import { parseEventDate } from './schedule.js'

// Détection du contexte prépa du moment (module E.1). Contrairement à la
// version précédente qui ne renvoyait qu'un seul message "gagnant", plusieurs
// contextes peuvent être vrais en même temps (ex: c'est le soir ET un DS est
// dans 2 jours) — chaque contexte listé dans le document est donc renvoyé
// comme un drapeau indépendant, à charge de l'écran d'afficher les
// interventions correspondantes.
//
// Note d'honnêteté : la "période de surchauffe" (>50h de travail/semaine
// pendant 2 semaines) n'est pas détectable ici car l'app ne mesure pas
// encore de temps de travail réel — l'ajouter demanderait un vrai suivi du
// temps (minuté par session), qu'on n'a pas. On ne fabrique donc pas un faux
// nombre d'heures à partir d'autres métriques : ce drapeau reste absent
// plutôt que mensonger.
export function detectContexts({ weekEvents, examTargetDate, recentMoods }) {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const withDiff = weekEvents.map((e) => ({
    ...e,
    diffDays: Math.round((parseEventDate(e.date) - today) / 86400000)
  }))

  const avantDS = withDiff.find((e) => e.type === 'ds' && e.diffDays >= 1 && e.diffDays <= 3) || null
  const apresDS = withDiff.find((e) => e.type === 'ds' && e.diffDays <= 0 && e.diffDays >= -2) || null
  const avantKholle = withDiff.find((e) => e.type === 'colle' && e.diffDays === 1) || null
  const apresKholle = withDiff.find((e) => e.type === 'colle' && e.diffDays === 0) || null

  const periodeDoute = recentMoods.slice(0, 3).filter((m) => m === 'pression' || m === 'epuise').length >= 2

  let avantConcours = null
  if (examTargetDate) {
    const daysToExam = Math.round((new Date(examTargetDate) - today) / 86400000)
    if (daysToExam >= 0 && daysToExam <= 30) avantConcours = { daysToExam }
  }

  return {
    avantDS,
    apresDS,
    avantKholle,
    apresKholle,
    periodeDoute,
    surchauffe: null,
    avantConcours,
    apresResultats: now.getMonth() === 6, // juillet
    soir: now.getHours() >= 20,
    weekend: now.getDay() === 0 || now.getDay() === 6
  }
}

export const breathingPhases = [
  { label: 'Inspire…', seconds: 4 },
  { label: 'Retiens…', seconds: 4 },
  { label: 'Expire…', seconds: 4 },
  { label: 'Retiens…', seconds: 4 }
]
