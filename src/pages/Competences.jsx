import { useEffect, useMemo, useState } from 'react'
import { competencySubjects, levelLabels } from '../data/competencies.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card } from '../components/ui.jsx'

export default function Competences({ userId }) {
  const [loading, setLoading] = useState(true)
  const [levels, setLevels] = useState({}) // `${subjectId}__${key}` -> level
  const [selectedSubject, setSelectedSubject] = useState(competencySubjects[0].id)

  useEffect(() => {
    supabase
      .from('competency_levels')
      .select('subject_id, competency_key, level')
      .eq('user_id', userId)
      .then(({ data }) => {
        const map = {}
        ;(data || []).forEach((row) => {
          map[`${row.subject_id}__${row.competency_key}`] = row.level
        })
        setLevels(map)
        setLoading(false)
      })
  }, [userId])

  async function setLevel(subjectId, key, level) {
    const mapKey = `${subjectId}__${key}`
    setLevels((prev) => ({ ...prev, [mapKey]: level }))
    await supabase
      .from('competency_levels')
      .upsert(
        { user_id: userId, subject_id: subjectId, competency_key: key, level, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,subject_id,competency_key' }
      )
  }

  const subjectAverages = useMemo(() => {
    const map = {}
    competencySubjects.forEach((s) => {
      const values = s.competencies.map((c) => levels[`${s.id}__${c.key}`] || 1)
      map[s.id] = values.reduce((a, b) => a + b, 0) / values.length
    })
    return map
  }, [levels])

  const scoreGlobal = useMemo(() => {
    const all = Object.values(subjectAverages)
    if (all.length === 0) return 0
    const avg = all.reduce((a, b) => a + b, 0) / all.length
    return Math.round(((avg - 1) / 4) * 100)
  }, [subjectAverages])

  if (loading) {
    return <p className="text-sm text-ink-400">Chargement…</p>
  }

  const subject = competencySubjects.find((s) => s.id === selectedSubject)

  return (
    <div className="flex flex-col gap-5">
      <Card className="bg-gradient-to-br from-indigo to-[#5b3fae] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Score global</p>
        <p className="mt-1 font-mono text-3xl font-bold">{scoreGlobal}<span className="text-lg text-white/70">/100</span></p>
        <p className="mt-1 text-sm text-white/85">Moyenne pondérée de tes compétences, toutes matières confondues.</p>
      </Card>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Vue d'ensemble</p>
        <div className="flex flex-col gap-2">
          {competencySubjects.map((s) => {
            const avg = subjectAverages[s.id]
            const percent = ((avg - 1) / 4) * 100
            return (
              <Card key={s.id} className="flex items-center gap-3 p-3.5">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.accent}`} />
                <span className="w-[130px] shrink-0 truncate text-sm font-medium text-ink-800">{s.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo to-coral transition-all duration-700" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-xs text-ink-500">{avg.toFixed(1)}/5</span>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {competencySubjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSubject(s.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selectedSubject === s.id ? 'bg-indigo text-white' : 'bg-white border border-ink-200 text-ink-600'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {subject.competencies.map((c) => {
          const level = levels[`${subject.id}__${c.key}`] || 1
          // Même logique de seuils que ColleIA (scoreTone) et Mental (barres d'énergie) :
          // teal = acquis, amber = en progression, coral = à travailler.
          // Classes écrites en toutes lettres (pas d'interpolation) pour que Tailwind les détecte.
          const tone =
            level >= 4
              ? { text: 'text-teal', fill: 'bg-teal' }
              : level >= 3
                ? { text: 'text-amber', fill: 'bg-amber' }
                : { text: 'text-coral', fill: 'bg-coral' }
          return (
            <Card key={c.key} className="p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-sm font-medium text-ink-800">{c.label}</p>
                <span className={`text-xs font-medium ${tone.text}`}>{levelLabels[level - 1]}</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setLevel(subject.id, c.key, n)}
                    className={`h-2.5 flex-1 rounded-full transition-colors ${n <= level ? tone.fill : 'bg-ink-100 hover:bg-ink-200'}`}
                    aria-label={`Niveau ${n}`}
                  />
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
