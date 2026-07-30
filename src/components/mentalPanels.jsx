import { useState } from 'react'
import { Card, Button } from './ui.jsx'
import { startWhiteNoise, stopWhiteNoise } from '../utils/whiteNoise.js'

const CHECKLIST_ITEMS = [
  { key: 'cours', label: "J'ai relu le cours" },
  { key: 'exercices', label: "J'ai fait 3 exercices-types" },
  { key: 'pret', label: 'Je suis prêt·e' }
]

export function AvantDSPanel({ event, strongCompetencies, onBreathing }) {
  const [checklist, setChecklist] = useState({ cours: false, exercices: false, pret: false })
  const [visualized, setVisualized] = useState(false)
  const allChecked = Object.values(checklist).every(Boolean)
  const label = event.diffDays === 1 ? 'demain' : `dans ${event.diffDays} jours`

  return (
    <Card className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-coral">Avant un DS</p>
      <p className="font-display text-lg font-semibold text-ink-900">
        {event.title} {label}
      </p>

      {strongCompetencies.length > 0 && (
        <p className="mt-2 text-sm text-ink-600">
          Tu maîtrises {strongCompetencies.map((c) => c.label).join(' et ')}. Le DS portera probablement là-dessus.
        </p>
      )}

      <Button variant="secondary" onClick={onBreathing} className="mt-3">
        Respiration guidée (2 min)
      </Button>

      <div className="mt-4 border-t border-ink-100 pt-4">
        <p className="mb-2 text-sm font-medium text-ink-700">Checklist mentale</p>
        <div className="flex flex-col gap-1.5">
          {CHECKLIST_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setChecklist((c) => ({ ...c, [item.key]: !c[item.key] }))}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                checklist[item.key] ? 'border-teal-soft bg-teal-soft text-teal' : 'border-ink-200 text-ink-600'
              }`}
            >
              <span className="shrink-0">{checklist[item.key] ? '✓' : '○'}</span> {item.label}
            </button>
          ))}
        </div>
        {allChecked && <p className="mt-2 text-sm font-medium text-teal">Tu es prêt·e. Fais-toi confiance.</p>}
      </div>

      <div className="mt-4 border-t border-ink-100 pt-4">
        <p className="text-sm font-medium text-ink-700">Visualisation</p>
        <p className="mt-1 text-sm text-ink-600">Imagine-toi en train de résoudre le premier exercice avec calme.</p>
        {!visualized ? (
          <button onClick={() => setVisualized(true)} className="mt-2 text-xs font-medium text-indigo hover:underline">
            J'ai pris 30 secondes pour le faire
          </button>
        ) : (
          <p className="mt-2 text-xs text-teal">✓ Fait</p>
        )}
      </div>
    </Card>
  )
}

const ANALYSE_OPTIONS = ['Méthode', 'Temps', 'Compréhension', 'Calcul']

export function ApresEvaluationPanel({ event, progressReminder, onJournalPrefill }) {
  const [picked, setPicked] = useState([])
  const [actionPlan, setActionPlan] = useState('')
  const [sent, setSent] = useState(false)

  function toggle(opt) {
    setPicked((p) => (p.includes(opt) ? p.filter((o) => o !== opt) : [...p, opt]))
  }

  function sendToJournal() {
    const parts = []
    if (picked.length > 0) parts.push(`Ce qui a posé problème : ${picked.join(', ')}.`)
    if (actionPlan.trim()) parts.push(`Plan d'action : ${actionPlan.trim()}`)
    if (parts.length > 0) {
      onJournalPrefill(parts.join(' '))
      setSent(true)
    }
  }

  return (
    <Card className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo">Après {event.type === 'ds' ? 'un DS' : 'une colle'}</p>
      <p className="font-display text-lg font-semibold text-ink-900">Comment ça s'est passé ?</p>
      <p className="mt-2 text-sm text-ink-600">Un 6/20 n'est pas une condamnation. C'est une information.</p>

      <div className="mt-4 border-t border-ink-100 pt-4">
        <p className="mb-2 text-sm font-medium text-ink-700">Qu'est-ce qui a posé problème ?</p>
        <div className="flex flex-wrap gap-2">
          {ANALYSE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                picked.includes(opt) ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-ink-100 pt-4">
        <p className="mb-2 text-sm font-medium text-ink-700">2-3 actions pour la prochaine fois</p>
        <textarea
          value={actionPlan}
          onChange={(e) => setActionPlan(e.target.value)}
          rows={2}
          placeholder="Ex : refaire les exercices sur ce chapitre, réviser 15 min de plus la veille…"
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-700"
        />
        <button onClick={sendToJournal} className="mt-2 text-xs font-medium text-indigo hover:underline">
          {sent ? '✓ Envoyé dans le journal du soir' : 'Envoyer dans le journal du soir'}
        </button>
      </div>

      {progressReminder && (
        <div className="mt-4 border-t border-ink-100 pt-4">
          <p className="text-sm text-ink-600">{progressReminder}</p>
        </div>
      )}
    </Card>
  )
}

export function AvantKhollePanel({ event, warmupQuestions, onBreathing }) {
  return (
    <Card className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-coral">Avant une khôlle</p>
      <p className="font-display text-lg font-semibold text-ink-900">{event.title} demain</p>

      <Button variant="secondary" onClick={onBreathing} className="mt-3">
        Respiration box-breathing (4-4-4-4)
      </Button>

      {warmupQuestions.length > 0 && (
        <div className="mt-4 border-t border-ink-100 pt-4">
          <p className="mb-2 text-sm font-medium text-ink-700">Questions de réchauffement</p>
          <div className="flex flex-col gap-1.5">
            {warmupQuestions.map((q, i) => (
              <p key={i} className="text-sm text-ink-600">
                • {q}
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 border-t border-ink-100 pt-4 text-sm text-ink-600">
        Le prof veut te voir réussir. Il cherche à t'aider, pas à te piéger.
      </p>
    </Card>
  )
}

export function PeriodeDoutePanel({ scoreGlobal, scoreTrendText, onNavigate }) {
  return (
    <Card className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber">Période difficile</p>
      <p className="font-display text-lg font-semibold text-ink-900">C'est normal, ça arrive à tout le monde</p>
      <p className="mt-2 text-sm text-ink-600">Aujourd'hui, fais juste 15 minutes. C'est déjà ça.</p>
      {onNavigate && (
        <Button variant="secondary" onClick={() => onNavigate('fiches')} className="mt-2">
          Réviser 15 minutes
        </Button>
      )}
      {scoreGlobal !== null && (
        <p className="mt-3 text-sm text-ink-600">
          Ton score global de compétences est à {scoreGlobal}/100{scoreTrendText ? ` — ${scoreTrendText}` : ''}. Tu as déjà avancé plus que tu ne le crois.
        </p>
      )}
      <div className="mt-4 border-t border-ink-100 pt-4">
        <p className="text-sm text-ink-600">
          Parle-en à quelqu'un de confiance — un·e ami·e de prépa, un prof, tes parents. En parler aide vraiment.
        </p>
      </div>
    </Card>
  )
}

export function RoutineSoirPanel() {
  const [demain, setDemain] = useState('')
  const [noiseOn, setNoiseOn] = useState(false)

  function toggleNoise() {
    if (noiseOn) {
      stopWhiteNoise()
      setNoiseOn(false)
    } else {
      startWhiteNoise()
      setNoiseOn(true)
    }
  }

  return (
    <Card className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo">Routine du soir</p>
      <p className="font-display text-lg font-semibold text-ink-900">On déconnecte ?</p>
      <p className="mt-1 text-sm text-ink-600">
        Pas d'écran dans l'heure qui précède le coucher si possible — complète ton journal du soir plus bas, puis lâche le téléphone.
      </p>

      <div className="mt-3">
        <p className="mb-1 text-sm font-medium text-ink-700">Visualisation de demain</p>
        <input
          value={demain}
          onChange={(e) => setDemain(e.target.value)}
          placeholder="Demain, je vais…"
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700"
        />
      </div>

      <div className="mt-4 border-t border-ink-100 pt-4">
        <button
          onClick={toggleNoise}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
            noiseOn ? 'border-teal-soft bg-teal-soft text-teal' : 'border-ink-200 text-ink-600'
          }`}
        >
          {noiseOn ? '⏸ Arrêter le bruit blanc' : "▶ Jouer un bruit blanc pour s'endormir"}
        </button>
      </div>
    </Card>
  )
}

export function BilanWeekendPanel({ weeklyVictories, weakPoints, weeklyPlanPriorities }) {
  return (
    <Card className="p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal">Bilan du week-end</p>
      <p className="font-display text-lg font-semibold text-ink-900">Comment s'est passée ta semaine ?</p>

      <div className="mt-3">
        <p className="mb-1.5 text-sm font-medium text-ink-700">Tes victoires de la semaine</p>
        {weeklyVictories.length > 0 ? (
          <div className="flex flex-col gap-1">
            {weeklyVictories.map((v, i) => (
              <p key={i} className="text-sm text-ink-600">
                🏆 {v}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-400">Rien noté cette semaine — pense à ton journal du soir.</p>
        )}
      </div>

      {weakPoints.length > 0 && (
        <div className="mt-4 border-t border-ink-100 pt-4">
          <p className="mb-1.5 text-sm font-medium text-ink-700">Points faibles identifiés</p>
          {weakPoints.map((w, i) => (
            <p key={i} className="text-sm text-ink-600">
              • {w.label}
            </p>
          ))}
        </div>
      )}

      {weeklyPlanPriorities.length > 0 && (
        <div className="mt-4 border-t border-ink-100 pt-4">
          <p className="mb-1.5 text-sm font-medium text-ink-700">Plan pour la semaine prochaine</p>
          {weeklyPlanPriorities.map((p, i) => (
            <p key={i} className="text-sm text-ink-600">
              → {p}
            </p>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-ink-100 pt-4">
        <p className="text-sm text-ink-600">
          Ce week-end, prévois aussi un vrai temps de repos actif : sport, sortie, lecture — pas juste de l'écran.
        </p>
      </div>
    </Card>
  )
}
