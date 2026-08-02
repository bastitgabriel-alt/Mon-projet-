// Ferme la boucle scan -> fiche -> compétences : si une même compétence
// revient plusieurs fois dans les erreurs détectées sur les copies, son
// niveau est plafonné automatiquement plutôt que de rester bloqué sur une
// auto-évaluation trop généreuse. On ne fait jamais remonter un niveau
// automatiquement — seulement le corriger à la baisse si les faits le
// contredisent.
export function computeAutoCompetencyDowngrades({ scans, currentLevels }) {
  const counts = {}
  scans.forEach((s) => {
    ;(s.annotations || []).forEach((a) => {
      if (!a.competencyKey) return
      const key = `${s.subjectId}__${a.competencyKey}`
      counts[key] = (counts[key] || 0) + 1
    })
  })

  const updates = []
  Object.entries(counts).forEach(([key, count]) => {
    if (count < 2) return
    const cap = count >= 4 ? 1 : 2
    const current = currentLevels[key] ?? null
    if (current === null || current > cap) {
      const [subjectId, competencyKey] = key.split('__')
      updates.push({ subjectId, competencyKey, newLevel: cap, count })
    }
  })
  return updates
}
