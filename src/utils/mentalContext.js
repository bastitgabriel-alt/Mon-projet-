import { parseEventDate } from './schedule.js'

// Détecte le contexte prépa du moment (DS/colle proches ou passés, période de
// doute, approche des concours) et renvoie le message de coaching le plus
// pertinent. Priorité : ce qui est le plus urgent/imminent d'abord.
export function getContextualMessage({ weekEvents, examTargetDate, recentMoods }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const withDiff = weekEvents.map((e) => ({
    ...e,
    diffDays: Math.round((parseEventDate(e.date) - today) / 86400000)
  }))

  const dsTomorrowOrSoon = withDiff.find((e) => e.type === 'ds' && e.diffDays >= 1 && e.diffDays <= 3)
  const colleTomorrow = withDiff.find((e) => e.type === 'colle' && e.diffDays === 1)
  const dsRecent = withDiff.find((e) => e.type === 'ds' && e.diffDays <= 0 && e.diffDays >= -2)
  const colleRecent = withDiff.find((e) => e.type === 'colle' && e.diffDays <= 0 && e.diffDays >= -1)

  if (colleTomorrow) {
    return {
      type: 'avant_colle',
      tone: 'coral',
      title: `Colle de ${colleTomorrow.title.split('—')[0].trim()} demain`,
      body: "Respiration box-breathing avant de dormir, et 3 questions de réchauffement sur le chapitre demain matin. Le prof veut te voir réussir, pas te piéger.",
      action: 'breathing'
    }
  }

  if (dsTomorrowOrSoon) {
    const label = dsTomorrowOrSoon.diffDays === 1 ? 'demain' : `dans ${dsTomorrowOrSoon.diffDays} jours`
    return {
      type: 'avant_ds',
      tone: 'coral',
      title: `DS ${label}`,
      body: "Relis tes fiches liées, refais 2-3 exercices-types, puis arrête-toi. La veille d'un DS, la fatigue coûte plus cher qu'un chapitre de plus.",
      action: 'breathing'
    }
  }

  if (colleRecent || dsRecent) {
    return {
      type: 'apres_evaluation',
      tone: 'indigo',
      title: 'Comment ça s\'est passé ?',
      body: "Que le résultat soit bon ou non, prends 2 minutes pour noter ce qui a posé problème dans ton journal du soir. C'est cette analyse qui te fait progresser, pas la note seule.",
      action: null
    }
  }

  const badStreak = recentMoods.slice(0, 3).filter((m) => m === 'pression' || m === 'epuise').length >= 2
  if (badStreak) {
    return {
      type: 'doute',
      tone: 'amber',
      title: 'Période difficile en ce moment ?',
      body: "C'est normal en prépa, ça arrive à tout le monde. Vise juste 15 minutes de travail aujourd'hui, pas plus. Regarde aussi ta progression sur les 2 derniers mois — tu as déjà avancé plus que tu ne le crois.",
      action: null
    }
  }

  if (examTargetDate) {
    const daysToExam = Math.round((new Date(examTargetDate) - today) / 86400000)
    if (daysToExam >= 0 && daysToExam <= 30) {
      return {
        type: 'avant_concours',
        tone: 'amber',
        title: `J-${daysToExam} avant les écrits`,
        body: "C'est le moment de passer en mode simulation : conditions réelles, temps chronométré. La régularité compte plus que l'intensité maintenant.",
        action: null
      }
    }
  }

  return {
    type: 'normal',
    tone: 'teal',
    title: 'Semaine normale',
    body: "Pas d'échéance immédiate — profites-en pour consolider un point faible ou prendre un peu de repos actif. Les deux comptent.",
    action: null
  }
}

export const breathingPhases = [
  { label: 'Inspire…', seconds: 4 },
  { label: 'Retiens…', seconds: 4 },
  { label: 'Expire…', seconds: 4 },
  { label: 'Retiens…', seconds: 4 }
]
