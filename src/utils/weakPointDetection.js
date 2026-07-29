import { errorCategories, computeErrorGroups } from '../data/mockData.js'
import { getWeakestCompetencies } from './weeklyPlan.js'

// Détection automatique des points faibles (module C.4) : croise plusieurs
// signaux déjà présents dans l'app plutôt qu'un seul (l'auto-évaluation ne
// suffit pas) — erreurs récurrentes détectées sur les copies scannées,
// fiches sur lesquelles l'élève bute (ease factor bas malgré des révisions),
// et compétences auto-évaluées comme faibles.
export function detectWeakPoints({ scans, fiches, competencyLevels }) {
  const points = []

  computeErrorGroups(scans)
    .filter((g) => g.count > 1)
    .slice(0, 3)
    .forEach((g) => {
      points.push({
        source: 'erreurs',
        subjectId: g.subjectId,
        label: errorCategories[g.category]?.label || g.category,
        detail: `Repérée ${g.count} fois sur tes copies scannées. ${errorCategories[g.category]?.tip || ''}`
      })
    })

  fiches
    .filter((f) => f.repetitions > 0 && f.easeFactor < 2.0)
    .slice(0, 3)
    .forEach((f) => {
      points.push({
        source: 'fiches',
        subjectId: f.subjectId,
        label: f.title,
        detail: "Cette fiche revient souvent en difficulté malgré les révisions — le contenu n'est pas encore stabilisé."
      })
    })

  getWeakestCompetencies(competencyLevels, 2).forEach((w) => {
    points.push({
      source: 'competence',
      subjectId: w.subjectId,
      label: w.label,
      detail: `Compétence auto-évaluée faible (${w.subject}) — une session de colle ou d'exercices ciblés aiderait.`
    })
  })

  return points
}
