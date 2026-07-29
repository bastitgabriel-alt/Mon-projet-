// Algorithme SM-2 (SuperMemo 2), simplifié à 4 niveaux de rappel façon Anki.
// https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm

export const recallLevels = [
  { id: 'again', label: 'Je ne savais pas', quality: 1 },
  { id: 'hard', label: 'Difficile', quality: 3 },
  { id: 'good', label: 'Bien', quality: 4 },
  { id: 'easy', label: 'Facile', quality: 5 }
]

// Calcule le nouvel état de répétition espacée à partir de l'état courant
// d'une fiche et de la qualité du rappel (0-5, cf. recallLevels ci-dessus).
export function nextReviewState({ repetitions = 0, easeFactor = 2.5, intervalDays = 0 }, quality) {
  let newEase = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (newEase < 1.3) newEase = 1.3

  let newRepetitions
  let newInterval

  if (quality < 3) {
    newRepetitions = 0
    newInterval = 1
  } else {
    newRepetitions = repetitions + 1
    if (newRepetitions === 1) newInterval = 1
    else if (newRepetitions === 2) newInterval = 6
    else newInterval = Math.round(intervalDays * newEase)
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  return {
    repetitions: newRepetitions,
    easeFactor: Number(newEase.toFixed(2)),
    intervalDays: newInterval,
    nextReview: nextReviewDate.toISOString().slice(0, 10)
  }
}

export function isDue(fiche, todayIso) {
  return !fiche.nextReview || fiche.nextReview <= todayIso
}
