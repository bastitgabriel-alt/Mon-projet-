import { useEffect, useMemo, useState } from 'react'
import { subjects, weekEvents } from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Badge, Button } from '../components/ui.jsx'
import { CameraIcon } from '../components/icons.jsx'
import { isDue } from '../utils/spacedRepetition.js'
import { computeStreak } from '../utils/streak.js'
import { relativeDayLabel, nextUpcoming } from '../utils/schedule.js'
import { useAcademicCalendar } from '../lib/academicSchedule.js'

const todayIso = new Date().toISOString().slice(0, 10)

// "2026-07-18" -> "18/07/2026"
function toFrDate(isoDate) {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

export default function Dashboard({ onNavigate, userId }) {
  const [loading, setLoading] = useState(true)
  const [fichesToReview, setFichesToReview] = useState(0)
  const [streak, setStreak] = useState(0)
  const [recentScans, setRecentScans] = useState([])

  useEffect(() => {
    async function load() {
      const [{ data: ficheRows }, { data: recentScanRows }, { data: allScanDates }, { data: reviewRows }] = await Promise.all([
        supabase.from('fiches').select('next_review').eq('user_id', userId),
        supabase
          .from('scans')
          .select('id, subject_id, title, grade, scan_date, annotations(id)')
          .eq('user_id', userId)
          .order('scan_date', { ascending: false })
          .limit(4),
        supabase.from('scans').select('scan_date').eq('user_id', userId),
        supabase.from('review_log').select('reviewed_at').eq('user_id', userId)
      ])

      setFichesToReview((ficheRows || []).filter((f) => isDue({ nextReview: f.next_review }, todayIso)).length)
      setRecentScans(
        (recentScanRows || []).map((s) => ({
          id: s.id,
          subjectId: s.subject_id,
          title: s.title,
          grade: s.grade,
          date: toFrDate(s.scan_date),
          annotationsCount: (s.annotations || []).length
        }))
      )
      // Le streak reflète une vraie activité (scan ou révision), pas juste
      // l'ouverture de l'appli — plus fiable qu'un check-in d'humeur dédié.
      const activityDates = [
        ...(allScanDates || []).map((s) => s.scan_date),
        ...(reviewRows || []).map((r) => r.reviewed_at.slice(0, 10))
      ]
      setStreak(computeStreak(activityDates))
      setLoading(false)
    }
    load()
  }, [userId])

  const { events: realEvents, hasProfile } = useAcademicCalendar(userId)
  const activeEvents = hasProfile && realEvents ? realEvents : weekEvents
  const nextExam = useMemo(() => nextUpcoming(activeEvents, ['ds', 'colle']), [activeEvents])
  const examSoonLabel = nextExam ? relativeDayLabel(nextExam.parsedDate) : null
  const examIsImminent = examSoonLabel === "aujourd'hui" || examSoonLabel === 'demain'
  const examSubject = nextExam ? subjects.find((s) => s.id === nextExam.subjectId) : null

  if (loading) {
    return <p className="text-sm text-ink-400">Chargement…</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mode urgent — priorité absolue de l'écran quand un DS/colle est demain ou aujourd'hui. */}
      {examIsImminent && (
        <Card className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-br from-coral to-[#d98f82] p-4 text-white">
          <p className="text-sm font-medium">
            ⚡ {examSubject?.short} {examSoonLabel} — prépare un plan de révision ciblé
          </p>
          <Button
            variant="secondary"
            onClick={() => onNavigate('fiches', { autoStart: 'urgent' })}
            className="shrink-0 !bg-white px-3 py-1.5 text-xs !text-coral hover:!bg-white/90"
          >
            Mode urgent
          </Button>
        </Card>
      )}

      {/* Repères immédiats : ce qu'il y a à faire, et depuis combien de temps
          on tient le rythme — pour qu'on comprenne l'appli dès l'arrivée. */}
      <div className="flex gap-3">
        <button onClick={() => onNavigate('fiches', { autoStart: 'due' })} className="flex-1 text-left">
          <Card className="p-3.5 transition-transform hover:-translate-y-0.5">
            <p className={`font-mono text-2xl font-bold ${fichesToReview > 0 ? 'text-coral' : 'text-ink-900'}`}>
              {fichesToReview}
            </p>
            <p className="text-xs text-ink-500">fiche{fichesToReview > 1 ? 's' : ''} à réviser</p>
          </Card>
        </button>
        <Card className="flex-1 p-3.5">
          <p className="font-mono text-2xl font-bold text-ink-900">🔥 {streak}</p>
          <p className="text-xs text-ink-500">jour{streak > 1 ? 's' : ''} de suivi d'affilée</p>
        </Card>
      </div>

      {/* Zone de scan — le cœur de Marge : photo → erreurs détectées → fiches. */}
      <button onClick={() => onNavigate('scan')} className="block w-full text-left">
        <div className="relative overflow-hidden rounded-[20px] bg-indigo p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-11 w-11 bg-[linear-gradient(135deg,transparent_50%,rgba(250,247,240,0.12)_50%)]" />
          <div className="pointer-events-none absolute inset-3.5 rounded-2xl border border-dashed border-white/25" />
          <div className="scan-sweep-line" />
          <div className="relative z-10 flex flex-col items-center gap-3 py-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber">
              <CameraIcon className="h-6 w-6 text-indigo" />
            </span>
            <span className="font-display text-lg font-medium text-white">Scanner une copie</span>
            <span className="text-xs text-white/60">Photo ou import de fichier</span>
          </div>
        </div>
      </button>

      {/* Copies récentes */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Copies récentes</p>
          <button onClick={() => onNavigate('scan')} className="text-xs font-medium text-indigo hover:underline">
            Tout voir
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {recentScans.map((s) => {
            const subject = subjects.find((sub) => sub.id === s.subjectId)
            return (
              <button key={s.id} onClick={() => onNavigate('scan')} className="text-left">
                <Card className="flex items-center gap-3 p-3.5 hover:bg-ink-50 transition-colors">
                  <span className={`h-9 w-1.5 shrink-0 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                  <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-[5px] border border-ink-200 bg-canvas">
                    <div className="absolute right-0 top-0 h-3 w-3 bg-[linear-gradient(135deg,transparent_50%,#e0dbcb_50%)]" />
                    {s.annotationsCount > 0 && (
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
                  <Badge className="shrink-0 bg-ink-100 text-ink-600">{s.annotationsCount} annotations</Badge>
                </Card>
              </button>
            )
          })}
          {recentScans.length === 0 && (
            <Card className="p-4 text-center text-sm text-ink-500">Aucune copie scannée pour l'instant.</Card>
          )}
        </div>
      </div>
    </div>
  )
}
