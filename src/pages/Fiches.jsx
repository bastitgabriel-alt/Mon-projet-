import { useEffect, useMemo, useState } from 'react'
import { subjects, errorCategories } from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Badge, Button } from '../components/ui.jsx'
import { ChevronLeftIcon, SparkleIcon, CheckIcon } from '../components/icons.jsx'
import { styleFor } from '../utils/categoryStyles.js'
import { recallLevels, nextReviewState, isDue } from '../utils/spacedRepetition.js'
import { checkAndAwardBadges } from '../lib/badges.js'

const todayIso = new Date().toISOString().slice(0, 10)

function mapFicheRow(row) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
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

export default function Fiches({ userId }) {
  const [allFiches, setAllFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [openFicheId, setOpenFicheId] = useState(null)

  // Session de révision (flashcards)
  const [sessionQueue, setSessionQueue] = useState(null) // null = pas de session en cours
  const [sessionIndex, setSessionIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [newBadges, setNewBadges] = useState([])

  useEffect(() => {
    supabase
      .from('fiches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAllFiches((data || []).map(mapFicheRow))
        setLoading(false)
      })
  }, [userId])

  const filtered = filter === 'all' ? allFiches : allFiches.filter((f) => f.subjectId === filter)
  const openFiche = allFiches.find((f) => f.id === openFicheId)
  const dueFiches = useMemo(() => allFiches.filter((f) => isDue(f, todayIso)), [allFiches])

  function startSession(fiches) {
    setSessionQueue(fiches)
    setSessionIndex(0)
    setRevealed(false)
    setReviewedCount(0)
    setNewBadges([])
    setOpenFicheId(null)
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
          <h2 className="font-display text-lg font-semibold text-ink-900">{fiche.title}</h2>

          {revealed ? (
            <div className="mt-4 flex-1">
              <p className="text-sm text-ink-700">{fiche.summary}</p>
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

        <Card className="p-5">
          <p className="text-sm text-ink-700">{openFiche.summary}</p>
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
  return (
    <div className="flex flex-col gap-5">
      {dueFiches.length > 0 && (
        <Card className="flex items-center justify-between gap-3 bg-gradient-to-br from-indigo to-[#5b3fae] p-5 text-white">
          <div>
            <p className="font-display text-lg font-semibold">
              {dueFiches.length} fiche{dueFiches.length > 1 ? 's' : ''} à réviser aujourd'hui
            </p>
            <p className="text-sm text-white/80">Une session rapide en répétition espacée.</p>
          </div>
          <Button variant="secondary" onClick={() => startSession(dueFiches)} className="shrink-0 bg-white text-indigo hover:bg-white/90">
            Commencer
          </Button>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Toutes" />
        {subjects.map((s) => (
          <FilterChip key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} label={s.short} />
        ))}
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
