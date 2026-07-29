// Détermine le "mode de vie" actuel de l'élève à partir du calendrier
// académique généré : l'app adapte son ton et ses priorités selon que c'est
// une semaine normale, une période de survie avant un DS, de consolidation
// pendant les vacances, etc.

const MODES = {
  normal: {
    mode: 'normal',
    title: 'Mode normal',
    description: "Semaine sans échéance majeure : avance sur ton planning et entraîne-toi à l'oral tranquillement."
  },
  survie: {
    mode: 'survie',
    title: 'Mode survie',
    description: 'DS proche : concentre-toi sur cette matière, 3 priorités maximum aujourd\'hui.'
  },
  kholle: {
    mode: 'kholle',
    title: 'Mode khôlle',
    description: 'Colle demain : révision ciblée sur le chapitre et préparation mentale.'
  },
  consolidation: {
    mode: 'consolidation',
    title: 'Mode consolidation',
    description: 'Vacances : rattrape tes points faibles sans culpabiliser, pas de nouveau chapitre.'
  },
  simulation: {
    mode: 'simulation',
    title: 'Mode simulation',
    description: 'Concours dans moins de 30 jours : conditions réelles, gestion du temps et du stress.'
  },
  recuperation: {
    mode: 'recuperation',
    title: 'Mode récupération',
    description: "Après une échéance : analyse tes erreurs, note une petite victoire, puis repose-toi."
  }
}

export function getLifeMode(events, today = new Date()) {
  const todayIso = today.toISOString().slice(0, 10)
  const withDiff = events.map((e) => ({
    ...e,
    diffDays: Math.round((new Date(e.date) - new Date(todayIso)) / 86400000)
  }))

  const onVacation = withDiff.find((e) => e.type === 'vacances' && todayIso >= e.date && todayIso <= e.endDate)
  if (onVacation) return { ...MODES.consolidation, context: onVacation.title }

  const ecrit = withDiff.find((e) => e.id === 'ecrit-debut')
  if (ecrit && ecrit.diffDays >= 0 && ecrit.diffDays <= 30) {
    return { ...MODES.simulation, context: `J-${ecrit.diffDays} avant les écrits` }
  }

  const kholleTomorrow = withDiff.find((e) => e.type === 'colle' && e.diffDays === 1)
  if (kholleTomorrow) return { ...MODES.kholle, context: kholleTomorrow.subjectId }

  const dsSoon = withDiff.find((e) => e.type === 'ds' && e.diffDays >= 0 && e.diffDays <= 7)
  if (dsSoon) return { ...MODES.survie, context: `DS dans ${dsSoon.diffDays} j` }

  const justHappened = withDiff.find((e) => (e.type === 'ds' || e.type === 'colle') && e.diffDays >= -2 && e.diffDays < 0)
  if (justHappened) return { ...MODES.recuperation, context: justHappened.title }

  return { ...MODES.normal, context: null }
}
