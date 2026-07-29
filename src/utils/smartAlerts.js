// Alertes intelligentes (module A.3) : contrairement au "mode de vie" qui
// décrit l'état général du moment, ces alertes ciblent une échéance précise
// à venir avec un conseil actionnable, façon notification.

function diffDaysFromToday(dateIso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(dateIso) - today) / 86400000)
}

function dayLabel(diffDays) {
  if (diffDays === 0) return "aujourd'hui"
  if (diffDays === 1) return 'demain'
  return `dans ${diffDays} jours`
}

export function getSmartAlerts(events) {
  const withDiff = events.map((e) => ({ ...e, diffDays: diffDaysFromToday(e.date) }))
  const alerts = []

  withDiff
    .filter((e) => e.type === 'colle' && e.diffDays >= 0 && e.diffDays <= 2)
    .forEach((e) => {
      alerts.push({
        id: `alert-${e.id}`,
        tone: 'coral',
        diffDays: e.diffDays,
        text: `${e.title} ${dayLabel(e.diffDays)}. Prends 20 minutes pour réviser le chapitre et fais quelques questions de réchauffement.`
      })
    })

  withDiff
    .filter((e) => e.type === 'ds' && e.diffDays >= 4 && e.diffDays <= 5)
    .forEach((e) => {
      alerts.push({
        id: `alert-${e.id}`,
        tone: 'coral',
        diffDays: e.diffDays,
        text: `${e.title} ${dayLabel(e.diffDays)}. Regarde tes fiches liées à cette matière et repère ce qui reste fragile.`
      })
    })

  withDiff
    .filter((e) => e.type === 'vacances' && e.diffDays >= 13 && e.diffDays <= 14)
    .forEach((e) => {
      alerts.push({
        id: `alert-${e.id}`,
        tone: 'teal',
        diffDays: e.diffDays,
        text: `${e.title} ${dayLabel(e.diffDays)}. Commence à préparer ton plan de consolidation pour tes points faibles.`
      })
    })

  withDiff
    .filter((e) => e.type === 'concours_blanc' && e.diffDays >= 9 && e.diffDays <= 10)
    .forEach((e) => {
      alerts.push({
        id: `alert-${e.id}`,
        tone: 'amber',
        diffDays: e.diffDays,
        text: `${e.title} ${dayLabel(e.diffDays)}. Passe en mode simulation : conditions réelles, temps chronométré.`
      })
    })

  return alerts.sort((a, b) => a.diffDays - b.diffDays)
}
