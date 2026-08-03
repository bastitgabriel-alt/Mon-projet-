import { useEffect, useMemo, useState } from 'react'
import { subjects, errorCategories, weekEvents } from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Badge, Button } from '../components/ui.jsx'
import { ChevronLeftIcon, SparkleIcon, CheckIcon, TimerIcon } from '../components/icons.jsx'
import { styleFor } from '../utils/categoryStyles.js'
import { recallLevels, nextReviewState, isDue } from '../utils/spacedRepetition.js'
import { checkAndAwardBadges } from '../lib/badges.js'
import { nextUpcoming, relativeDayLabel } from '../utils/schedule.js'
import { buildUrgentPlan } from '../utils/urgentPlan.js'
import { useAcademicCalendar } from '../lib/academicSchedule.js'
import MentalCalcGame from '../components/MentalCalcGame.jsx'
import DemonstrationGame from '../components/DemonstrationGame.jsx'
import ClassicErrorGame from '../components/ClassicErrorGame.jsx'
import PomodoroTimer from '../components/PomodoroTimer.jsx'

const todayIso = new Date().toISOString().slice(0, 10)
const TIME_OPTIONS = [15, 30, 45, 60]
const REASON_TONE = {
  'Erreur fréquente': 'bg-coral-soft text-coral',
  'Jamais révisée': 'bg-indigo-soft text-indigo',
  'À réviser': 'bg-amber-soft text-amber',
  Renforcement: 'bg-teal-soft text-teal'
}

function mapFicheRow(row) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    question: row.question,
    summary: row.summary,
    linkedCategory: row.linked_category,
    generated: row.generated,
    lastReviewed: row.last_reviewed,
    nextReview: row.next_review,
    intervalDays: row.interval_days,
    easeFactor: Number(row.ease_factor),
    repetitions: row.repetitions
  }
}

// "2026-07-18" -> "18/07/2026"
function toFrDate(isoDate) {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

function dueLabel(fiche) {
  if (fiche.repetitions === 0 && !fiche.lastReviewed) return { text: 'Nouvelle', tone: 'bg-indigo-soft text-indigo' }
  if (isDue(fiche, todayIso)) return { text: 'À réviser', tone: 'bg-amber-soft text-amber' }
  return { text: `Prochaine révision le ${toFrDate(fiche.nextReview)}`, tone: 'bg-teal-soft text-teal' }
}

export default function Fiches({ userId, navParams }) {
  const [allFiches, setAllFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [openFicheId, setOpenFicheId] = useState(null)
  const [autoStartHandled, setAutoStartHandled] = useState(false)

  // Session de révision (flashcards)
  const [sessionQueue, setSessionQueue] = useState(null) // null = pas de session en cours
  const [sessionIndex, setSessionIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [newBadges, setNewBadges] = useState([])

  // Mode urgent
  const [scans, setScans] = useState([])
  const [urgentStep, setUrgentStep] = useState(null) // null | 'setup' | 'plan'
  const [urgentSubjectId, setUrgentSubjectId] = useState(subjects[0].id)
  const [urgentMinutes, setUrgentMinutes] = useState(30)
  const [urgentPlanItems, setUrgentPlanItems] = useState([])

  // Révision active (D.3 / D.4 / D.5) + focus
  const [activeGame, setActiveGame] = useState(null) // null | 'calcul-mental' | 'demonstration' | 'erreur-classique' | 'pomodoro'

  // Création manuelle d'une fiche
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newSubjectId, setNewSubjectId] = useState(subjects[0].id)
  const [newTitle, setNewTitle] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [newSummary, setNewSummary] = useState('')
  const [savingFiche, setSavingFiche] = useState(false)

  // Banque de fiches (templates prêts à l'emploi)
  const [showTemplateBank, setShowTemplateBank] = useState(false)
  const [templates, setTemplates] = useState([])
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  const [templateFilter, setTemplateFilter] = useState('all')
  const [addedTemplateIds, setAddedTemplateIds] = useState([])
  const [addingTemplateId, setAddingTemplateId] = useState(null)

  const { events: realEvents, hasProfile } = useAcademicCalendar(userId)
  const activeEvents = hasProfile && realEvents ? realEvents : weekEvents
  const nextExam = useMemo(() => nextUpcoming(activeEvents, ['ds', 'colle']), [activeEvents])

  useEffect(() => {
    Promise.all([
      supabase.from('fiches').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('scans').select('subject_id, annotations(category)').eq('user_id', userId)
    ]).then(([{ data: ficheRows }, { data: scanRows }]) => {
      setAllFiches((ficheRows || []).map(mapFicheRow))
      setScans((scanRows || []).map((s) => ({ subjectId: s.subject_id, annotations: s.annotations || [] })))
      setLoading(false)
    })
  }, [userId])

  useEffect(() => {
    if (nextExam) setUrgentSubjectId(nextExam.subjectId)
  }, [nextExam])

  const filtered = filter === 'all' ? allFiches : allFiches.filter((f) => f.subjectId === filter)
  const openFiche = allFiches.find((f) => f.id === openFicheId)
  const dueFiches = useMemo(() => allFiches.filter((f) => isDue(f, todayIso)), [allFiches])

  // Arrivée depuis un bandeau du Dashboard : on saute direct dans l'action
  // demandée (session de révision, ou configuration du mode urgent), sans
  // repasser par la liste.
  useEffect(() => {
    if (loading || autoStartHandled || !navParams?.autoStart) return
    setAutoStartHandled(true)
    if (navParams.autoStart === 'due' && dueFiches.length > 0) startSession(dueFiches)
    if (navParams.autoStart === 'urgent') setUrgentStep('setup')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, navParams, autoStartHandled, dueFiches])

  async function openTemplateBank() {
    setShowTemplateBank(true)
    if (templatesLoaded) return
    const { data } = await supabase.from('fiche_templates').select('*').order('subject_id')
    setTemplates(data || [])
    setTemplatesLoaded(true)
  }

  async function addTemplateToMyFiches(template) {
    setAddingTemplateId(template.id)
    const { data, error } = await supabase
      .from('fiches')
      .insert({
        user_id: userId,
        subject_id: template.subject_id,
        title: template.title,
        question: template.question,
        summary: template.summary
      })
      .select()
      .single()
    setAddingTemplateId(null)
    if (error || !data) return
    setAllFiches((prev) => [mapFicheRow(data), ...prev])
    setAddedTemplateIds((prev) => [...prev, template.id])
  }

  function openUrgentPlan() {
    const items = buildUrgentPlan({ subjectId: urgentSubjectId, minutes: urgentMinutes, fiches: allFiches, scans })
    setUrgentPlanItems(items)
    setUrgentStep('plan')
  }

  function startSession(fiches) {
    setSessionQueue(fiches)
    setSessionIndex(0)
    setRevealed(false)
    setReviewedCount(0)
    setNewBadges([])
    setOpenFicheId(null)
    setUrgentStep(null)
  }

  async function createFiche() {
    if (!newTitle.trim() || !newQuestion.trim() || !newSummary.trim()) return
    setSavingFiche(true)
    const { data, error } = await supabase
      .from('fiches')
      .insert({
        user_id: userId,
        subject_id: newSubjectId,
        title: newTitle.trim(),
        question: newQuestion.trim(),
        summary: newSummary.trim()
      })
      .select()
      .single()
    setSavingFiche(false)
    if (error || !data) return
    setAllFiches((prev) => [mapFicheRow(data), ...prev])
    setNewTitle('')
    setNewQuestion('')
    setNewSummary('')
    setShowCreateForm(false)
  }

  async function rate(quality) {
    const fiche = sessionQueue[sessionIndex]
    const next = nextReviewState(fiche, quality)
    setAllFiches((prev) => prev.map((f) => (f.id === fiche.id ? { ...f, ...next, lastReviewed: todayIso } : f)))
    await Promise.all([
      supabase
        .from('fiches')
        .update({
          next_review: next.nextReview,
          interval_days: next.intervalDays,
          ease_factor: next.easeFactor,
          repetitions: next.repetitions,
          last_reviewed: todayIso
        })
        .eq('id', fiche.id),
      supabase.from('review_log').insert({ user_id: userId, fiche_id: fiche.id, quality })
    ])
    setReviewedCount((c) => c + 1)
    setRevealed(false)
    const isLastCard = sessionIndex + 1 >= sessionQueue.length
    setSessionIndex((i) => i + 1)
    if (isLastCard) {
      checkAndAwardBadges(userId).then((res) => setNewBadges(res.newlyEarned))
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-400">Chargement…</p>
  }

  // --- Révision active : Calcul mental (D.3) ---
  if (activeGame === 'calcul-mental') {
    return <MentalCalcGame userId={userId} onExit={() => setActiveGame(null)} />
  }

  // --- Révision active : Démonstration (D.4) ---
  if (activeGame === 'demonstration') {
    return <DemonstrationGame onExit={() => setActiveGame(null)} />
  }

  // --- Révision active : Erreur classique (D.5) ---
  if (activeGame === 'erreur-classique') {
    return <ClassicErrorGame onExit={() => setActiveGame(null)} />
  }

  // --- Focus : minuteur Pomodoro ---
  if (activeGame === 'pomodoro') {
    return <PomodoroTimer userId={userId} onExit={() => setActiveGame(null)} />
  }

  // --- Session de révision (flashcards) ---
  if (sessionQueue) {
    if (sessionIndex >= sessionQueue.length) {
      return (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-soft">
            <CheckIcon className="w-7 h-7 text-teal" />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Session terminée</h1>
          <p className="text-sm text-ink-500">
            {reviewedCount} fiche{reviewedCount > 1 ? 's' : ''} révisée{reviewedCount > 1 ? 's' : ''}. Bien joué.
          </p>

          {newBadges.length > 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-amber-soft px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber">Nouveau succès débloqué</p>
              <div className="flex gap-4">
                {newBadges.map((b) => (
                  <div key={b.id} className="flex flex-col items-center gap-1">
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-xs font-medium text-ink-700">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={() => setSessionQueue(null)}>Retour aux fiches</Button>
        </div>
      )
    }

    const fiche = sessionQueue[sessionIndex]
    const subject = subjects.find((s) => s.id === fiche.subjectId)
    const category = fiche.linkedCategory ? errorCategories[fiche.linkedCategory] : null
    const style = fiche.linkedCategory ? styleFor(fiche.linkedCategory) : null

    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setSessionQueue(null)} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Quitter la session
        </button>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Fiche {sessionIndex + 1} / {sessionQueue.length}
        </p>

        <Card className="flex min-h-[280px] flex-col p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${subject?.accent}`} />
            <span className="text-sm font-medium text-ink-500">{subject?.name}</span>
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{fiche.title}</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">
            {fiche.question || fiche.title}
          </h2>

          {revealed ? (
            <div className="mt-4 flex-1">
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{fiche.summary}</p>
              {category && (
                <div className="mt-4 rounded-xl bg-ink-50 p-4">
                  <Badge className={style.badge}>{category.label}</Badge>
                  <p className="mt-2 text-sm text-ink-600">{category.tip}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 flex flex-1 items-center justify-center">
              <Button variant="secondary" onClick={() => setRevealed(true)}>
                Voir la réponse
              </Button>
            </div>
          )}
        </Card>

        {revealed && (
          <div>
            <p className="mb-2 text-center text-xs font-medium text-ink-500">Comment as-tu retenu cette fiche ?</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {recallLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => rate(level.quality)}
                  className="rounded-xl border border-ink-200 bg-white px-2 py-2.5 text-xs font-medium text-ink-700 transition-colors hover:border-indigo hover:bg-indigo-soft hover:text-indigo"
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- Création manuelle d'une fiche ---
  if (showCreateForm) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setShowCreateForm(false)} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Annuler
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Nouvelle fiche</h1>
          <p className="text-sm text-ink-500">Écris ta propre fiche, elle rentre direct dans la répétition espacée.</p>
        </div>

        <Card className="flex flex-col gap-4 p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Matière</p>
            <select
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-700"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Titre (thème de la fiche)</p>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex : Formule de Taylor-Lagrange"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Question (recto)</p>
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ex : Quand et comment appliquer la formule de Taylor-Lagrange ?"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Réponse (verso)</p>
            <textarea
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              rows={10}
              placeholder="Développe vraiment : méthode complète, formules, pièges à éviter, exemples… comme une fiche Anki détaillée, pas juste une phrase."
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700"
            />
          </div>
        </Card>

        <Button
          onClick={createFiche}
          disabled={!newTitle.trim() || !newQuestion.trim() || !newSummary.trim() || savingFiche}
          className="w-full"
        >
          {savingFiche ? 'Création…' : 'Créer la fiche'}
        </Button>
      </div>
    )
  }

  // --- Banque de fiches (templates prêts à l'emploi) ---
  if (showTemplateBank) {
    const filteredTemplates = templateFilter === 'all' ? templates : templates.filter((t) => t.subject_id === templateFilter)
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setShowTemplateBank(false)} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Retour
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Banque de fiches</h1>
          <p className="text-sm text-ink-500">Des fiches déjà écrites, prêtes à rejoindre ta répétition espacée.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <FilterChip active={templateFilter === 'all'} onClick={() => setTemplateFilter('all')} label="Toutes" />
          {subjects.map((s) => (
            <FilterChip key={s.id} active={templateFilter === s.id} onClick={() => setTemplateFilter(s.id)} label={s.short} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {filteredTemplates.map((t) => {
            const subject = subjects.find((s) => s.id === t.subject_id)
            const added = addedTemplateIds.includes(t.id)
            return (
              <Card key={t.id} className="flex items-center gap-3 p-3.5">
                <span className={`h-9 w-1.5 shrink-0 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-800">{t.title}</p>
                  <p className="text-xs text-ink-500">{subject?.name}</p>
                </div>
                {added ? (
                  <Badge className="shrink-0 bg-teal-soft text-teal">
                    <CheckIcon className="mr-1 w-3.5 h-3.5" /> Ajoutée
                  </Badge>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => addTemplateToMyFiches(t)}
                    disabled={addingTemplateId === t.id}
                    className="shrink-0 px-3 py-1.5 text-xs"
                  >
                    {addingTemplateId === t.id ? '…' : 'Ajouter'}
                  </Button>
                )}
              </Card>
            )
          })}
          {templatesLoaded && filteredTemplates.length === 0 && (
            <Card className="p-4 text-center text-sm text-ink-500">Aucune fiche pour l'instant dans cette matière.</Card>
          )}
        </div>
      </div>
    )
  }

  // --- Mode urgent : configuration ---
  if (urgentStep === 'setup') {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setUrgentStep(null)} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Annuler
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Mode urgent</h1>
          <p className="text-sm text-ink-500">Dis-nous ta matière et le temps que tu as — on te fait un plan.</p>
        </div>

        <Card className="p-5">
          <p className="mb-2 text-sm font-medium text-ink-700">Matière</p>
          <select
            value={urgentSubjectId}
            onChange={(e) => setUrgentSubjectId(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-700"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Card>

        <Card className="p-5">
          <p className="mb-2 text-sm font-medium text-ink-700">Temps disponible</p>
          <div className="grid grid-cols-4 gap-2">
            {TIME_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setUrgentMinutes(m)}
                className={`rounded-xl border-[1.5px] py-2.5 text-sm font-semibold transition-colors ${
                  urgentMinutes === m ? 'border-coral bg-coral-soft text-coral' : 'border-ink-200 text-ink-600 hover:border-ink-400'
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </Card>

        <Button onClick={openUrgentPlan} className="w-full">Voir mon plan</Button>
      </div>
    )
  }

  // --- Mode urgent : plan ---
  if (urgentStep === 'plan') {
    const subject = subjects.find((s) => s.id === urgentSubjectId)
    const totalMinutes = urgentPlanItems.reduce((sum, i) => sum + i.minutes, 0)

    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setUrgentStep('setup')} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Modifier
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Ton plan rapide · {subject?.short}</h1>
          <p className="text-sm text-ink-500">
            {urgentPlanItems.length} fiche{urgentPlanItems.length > 1 ? 's' : ''} priorisée{urgentPlanItems.length > 1 ? 's' : ''} · ~{totalMinutes} min
          </p>
        </div>

        {urgentPlanItems.length === 0 ? (
          <Card className="p-4 text-center text-sm text-ink-500">
            Pas encore de fiche en {subject?.name}. Scanne une copie ou crée une fiche pour cette matière d'abord.
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {urgentPlanItems.map((item, i) => (
              <Card key={item.fiche.id} className="flex items-center gap-3 p-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">{item.fiche.title}</p>
                  <Badge className={`mt-1 ${REASON_TONE[item.reason]}`}>{item.reason}</Badge>
                </div>
                <span className="shrink-0 font-mono text-xs text-ink-400">{item.minutes} min</span>
              </Card>
            ))}
          </div>
        )}

        {urgentPlanItems.length > 0 && (
          <Button onClick={() => startSession(urgentPlanItems.map((i) => i.fiche))} className="w-full">
            Commencer la session
          </Button>
        )}
      </div>
    )
  }

  // --- Détail d'une fiche ---
  if (openFiche) {
    const subject = subjects.find((s) => s.id === openFiche.subjectId)
    const category = openFiche.linkedCategory ? errorCategories[openFiche.linkedCategory] : null
    const style = openFiche.linkedCategory ? styleFor(openFiche.linkedCategory) : null
    const status = dueLabel(openFiche)

    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setOpenFicheId(null)} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Mes fiches
        </button>

        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${subject?.accent}`} />
          <span className="text-sm font-medium text-ink-500">{subject?.name}</span>
        </div>
        <h1 className="font-display text-xl font-semibold text-ink-900">{openFiche.title}</h1>

        {openFiche.generated && (
          <Badge className="w-fit bg-indigo-soft text-indigo">
            <SparkleIcon className="w-3.5 h-3.5 mr-1" /> Générée depuis un scan de copie
          </Badge>
        )}

        {openFiche.question && (
          <Card className="p-5 bg-indigo-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo">Question</p>
            <p className="mt-1.5 font-display text-base font-semibold text-ink-900">{openFiche.question}</p>
          </Card>
        )}

        <Card className="p-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">{openFiche.summary}</p>
          {category && (
            <div className="mt-4 rounded-xl bg-ink-50 p-4">
              <Badge className={style.badge}>{category.label}</Badge>
              <p className="mt-2 text-sm text-ink-600">{category.tip}</p>
            </div>
          )}
        </Card>

        <Card className="p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink-700">Statut</p>
            <Badge className={`mt-1 ${status.tone}`}>{status.text}</Badge>
          </div>
          <Button variant="secondary" onClick={() => startSession([openFiche])} className="text-xs px-3 py-1.5 shrink-0">
            Réviser cette fiche
          </Button>
        </Card>
      </div>
    )
  }

  // --- Liste ---
  const examSoonLabel = nextExam ? relativeDayLabel(nextExam.parsedDate) : null
  const examIsImminent = examSoonLabel === "aujourd'hui" || examSoonLabel === 'demain'
  const examSubject = nextExam ? subjects.find((s) => s.id === nextExam.subjectId) : null

  return (
    <div className="flex flex-col gap-5">
      {examIsImminent ? (
        <Card className="flex items-center justify-between gap-3 bg-gradient-to-br from-coral to-[#d98f82] p-5 text-white">
          <div>
            <p className="font-display text-lg font-semibold">⚡ {examSubject?.name} {examSoonLabel}</p>
            <p className="text-sm text-white/80">Prépare un plan de révision rapide et ciblé.</p>
          </div>
          <Button variant="secondary" onClick={() => setUrgentStep('setup')} className="shrink-0 bg-white text-coral hover:bg-white/90">
            Mode urgent
          </Button>
        </Card>
      ) : (
        <button
          onClick={() => setUrgentStep('setup')}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink-300 py-2.5 text-sm font-medium text-ink-500 hover:border-coral hover:text-coral transition-colors"
        >
          ⚡ Mode urgent — contrôle bientôt ?
        </button>
      )}

      {dueFiches.length > 0 && (
        <Card className="flex items-center justify-between gap-3 bg-indigo-soft p-5">
          <div>
            <p className="font-display text-lg font-semibold text-ink-900">
              {dueFiches.length} fiche{dueFiches.length > 1 ? 's' : ''} à réviser aujourd'hui
            </p>
            <p className="text-sm text-ink-600">Une session rapide en répétition espacée.</p>
          </div>
          <Button onClick={() => startSession(dueFiches)} className="shrink-0">
            Commencer
          </Button>
        </Card>
      )}

      <button
        onClick={() => setActiveGame('pomodoro')}
        className="flex items-center gap-2.5 rounded-2xl border border-ink-200 bg-white px-4 py-3 shadow-card transition-colors hover:border-indigo"
      >
        <TimerIcon className="w-5 h-5 text-indigo shrink-0" />
        <span className="text-sm font-semibold text-ink-800">Focus</span>
        <span className="text-[11px] text-ink-500">Minuteur Pomodoro</span>
      </button>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-2 overflow-x-auto no-scrollbar pb-1">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Toutes" />
          {subjects.map((s) => (
            <FilterChip key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} label={s.short} />
          ))}
        </div>
        <Button variant="ghost" onClick={openTemplateBank} className="shrink-0 border border-ink-200 px-3 py-1.5 text-xs">
          Banque de fiches
        </Button>
        <Button variant="secondary" onClick={() => setShowCreateForm(true)} className="shrink-0 px-3 py-1.5 text-xs">
          + Nouvelle fiche
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((f) => {
          const subject = subjects.find((s) => s.id === f.subjectId)
          const status = dueLabel(f)
          return (
            <button key={f.id} onClick={() => setOpenFicheId(f.id)} className="text-left">
              <Card className="flex items-center gap-3 p-3.5 hover:bg-ink-50 transition-colors">
                <span className={`h-9 w-1.5 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">{f.title}</p>
                  <p className="text-xs text-ink-500">{subject?.name}</p>
                </div>
                <Badge className={`shrink-0 ${status.tone}`}>{status.text}</Badge>
              </Card>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <Card className="p-4 text-center text-sm text-ink-500">Aucune fiche pour l'instant dans cette matière.</Card>
        )}
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
      }`}
    >
      {label}
    </button>
  )
}
