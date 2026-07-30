// Progression à l'oral (module B.5) : reconstitue la courbe de notes et la
// comparaison d'une colle à l'autre à partir des sessions déjà terminées.
// Les scores par dimension (clarté, structure, etc.) ne sont disponibles que
// depuis l'ajout du bilan enrichi (B.4) — les colles plus anciennes n'ont
// pas ces champs et sont simplement ignorées dans le calcul par dimension,
// plutôt que remplacées par une valeur inventée.

const DIMENSIONS = [
  { key: 'clarte_score', label: 'clarté' },
  { key: 'structure_score', label: 'structure' },
  { key: 'gestion_temps_score', label: 'gestion du temps' },
  { key: 'maitrise_technique_score', label: 'maîtrise technique' }
]

export function computeColleProgression(sessions) {
  const scored = sessions
    .filter((s) => typeof s.feedback?.score === 'number')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  const scoreTimeline = scored.map((s) => ({ date: s.created_at, score: s.feedback.score }))

  const delta =
    scored.length >= 2 ? scored[scored.length - 1].feedback.score - scored[scored.length - 2].feedback.score : null

  const dimensionProgress = DIMENSIONS.map((dim) => {
    const withDim = scored.filter((s) => typeof s.feedback?.[dim.key] === 'number')
    if (withDim.length < 2) return null
    const gain = withDim[withDim.length - 1].feedback[dim.key] - withDim[0].feedback[dim.key]
    if (gain === 0) return null
    return { label: dim.label, gain }
  }).filter(Boolean)

  return { scoreTimeline, delta, dimensionProgress, sessionCount: scored.length }
}
