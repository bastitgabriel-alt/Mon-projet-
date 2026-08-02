import { useEffect, useMemo, useState } from 'react'
import { subjects } from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Badge, Button } from '../components/ui.jsx'
import { generateAcademicCalendar, eventTypeMeta } from '../utils/academicCalendar.js'
import { getLifeMode } from '../utils/lifeMode.js'
import { getSmartAlerts } from '../utils/smartAlerts.js'
import { buildWeeklyPlan } from '../utils/weeklyPlan.js'

const ALERT_TONE = {
  coral: 'bg-coral-soft text-coral',
  amber: 'bg-amber-soft text-amber',
  teal: 'bg-teal-soft text-teal'
}

const FILIERE_OPTIONS = ['MPSI', 'PCSI', 'MP', 'PSI', 'PC', 'PT', 'BCPST']
const MODE_TONE = {
  normal: 'bg-gradient-to-br from-teal to-[#46614f] text-white',
  survie: 'bg-gradient-to-br from-coral to-[#d98f82] text-white',
  kholle: 'bg-gradient-to-br from-coral to-[#d98f82] text-white',
  consolidation: 'bg-gradient-to-br from-teal to-[#46614f] text-white',
  simulation: 'bg-gradient-to-br from-amber to-[#c08a34] text-white',
  recuperation: 'bg-gradient-to-br from-indigo to-[#2e4368] text-white'
}
const WEEKS_PAGE = 12

function eventTitle(e) {
  if (e.type === 'ds') return `DS de ${subjects.find((s) => s.id === e.subjectId)?.short || e.subjectId}`
  if (e.type === 'colle') return `Colle de ${subjects.find((s) => s.id === e.subjectId)?.short || e.subjectId}`
  return e.title
}

function weekMonday(iso) {
  const d = new Date(iso)
  const offset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

function formatDayMonth(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

export default function Calendrier({ userId }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [filiere, setFiliere] = useState(FILIERE_OPTIONS[0])
  const [annee, setAnnee] = useState(1)
  const [dateRentree, setDateRentree] = useState('')
  const [weeksToShow, setWeeksToShow] = useState(WEEKS_PAGE)
  const [competencyLevels, setCompetencyLevels] = useState({})
  const [energyToday, setEnergyToday] = useState(null)
  const [planDismissed, setPlanDismissed] = useState(false)

  const todayIso = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    supabase
      .from('user_academic_profile')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })

    supabase
      .from('competency_levels')
      .select('subject_id, competency_key, level')
      .eq('user_id', userId)
      .then(({ data }) => {
        const map = {}
        ;(data || []).forEach((row) => {
          map[`${row.subject_id}__${row.competency_key}`] = row.level
        })
        setCompetencyLevels(map)
      })

    supabase
      .from('energy_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', todayIso)
      .maybeSingle()
      .then(({ data }) => setEnergyToday(data || null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const events = useMemo(() => {
    if (!profile) return []
    return generateAcademicCalendar({ filiere: profile.filiere, annee: profile.annee, dateRentree: profile.date_rentree })
  }, [profile])

  const lifeMode = useMemo(() => (events.length > 0 ? getLifeMode(events) : null), [events])
  const smartAlerts = useMemo(() => (events.length > 0 ? getSmartAlerts(events) : []), [events])
  const weeklyPlan = useMemo(
    () =>
      events.length > 0
        ? buildWeeklyPlan({ events: events.map((e) => ({ ...e, title: eventTitle(e) })), levels: competencyLevels, energyToday })
        : null,
    [events, competencyLevels, energyToday]
  )

  const upcoming = useMemo(() => events.filter((e) => (e.endDate || e.date) >= todayIso), [events, todayIso])

  const weekGroups = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + weeksToShow * 7)
    const cutoffIso = cutoff.toISOString().slice(0, 10)
    const visible = upcoming.filter((e) => e.date <= cutoffIso)
    const groups = new Map()
    visible.forEach((e) => {
      const key = weekMonday(e.date)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(e)
    })
    return Array.from(groups.entries())
  }, [upcoming, weeksToShow])

  async function saveProfile() {
    if (!dateRentree) return
    const { data } = await supabase
      .from('user_academic_profile')
      .upsert({ user_id: userId, filiere, annee, date_rentree: dateRentree }, { onConflict: 'user_id' })
      .select()
      .single()
    setProfile(data)
  }

  if (loading) {
    return <p className="text-sm text-ink-400">Chargement…</p>
  }

  if (!profile) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Ton calendrier de prépa sur 2 ans</h1>
          <p className="mt-1 text-sm text-ink-500">
            Quelques infos pour générer automatiquement tes vacances, DS, colles et dates de concours sur les 2 ans.
          </p>
        </div>

        <Card className="p-5">
          <p className="mb-2 text-sm font-medium text-ink-700">Filière</p>
          <div className="flex flex-wrap gap-2">
            {FILIERE_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setFiliere(f)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  filiere === f ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-2 text-sm font-medium text-ink-700">Année actuelle</p>
          <div className="flex gap-2">
            <button
              onClick={() => setAnnee(1)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                annee === 1 ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
              }`}
            >
              1ère année
            </button>
            <button
              onClick={() => setAnnee(2)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                annee === 2 ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
              }`}
            >
              2e année
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-2 text-sm font-medium text-ink-700">Date de rentrée de cette année</p>
          <input
            type="date"
            value={dateRentree}
            onChange={(e) => setDateRentree(e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700"
          />
        </Card>

        <Button onClick={saveProfile} disabled={!dateRentree} className="w-full">
          Générer mon calendrier
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className={`p-5 ${MODE_TONE[lifeMode.mode]}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {profile.filiere} · {profile.annee === 1 ? '1ère' : '2e'} année
        </p>
        <p className="mt-1 font-display text-lg font-semibold">{lifeMode.title}</p>
        <p className="mt-1 text-sm text-white/85">{lifeMode.description}</p>
      </Card>

      {smartAlerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {smartAlerts.map((a) => (
            <Card key={a.id} className={`flex items-start gap-2.5 p-3.5 ${ALERT_TONE[a.tone]}`}>
              <span className="shrink-0">🔔</span>
              <p className="text-sm font-medium">{a.text}</p>
            </Card>
          ))}
        </div>
      )}

      {weeklyPlan && !planDismissed && (
        <Card className="p-5">
          <p className="mb-3 font-display text-[15.5px] font-semibold text-ink-900">Plan de la semaine</p>
          <ul className="mb-4 flex flex-col gap-2.5">
            {weeklyPlan.priorities.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-700">
                <span className="shrink-0 text-indigo">→</span>
                {p}
              </li>
            ))}
          </ul>
          <Button variant="secondary" onClick={() => setPlanDismissed(true)} className="w-full">
            Compris, je m'y mets
          </Button>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {weekGroups.map(([weekStart, weekEvents]) => (
          <div key={weekStart}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Semaine du {formatDayMonth(weekStart)}
            </p>
            <div className="flex flex-col gap-2">
              {weekEvents.map((e) => {
                const meta = eventTypeMeta[e.type]
                return (
                  <Card key={e.id} className="flex items-center gap-3 p-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">{eventTitle(e)}</p>
                      <p className="text-xs text-ink-500">
                        {formatDayMonth(e.date)}
                        {e.endDate ? ` → ${formatDayMonth(e.endDate)}` : ''}
                      </p>
                    </div>
                    <Badge className={`shrink-0 ${meta.tone}`}>{meta.label}</Badge>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
        {weekGroups.length === 0 && (
          <Card className="p-4 text-center text-sm text-ink-500">Rien de prévu sur cette période.</Card>
        )}
      </div>

      <Button variant="ghost" onClick={() => setWeeksToShow((w) => w + WEEKS_PAGE)} className="w-full border border-ink-200">
        Voir plus loin
      </Button>
    </div>
  )
}
