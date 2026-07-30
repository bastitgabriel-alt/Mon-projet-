import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Button } from './ui.jsx'
import { ChevronLeftIcon } from './icons.jsx'
import { generateMentalCalcQuestion, timeForStreak } from '../utils/mentalCalc.js'

export default function MentalCalcGame({ userId, onExit }) {
  const [phase, setPhase] = useState('intro') // intro | playing | over
  const [bestStreak, setBestStreak] = useState(0)
  const [question, setQuestion] = useState(null)
  const [streak, setStreak] = useState(0)
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(8)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)

  useEffect(() => {
    supabase
      .from('mental_calc_best')
      .select('best_streak')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        setBestStreak(data?.best_streak || 0)
        loadLeaderboard(data?.best_streak || 0)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function loadLeaderboard(myBest) {
    const { data: top } = await supabase
      .from('mental_calc_best')
      .select('user_id, best_streak')
      .order('best_streak', { ascending: false })
      .limit(10)
    setLeaderboard(top || [])
    if (myBest > 0) {
      const { count } = await supabase
        .from('mental_calc_best')
        .select('user_id', { count: 'exact', head: true })
        .gt('best_streak', myBest)
      setMyRank((count || 0) + 1)
    }
  }

  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return
    if (timeLeft <= 0) {
      endRound()
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => Math.max(0, s - 0.1)), 100)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft, selected])

  function start() {
    setStreak(0)
    setIsNewRecord(false)
    nextQuestion(0)
    setPhase('playing')
  }

  function nextQuestion(currentStreak) {
    setQuestion(generateMentalCalcQuestion())
    setSelected(null)
    setTimeLeft(timeForStreak(currentStreak))
  }

  function answer(index) {
    if (selected !== null) return
    setSelected(index)
    if (index === question.correctIndex) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setTimeout(() => nextQuestion(newStreak), 500)
    } else {
      setTimeout(() => endRound(), 700)
    }
  }

  async function endRound() {
    setPhase('over')
    if (streak > bestStreak) {
      setIsNewRecord(true)
      setBestStreak(streak)
      await supabase
        .from('mental_calc_best')
        .upsert({ user_id: userId, best_streak: streak, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      loadLeaderboard(streak)
    }
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col gap-5">
        <button onClick={onExit} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Retour aux fiches
        </button>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="font-display text-xl font-semibold text-ink-900">Calcul mental</p>
          <p className="max-w-xs text-sm text-ink-500">
            Réponds vite : produits, pourcentages, ordres de grandeur, racines approchées. Le temps se réduit à chaque bonne réponse — une erreur arrête la série.
          </p>
          {bestStreak > 0 && (
            <p className="font-mono text-sm text-indigo">Ton record : {bestStreak} bonne{bestStreak > 1 ? 's' : ''} réponse{bestStreak > 1 ? 's' : ''} d'affilée</p>
          )}
        </div>
        <Button onClick={start} className="w-full">
          Commencer
        </Button>
        <Leaderboard rows={leaderboard} userId={userId} myRank={myRank} />
      </div>
    )
  }

  if (phase === 'playing' && question) {
    const timePercent = Math.max(0, Math.min(100, (timeLeft / timeForStreak(streak)) * 100))
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <button onClick={onExit} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
            <ChevronLeftIcon className="w-4 h-4" /> Quitter
          </button>
          <span className="font-mono text-sm font-semibold text-indigo">Série : {streak}</span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div
            className={`h-full rounded-full transition-all duration-100 ${timePercent > 30 ? 'bg-indigo' : 'bg-coral'}`}
            style={{ width: `${timePercent}%` }}
          />
        </div>

        <Card className="flex min-h-[140px] items-center justify-center p-6">
          <p className="text-center font-mono text-2xl font-semibold text-ink-900">{question.prompt}</p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt, i) => {
            let tone = 'border-ink-200 bg-white text-ink-700'
            if (selected !== null) {
              if (i === question.correctIndex) tone = 'border-teal bg-teal-soft text-teal'
              else if (i === selected) tone = 'border-coral bg-coral-soft text-coral'
              else tone = 'border-ink-200 bg-white text-ink-400'
            }
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                disabled={selected !== null}
                className={`rounded-xl border-[1.5px] py-4 font-mono text-lg font-semibold transition-colors ${tone}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // --- Fin de la série ---
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-soft">
        <span className="font-mono text-xl font-bold text-indigo">{streak}</span>
      </div>
      <h1 className="font-display text-xl font-semibold text-ink-900">
        {streak} bonne{streak > 1 ? 's' : ''} réponse{streak > 1 ? 's' : ''} d'affilée
      </h1>
      {isNewRecord ? (
        <p className="text-sm font-medium text-teal">🎉 Nouveau record personnel !</p>
      ) : (
        <p className="text-sm text-ink-500">Ton record reste à {bestStreak}.</p>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={start}>
          Rejouer
        </Button>
        <Button onClick={onExit}>Retour aux fiches</Button>
      </div>
      <Leaderboard rows={leaderboard} userId={userId} myRank={myRank} className="w-full text-left" />
    </div>
  )
}

function Leaderboard({ rows, userId, myRank, className = '' }) {
  if (rows.length === 0) return null
  return (
    <Card className={`p-4 ${className}`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
        Classement · meilleures séries
      </p>
      <div className="flex flex-col gap-1">
        {rows.map((row, i) => {
          const isMe = row.user_id === userId
          return (
            <div
              key={row.user_id}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm ${
                isMe ? 'bg-indigo-soft font-semibold text-indigo' : 'text-ink-700'
              }`}
            >
              <span>#{i + 1}{isMe ? ' · Toi' : ''}</span>
              <span className="font-mono">{row.best_streak}</span>
            </div>
          )
        })}
      </div>
      {myRank && myRank > rows.length && (
        <p className="mt-2 text-xs text-ink-500">Ta position : #{myRank}</p>
      )}
    </Card>
  )
}
