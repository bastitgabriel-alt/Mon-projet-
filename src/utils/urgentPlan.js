import { computeErrorGroups } from '../data/mockData.js'
import { isDue } from './spacedRepetition.js'

const MINUTES_PER_CARD = 4

// Construit un plan de révision rapide pour une matière donnée : classe les
// fiches de cette matière par priorité (erreurs récurrentes fréquentes,
// jamais révisées, en retard), puis n'en garde que ce qui tient dans le
// temps disponible.
export function buildUrgentPlan({ subjectId, minutes, fiches, scans }) {
  const subjectScans = scans.filter((s) => s.subjectId === subjectId)
  const categoryRank = {}
  computeErrorGroups(subjectScans).forEach((g, i) => {
    categoryRank[g.category] = i
  })

  const todayIso = new Date().toISOString().slice(0, 10)
  const subjectFiches = fiches.filter((f) => f.subjectId === subjectId)

  const scored = subjectFiches.map((f) => {
    let score = 0
    let reason = 'Renforcement'
    if (f.linkedCategory && categoryRank[f.linkedCategory] !== undefined) {
      score += 100 - categoryRank[f.linkedCategory] * 10
      reason = 'Erreur fréquente'
    }
    if (f.repetitions === 0 && !f.lastReviewed) {
      score += 30
      reason = 'Jamais révisée'
    } else if (isDue(f, todayIso)) {
      score += 15
      if (reason === 'Renforcement') reason = 'À réviser'
    }
    score -= f.repetitions * 5
    return { fiche: f, score, reason }
  })

  scored.sort((a, b) => b.score - a.score)

  const maxCards = Math.max(1, Math.floor(minutes / MINUTES_PER_CARD))
  const items = scored.slice(0, maxCards)
  const perItemMinutes = items.length > 0 ? Math.max(2, Math.round(minutes / items.length)) : 0

  return items.map((item) => ({ ...item, minutes: perItemMinutes }))
}
