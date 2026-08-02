import { useEffect, useMemo, useState } from 'react'
import { competencySubjects, levelLabels } from '../data/competencies.js'
import { competencyChallenges } from '../data/competencyChallenges.js'
import { supabase } from '../lib/supabaseClient.js'
import { Card } from '../components/ui.jsx'
import { computeScoreTimeline, predictScoreIn90Days } from '../utils/competencyHistory.js'
import { detectWeakPoints } from '../utils/weakPointDetection.js'

function buildTimelinePolyline(points) {
  const w = 320
  const h = 100
  const step = points.length > 1 ? w / (points.length - 1) : 0
  return points.map((p, i) => `${i * step},${h - (p.score / 100) * h}`).join(' ')
}

function RadarChart({ items }) {
  const size = 220
  const center = size / 2
  const maxR = 80

  function point(i, r) {
    const angle = -Math.PI / 2 + i * ((2 * Math.PI) / items.length)
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const polygonPoints = items.map((item, i) => point(i, (item.level / 5) * maxR).join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size + 20}`} className="mx-auto w-full max-w-[240px]">
      {[1, 2, 3, 4, 5].map((r) => (
        <polygon
          key={r}
          points={items.map((_, i) => point(i, (r / 5) * maxR).join(',')).join(' ')}
          fill="none"
          stroke="#e8ebf1"
          strokeWidth="1"
        />
      ))}
      {items.map((_, i) => {
        const [x, y] = point(i, maxR)
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e8ebf1" strokeWidth="1" />
      })}
      <polygon points={polygonPoints} fill="rgba(59,47,128,0.25)" stroke="#1b2a4a" strokeWidth="2" />
      {items.map((item, i) => {
        const [x, y] = point(i, maxR + 18)
        return (
          <text key={i} x={x} y={y} textAnchor="middle" fontSize="9" fill="#a39c89">
            {item.label.length > 13 ? `${item.label.slice(0, 12)}…` : item.label}
          </text>
        )
      })}
    </svg>
  )
}

export default function Competences({ userId }) {
  const [loading, setLoading] = useState(true)
  const [levels, setLevels] = useState({}) // `${subjectId}__${key}` -> level
  const [historyRows, setHistoryRows] = useState([])
  const [scans, setScans] = useState([])
  const [fiches, setFiches] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(competencySubjects[0].id)

  useEffect(() => {
    Promise.all([
      supabase.from('competency_levels').select('subject_id, competency_key, level').eq('user_id', userId),
      supabase.from('competency_history').select('subject_id, competency_key, level, recorded_at').eq('user_id', userId),
      supabase.from('scans').select('subject_id, annotations(category)').eq('user_id', userId),
      supabase.from('fiches').select('title, subject_id, repetitions, ease_factor').eq('user_id', userId)
    ]).then(([{ data: levelRows }, { data: historyData }, { data: scanRows }, { data: ficheRows }]) => {
      const map = {}
      ;(levelRows || []).forEach((row) => {
        map[`${row.subject_id}__${row.competency_key}`] = row.level
      })
      setLevels(map)
      setHistoryRows(historyData || [])
      setScans((scanRows || []).map((s) => ({ subjectId: s.subject_id, annotations: s.annotations || [] })))
      setFiches(
        (ficheRows || []).map((f) => ({
          title: f.title,
          subjectId: f.subject_id,
          repetitions: f.repetitions,
          easeFactor: Number(f.ease_factor)
        }))
      )
      setLoading(false)
    })
  }, [userId])

  async function setLevel(subjectId, key, level) {
    const mapKey = `${subjectId}__${key}`
    const now = new Date().toISOString()
    setLevels((prev) => ({ ...prev, [mapKey]: level }))
    setHistoryRows((prev) => [...prev, { subject_id: subjectId, competency_key: key, level, recorded_at: now }])
    await Promise.all([
      supabase
        .from('competency_levels')
        .upsert({ user_id: userId, subject_id: subjectId, competency_key: key, level, updated_at: now }, { onConflict: 'user_id,subject_id,competency_key' }),
      supabase.from('competency_history').insert({ user_id: userId, subject_id: subjectId, competency_key: key, level, recorded_at: now })
    ])
  }

  function validateChallenge(subjectId, key, targetLevel) {
    const current = levels[`${subjectId}__${key}`] || 1
    if (targetLevel > current) setLevel(subjectId, key, targetLevel)
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

  const scoreTimeline = useMemo(() => computeScoreTimeline(historyRows), [historyRows])
  const prediction = useMemo(() => predictScoreIn90Days(scoreTimeline), [scoreTimeline])
  const weakPoints = useMemo(() => detectWeakPoints({ scans, fiches, competencyLevels: levels }), [scans, fiches, levels])

  if (loading) {
    return <p className="text-sm text-ink-400">Chargement…</p>
  }

  const subject = competencySubjects.find((s) => s.id === selectedSubject)
  const radarItems = subject.competencies.map((c) => ({ label: c.label, level: levels[`${subject.id}__${c.key}`] || 1 }))

  return (
    <div className="flex flex-col gap-5">
      <Card className="bg-gradient-to-br from-indigo to-[#2e4368] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Score global</p>
        <p className="mt-1 font-mono text-3xl font-bold">
          {scoreGlobal}
          <span className="text-lg text-white/70">/100</span>
        </p>
        <p className="mt-1 text-sm text-white/85">Moyenne pondérée de tes compétences, toutes matières confondues.</p>
      </Card>

      {weakPoints.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Points faibles détectés</p>
          <div className="flex flex-col gap-2">
            {weakPoints.map((w, i) => (
              <Card key={i} className="flex items-start gap-3 border-l-4 border-l-amber p-3.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                <div>
                  <p className="text-sm font-medium text-ink-800">{w.label}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{w.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="p-5">
        <p className="mb-3 font-display text-[15.5px] font-semibold text-ink-900">Progression sur 2 ans</p>
        {scoreTimeline.length >= 2 ? (
          <>
            <svg viewBox="0 0 320 100" preserveAspectRatio="none" className="block h-auto w-full">
              <polyline
                points={buildTimelinePolyline(scoreTimeline)}
                fill="none"
                stroke="#1b2a4a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {prediction && (
              <p className="mt-2 text-xs text-ink-500">
                À ce rythme, ton score global pourrait atteindre{' '}
                <span className="font-mono font-semibold text-indigo">{prediction.predicted}/100</span> d'ici le{' '}
                {new Date(prediction.date).toLocaleDateString('fr-FR')}.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-ink-500">Fais évoluer quelques compétences pour voir apparaître ta courbe de progression.</p>
        )}
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

      <Card className="p-5">
        <p className="mb-1 text-center font-display text-[15.5px] font-semibold text-ink-900">Carte des compétences</p>
        <p className="mb-2 text-center text-xs text-ink-400">{subject.name}</p>
        <RadarChart items={radarItems} />
      </Card>

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
          const challenges = competencyChallenges[`${subject.id}__${c.key}`] || []
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

              {challenges.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {challenges.map((defi) => {
                    const done = level >= defi.targetLevel
                    return (
                      <button
                        key={defi.id}
                        onClick={() => validateChallenge(subject.id, c.key, defi.targetLevel)}
                        disabled={done}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
                          done ? 'border-teal-soft bg-teal-soft text-teal' : 'border-ink-200 text-ink-600 hover:border-indigo'
                        }`}
                      >
                        <span className="shrink-0">{done ? '✓' : '○'}</span>
                        <span className="flex-1">{defi.text}</span>
                        <span className="shrink-0 font-mono text-[10px] text-ink-400">niv. {defi.targetLevel}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
