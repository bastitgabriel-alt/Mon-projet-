import { useEffect, useMemo, useState } from 'react'
import {
  subjects,
  subjectProgress,
  subjectAverages,
  gradeHistory,
  competitionGoal,
  examTargetDate,
  weekEvents,
  moodOptions,
  computeErrorGroups
} from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Button } from '../components/ui.jsx'
import { ScanIcon } from '../components/icons.jsx'
import { isDue } from '../utils/spacedRepetition.js'

const todayIso = new Date().toISOString().slice(0, 10)
const CHART_SUBJECTS = ['maths', 'physique', 'anglais', 'francais']
const CHART_COLORS = { maths: '#3b2f80', physique: '#e63950', anglais: '#0f9488', francais: '#f5a524' }

function frGrade(n) {
  return n.toFixed(1).replace('.', ',')
}

function deriveName(email) {
  const local = (email || '').split('@')[0].split(/[.\-_0-9]/)[0]
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'toi'
}

// "28/07" -> Date de cette année (les données de démo sont calées sur la
// semaine en cours, donc on suppose l'année courante).
function parseEventDate(ddmm) {
  const [d, m] = ddmm.split('/').map(Number)
  return new Date(new Date().getFullYear(), m - 1, d)
}

function relativeDayLabel(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date - today) / 86400000)
  if (diffDays === 0) return "aujourd'hui"
  if (diffDays === 1) return 'demain'
  if (diffDays > 1) return `dans ${diffDays} j`
  return null
}

function buildPolyline(values, min, max) {
  const w = 320
  const h = 120
  const step = w / (values.length - 1)
  return values
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / (max - min)) * (h - 20) - 10
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function computeStreak(moodDates) {
  const set = new Set(moodDates)
  let streak = 0
  const cursor = new Date()
  // Si l'humeur du jour n'est pas encore renseignée, on part d'hier pour ne
  // pas casser une série en cours avant la fin de la journée.
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function Dashboard({ onNavigate, userId, userEmail }) {
  const [mood, setMoodState] = useState(null)
  const [streak, setStreak] = useState(0)
  const [scans, setScans] = useState([])
  const [fichesToReview, setFichesToReview] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: todayMood }, { data: moodHistory }, { data: scanRows }, { data: ficheRows }] = await Promise.all([
        supabase.from('moods').select('mood_id').eq('user_id', userId).eq('mood_date', todayIso).maybeSingle(),
        supabase.from('moods').select('mood_date').eq('user_id', userId),
        supabase.from('scans').select('subject_id, title, grade, scan_date, annotations(category)').eq('user_id', userId).order('scan_date', { ascending: false }),
        supabase.from('fiches').select('id, next_review').eq('user_id', userId)
      ])

      setMoodState(todayMood?.mood_id ?? null)
      setStreak(computeStreak((moodHistory || []).map((m) => m.mood_date)))
      setScans(
        (scanRows || []).map((s) => ({
          subjectId: s.subject_id,
          title: s.title,
          grade: s.grade,
          date: s.scan_date,
          annotations: s.annotations || []
        }))
      )
      setFichesToReview((ficheRows || []).filter((f) => isDue({ nextReview: f.next_review }, todayIso)).length)
      setLoading(false)
    }
    load()
  }, [userId])

  async function setMood(id) {
    const alreadyLoggedToday = mood !== null
    setMoodState(id)
    await supabase
      .from('moods')
      .upsert({ user_id: userId, mood_date: todayIso, mood_id: id }, { onConflict: 'user_id,mood_date' })
    // computeStreak (au chargement) exclut aujourd'hui tant qu'il n'est pas
    // encore renseigné : le premier enregistrement du jour allonge donc la
    // série d'un jour ; un changement d'humeur le même jour ne la change pas.
    if (!alreadyLoggedToday) setStreak((s) => s + 1)
  }

  const selectedMood = moodOptions.find((m) => m.id === mood)

  const daysToExam = Math.ceil((new Date(examTargetDate) - new Date()) / 86400000)
  const progressAvg = Math.round(
    Object.values(subjectProgress).reduce((a, b) => a + b, 0) / Object.values(subjectProgress).length
  )
  const overallAverage = useMemo(() => {
    const values = CHART_SUBJECTS.map((id) => subjectAverages[id])
    return values.reduce((a, b) => a + b, 0) / values.length
  }, [])
  const previousAverage = useMemo(() => {
    const values = CHART_SUBJECTS.map((id) => gradeHistory[id][gradeHistory[id].length - 2])
    return values.reduce((a, b) => a + b, 0) / values.length
  }, [])
  const averageDelta = overallAverage - previousAverage

  const nextColle = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return weekEvents
      .filter((e) => e.type === 'colle')
      .map((e) => ({ ...e, parsedDate: parseEventDate(e.date) }))
      .filter((e) => e.parsedDate >= today)
      .sort((a, b) => a.parsedDate - b.parsedDate)[0]
  }, [])

  const recurringCount = useMemo(() => computeErrorGroups(scans).filter((g) => g.count > 1).length, [scans])
  const latestScan = scans[0]

  const chartMin = Math.min(...CHART_SUBJECTS.flatMap((id) => gradeHistory[id])) - 1
  const chartMax = Math.max(...CHART_SUBJECTS.flatMap((id) => gradeHistory[id])) + 1

  if (loading) {
    return <p className="text-sm text-ink-400">Chargement…</p>
  }

  return (
    <div className="flex flex-col gap-[22px]">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[20px] p-[30px] text-white flex items-center justify-between gap-6 flex-col sm:flex-row bg-[linear-gradient(120deg,#2c1f5e_0%,#46308f_48%,#7a3b6e_100%)]">
        <div
          className="pointer-events-none absolute -right-0 -top-[120px] h-[260px] w-[260px] rounded-full opacity-55 blur-[50px]"
          style={{ background: '#e63950' }}
        />
        <div
          className="pointer-events-none absolute -left-10 -bottom-[140px] h-[220px] w-[220px] rounded-full opacity-35 blur-[50px]"
          style={{ background: '#4d8bff' }}
        />
        <div className="relative z-10 self-start sm:self-auto">
          <div className="mb-2.5 text-[13px] text-white/75">Bonjour {deriveName(userEmail)} 👋</div>
          <div className="font-mono text-[46px] font-bold leading-none mb-1.5">J-{daysToExam}</div>
          <div className="mb-4.5 text-[13.5px] text-white/80">avant les premiers écrits</div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-[7px] text-[12.5px] font-semibold backdrop-blur-sm">
            <span>🔥</span> {streak > 0 ? `${streak} jour${streak > 1 ? 's' : ''} de suivi d'affilée` : 'Commence ton suivi aujourd\'hui'}
          </div>
        </div>
        <div className="relative z-10 h-[118px] w-[118px] shrink-0 self-center">
          <svg width="118" height="118" viewBox="0 0 118 118" className="-rotate-90">
            <circle cx="59" cy="59" r="42" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="10" />
            <circle
              cx="59" cy="59" r="42" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round"
              strokeDasharray="264" strokeDashoffset={264 - (264 * progressAvg) / 100}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono text-[21px] font-bold">{progressAvg}%</div>
            <div className="mt-0.5 text-center text-[10px] leading-tight text-white/75">programme<br />couvert</div>
          </div>
        </div>
      </div>

      {/* Chips matières */}
      <div className="flex flex-wrap gap-2.5">
        {subjects.map((s) => (
          <div key={s.id} className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[12.5px] transition-transform hover:-translate-y-0.5 hover:shadow-soft">
            <span className={`h-[9px] w-[9px] shrink-0 rounded-full ${s.accent}`} />
            <span className="font-semibold text-ink-900">{s.short}</span>
            <span className="font-mono text-xs text-ink-400">{frGrade(subjectAverages[s.id])}/20</span>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          tone="indigo"
          icon={<path d="M3 17l6-6 4 4 8-8M17 7h4v4" />}
          delta={
            <span className={`font-bold ${averageDelta >= 0 ? 'text-teal' : 'text-coral'}`}>
              {averageDelta >= 0 ? '↑' : '↓'} {frGrade(Math.abs(averageDelta))}
            </span>
          }
          value={frGrade(overallAverage)}
          label="moyenne générale /20"
        />
        <KpiCard
          tone="coral"
          icon={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>}
          delta={<span className="text-coral font-bold">{nextColle ? relativeDayLabel(nextColle.parsedDate) : '—'}</span>}
          value={nextColle ? nextColle.time : '—'}
          label={nextColle ? `prochaine colle · ${subjects.find((s) => s.id === nextColle.subjectId)?.short}` : 'aucune colle prévue'}
        />
        <KpiCard
          tone="amber"
          icon={<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>}
          delta={<span className="text-amber font-bold">à revoir</span>}
          value={String(fichesToReview)}
          label="fiches à réviser"
        />
        <KpiCard
          tone="teal"
          icon={<><path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="9" /></>}
          delta={<span className="text-coral font-bold">actif</span>}
          value={String(recurringCount)}
          label="erreurs récurrentes en cours"
        />
      </div>

      {/* Graphique + mini cards */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="p-[22px]">
          <div className="mb-4.5 flex items-center justify-between">
            <h2 className="font-display text-[15.5px] font-semibold text-ink-900">Évolution des notes</h2>
            <span className="text-xs text-ink-400">5 derniers DS</span>
          </div>
          <div className="mb-3.5 flex flex-wrap gap-4">
            {CHART_SUBJECTS.map((id) => (
              <div key={id} className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[id] }} />
                {subjects.find((s) => s.id === id)?.short}
              </div>
            ))}
          </div>
          <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="w-full h-auto block">
            {[10, 32.5, 55, 77.5, 100].map((y) => (
              <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#efecf9" strokeWidth="1" />
            ))}
            {CHART_SUBJECTS.map((id) => (
              <polyline
                key={id}
                points={buildPolyline(gradeHistory[id], chartMin, chartMax)}
                fill="none"
                stroke={CHART_COLORS[id]}
                strokeWidth={id === 'maths' ? 2.6 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <div className="mt-1 flex justify-between px-1 font-mono text-[11px] text-ink-400">
            {gradeHistory.maths.map((_, i) => <span key={i}>DS{i + 1}</span>)}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-[22px]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-coral to-[#ff7a5c]">
                <ScanIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-ink-900">Copies scannées</div>
                {latestScan ? (
                  <div className="text-xs text-ink-400">
                    {subjects.find((s) => s.id === latestScan.subjectId)?.name}{latestScan.grade ? ` · ${latestScan.grade}` : ''}
                  </div>
                ) : (
                  <div className="text-xs text-ink-400">Aucun scan pour l'instant</div>
                )}
              </div>
            </div>
            <p className="mb-3 text-[12.5px] leading-relaxed text-ink-600">
              {recurringCount > 0
                ? <>Tu as <b className="text-ink-900">{recurringCount} erreur{recurringCount > 1 ? 's' : ''} récurrente{recurringCount > 1 ? 's' : ''}</b> détectée{recurringCount > 1 ? 's' : ''} sur tes dernières copies.</>
                : 'Scanne une copie pour repérer tes erreurs récurrentes.'}
            </p>
            <Button onClick={() => onNavigate('scan')} className="w-full">
              Scanner une copie
            </Button>
          </Card>

          <Card className="p-[22px]">
            <h2 className="mb-3 font-display text-sm font-semibold text-ink-900">Objectif concours</h2>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-display text-[14.5px] font-semibold text-ink-900">{competitionGoal.school}</span>
              <span className="font-mono text-[11.5px] text-ink-400">top {competitionGoal.targetRank}</span>
            </div>
            <div className="mb-1.5 h-[7px] overflow-hidden rounded bg-indigo-soft">
              <div className="h-full rounded bg-gradient-to-r from-indigo to-coral transition-all duration-700" style={{ width: `${competitionGoal.progress}%` }} />
            </div>
            <div className="text-[11.5px] text-ink-400">Classement estimé : ~{competitionGoal.estimatedRank}ᵉ</div>
          </Card>
        </div>
      </div>

      {/* Planning + humeur */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-[22px]">
          <div className="mb-4.5 flex items-center justify-between">
            <h2 className="font-display text-[15.5px] font-semibold text-ink-900">Planning de la semaine</h2>
            <span className="text-xs text-ink-400">
              {weekEvents.filter((e) => e.type === 'ds').length} DS · {weekEvents.filter((e) => e.type === 'colle').length} colles
            </span>
          </div>
          <WeekPlan />
        </Card>

        <Card className="p-[22px]">
          <h2 className="mb-4.5 font-display text-[15.5px] font-semibold text-ink-900">Comment tu te sens ?</h2>
          <div className="mb-4 flex gap-2">
            {moodOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMood(opt.id)}
                className={`flex-1 rounded-[11px] border-[1.5px] px-1.5 py-3 text-center text-xs transition-colors ${
                  mood === opt.id ? 'border-amber bg-amber-soft font-bold text-[#a9660a]' : 'border-ink-200 bg-white text-ink-600 hover:border-ink-400'
                }`}
              >
                <span className="mb-1 block text-lg">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mb-3.5 text-[12.5px] text-ink-600">
            <b className="text-ink-900">{streak}</b> jour{streak > 1 ? 's' : ''} de suivi d'affilée
          </div>
          <div className="rounded-[9px] bg-teal-soft px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed text-teal">
            {selectedMood ? selectedMood.hint : "Sélectionne ton humeur pour un conseil personnalisé."}
          </div>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({ tone, icon, delta, value, label }) {
  const toneClasses = {
    indigo: { bg: 'bg-indigo-soft', stroke: 'text-indigo' },
    coral: { bg: 'bg-coral-soft', stroke: 'text-coral' },
    amber: { bg: 'bg-amber-soft', stroke: 'text-amber' },
    teal: { bg: 'bg-teal-soft', stroke: 'text-teal' }
  }[tone]

  return (
    <Card className="p-[18px_20px] transition-transform hover:-translate-y-[3px]">
      <div className="mb-3.5 flex items-center justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${toneClasses.bg}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-[15px] h-[15px] ${toneClasses.stroke}`}>
            {icon}
          </svg>
        </div>
        <div className="text-[11.5px]">{delta}</div>
      </div>
      <div className="mb-0.5 font-mono text-[23px] font-bold leading-tight text-ink-900">{value}</div>
      <div className="text-[12.5px] text-ink-500">{label}</div>
    </Card>
  )
}

function WeekPlan() {
  const todayName = new Date().toLocaleDateString('fr-FR', { weekday: 'long' })
  const todayCap = todayName.charAt(0).toUpperCase() + todayName.slice(1)
  const days = [...new Set(weekEvents.map((e) => e.day))]

  return (
    <table className="w-full border-collapse">
      <tbody>
        {days.map((day) => {
          const events = weekEvents.filter((e) => e.day === day)
          const isToday = day === todayCap
          return (
            <tr key={day} className={isToday ? 'bg-gradient-to-r from-indigo-soft to-transparent' : ''}>
              <td className="w-[90px] border-t border-ink-100 py-2.5 align-middle text-xs font-bold uppercase tracking-wide text-ink-500 first:border-t-0">
                {day}
              </td>
              <td className="border-t border-ink-100 py-2.5 align-middle text-sm first:border-t-0">
                {events.length === 0 ? (
                  <span className="text-[12.5px] text-ink-400">Rien de prévu</span>
                ) : (
                  events.map((e) => {
                    const subject = subjects.find((s) => s.id === e.subjectId)
                    return (
                      <div key={e.id} className="flex items-center gap-1.5 py-0.5 text-[12.5px] font-medium">
                        <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${subject?.accent}`} />
                        {e.title}
                        <span className="ml-auto font-mono text-[11.5px] text-ink-400">{e.time}</span>
                      </div>
                    )
                  })
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
