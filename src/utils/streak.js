// Nombre de jours consécutifs (jusqu'à aujourd'hui) avec une humeur enregistrée.
export function computeStreak(moodDates) {
  const set = new Set(moodDates)
  let streak = 0
  const cursor = new Date()
  // Si l'humeur du jour n'est pas encore renseignée, on part d'hier pour ne
  // pas casser une série en cours avant la fin de la journée.
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
