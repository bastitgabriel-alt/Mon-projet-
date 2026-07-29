// "28/07" -> Date de cette année (les données de démo sont calées sur la
// semaine en cours, donc on suppose l'année courante). Accepte aussi le
// format ISO "YYYY-MM-DD" utilisé par le calendrier académique généré
// (Calendrier.jsx), qui lui couvre plusieurs années.
export function parseEventDate(dateStr) {
  if (dateStr.includes('/')) {
    const [d, m] = dateStr.split('/').map(Number)
    return new Date(new Date().getFullYear(), m - 1, d)
  }
  return new Date(dateStr)
}

export function relativeDayLabel(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date - today) / 86400000)
  if (diffDays === 0) return "aujourd'hui"
  if (diffDays === 1) return 'demain'
  if (diffDays > 1) return `dans ${diffDays} j`
  return null
}

// Prochaine échéance à venir (DS/colle par défaut), triée par date.
export function nextUpcoming(events, types = ['ds', 'colle']) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return events
    .filter((e) => types.includes(e.type))
    .map((e) => ({ ...e, parsedDate: parseEventDate(e.date) }))
    .filter((e) => e.parsedDate >= today)
    .sort((a, b) => a.parsedDate - b.parsedDate)[0]
}
