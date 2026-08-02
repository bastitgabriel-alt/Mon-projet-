import { useEffect, useRef, useState } from 'react'
import {
  subjects,
  errorCategories,
  computeErrorGroups,
  computeWeeklySynthesis
} from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, SectionTitle, Badge, Button } from '../components/ui.jsx'
import AnnotatedCopy from '../components/AnnotatedCopy.jsx'
import { CameraIcon, UploadIcon, ChevronLeftIcon, SparkleIcon, CheckIcon, BookIcon } from '../components/icons.jsx'
import { styleFor } from '../utils/categoryStyles.js'
import { analyzeCourseImage } from '../lib/courseAi.js'
import { analyzeCopyImage } from '../lib/copyAi.js'
import { computeAutoCompetencyDowngrades } from '../utils/competencyAutoUpdate.js'
import { competencySubjects, levelLabels } from '../data/competencies.js'
import { isDue } from '../utils/spacedRepetition.js'
import { computeStreak } from '../utils/streak.js'

const todayIso = new Date().toISOString().slice(0, 10)

// "2026-07-18" -> "18/07/2026"
function toFrDate(isoDate) {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

function mapScanRow(row) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    date: toFrDate(row.scan_date),
    grade: row.grade,
    annotations: (row.annotations || []).map((a) => ({
      id: a.id,
      x: Number(a.pos_x),
      y: Number(a.pos_y),
      category: a.category,
      comment: a.comment
    }))
  }
}

export default function Scan({ userId, navParams }) {
  const [mode, setMode] = useState(navParams?.mode === 'cours' ? 'cours' : 'copie') // copie | cours
  const [step, setStep] = useState('idle') // idle | preview | analyzing | result | history | course-preview | course-analyzing | course-result | course-quiz | course-quiz-done
  const [subjectId, setSubjectId] = useState('maths')
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [newScan, setNewScan] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [competencyUpdates, setCompetencyUpdates] = useState([])
  const [activeAnnotation, setActiveAnnotation] = useState(null)
  const [historyScan, setHistoryScan] = useState(null)
  const [createdFicheKeys, setCreatedFicheKeys] = useState([])
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const [allScans, setAllScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [fichesToReview, setFichesToReview] = useState(0)
  const [streak, setStreak] = useState(0)

  // --- Scan de cours + quiz ---
  const [courseScans, setCourseScans] = useState([])
  const [courseImageFile, setCourseImageFile] = useState(null)
  const [courseImageUrl, setCourseImageUrl] = useState(null)
  const [courseResult, setCourseResult] = useState(null) // { title, summary, questions }
  const [courseError, setCourseError] = useState(null)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizSelected, setQuizSelected] = useState(null)
  const [quizScore, setQuizScore] = useState(0)
  const courseCameraInputRef = useRef(null)
  const courseFileInputRef = useRef(null)

  async function loadData() {
    const [{ data: scanRows }, { data: ficheRows }, { data: courseRows }, { data: reviewRows }] = await Promise.all([
      supabase
        .from('scans')
        .select('*, annotations(*)')
        .eq('user_id', userId)
        .order('scan_date', { ascending: false }),
      supabase.from('fiches').select('subject_id, linked_category, next_review, last_reviewed, repetitions').eq('user_id', userId),
      supabase
        .from('course_scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase.from('review_log').select('reviewed_at').eq('user_id', userId)
    ])
    setAllScans((scanRows || []).map(mapScanRow))
    setCreatedFicheKeys(
      (ficheRows || [])
        .filter((f) => f.linked_category)
        .map((f) => `${f.subject_id}__${f.linked_category}`)
    )
    setFichesToReview((ficheRows || []).filter((f) => isDue({ nextReview: f.next_review }, todayIso)).length)
    // Le streak reflète une vraie activité (scan ou révision), pas un check-in dédié.
    const activityDates = [
      ...(scanRows || []).map((s) => s.scan_date),
      ...(reviewRows || []).map((r) => r.reviewed_at.slice(0, 10))
    ]
    setStreak(computeStreak(activityDates))
    setCourseScans(courseRows || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function finishAnalysis() {
    try {
      const subject = subjects.find((s) => s.id === subjectId)
      const analysis = await analyzeCopyImage({ subject: subjectId, file: imageFile })

      const { data: insertedScan, error } = await supabase
        .from('scans')
        .insert({
          user_id: userId,
          subject_id: subjectId,
          title: `Copie du ${new Date().toLocaleDateString('fr-FR')} — ${subject?.name}`,
          scan_date: new Date().toISOString().slice(0, 10),
          grade: analysis.grade || null
        })
        .select()
        .single()

      if (error || !insertedScan) throw new Error("Impossible d'enregistrer le scan.")

      const clampPos = (n) => Math.min(95, Math.max(5, Number(n) || 50))
      const annotationRows = (analysis.annotations || []).map((a) => ({
        scan_id: insertedScan.id,
        user_id: userId,
        pos_x: clampPos(a.x),
        pos_y: clampPos(a.y),
        category: a.category,
        comment: a.comment,
        competency_key: a.competency_key || null
      }))
      const { data: insertedAnnotations } =
        annotationRows.length > 0 ? await supabase.from('annotations').insert(annotationRows).select() : { data: [] }

      const result = mapScanRow({ ...insertedScan, annotations: insertedAnnotations })
      setNewScan(result)
      setAllScans((prev) => [result, ...prev])
      const updates = await applyCompetencyAutoUpdates()
      setCompetencyUpdates(updates)
      setStep('result')
    } catch (e) {
      setScanError(e.message)
      setStep('preview')
    }
  }

  // Ferme la boucle scan → fiche → compétences : recalcule, sur l'ensemble
  // des erreurs déjà détectées (toutes copies confondues), si une compétence
  // revient assez souvent pour justifier de plafonner son niveau — sans
  // jamais le faire remonter automatiquement.
  async function applyCompetencyAutoUpdates() {
    const [{ data: scanRows }, { data: levelRows }] = await Promise.all([
      supabase.from('scans').select('subject_id, annotations(competency_key)').eq('user_id', userId),
      supabase.from('competency_levels').select('subject_id, competency_key, level').eq('user_id', userId)
    ])

    const scansForCompute = (scanRows || []).map((s) => ({
      subjectId: s.subject_id,
      annotations: (s.annotations || []).map((a) => ({ competencyKey: a.competency_key }))
    }))
    const levelsMap = {}
    ;(levelRows || []).forEach((r) => {
      levelsMap[`${r.subject_id}__${r.competency_key}`] = r.level
    })

    const updates = computeAutoCompetencyDowngrades({ scans: scansForCompute, currentLevels: levelsMap })
    if (updates.length === 0) return []

    const now = new Date().toISOString()
    await Promise.all(
      updates.flatMap((u) => [
        supabase.from('competency_levels').upsert(
          { user_id: userId, subject_id: u.subjectId, competency_key: u.competencyKey, level: u.newLevel, updated_at: now },
          { onConflict: 'user_id,subject_id,competency_key' }
        ),
        supabase
          .from('competency_history')
          .insert({ user_id: userId, subject_id: u.subjectId, competency_key: u.competencyKey, level: u.newLevel, recorded_at: now })
      ])
    )
    return updates
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setScanError(null)
    setStep('preview')
  }

  function startAnalysis() {
    setStep('analyzing')
    finishAnalysis()
  }

  function reset() {
    setStep('idle')
    setImageFile(null)
    setImageUrl(null)
    setNewScan(null)
    setScanError(null)
    setCompetencyUpdates([])
    setActiveAnnotation(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  // --- Scan de cours + quiz ---

  function handleCourseFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCourseImageFile(file)
    setCourseImageUrl(URL.createObjectURL(file))
    setCourseError(null)
    setStep('course-preview')
  }

  async function analyzeCourse() {
    setStep('course-analyzing')
    setCourseError(null)
    try {
      const result = await analyzeCourseImage({ subject: subjectId, file: courseImageFile })
      const { data: inserted } = await supabase
        .from('course_scans')
        .insert({
          user_id: userId,
          subject_id: subjectId,
          title: result.title,
          summary: result.summary,
          quiz: result.questions
        })
        .select()
        .single()
      setCourseScans((prev) => [inserted, ...prev])
      setCourseResult(inserted)
      setStep('course-result')
    } catch (e) {
      setCourseError(e.message)
      setStep('course-preview')
    }
  }

  function startQuiz(scan) {
    setCourseResult(scan)
    setQuizIndex(0)
    setQuizSelected(null)
    setQuizScore(0)
    setStep('course-quiz')
  }

  function selectQuizAnswer(optionIndex) {
    if (quizSelected !== null) return
    setQuizSelected(optionIndex)
    const question = courseResult.quiz[quizIndex]
    if (optionIndex === question.correct_index) setQuizScore((s) => s + 1)
  }

  function nextQuizQuestion() {
    const isLast = quizIndex + 1 >= courseResult.quiz.length
    if (isLast) {
      setStep('course-quiz-done')
      return
    }
    setQuizIndex((i) => i + 1)
    setQuizSelected(null)
  }

  function resetCourseFlow() {
    setStep('idle')
    setCourseImageFile(null)
    setCourseImageUrl(null)
    setCourseResult(null)
    setCourseError(null)
    if (courseFileInputRef.current) courseFileInputRef.current.value = ''
    if (courseCameraInputRef.current) courseCameraInputRef.current.value = ''
  }

  async function createFiche(group) {
    const subject = subjects.find((s) => s.id === group.subjectId)
    const category = errorCategories[group.category]
    setCreatedFicheKeys((prev) => [...prev, group.key])
    await supabase.from('fiches').insert({
      user_id: userId,
      subject_id: group.subjectId,
      title: `${category.label} en ${subject?.short}`,
      question: `Quel est le piège récurrent sur "${category.label.toLowerCase()}" en ${subject?.short}, et comment l'éviter ?`,
      summary: category.tip,
      linked_category: group.category,
      generated: true,
      last_reviewed: null
    })
  }

  if (loading) {
    return <p className="text-sm text-ink-400">Chargement…</p>
  }

  if (step === 'history' && historyScan) {
    const subject = subjects.find((s) => s.id === historyScan.subjectId)
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={() => setStep('idle')} label="Historique" />
        <div>
          <h1 className="text-xl font-bold text-ink-900">{historyScan.title}</h1>
          <p className="text-sm text-ink-500">{subject?.name} · {historyScan.date}{historyScan.grade ? ` · ${historyScan.grade}` : ''}</p>
        </div>
        <AnnotatedCopy
          imageUrl={null}
          annotations={historyScan.annotations}
          activeId={activeAnnotation}
          onSelect={setActiveAnnotation}
        />
        <AnnotationList annotations={historyScan.annotations} activeId={activeAnnotation} onSelect={setActiveAnnotation} />
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={reset} label="Annuler" />
        <h1 className="text-xl font-bold text-ink-900">Vérifie ta copie</h1>
        <AnnotatedCopy imageUrl={imageUrl} annotations={[]} />
        <Card className="p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink-700">Matière</p>
            <p className="text-xs text-ink-500">Choisis la matière pour affiner l'analyse</p>
          </div>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Card>
        {scanError && <Card className="bg-coral-soft p-3 text-sm text-coral">{scanError}</Card>}
        <Button onClick={startAnalysis} className="w-full">
          <SparkleIcon /> Lancer l'analyse
        </Button>
      </div>
    )
  }

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-ink-900">Analyse en cours…</h1>
        <AnnotatedCopy imageUrl={imageUrl} annotations={[]} />
        <Card className="flex items-center gap-3 p-5">
          <span className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-indigo-soft" />
          <p className="text-sm text-ink-600">Le professeur virtuel lit tes annotations et prépare ta synthèse d'erreurs…</p>
        </Card>
      </div>
    )
  }

  if (step === 'result' && newScan) {
    const subject = subjects.find((s) => s.id === newScan.subjectId)
    const relevantScans = allScans.filter((s) => s.subjectId === newScan.subjectId)
    const recurring = computeErrorGroups(relevantScans).filter((g) => g.count > 1)
    const synthesis = computeWeeklySynthesis(allScans)

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-indigo">
          <CheckIcon className="w-5 h-5" />
          <span className="text-sm font-semibold">Analyse terminée</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink-900">{newScan.title}</h1>
          <p className="text-sm text-ink-500">{subject?.name} · {newScan.date}{newScan.grade ? ` · ${newScan.grade}` : ''}</p>
        </div>

        <AnnotatedCopy
          imageUrl={imageUrl}
          annotations={newScan.annotations}
          activeId={activeAnnotation}
          onSelect={setActiveAnnotation}
        />

        <div>
          <SectionTitle title="Annotations détectées" eyebrow={`${newScan.annotations.length} repérées`} />
          {newScan.annotations.length > 0 ? (
            <AnnotationList annotations={newScan.annotations} activeId={activeAnnotation} onSelect={setActiveAnnotation} />
          ) : (
            <Card className="p-4 text-center text-sm text-ink-500">
              Aucune annotation trouvée sur cette photo — vérifie qu'elle est bien nette et que les corrections du prof sont visibles.
            </Card>
          )}
        </div>

        {competencyUpdates.length > 0 && (
          <div>
            <SectionTitle title="Ton radar de compétences a bougé" eyebrow="Mis à jour automatiquement" />
            <div className="flex flex-col gap-2">
              {competencyUpdates.map((u) => {
                const compSubject = competencySubjects.find((s) => s.id === u.subjectId)
                const competency = compSubject?.competencies.find((c) => c.key === u.competencyKey)
                return (
                  <Card key={`${u.subjectId}__${u.competencyKey}`} className="flex items-center gap-3 border-l-4 border-l-amber p-3.5">
                    <span className="text-lg">📉</span>
                    <div>
                      <p className="text-sm font-medium text-ink-800">
                        {competency?.label || u.competencyKey} <span className="text-ink-400">· {compSubject?.name}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {u.count} erreur{u.count > 1 ? 's' : ''} récurrente{u.count > 1 ? 's' : ''} détectée{u.count > 1 ? 's' : ''} → niveau ajusté à « {levelLabels[u.newLevel - 1]} ».
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {recurring.length > 0 && (
          <div>
            <SectionTitle title="Erreurs qui reviennent souvent" eyebrow={subject?.name} />
            <div className="flex flex-col gap-2">
              {recurring.map((g) => (
                <Card key={g.key} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink-800">{errorCategories[g.category].label}</span>
                    <Badge className={styleFor(g.category).badge}>vu {g.count} fois</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">{errorCategories[g.category].tip}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionTitle title="Tes 3 points à travailler cette semaine" eyebrow="Synthèse actionnable" />
          <div className="flex flex-col gap-2">
            {synthesis.map((g, i) => {
              const subj = subjects.find((s) => s.id === g.subjectId)
              const created = createdFicheKeys.includes(g.key)
              return (
                <Card key={g.key} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-indigo">Priorité {i + 1} · {subj?.short}</p>
                      <p className="text-sm font-semibold text-ink-800">{errorCategories[g.category].label}</p>
                      <p className="mt-1 text-xs text-ink-500">{errorCategories[g.category].tip}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {created ? (
                      <Badge className="bg-indigo-soft text-indigo"><CheckIcon className="w-3.5 h-3.5 mr-1" /> Fiche créée</Badge>
                    ) : (
                      <Button variant="secondary" onClick={() => createFiche(g)} className="text-xs px-3 py-1.5">
                        Créer une fiche de révision
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <Button variant="ghost" onClick={reset} className="w-full border border-ink-200">
          Nouveau scan
        </Button>
      </div>
    )
  }

  // --- Scan de cours : aperçu avant analyse ---
  if (step === 'course-preview') {
    return (
      <div className="flex flex-col gap-4">
        <BackButton onClick={resetCourseFlow} label="Annuler" />
        <h1 className="text-xl font-bold text-ink-900">Vérifie ta page de cours</h1>
        <img src={courseImageUrl} alt="Page de cours" className="w-full rounded-2xl border border-ink-100 shadow-card" />
        <Card className="p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink-700">Matière</p>
            <p className="text-xs text-ink-500">Choisis la matière pour affiner la lecture</p>
          </div>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </Card>
        {courseError && <Card className="bg-coral-soft p-3 text-sm text-coral">{courseError}</Card>}
        <Button onClick={analyzeCourse} className="w-full">
          <SparkleIcon /> Lire le cours et générer le quiz
        </Button>
      </div>
    )
  }

  // --- Scan de cours : analyse en cours ---
  if (step === 'course-analyzing') {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-ink-900">Lecture du cours…</h1>
        <img src={courseImageUrl} alt="Page de cours" className="w-full rounded-2xl border border-ink-100 shadow-card opacity-70" />
        <Card className="flex items-center gap-3 p-5">
          <span className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-indigo-soft" />
          <p className="text-sm text-ink-600">Le professeur virtuel lit ta page et prépare ton quiz…</p>
        </Card>
      </div>
    )
  }

  // --- Scan de cours : résultat de la lecture ---
  if (step === 'course-result' && courseResult) {
    const subject = subjects.find((s) => s.id === subjectId)
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-indigo">
          <CheckIcon className="w-5 h-5" />
          <span className="text-sm font-semibold">Cours ajouté</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink-900">{courseResult.title}</h1>
          <p className="text-sm text-ink-500">{subject?.name} · {courseResult.quiz.length} questions générées</p>
        </div>
        <Card className="p-5">
          <p className="text-sm text-ink-700">{courseResult.summary}</p>
        </Card>
        <Button onClick={() => startQuiz(courseResult)} className="w-full">
          Faire le quiz maintenant
        </Button>
        <Button variant="ghost" onClick={resetCourseFlow} className="w-full border border-ink-200">
          Plus tard
        </Button>
      </div>
    )
  }

  // --- Scan de cours : session de quiz ---
  if (step === 'course-quiz' && courseResult) {
    const question = courseResult.quiz[quizIndex]
    return (
      <div className="flex flex-col gap-4">
        <button onClick={resetCourseFlow} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Quitter le quiz
        </button>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
          {courseResult.title} · Question {quizIndex + 1} / {courseResult.quiz.length}
        </p>
        <Card className="p-5">
          <p className="font-display text-lg font-semibold text-ink-900">{question.question}</p>
        </Card>
        <div className="flex flex-col gap-2">
          {question.options.map((option, i) => {
            const isCorrect = i === question.correct_index
            const isPicked = i === quizSelected
            let tone = 'border-ink-200 bg-white text-ink-700 hover:border-indigo'
            if (quizSelected !== null) {
              if (isCorrect) tone = 'border-teal bg-teal-soft text-teal'
              else if (isPicked) tone = 'border-coral bg-coral-soft text-coral'
              else tone = 'border-ink-200 bg-white text-ink-400'
            }
            return (
              <button
                key={i}
                onClick={() => selectQuizAnswer(i)}
                disabled={quizSelected !== null}
                className={`rounded-xl border-[1.5px] px-4 py-3 text-left text-sm font-medium transition-colors ${tone}`}
              >
                {option}
              </button>
            )
          })}
        </div>
        {quizSelected !== null && (
          <Card className="bg-indigo-soft p-4">
            <p className="text-sm text-ink-700">{question.explanation}</p>
          </Card>
        )}
        {quizSelected !== null && (
          <Button onClick={nextQuizQuestion} className="w-full">
            {quizIndex + 1 >= courseResult.quiz.length ? 'Voir mon score' : 'Question suivante'}
          </Button>
        )}
      </div>
    )
  }

  // --- Scan de cours : score final du quiz ---
  if (step === 'course-quiz-done' && courseResult) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-soft">
          <CheckIcon className="w-7 h-7 text-teal" />
        </div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Quiz terminé</h1>
        <p className="font-mono text-3xl font-bold text-indigo">
          {quizScore}
          <span className="text-lg text-ink-400">/{courseResult.quiz.length}</span>
        </p>
        <p className="text-sm text-ink-500">{courseResult.title}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => startQuiz(courseResult)}>Refaire le quiz</Button>
          <Button onClick={resetCourseFlow}>Terminer</Button>
        </div>
      </div>
    )
  }

  // step === 'idle'
  return (
    <div className="flex flex-col gap-6">
      {/* Repères immédiats : ce qu'il y a à faire, et depuis combien de temps
          on tient le rythme — pour qu'on comprenne l'appli dès l'arrivée. */}
      <div className="flex gap-3">
        <Card className="flex-1 p-3.5">
          <p className={`font-mono text-2xl font-bold ${fichesToReview > 0 ? 'text-coral' : 'text-ink-900'}`}>
            {fichesToReview}
          </p>
          <p className="text-xs text-ink-500">fiche{fichesToReview > 1 ? 's' : ''} à réviser</p>
        </Card>
        <Card className="flex-1 p-3.5">
          <p className="font-mono text-2xl font-bold text-ink-900">🔥 {streak}</p>
          <p className="text-xs text-ink-500">jour{streak > 1 ? 's' : ''} de suivi d'affilée</p>
        </Card>
      </div>

      <div className="flex rounded-xl bg-ink-100 p-1">
        <button
          onClick={() => setMode('copie')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === 'copie' ? 'bg-white text-indigo shadow-card' : 'text-ink-500'
          }`}
        >
          Copie corrigée
        </button>
        <button
          onClick={() => setMode('cours')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === 'cours' ? 'bg-white text-indigo shadow-card' : 'text-ink-500'
          }`}
        >
          Page de cours
        </button>
      </div>

      {mode === 'copie' && (
        <>
          <Card className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink-700">Matière de la copie</p>
            </div>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Card>

          <div className="relative overflow-hidden rounded-[20px] bg-indigo p-6">
            <div className="pointer-events-none absolute right-0 top-0 h-11 w-11 bg-[linear-gradient(135deg,transparent_50%,rgba(250,247,240,0.12)_50%)]" />
            <div className="pointer-events-none absolute inset-3.5 rounded-2xl border border-dashed border-white/25" />
            <div className="scan-sweep-line" />
            <button onClick={() => cameraInputRef.current?.click()} className="relative z-10 flex w-full flex-col items-center gap-3 py-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber">
                <CameraIcon className="h-6 w-6 text-indigo" />
              </span>
              <span className="font-display text-lg font-medium text-white">Scanner une copie</span>
              <span className="text-xs text-white/60">Photo depuis l'appareil</span>
            </button>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-center text-xs font-medium text-ink-500 underline decoration-ink-300 underline-offset-2 hover:text-indigo"
          >
            ou importer un fichier depuis mon appareil
          </button>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </>
      )}

      {mode === 'cours' && (
        <>
          <Card className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink-700">Matière du cours</p>
            </div>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => courseCameraInputRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-amber to-[#c08a34] p-6 text-white shadow-soft hover:brightness-110 transition-all"
            >
              <CameraIcon className="w-8 h-8" />
              <span className="text-sm font-semibold">Prendre en photo</span>
            </button>
            <button
              onClick={() => courseFileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-ink-100 p-6 text-ink-800 shadow-card hover:bg-ink-50 transition-colors"
            >
              <UploadIcon className="w-8 h-8 text-amber" />
              <span className="text-sm font-semibold">Importer un fichier</span>
            </button>
            <input ref={courseCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCourseFile} />
            <input ref={courseFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCourseFile} />
          </div>

          <div>
            <SectionTitle title="Tes cours scannés" />
            <div className="flex flex-col gap-2">
              {courseScans.map((s) => {
                const subject = subjects.find((sub) => sub.id === s.subject_id)
                return (
                  <Card key={s.id} className="flex items-center gap-3 p-3.5">
                    <span className={`h-9 w-1.5 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">{s.title}</p>
                      <p className="text-xs text-ink-500">{subject?.name} · {(s.quiz || []).length} questions</p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => startQuiz({ ...s, quiz: s.quiz })}
                      className="shrink-0 text-xs px-3 py-1.5"
                    >
                      <BookIcon className="w-3.5 h-3.5" /> Faire le quiz
                    </Button>
                  </Card>
                )
              })}
              {courseScans.length === 0 && (
                <Card className="p-4 text-center text-sm text-ink-500">Aucun cours scanné pour l'instant.</Card>
              )}
            </div>
          </div>
        </>
      )}

      {mode === 'copie' && (
      <div>
        <SectionTitle title="Historique de tes scans" />
        <div className="flex flex-col gap-2">
          {allScans.map((s) => {
            const subject = subjects.find((sub) => sub.id === s.subjectId)
            return (
              <button
                key={s.id}
                onClick={() => { setHistoryScan(s); setActiveAnnotation(null); setStep('history') }}
                className="text-left"
              >
                <Card className="flex items-center gap-3 p-3.5 hover:bg-ink-50 transition-colors">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                  <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-[5px] border border-ink-200 bg-canvas">
                    <div className="absolute right-0 top-0 h-3 w-3 bg-[linear-gradient(135deg,transparent_50%,#e0dbcb_50%)]" />
                    {s.annotations.length > 0 && (
                      <>
                        <div className="absolute inset-x-1.5 top-3 h-[1.5px] bg-coral/60" />
                        <div className="absolute inset-x-1.5 top-[22px] h-[1.5px] bg-coral/35" />
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">{s.title}</p>
                    <p className="text-xs text-ink-500">{subject?.name} · {s.date}{s.grade ? ` · ${s.grade}` : ''}</p>
                  </div>
                  <Badge className="shrink-0 bg-ink-100 text-ink-600">{s.annotations.length} annotations</Badge>
                </Card>
              </button>
            )
          })}
          {allScans.length === 0 && (
            <Card className="p-4 text-center text-sm text-ink-500">Aucun scan pour l'instant.</Card>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

function AnnotationList({ annotations, activeId, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      {annotations.map((ann, i) => {
        const style = styleFor(ann.category)
        const active = activeId === ann.id
        return (
          <button key={ann.id} onClick={() => onSelect?.(ann.id)} className="text-left">
            <Card className={`flex items-start gap-3 p-3.5 transition-shadow ${active ? `ring-2 ${style.ring}` : ''}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${style.dot}`}>
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm text-ink-700">{ann.comment}</p>
                <Badge className={`mt-1.5 ${style.badge}`}>{errorCategories[ann.category].label}</Badge>
              </div>
            </Card>
          </button>
        )
      })}
    </div>
  )
}

function BackButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
      <ChevronLeftIcon className="w-4 h-4" /> {label}
    </button>
  )
}
