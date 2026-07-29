import { useEffect, useMemo, useState } from 'react'
import { weekEvents, examTargetDate } from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Badge, Button } from '../components/ui.jsx'
import { getContextualMessage, breathingPhases } from '../utils/mentalContext.js'

const todayIso = new Date().toISOString().slice(0, 10)

const METRICS = [
  { key: 'energie', label: 'Énergie' },
  { key: 'stress', label: 'Stress' },
  { key: 'focus', label: 'Focus' },
  { key: 'motivation', label: 'Motivation' },
  { key: 'sommeil', label: 'Sommeil' }
]

const TONE_CARD = {
  coral: 'bg-gradient-to-br from-coral to-[#ff7a5c] text-white',
  amber: 'bg-gradient-to-br from-amber to-[#d98c12] text-white',
  indigo: 'bg-gradient-to-br from-indigo to-[#5b3fae] text-white',
  teal: 'bg-gradient-to-br from-teal to-[#0c7a70] text-white'
}

function toFrDate(isoDate) {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}`
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
      <p className="text-sm font-medium text-white/60">Cycle {cycle + 1} / {totalCycles}</p>
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

export default function Mental({ userId }) {
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

  useEffect(() => {
    Promise.all([
      supabase.from('moods').select('mood_id, mood_date').eq('user_id', userId).order('mood_date', { ascending: false }).limit(5),
      supabase.from('energy_logs').select('*').eq('user_id', userId).order('log_date', { ascending: false }).limit(14),
      supabase.from('journal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false }).limit(10)
    ]).then(([{ data: moodRows }, { data: energyRows }, { data: journalRows }]) => {
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

      setLoading(false)
    })
  }, [userId])

  const contextMsg = useMemo(
    () => getContextualMessage({ weekEvents, examTargetDate, recentMoods }),
    [recentMoods]
  )

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

  return (
    <div className="flex flex-col gap-5">
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}

      <Card className={`p-5 ${TONE_CARD[contextMsg.tone]}`}>
        <p className="font-display text-lg font-semibold">{contextMsg.title}</p>
        <p className="mt-1.5 text-sm text-white/85">{contextMsg.body}</p>
        {contextMsg.action === 'breathing' && (
          <Button variant="secondary" onClick={() => setShowBreathing(true)} className="mt-3 bg-white/90 text-ink-800 hover:bg-white">
            Respiration guidée (1 min)
          </Button>
        )}
      </Card>

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
            <Button onClick={saveEnergy} className="w-full">Enregistrer</Button>
          </div>
        )}

        {energyHistory.length > 1 && (
          <div className="mt-4 flex items-end gap-1.5 border-t border-ink-100 pt-4">
            {energyHistory.map((row) => {
              const avg = (row.energie + row.stress + row.focus + row.motivation + row.sommeil) / 5
              const height = Math.max(8, Math.round((avg / 10) * 48))
              return (
                <div key={row.log_date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${avg >= 6 ? 'bg-teal' : avg >= 4 ? 'bg-amber' : 'bg-coral'}`}
                    style={{ height: `${height}px` }}
                  />
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
            {journalToday.victoire && (
              <Badge className="w-fit bg-amber-soft text-amber">🏆 {journalToday.victoire}</Badge>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1 text-xs font-medium text-ink-600">1 apprentissage, 1 difficulté, 1 ressenti — 3 lignes suffisent</p>
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
              <Card className="p-4 text-center text-sm text-ink-500">
                Note ta première victoire ce soir, même toute petite.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
