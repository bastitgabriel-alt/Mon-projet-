import { competencySubjects } from '../data/competencies.js'

// Plan hebdomadaire (module A.4) : combine le calendrier de la semaine à
// venir, les compétences les plus faibles (module C) et l'énergie du jour
// (module E) en 2-3 priorités concrètes pour la semaine.

function weakestCompetencies(levels, count = 2) {
  const all = []
  competencySubjects.forEach((s) => {
    s.competencies.forEach((c) => {
      const level = levels[`${s.id}__${c.key}`] || 1
      all.push({ subject: s.name, label: c.label, level })
    })
  })
  return all.sort((a, b) => a.level - b.level).slice(0, count)
}

function energyNote(energyToday) {
  if (!energyToday) return null
  if (energyToday.energie <= 4 || energyToday.stress >= 7) {
    return 'Ton énergie est plutôt basse en ce moment : privilégie des sessions courtes et régulières cette semaine plutôt que de longues marathons de révision.'
  }
  if (energyToday.energie >= 7) {
    return "Ton énergie est bonne : c'est le bon moment pour attaquer un point difficile plutôt que de la révision légère."
  }
  return null
}

export function buildWeeklyPlan({ events, levels, energyToday }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in7Days = new Date(today)
  in7Days.setDate(in7Days.getDate() + 7)
  const in7DaysIso = in7Days.toISOString().slice(0, 10)
  const todayIso = today.toISOString().slice(0, 10)

  const weekEvents = events
    .filter((e) => (e.type === 'ds' || e.type === 'colle') && e.date >= todayIso && e.date <= in7DaysIso)
    .sort((a, b) => a.date.localeCompare(b.date))

  const weak = weakestCompetencies(levels)
  const priorities = []

  if (weekEvents.length > 0) {
    const labels = weekEvents.map((e) => e.title).join(', ')
    priorities.push(`${weekEvents.length} échéance${weekEvents.length > 1 ? 's' : ''} cette semaine : ${labels}. Priorise les fiches liées à ces matières.`)
  } else {
    priorities.push("Pas d'échéance cette semaine : bon moment pour consolider en profondeur.")
  }

  if (weak.length > 0) {
    priorities.push(
      `Points les plus faibles en ce moment : ${weak.map((w) => `${w.label} (${w.subject})`).join(' et ')}. Vise au moins une session dessus.`
    )
  }

  const note = energyNote(energyToday)
  if (note) priorities.push(note)

  return { weekEvents, weak, priorities }
}
