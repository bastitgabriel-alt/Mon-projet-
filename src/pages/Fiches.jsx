import { useMemo, useState } from 'react'
import { subjects, fiches, errorCategories } from '../data/mockData.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { Card, SectionTitle, Badge, Button } from '../components/ui.jsx'
import { ChevronLeftIcon, SparkleIcon } from '../components/icons.jsx'
import { styleFor } from '../utils/categoryStyles.js'

export default function Fiches() {
  const [customFiches] = useLocalStorage('marge_custom_fiches', [])
  const [reviewedOverrides, setReviewedOverrides] = useLocalStorage('marge_fiches_reviewed', {})
  const [filter, setFilter] = useState('all')
  const [openFicheId, setOpenFicheId] = useState(null)

  const allFiches = useMemo(() => [...customFiches, ...fiches], [customFiches])
  const filtered = filter === 'all' ? allFiches : allFiches.filter((f) => f.subjectId === filter)
  const openFiche = allFiches.find((f) => f.id === openFicheId)

  function markReviewed(id) {
    setReviewedOverrides((prev) => ({ ...prev, [id]: new Date().toLocaleDateString('fr-FR') }))
  }

  if (openFiche) {
    const subject = subjects.find((s) => s.id === openFiche.subjectId)
    const lastReviewed = reviewedOverrides[openFiche.id] || openFiche.lastReviewed
    const category = openFiche.linkedCategory ? errorCategories[openFiche.linkedCategory] : null
    const style = openFiche.linkedCategory ? styleFor(openFiche.linkedCategory) : null

    return (
      <div className="flex flex-col gap-4">
        <button onClick={() => setOpenFicheId(null)} className="flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-700">
          <ChevronLeftIcon className="w-4 h-4" /> Mes fiches
        </button>

        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${subject?.accent}`} />
          <span className="text-sm font-medium text-ink-500">{subject?.name}</span>
        </div>
        <h1 className="text-xl font-bold text-ink-900">{openFiche.title}</h1>

        {openFiche.generated && (
          <Badge className="w-fit bg-brand-50 text-brand-700">
            <SparkleIcon className="w-3.5 h-3.5 mr-1" /> Générée depuis un scan de copie
          </Badge>
        )}

        <Card className="p-5">
          <p className="text-sm text-ink-700">{openFiche.summary}</p>
          {category && (
            <div className="mt-4 rounded-xl bg-ink-50 p-4">
              <Badge className={style.badge}>{category.label}</Badge>
              <p className="mt-2 text-sm text-ink-600">{category.tip}</p>
            </div>
          )}
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-700">Dernière révision</p>
            <p className="text-xs text-ink-500">{lastReviewed || 'Pas encore révisée'}</p>
          </div>
          <Button variant="secondary" onClick={() => markReviewed(openFiche.id)} className="text-xs px-3 py-1.5">
            Marquer comme révisée
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-ink-900">Fiches de révision</h1>
        <p className="text-sm text-ink-500">Générées automatiquement à partir de tes copies, ou créées par toi.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Toutes" />
        {subjects.map((s) => (
          <FilterChip key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} label={s.short} />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((f) => {
          const subject = subjects.find((s) => s.id === f.subjectId)
          const lastReviewed = reviewedOverrides[f.id] || f.lastReviewed
          return (
            <button key={f.id} onClick={() => setOpenFicheId(f.id)} className="text-left">
              <Card className="flex items-center gap-3 p-3.5 hover:bg-ink-50 transition-colors">
                <span className={`h-9 w-1.5 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">{f.title}</p>
                  <p className="text-xs text-ink-500">
                    {subject?.name} · {lastReviewed ? `Révisée le ${lastReviewed}` : 'Jamais révisée'}
                  </p>
                </div>
                {f.generated && <Badge className="bg-brand-50 text-brand-700 shrink-0">Auto</Badge>}
              </Card>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <Card className="p-4 text-center text-sm text-ink-500">Aucune fiche pour l'instant dans cette matière.</Card>
        )}
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200 text-ink-600'
      }`}
    >
      {label}
    </button>
  )
}
