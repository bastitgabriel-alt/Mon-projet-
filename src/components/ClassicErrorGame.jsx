import { useState } from 'react'
import { classicErrors } from '../data/classicErrors.js'
import { errorCategories, subjects } from '../data/mockData.js'
import { Card, Button } from './ui.jsx'
import { ChevronLeftIcon } from './icons.jsx'

function randomError(excludeId) {
  const pool = excludeId ? classicErrors.filter((e) => e.id !== excludeId) : classicErrors
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function ClassicErrorGame({ onExit }) {
  const [current, setCurrent] = useState(() => randomError())
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  function answer(category) {
    if (selected) return
    setSelected(category)
    setScore((s) => ({ correct: s.correct + (category === current.category ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    setCurrent(randomError(current.id))
    setSelected(null)
  }

  const subject = subjects.find((s) => s.id === current.subjectId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Retour aux fiches
        </button>
        {score.total > 0 && (
          <span className="font-mono text-sm text-ink-500">
            {score.correct}/{score.total}
          </span>
        )}
      </div>

      <div>
        <p className="font-display text-lg font-semibold text-ink-900">Erreur classique</p>
        <p className="text-sm text-ink-500">Identifie le type d'erreur glissée dans cet extrait de copie.</p>
      </div>

      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${subject?.accent}`} />
        <span className="text-xs font-medium text-ink-500">{subject?.name}</span>
      </div>

      <Card className="p-5">
        <p className="font-hand text-xl leading-relaxed text-ink-800">« {current.excerpt} »</p>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(errorCategories).map(([key, cat]) => {
          let tone = 'border-ink-200 bg-white text-ink-700'
          if (selected) {
            if (key === current.category) tone = 'border-teal bg-teal-soft text-teal'
            else if (key === selected) tone = 'border-coral bg-coral-soft text-coral'
            else tone = 'border-ink-200 bg-white text-ink-400'
          }
          return (
            <button
              key={key}
              onClick={() => answer(key)}
              disabled={!!selected}
              className={`rounded-xl border-[1.5px] px-3 py-2.5 text-left text-xs font-medium transition-colors ${tone}`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {selected && (
        <Card className="bg-indigo-soft p-4">
          <p className="text-sm text-ink-700">{current.explanation}</p>
        </Card>
      )}

      {selected && (
        <Button onClick={next} className="w-full">
          Question suivante
        </Button>
      )}
    </div>
  )
}
