// Définitions des succès. `metric` pointe vers une clé des stats calculées
// dans src/lib/badges.js ; `threshold` est le palier à atteindre. Une fois
// débloqué, un succès reste acquis pour toujours (voir badges_earned) même
// si la stat qui l'a déclenché redescend ensuite — jamais punitif.
export const badgeDefinitions = [
  { id: 'first-scan', label: 'Premier scan', icon: '📸', metric: 'scans', threshold: 1, unit: 'copie scannée' },
  { id: 'scans-5', label: '5 copies scannées', icon: '🗂️', metric: 'scans', threshold: 5, unit: 'copies scannées' },
  { id: 'scans-20', label: '20 copies scannées', icon: '🗃️', metric: 'scans', threshold: 20, unit: 'copies scannées' },
  { id: 'first-review', label: 'Première session de révision', icon: '🧠', metric: 'reviews', threshold: 1, unit: 'fiche révisée' },
  { id: 'reviews-10', label: '10 fiches révisées', icon: '📖', metric: 'reviews', threshold: 10, unit: 'fiches révisées' },
  { id: 'reviews-50', label: '50 fiches révisées', icon: '📚', metric: 'reviews', threshold: 50, unit: 'fiches révisées' },
  { id: 'streak-3', label: '3 jours de suite', icon: '🔥', metric: 'streak', threshold: 3, unit: 'jours de suite' },
  { id: 'streak-7', label: '7 jours de suite', icon: '🔥', metric: 'streak', threshold: 7, unit: 'jours de suite' },
  { id: 'streak-30', label: '30 jours de suite', icon: '🏆', metric: 'streak', threshold: 30, unit: 'jours de suite' },
  { id: 'mastered-1', label: 'Une fiche maîtrisée', icon: '⭐', metric: 'mastered', threshold: 1, unit: 'fiche maîtrisée' },
  { id: 'mastered-5', label: '5 fiches maîtrisées', icon: '🌟', metric: 'mastered', threshold: 5, unit: 'fiches maîtrisées' }
]
