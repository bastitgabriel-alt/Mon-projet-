import { useEffect, useState } from 'react'
import { subjects } from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Button } from './ui.jsx'
import { ChevronLeftIcon } from './icons.jsx'
import { isPushSupported, getNotificationPermission, subscribeToPush, scheduleNotification, cancelPendingNotifications } from '../lib/pushNotifications.js'

const PHASE_NOTIF = {
  focus: { title: 'Fin du focus', body: 'Ta session de focus est terminée. Passe en pause.' },
  shortBreak: { title: 'Fin de la pause', body: 'La pause est terminée. Retour au focus.' },
  longBreak: { title: 'Fin de la pause', body: 'La pause est terminée. Retour au focus.' }
}

const DURATIONS = { focus: 25, shortBreak: 5, longBreak: 15 }
const CYCLES_BEFORE_LONG_BREAK = 4
const PHASE_LABEL = { focus: 'Focus', shortBreak: 'Pause courte', longBreak: 'Pause longue' }

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function PomodoroTimer({ userId, onExit }) {
  const [subjectId, setSubjectId] = useState(null)
  const [phase, setPhase] = useState('focus') // focus | shortBreak | longBreak
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus * 60)
  const [running, setRunning] = useState(false)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [notifStatus, setNotifStatus] = useState('unsupported') // unsupported | default | denied | granted
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    const todayIso = new Date().toISOString().slice(0, 10)
    supabase
      .from('pomodoro_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('completed_at', todayIso)
      .then(({ count }) => setTodayCount(count || 0))

    setNotifStatus(getNotificationPermission())
  }, [userId])

  async function enableNotifications() {
    setSubscribing(true)
    try {
      await subscribeToPush(userId)
      setNotifStatus('granted')
    } catch {
      setNotifStatus(getNotificationPermission())
    }
    setSubscribing(false)
  }

  useEffect(() => {
    if (!running) return
    if (secondsLeft <= 0) {
      handlePhaseEnd()
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, secondsLeft])

  async function handlePhaseEnd() {
    setRunning(false)
    if (notifStatus === 'granted') cancelPendingNotifications(userId)
    if (phase === 'focus') {
      await supabase.from('pomodoro_sessions').insert({ user_id: userId, subject_id: subjectId, duration_minutes: DURATIONS.focus })
      setTodayCount((c) => c + 1)
      const nextCycles = completedCycles + 1
      setCompletedCycles(nextCycles)
      const nextPhase = nextCycles % CYCLES_BEFORE_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak'
      setPhase(nextPhase)
      setSecondsLeft(DURATIONS[nextPhase] * 60)
    } else {
      setPhase('focus')
      setSecondsLeft(DURATIONS.focus * 60)
    }
  }

  function reset() {
    setRunning(false)
    setPhase('focus')
    setSecondsLeft(DURATIONS.focus * 60)
    if (notifStatus === 'granted') cancelPendingNotifications(userId)
  }

  function startQuickBreak() {
    if (notifStatus === 'granted') cancelPendingNotifications(userId)
    setPhase('shortBreak')
    setSecondsLeft(DURATIONS.shortBreak * 60)
    setRunning(true)
    if (notifStatus === 'granted') {
      const notif = PHASE_NOTIF.shortBreak
      scheduleNotification({ userId, delaySeconds: DURATIONS.shortBreak * 60, title: notif.title, body: notif.body })
    }
  }

  function toggle() {
    if (running) {
      setRunning(false)
      if (notifStatus === 'granted') cancelPendingNotifications(userId)
    } else {
      setRunning(true)
      if (notifStatus === 'granted') {
        const notif = PHASE_NOTIF[phase]
        scheduleNotification({ userId, delaySeconds: secondsLeft, title: notif.title, body: notif.body })
      }
    }
  }

  function handleExit() {
    if (notifStatus === 'granted') cancelPendingNotifications(userId)
    onExit()
  }

  const totalSeconds = DURATIONS[phase] * 60
  const percent = (secondsLeft / totalSeconds) * 100
  const subject = subjects.find((s) => s.id === subjectId)
  const isFreshFocus = phase === 'focus' && !running && secondsLeft === DURATIONS.focus * 60

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button onClick={handleExit} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Retour aux fiches
        </button>
        {todayCount > 0 && (
          <span className="font-mono text-sm text-ink-500">
            {todayCount} session{todayCount > 1 ? 's' : ''} aujourd'hui
          </span>
        )}
      </div>

      {notifStatus === 'default' && (
        <Card className="flex items-center justify-between gap-3 bg-indigo-soft p-4">
          <p className="text-sm text-indigo">Reçois une notification à la fin du focus, même si tu changes d'écran.</p>
          <Button variant="secondary" onClick={enableNotifications} disabled={subscribing} className="shrink-0 bg-white text-xs px-3 py-1.5">
            {subscribing ? '…' : 'Activer'}
          </Button>
        </Card>
      )}
      {notifStatus === 'denied' && (
        <Card className="p-4 bg-amber-soft text-sm text-amber">
          Notifications bloquées pour ce site — active-les dans les réglages de ton navigateur si tu changes d'avis.
        </Card>
      )}

      {isFreshFocus && (
        <Card className="p-4">
          <p className="mb-2 text-sm font-medium text-ink-700">Matière (optionnel)</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSubjectId(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                !subjectId ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
              }`}
            >
              Aucune
            </button>
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubjectId(s.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  subjectId === s.id ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
                }`}
              >
                {s.short}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col items-center gap-4 py-6">
        <p className={`text-sm font-semibold uppercase tracking-wide ${phase === 'focus' ? 'text-indigo' : 'text-teal'}`}>
          {PHASE_LABEL[phase]}
          {subject ? ` · ${subject.short}` : ''}
        </p>

        <div className="relative h-56 w-56">
          <svg viewBox="0 0 200 200" className="-rotate-90">
            <circle cx="100" cy="100" r="88" fill="none" stroke="#efecf9" strokeWidth="12" />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke={phase === 'focus' ? '#3b2f80' : '#0f9488'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - percent / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-4xl font-bold text-ink-900">{formatTime(secondsLeft)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={toggle} className="px-8">
            {running ? 'Pause' : 'Démarrer'}
          </Button>
          <Button variant="ghost" onClick={reset} className="border border-ink-200">
            Réinitialiser
          </Button>
        </div>

        {phase !== 'shortBreak' && (
          <button onClick={startQuickBreak} className="text-xs font-medium text-teal hover:underline">
            Besoin d'une pause tout de suite ? Pause de 5 min →
          </button>
        )}

        {completedCycles > 0 && (
          <p className="text-xs text-ink-500">
            {completedCycles} cycle{completedCycles > 1 ? 's' : ''} complété{completedCycles > 1 ? 's' : ''} cette session
          </p>
        )}
      </div>

      <Card className="p-4 bg-indigo-soft/60">
        <p className="mb-1.5 text-sm font-semibold text-ink-900">La méthode Pomodoro, en bref</p>
        <p className="text-[12.5px] leading-relaxed text-ink-600">
          Le principe : découper le travail en sessions de <b className="text-ink-900">25 min de focus intense</b>, suivies
          d'une <b className="text-ink-900">pause de 5 min</b>, et toutes les 4 sessions d'une pause plus longue de 15 min.
          C'est efficace car le cerveau tient mieux l'attention sur un temps court et borné que sur une durée floue : la
          limite crée une urgence qui limite la procrastination, et les pauses régulières évitent la fatigue mentale
          avant qu'elle ne s'installe. Résultat : on avance par petits blocs concrets, plus faciles à démarrer qu'une
          session de révision sans fin.
        </p>
      </Card>
    </div>
  )
}
