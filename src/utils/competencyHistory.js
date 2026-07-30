import { competencySubjects, levelLabels } from '../data/competencies.js'

const TOTAL_COMPETENCIES = competencySubjects.flatMap((s) => s.competencies).length

// Reconstitue l'évolution du score global (0-100) dans le temps à partir du
// journal d'historique (une ligne à chaque changement de niveau d'une
// compétence). Les compétences jamais touchées comptent au niveau 1 par
// défaut, comme ailleurs dans l'app.
export function computeScoreTimeline(historyRows) {
  const sorted = [...historyRows].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
  const known = {}
  const points = []

  sorted.forEach((row) => {
    known[`${row.subject_id}__${row.competency_key}`] = row.level
    const sumLevels = Object.values(known).reduce((a, b) => a + b, 0)
    const untouched = TOTAL_COMPETENCIES - Object.keys(known).length
    const avg = (sumLevels + untouched * 1) / TOTAL_COMPETENCIES
    const score = Math.round(((avg - 1) / 4) * 100)
    points.push({ date: row.recorded_at, score })
  })

  return points
}

// Régression linéaire simple (score en fonction du temps écoulé) pour
// projeter le score global à +90 jours. Ne renvoie une prédiction que s'il y
// a assez de données et une tendance positive claire, pour éviter une
// projection fantaisiste sur un historique trop court ou en baisse.
export function predictScoreIn90Days(points) {
  if (points.length < 3) return null

  const first = new Date(points[0].date).getTime()
  const xs = points.map((p) => (new Date(p.date).getTime() - first) / 86400000)
  const ys = points.map((p) => p.score)
  const n = xs.length
  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0)
  const sumXX = xs.reduce((sum, x) => sum + x * x, 0)
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return null

  const slope = (n * sumXY - sumX * sumY) / denom
  if (slope <= 0.01) return null

  const latestScore = ys[ys.length - 1]
  const predicted = Math.min(100, Math.round(latestScore + slope * 90))
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 90)

  return { predicted, date: targetDate.toISOString().slice(0, 10) }
}

// "Rappel de progression" (module E.2, section "Après une mauvaise note") :
// trouve une compétence qui a réellement bien progressé (au moins 2 niveaux
// gagnés sur au moins 30 jours) pour un rappel concret plutôt qu'une phrase
// générique — n'affiche rien si l'historique ne montre pas une telle
// progression, plutôt que d'inventer un exemple.
export function findProgressReminder(historyRows) {
  const byKey = {}
  historyRows.forEach((row) => {
    const key = `${row.subject_id}__${row.competency_key}`
    if (!byKey[key]) byKey[key] = []
    byKey[key].push(row)
  })

  let best = null
  Object.entries(byKey).forEach(([key, rows]) => {
    const sorted = [...rows].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const daysBetween = (new Date(last.recorded_at) - new Date(first.recorded_at)) / 86400000
    const gain = last.level - first.level
    if (gain >= 2 && daysBetween >= 30 && (!best || gain > best.gain)) {
      best = { key, last, gain, daysBetween }
    }
  })

  if (!best) return null
  const months = Math.max(1, Math.round(best.daysBetween / 30))
  const [subjectId, competencyKey] = best.key.split('__')
  const label = competencySubjects.find((s) => s.id === subjectId)?.competencies.find((c) => c.key === competencyKey)?.label
  if (!label) return null

  return `Il y a ${months} mois, ta maîtrise de "${label}" était encore faible. Aujourd'hui, tu es à un niveau ${levelLabels[best.last.level - 1].toLowerCase()}.`
}
