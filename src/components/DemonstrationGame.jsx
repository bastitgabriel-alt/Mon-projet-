import { useState } from 'react'
import { subjects } from '../data/mockData.js'
import { demonstrations } from '../data/demonstrations.js'
import { Card, Button } from './ui.jsx'
import { ChevronLeftIcon } from './icons.jsx'

function shuffleWithIndex(steps) {
  const withIndex = steps.map((text, index) => ({ text, index }))
  for (let i = withIndex.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[withIndex[i], withIndex[j]] = [withIndex[j], withIndex[i]]
  }
  return withIndex
}

export default function DemonstrationGame({ onExit }) {
  const [demoId, setDemoId] = useState(null)
  const [pool, setPool] = useState([])
  const [sequence, setSequence] = useState([])
  const [revealed, setRevealed] = useState(false)

  function startDemo(demo) {
    setDemoId(demo.id)
    setPool(shuffleWithIndex(demo.steps))
    setSequence([])
    setRevealed(false)
  }

  function pick(item) {
    if (revealed) return
    setSequence((s) => [...s, item])
    setPool((p) => p.filter((x) => x.index !== item.index))
  }

  function removeFromSequence(item) {
    if (revealed) return
    setSequence((s) => s.filter((x) => x.index !== item.index))
    setPool((p) => [...p, item])
  }

  const demo = demonstrations.find((d) => d.id === demoId)
  const correctCount = demo && revealed ? sequence.filter((item, i) => item.index === i).length : 0

  if (!demo) {
    return (
      <div className="flex flex-col gap-5">
        <button onClick={onExit} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Retour aux fiches
        </button>
        <div>
          <p className="font-display text-xl font-semibold text-ink-900">Reconstitue la démonstration</p>
          <p className="text-sm text-ink-500">Choisis une démonstration classique et remets ses étapes dans l'ordre.</p>
        </div>
        <div className="flex flex-col gap-2">
          {demonstrations.map((d) => {
            const subject = subjects.find((s) => s.id === d.subjectId)
            return (
              <button key={d.id} onClick={() => startDemo(d)} className="text-left">
                <Card className="flex items-center gap-3 p-3.5 hover:bg-ink-50 transition-colors">
                  <span className={`h-9 w-1.5 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">{d.title}</p>
                    <p className="text-xs text-ink-500">
                      {subject?.name} · {d.steps.length} étapes
                    </p>
                  </div>
                </Card>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => setDemoId(null)} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
        <ChevronLeftIcon className="w-4 h-4" /> Changer de démonstration
      </button>
      <div>
        <p className="font-display text-lg font-semibold text-ink-900">{demo.title}</p>
        <p className="text-xs text-ink-500">Tape les étapes dans l'ordre où elles doivent apparaître.</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
          Ta suite ({sequence.length}/{demo.steps.length})
        </p>
        <div className="flex flex-col gap-2">
          {sequence.map((item, i) => {
            const isCorrect = revealed && item.index === i
            const isWrong = revealed && item.index !== i
            return (
              <button key={item.index} onClick={() => removeFromSequence(item)} disabled={revealed} className="text-left">
                <Card className={`flex items-start gap-3 p-3.5 ${isCorrect ? 'border-teal bg-teal-soft' : isWrong ? 'border-coral bg-coral-soft' : ''}`}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">
                    {i + 1}
                  </span>
                  <p className="text-sm text-ink-700">{item.text}</p>
                </Card>
              </button>
            )
          })}
          {sequence.length === 0 && <p className="text-xs text-ink-400">Tape une étape ci-dessous pour commencer.</p>}
        </div>
      </div>

      {pool.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Étapes à placer</p>
          <div className="flex flex-col gap-2">
            {pool.map((item) => (
              <button key={item.index} onClick={() => pick(item)} className="text-left">
                <Card className="p-3.5 transition-colors hover:bg-ink-50">
                  <p className="text-sm text-ink-700">{item.text}</p>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {pool.length === 0 && !revealed && (
        <Button onClick={() => setRevealed(true)} className="w-full">
          Vérifier l'ordre
        </Button>
      )}

      {revealed && (
        <Card className="p-4 text-center">
          <p className="font-display text-lg font-semibold text-ink-900">
            {correctCount}/{demo.steps.length} étapes bien placées
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {correctCount === demo.steps.length
              ? 'La structure logique est parfaitement respectée.'
              : 'La structure logique peut encore être affinée — relis les étapes en rouge.'}
          </p>
          <Button variant="secondary" onClick={() => startDemo(demo)} className="mt-3">
            Réessayer
          </Button>
        </Card>
      )}
    </div>
  )
}
