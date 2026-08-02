import { useEffect, useMemo, useState } from 'react'
import { weekEvents, examTargetDate } from '../data/mockData.js'
import { subjectBank } from '../data/subjectBank.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Badge, Button } from '../components/ui.jsx'
import { detectContexts, breathingPhases } from '../utils/mentalContext.js'
import { useAcademicCalendar } from '../lib/academicSchedule.js'
import { getWeakestCompetencies, getStrongestCompetencies, buildWeeklyPlan } from '../utils/weeklyPlan.js'
import { computeScoreTimeline, predictScoreIn90Days, findProgressReminder } from '../utils/competencyHistory.js'
import { detectWeakPoints } from '../utils/weakPointDetection.js'
import {
  AvantDSPanel,
  ApresEvaluationPanel,
  AvantKhollePanel,
  PeriodeDoutePanel,
  RoutineSoirPanel,
  BilanWeekendPanel
} from '../components/mentalPanels.jsx'

const todayIso = new Date().toISOString().slice(0, 10)

const METRICS = [
  { key: 'energie', label: 'Énergie' },
  { key: 'stress', label: 'Stress' },
  { key: 'focus', label: 'Focus' },
  { key: 'motivation', label: 'Motivation' },
  { key: 'sommeil', label: 'Sommeil' }
]

const TONE_CARD = {
  coral: 'bg-gradient-to-br from-coral to-[#d98f82] text-white',
  amber: 'bg-gradient-to-br from-amber to-[#c08a34] text-white',
  indigo: 'bg-gradient-to-br from-indigo to-[#2e4368] text-white',
  teal: 'bg-gradient-to-br from-teal to-[#46614f] text-white'
}

function toFrDate(isoDate) {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}`
}

function pickWarmupQuestions(subjectId) {
  const chapters = subjectBank[subjectId]
  if (!chapters) return []
  const all = Object.values(chapters).flat()
  return [...all]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((s) => s.text)
}

function BreathingExercise({ onClose }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
  const totalCycles = 3

  useEffect(() => {
    const phase = breathingPhases[phaseIndex]
    const t = setTimeout(() => {
      if (phaseIndex + 1 >= breathingPhases.length) {
        if (cycle + 1 >= totalCycles) {
          onClose()
          return
        }
        setCycle((c) => c + 1)
        setPhaseIndex(0)
      } else {
        setPhaseIndex((p) => p + 1)
      }
    }, phase.seconds * 1000)
    return () => clearTimeout(t)
  }, [phaseIndex, cycle, onClose])

  const phase = breathingPhases[phaseIndex]
  const scale = [1, 1, 0.55, 0.55][phaseIndex]

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-sidebar-1/95 px-6">
      <p className="text-sm font-medium text-white/60">
        Cycle {cycle + 1} / {totalCycles}
      </p>
      <div
        className="h-40 w-40 rounded-full bg-gradient-to-br from-indigo to-coral transition-transform ease-in-out"
        style={{ transform: `scale(${scale})`, transitionDuration: `${phase.seconds}s` }}
      />
      <p className="font-display text-2xl font-medium text-white">{phase.label}</p>
      <button onClick={onClose} className="text-sm font-medium text-white/60 hover:text-white">
        Arrêter
      </button>
    </div>
  )
}

export default function Mental({ userId, onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [recentMoods, setRecentMoods] = useState([])
  const [showBreathing, setShowBreathing] = useState(false)

  const [energyToday, setEnergyToday] = useState(null)
  const [energyForm, setEnergyForm] = useState({ energie: 5, stress: 5, focus: 5, motivation: 5, sommeil: 5 })
  const [energyHistory, setEnergyHistory] = useState([])
  const [editingEnergy, setEditingEnergy] = useState(false)

  const [journalToday, setJournalToday] = useState(null)
  const [journalContent, setJournalContent] = useState('')
  const [journalVictoire, setJournalVictoire] = useState('')
  const [journalHistory, setJournalHistory] = useState([])
  const [editingJournal, setEditingJournal] = useState(false)

  const [competencyLevels, setCompetencyLevels] = useState({})
  const [historyRows, setHistoryRows] = useState([])
  const [scans, setScans] = useState([])
  const [fiches, setFiches] = useState([])

  useEffect(() => {
    Promise.all([
      supabase.from('moods').select('mood_id, mood_date').eq('user_id', userId).order('mood_date', { ascending: false }).limit(5),
      supabase.from('energy_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }).limit(14),
      supabase.from('journal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false }).limit(20),
      supabase.from('competency_levels').select('subject_id, competency_key, level').eq('user_id', userId),
      supabase.from('competency_history').select('subject_id, competency_key, level, recorded_at').eq('user_id', userId),
      supabase.from('scans').select('subject_id, annotations(category)').eq('user_id', userId),
      supabase.from('fiches').select('title, subject_id, repetitions, ease_factor').eq('user_id', userId)
    ]).then(([{ data: moodRows }, { data: energyRows }, { data: journalRows }, { data: levelRows }, { data: historyData }, { data: scanRows }, { data: ficheRows }]) => {
      setRecentMoods((moodRows || []).map((m) => m.mood_id))

      const todayEnergy = (energyRows || []).find((r) => r.log_date === todayIso)
      setEnergyToday(todayEnergy || null)
      if (todayEnergy) {
        setEnergyForm({
          energie: todayEnergy.energie,
          stress: todayEnergy.stress,
          focus: todayEnergy.focus,
          motivation: todayEnergy.motivation,
          sommeil: todayEnergy.sommeil
        })
      }
      setEnergyHistory((energyRows || []).slice().reverse())

      const todayJournal = (journalRows || []).find((r) => r.entry_date === todayIso)
      setJournalToday(todayJournal || null)
      if (todayJournal) {
        setJournalContent(todayJournal.content || '')
        setJournalVictoire(todayJournal.victoire || '')
      }
      setJournalHistory(journalRows || [])

      const levelMap = {}
      ;(levelRows || []).forEach((row) => {
        levelMap[`${row.subject_id}__${row.competency_key}`] = row.level
      })
      setCompetencyLevels(levelMap)
      setHistoryRows(historyData || [])
      setScans((scanRows || []).map((s) => ({ subjectId: s.subject_id, annotations: s.annotations || [] })))
      setFiches(
        (ficheRows || []).map((f) => ({ title: f.title, subjectId: f.subject_id, repetitions: f.repetitions, easeFactor: Number(f.ease_factor) }))
      )

      setLoading(false)
    })
  }, [userId])

  const { events: realEvents, examTargetDate: realExamTargetDate, hasProfile } = useAcademicCalendar(userId)
  const activeEvents = hasProfile && realEvents ? realEvents : weekEvents
  const activeExamTargetDate = hasProfile && realExamTargetDate ? realExamTargetDate : examTargetDate

  const contexts = useMemo(
    () => detectContexts({ weekEvents: activeEvents, examTargetDate: activeExamTargetDate, recentMoods }),
    [activeEvents, activeExamTargetDate, recentMoods]
  )

  const strongCompetencies = useMemo(
    () => (contexts.avantDS ? getStrongestCompetencies(competencyLevels, contexts.avantDS.subjectId) : []),
    [contexts.avantDS, competencyLevels]
  )

  const progressReminder = useMemo(() => findProgressReminder(historyRows), [historyRows])

  const warmupQuestions = useMemo(
    () => (contexts.avantKholle ? pickWarmupQuestions(contexts.avantKholle.subjectId) : []),
    [contexts.avantKholle]
  )

  const scoreTimeline = useMemo(() => computeScoreTimeline(historyRows), [historyRows])
  const prediction = useMemo(() => predictScoreIn90Days(scoreTimeline), [scoreTimeline])
  const scoreGlobal = scoreTimeline.length > 0 ? scoreTimeline[scoreTimeline.length - 1].score : null
  const scoreTrendText = prediction ? `tendance à la hausse` : null

  const weeklyVictories = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoIso = weekAgo.toISOString().slice(0, 10)
    return journalHistory.filter((j) => j.victoire && j.entry_date >= weekAgoIso).map((j) => j.victoire)
  }, [journalHistory])

  const weekendWeakPoints = useMemo(
    () => (contexts.weekend ? detectWeakPoints({ scans, fiches, competencyLevels }).slice(0, 3) : []),
    [contexts.weekend, scans, fiches, competencyLevels]
  )

  const weeklyPlan = useMemo(
    () => (contexts.weekend ? buildWeeklyPlan({ events: activeEvents, levels: competencyLevels, energyToday }) : null),
    [contexts.weekend, activeEvents, competencyLevels, energyToday]
  )

  function prefillJournal(text) {
    setJournalContent((prev) => (prev ? `${prev}\n${text}` : text))
    setEditingJournal(true)
  }

  async function saveEnergy() {
    const { data } = await supabase
      .from('energy_logs')
      .upsert({ user_id: userId, log_date: todayIso, ...energyForm }, { onConflict: 'user_id,log_date' })
      .select()
      .single()
    setEnergyToday(data)
    setEnergyHistory((prev) => [...prev.filter((r) => r.log_date !== todayIso), data])
    setEditingEnergy(false)
  }

  async function saveJournal() {
    const { data } = await supabase
      .from('journal_entries')
      .upsert(
        { user_id: userId, entry_date: todayIso, content: journalContent, victoire: journalVictoire || null },
        { onConflict: 'user_id,entry_date' }
      )
      .select()
      .single()
    setJournalToday(data)
    setJournalHistory((prev) => [data, ...prev.filter((r) => r.entry_date !== todayIso)])
    setEditingJournal(false)
  }

  if (loading) {
    return <p className="text-sm text-ink-400">Chargement…</p>
  }

  const hasRichPanel = contexts.avantDS || contexts.apresDS || contexts.apresKholle || contexts.avantKholle || contexts.periodeDoute
  const fallback = !hasRichPanel && !contexts.weekend && !contexts.soir
  const fallbackContext = contexts.avantConcours
    ? { tone: 'amber', title: `J-${contexts.avantConcours.daysToExam} avant les écrits`, body: 'C\'est le moment de passer en mode simulation : conditions réelles, temps chronométré. La régularité compte plus que l\'intensité maintenant.' }
    : contexts.apresResultats
      ? { tone: 'indigo', title: 'Résultats de concours', body: 'Quel que soit le résultat, prends le temps de le digérer avant de penser à la suite.' }
      : { tone: 'teal', title: 'Semaine normale', body: 'Pas d\'échéance immédiate — profites-en pour consolider un point faible ou prendre un peu de repos actif.' }

  return (
    <div className="flex flex-col gap-5">
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}

      {contexts.avantDS && (
        <AvantDSPanel event={contexts.avantDS} strongCompetencies={strongCompetencies} onBreathing={() => setShowBreathing(true)} />
      )}

      {(contexts.apresDS || contexts.apresKholle) && (
        <ApresEvaluationPanel event={contexts.apresDS || contexts.apresKholle} progressReminder={progressReminder} onJournalPrefill={prefillJournal} />
      )}

      {contexts.avantKholle && (
        <AvantKhollePanel event={contexts.avantKholle} warmupQuestions={warmupQuestions} onBreathing={() => setShowBreathing(true)} />
      )}

      {contexts.periodeDoute && (
        <PeriodeDoutePanel scoreGlobal={scoreGlobal} scoreTrendText={scoreTrendText} onNavigate={onNavigate} />
      )}

      {contexts.weekend && (
        <BilanWeekendPanel weeklyVictories={weeklyVictories} weakPoints={weekendWeakPoints} weeklyPlanPriorities={weeklyPlan?.priorities || []} />
      )}

      {contexts.soir && <RoutineSoirPanel />}

      {fallback && (
        <Card className={`p-5 ${TONE_CARD[fallbackContext.tone]}`}>
          <p className="font-display text-lg font-semibold">{fallbackContext.title}</p>
          <p className="mt-1.5 text-sm text-white/85">{fallbackContext.body}</p>
        </Card>
      )}

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-[15.5px] font-semibold text-ink-900">Comment tu te sens aujourd'hui</p>
          {energyToday && !editingEnergy && (
            <button onClick={() => setEditingEnergy(true)} className="text-xs font-medium text-indigo hover:underline">
              Modifier
            </button>
          )}
        </div>

        {energyToday && !editingEnergy ? (
          <div className="grid grid-cols-5 gap-2 text-center">
            {METRICS.map((m) => (
              <div key={m.key}>
                <p className="font-mono text-lg font-bold text-ink-800">{energyToday[m.key]}</p>
                <p className="text-[11px] text-ink-500">{m.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {METRICS.map((m) => (
              <div key={m.key}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium text-ink-600">{m.label}</p>
                  <p className="font-mono text-xs font-semibold text-indigo">{energyForm[m.key]}/10</p>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={energyForm[m.key]}
                  onChange={(e) => setEnergyForm((f) => ({ ...f, [m.key]: Number(e.target.value) }))}
                  className="w-full accent-indigo"
                />
              </div>
            ))}
            <Button onClick={saveEnergy} className="w-full">
              Enregistrer
            </Button>
          </div>
        )}

        {energyHistory.length > 1 && (
          <div className="mt-4 flex items-end gap-1.5 border-t border-ink-100 pt-4">
            {energyHistory.map((row) => {
              const avg = (row.energie + row.stress + row.focus + row.motivation + row.sommeil) / 5
              const height = Math.max(8, Math.round((avg / 10) * 48))
              return (
                <div key={row.log_date} className="flex flex-1 flex-col items-center gap-1">
                  <div className={`w-full rounded-t ${avg >= 6 ? 'bg-teal' : avg >= 4 ? 'bg-amber' : 'bg-coral'}`} style={{ height: `${height}px` }} />
                  <span className="text-[9px] text-ink-400">{toFrDate(row.log_date)}</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-[15.5px] font-semibold text-ink-900">Journal du soir</p>
          {journalToday && !editingJournal && (
            <button onClick={() => setEditingJournal(true)} className="text-xs font-medium text-indigo hover:underline">
              Modifier
            </button>
          )}
        </div>

        {journalToday && !editingJournal ? (
          <div className="flex flex-col gap-2">
            <p className="whitespace-pre-line text-sm text-ink-700">{journalToday.content}</p>
            {journalToday.victoire && <Badge className="w-fit bg-amber-soft text-amber">🏆 {journalToday.victoire}</Badge>}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-ink-600">1 apprentissage, 1 chose à améliorer — ta victoire a son propre champ juste en dessous</p>
              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                rows={4}
                placeholder="Ce qui m'a surpris aujourd'hui…"
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-ink-600">Ta victoire d'aujourd'hui (même minuscule)</p>
              <input
                value={journalVictoire}
                onChange={(e) => setJournalVictoire(e.target.value)}
                placeholder="Ex : j'ai fini l'exercice qui me bloquait depuis 2 jours"
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700"
              />
            </div>
            <Button onClick={saveJournal} disabled={!journalContent.trim()} className="w-full">
              Enregistrer
            </Button>
          </div>
        )}
      </Card>

      {journalHistory.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Mur des victoires</p>
          <div className="flex flex-col gap-2">
            {journalHistory
              .filter((j) => j.victoire)
              .slice(0, 8)
              .map((j) => (
                <Card key={j.id} className="flex items-center gap-3 p-3.5">
                  <span className="text-lg">🏆</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800">{j.victoire}</p>
                    <p className="text-xs text-ink-500">{toFrDate(j.entry_date)}</p>
                  </div>
                </Card>
              ))}
            {journalHistory.filter((j) => j.victoire).length === 0 && (
              <Card className="p-4 text-center text-sm text-ink-500">Note ta première victoire ce soir, même toute petite.</Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
