import { useEffect, useMemo, useState } from 'react'
import { subjects, errorCategories } from '../data/mockData.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card, SectionTitle, Badge, Button } from '../components/ui.jsx'
import { ChevronLeftIcon, SparkleIcon } from '../components/icons.jsx'
import { styleFor } from '../utils/categoryStyles.js'

function mapFicheRow(row) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    summary: row.summary,
    linkedCategory: row.linked_category,
    generated: row.generated,
    lastReviewed: row.last_reviewed ? toFrDate(row.last_reviewed) : null
  }
}

// "2026-07-18" -> "18/07/2026"
function toFrDate(isoDate) {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

export default function Fiches({ userId }) {
  const [allFiches, setAllFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [openFicheId, setOpenFicheId] = useState(null)

  useEffect(() => {
    supabase
      .from('fiches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAllFiches((data || []).map(mapFicheRow))
        setLoading(false)
      })
  }, [userId])

  const filtered = filter === 'all' ? allFiches : allFiches.filter((f) => f.subjectId === filter)
  const openFiche = allFiches.find((f) => f.id === openFicheId)

  async function markReviewed(id) {
    const todayIso = new Date().toISOString().slice(0, 10)
    setAllFiches((prev) => prev.map((f) => (f.id === id ? { ...f, lastReviewed: toFrDate(todayIso) } : f)))
    await supabase.from('fiches').update({ last_reviewed: todayIso }).eq('id', id)
  }

  if (loading) {
    return <p className="text-sm text-ink-400">Chargement…</p>
  }

  if (openFiche) {
    const subject = subjects.find((s) => s.id === openFiche.subjectId)
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
          <Badge className="w-fit bg-indigo-soft text-indigo">
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
            <p className="text-xs text-ink-500">{openFiche.lastReviewed || 'Pas encore révisée'}</p>
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
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Toutes" />
        {subjects.map((s) => (
          <FilterChip key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} label={s.short} />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((f) => {
          const subject = subjects.find((s) => s.id === f.subjectId)
          return (
            <button key={f.id} onClick={() => setOpenFicheId(f.id)} className="text-left">
              <Card className="flex items-center gap-3 p-3.5 hover:bg-ink-50 transition-colors">
                <span className={`h-9 w-1.5 rounded-full ${subject?.accent || 'bg-ink-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">{f.title}</p>
                  <p className="text-xs text-ink-500">
                    {subject?.name} · {f.lastReviewed ? `Révisée le ${f.lastReviewed}` : 'Jamais révisée'}
                  </p>
                </div>
                {f.generated && <Badge className="bg-indigo-soft text-indigo shrink-0">Auto</Badge>}
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
        active ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
      }`}
    >
      {label}
    </button>
  )
}
