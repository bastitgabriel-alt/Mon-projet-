import { useEffect, useRef, useState } from 'react'
import { subjects } from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, Badge, Button } from '../components/ui.jsx'
import { ChevronLeftIcon, MicIcon, SparkleIcon } from '../components/icons.jsx'
import { askExaminerTurn, getColleFeedback } from '../lib/colleAi.js'

const SpeechRecognitionCtor =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

function scoreTone(score) {
  if (score >= 14) return 'bg-teal-soft text-teal'
  if (score >= 10) return 'bg-amber-soft text-amber'
  return 'bg-coral-soft text-coral'
}

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.98
  window.speechSynthesis.speak(utterance)
}

export default function ColleIA({ userId }) {
  const [step, setStep] = useState('setup') // setup | session | feedback
  const [subjectId, setSubjectId] = useState(subjects[0].id)
  const [topic, setTopic] = useState('')
  const [ficheSuggestions, setFicheSuggestions] = useState([])
  const [pastSessions, setPastSessions] = useState([])

  const [history, setHistory] = useState([])
  const [loadingTurn, setLoadingTurn] = useState(false)
  const [listening, setListening] = useState(false)
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    supabase
      .from('fiches')
      .select('title, subject_id')
      .eq('user_id', userId)
      .then(({ data }) => setFicheSuggestions(data || []))

    supabase
      .from('colle_sessions')
      .select('id, subject_id, topic, feedback, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setPastSessions(data || []))
  }, [userId])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const subjectTopics = ficheSuggestions.filter((f) => f.subject_id === subjectId).map((f) => f.title)

  async function startSession() {
    if (!topic.trim()) return
    setHistory([])
    setFeedback(null)
    setError(null)
    setStep('session')
    setLoadingTurn(true)
    try {
      const { question } = await askExaminerTurn({ subject: subjectId, topic: topic.trim(), history: [] })
      setHistory([{ role: 'assistant', content: question }])
      speak(question)
    } catch (e) {
      setError(e.message)
    }
    setLoadingTurn(false)
  }

  async function sendAnswer(text) {
    const trimmed = (text || '').trim()
    if (!trimmed || loadingTurn) return
    const nextHistory = [...history, { role: 'user', content: trimmed }]
    setHistory(nextHistory)
    setDraft('')
    setLoadingTurn(true)
    try {
      const { question } = await askExaminerTurn({ subject: subjectId, topic, history: nextHistory })
      setHistory((h) => [...h, { role: 'assistant', content: question }])
      speak(question)
    } catch (e) {
      setError(e.message)
    }
    setLoadingTurn(false)
  }

  function toggleListening() {
    if (!SpeechRecognitionCtor || loadingTurn) return
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'fr-FR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = (e) => sendAnswer(e.results[0][0].transcript)
    recognitionRef.current = recognition
    recognition.start()
  }

  async function finishSession() {
    setLoadingTurn(true)
    setError(null)
    try {
      const result = await getColleFeedback({ subject: subjectId, topic, history })
      setFeedback(result)
      await supabase.from('colle_sessions').insert({
        user_id: userId,
        subject_id: subjectId,
        topic,
        status: 'completed',
        transcript: history,
        feedback: result,
        ended_at: new Date().toISOString()
      })
      setPastSessions((prev) =>
        [{ id: `local-${Date.now()}`, subject_id: subjectId, topic, feedback: result, created_at: new Date().toISOString() }, ...prev].slice(0, 5)
      )
      setStep('feedback')
    } catch (e) {
      setError(e.message)
    }
    setLoadingTurn(false)
  }

  function reset() {
    window.speechSynthesis?.cancel()
    recognitionRef.current?.stop()
    setStep('setup')
    setTopic('')
    setHistory([])
    setFeedback(null)
    setError(null)
  }

  // --- Configuration de la colle ---
  if (step === 'setup') {
    return (
      <div className="flex flex-col gap-5">
        <Card className="p-5">
          <p className="mb-2 text-sm font-medium text-ink-700">Matière</p>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSubjectId(s.id)
                  setTopic('')
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  subjectId === s.id ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
                }`}
              >
                {s.short}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-2 text-sm font-medium text-ink-700">Chapitre à interroger</p>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex : Réduction des endomorphismes"
            className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700"
          />
          {subjectTopics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {subjectTopics.slice(0, 4).map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="rounded-full bg-indigo-soft px-2.5 py-1 text-xs font-medium text-indigo hover:brightness-95"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </Card>

        {!SpeechRecognitionCtor && (
          <Card className="p-4 bg-amber-soft text-sm text-amber">
            Ton navigateur ne prend pas en charge la reconnaissance vocale — tu pourras répondre au clavier.
          </Card>
        )}

        <Button onClick={startSession} disabled={!topic.trim()} className="w-full">
          Démarrer la colle
        </Button>

        {pastSessions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Colles récentes</p>
            <div className="flex flex-col gap-2">
              {pastSessions.map((s) => {
                const subject = subjects.find((x) => x.id === s.subject_id)
                return (
                  <Card key={s.id} className="flex items-center gap-3 p-3.5">
                    <span className={`h-9 w-1.5 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">{s.topic}</p>
                      <p className="text-xs text-ink-500">{subject?.name}</p>
                    </div>
                    <Badge className={`shrink-0 ${scoreTone(s.feedback?.score ?? 0)}`}>{s.feedback?.score}/20</Badge>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- Session orale en cours ---
  if (step === 'session') {
    const subject = subjects.find((s) => s.id === subjectId)
    const lastAssistant = history[history.length - 1]
    const previousExchanges = history.slice(0, -1)

    return (
      <div className="flex flex-col gap-4">
        <button onClick={reset} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Quitter la colle
        </button>

        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${subject?.accent}`} />
          <span className="text-sm font-medium text-ink-500">
            {subject?.name} · {topic}
          </span>
        </div>

        <Card className="flex min-h-[220px] flex-col justify-center gap-3 bg-gradient-to-br from-sidebar-2 to-sidebar-1 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Le colleur demande</p>
          {loadingTurn && !lastAssistant ? (
            <p className="text-sm text-white/70">Préparation de la question…</p>
          ) : (
            <p className="font-display text-lg font-medium leading-snug">{lastAssistant?.content}</p>
          )}
          {loadingTurn && lastAssistant && <p className="text-xs text-white/60">Le colleur réfléchit à sa relance…</p>}
        </Card>

        {error && <Card className="bg-coral-soft p-3 text-sm text-coral">{error}</Card>}

        <div className="flex flex-col gap-3">
          {SpeechRecognitionCtor && (
            <button
              onClick={toggleListening}
              disabled={loadingTurn}
              className={`flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition-colors disabled:opacity-50 ${
                listening ? 'bg-coral text-white' : 'bg-indigo-soft text-indigo hover:brightness-95'
              }`}
            >
              <MicIcon className="w-5 h-5" />
              {listening ? 'Écoute en cours… clique pour arrêter' : 'Répondre à voix haute'}
            </button>
          )}

          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendAnswer(draft)
              }}
              placeholder="Ou écris ta réponse ici…"
              disabled={loadingTurn}
              className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700 disabled:opacity-50"
            />
            <Button variant="secondary" onClick={() => sendAnswer(draft)} disabled={loadingTurn || !draft.trim()}>
              Envoyer
            </Button>
          </div>
        </div>

        {history.length >= 2 && (
          <Button variant="ghost" onClick={finishSession} disabled={loadingTurn} className="w-full">
            Terminer la colle et voir mon bilan
          </Button>
        )}

        {previousExchanges.length > 0 && (
          <div className="flex flex-col gap-1.5 opacity-70">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Échanges précédents</p>
            {previousExchanges.map((h, i) => (
              <p key={i} className={`text-xs ${h.role === 'assistant' ? 'text-ink-500' : 'font-medium text-ink-700'}`}>
                {h.role === 'assistant' ? 'Colleur : ' : 'Toi : '}
                {h.content}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  // --- Bilan structuré ---
  if (step === 'feedback' && feedback) {
    const subject = subjects.find((s) => s.id === subjectId)
    return (
      <div className="flex flex-col gap-4">
        <button onClick={reset} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Retour
        </button>

        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Bilan de la colle</p>
          <p className="font-mono text-4xl font-bold text-indigo">
            {feedback.score}
            <span className="text-lg text-ink-400">/20</span>
          </p>
          <p className="text-sm text-ink-500">
            {subject?.name} · {topic}
          </p>
        </div>

        <Card className="p-5">
          <p className="mb-2 text-sm font-semibold text-teal">Points forts</p>
          <ul className="flex flex-col gap-1.5">
            {(feedback.points_forts || []).map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-700">
                <span className="text-teal">＋</span>
                {p}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <p className="mb-2 text-sm font-semibold text-coral">Points à travailler</p>
          <ul className="flex flex-col gap-1.5">
            {(feedback.points_a_travailler || []).map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-700">
                <span className="text-coral">－</span>
                {p}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-teal-soft p-5">
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-teal">
            <SparkleIcon className="w-4 h-4" /> Conseil
          </p>
          <p className="text-sm text-ink-700">{feedback.conseil}</p>
        </Card>

        <Button onClick={reset} className="w-full">
          Nouvelle colle
        </Button>
      </div>
    )
  }

  return null
}
