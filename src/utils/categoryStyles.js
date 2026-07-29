// Palette "coaching" volontairement douce : on évite le rouge alarmant
// pour signaler une erreur, on préfère des teintes neutres/chaleureuses.
export const categoryStyles = {
  calcul: { dot: 'bg-coach-500', badge: 'bg-coach-50 text-coach-600', ring: 'ring-coach-300' },
  hypotheses: { dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700', ring: 'ring-violet-300' },
  redaction: { dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700', ring: 'ring-sky-300' },
  methode: { dot: 'bg-brand-500', badge: 'bg-brand-50 text-brand-700', ring: 'ring-brand-300' },
  notions: { dot: 'bg-rose-400', badge: 'bg-rose-50 text-rose-600', ring: 'ring-rose-300' }
}

export function styleFor(category) {
  return categoryStyles[category] || categoryStyles.methode
}
