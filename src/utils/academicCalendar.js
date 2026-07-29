// Génère un calendrier académique de prépa sur 2 ans à partir de la filière,
// l'année en cours et la date de rentrée de cette année. Les dates de
// vacances/concours sont des approximations plausibles (zone scolaire
// générique) — comme le reste des données de démo de l'app, l'objectif est
// un calendrier crédible, pas une source officielle.

function addDays(date, n) {
  const r = new Date(date)
  r.setDate(r.getDate() + n)
  return r
}

function addYears(date, n) {
  const r = new Date(date)
  r.setFullYear(r.getFullYear() + n)
  return r
}

function dateAt(year, month, day) {
  return new Date(year, month - 1, day)
}

function toISO(date) {
  return date.toISOString().slice(0, 10)
}

function vacationWindows(rentreeYear) {
  return [
    { start: dateAt(rentreeYear, 10, 19), end: dateAt(rentreeYear, 11, 3), title: 'Vacances de la Toussaint' },
    { start: dateAt(rentreeYear, 12, 21), end: dateAt(rentreeYear + 1, 1, 5), title: 'Vacances de Noël' },
    { start: dateAt(rentreeYear + 1, 2, 14), end: dateAt(rentreeYear + 1, 3, 1), title: "Vacances d'hiver" },
    { start: dateAt(rentreeYear + 1, 4, 11), end: dateAt(rentreeYear + 1, 4, 26), title: 'Vacances de printemps' }
  ]
}

const DS_SUBJECTS = ['maths', 'physique']
const KHOLLE_SUBJECTS = ['maths', 'physique', 'anglais', 'francais']

export function generateAcademicCalendar({ filiere, annee, dateRentree }) {
  const rentree = new Date(dateRentree)
  const annee1Rentree = annee === 1 ? rentree : addYears(rentree, -1)
  const annee2Rentree = annee === 2 ? rentree : addYears(rentree, 1)
  const y1 = annee1Rentree.getFullYear()
  const y2 = annee2Rentree.getFullYear()

  const events = []

  events.push({ id: 'rentree-1', date: toISO(annee1Rentree), type: 'rentree', title: `Rentrée — 1ère année (${filiere})` })
  events.push({ id: 'rentree-2', date: toISO(annee2Rentree), type: 'rentree', title: 'Rentrée — 2e année' })

  const vac1 = vacationWindows(y1)
  const vac2 = vacationWindows(y2)
  ;[...vac1, ...vac2].forEach((w, i) => {
    events.push({ id: `vac-${i}`, date: toISO(w.start), endDate: toISO(w.end), type: 'vacances', title: w.title })
  })

  const concoursBlancs = [dateAt(y2, 11, 15), dateAt(y2 + 1, 1, 10), dateAt(y2 + 1, 3, 10), dateAt(y2 + 1, 5, 5)]
  concoursBlancs.forEach((d, i) => {
    events.push({ id: `blanc-${i}`, date: toISO(d), type: 'concours_blanc', title: `Concours blanc n°${i + 1}` })
  })

  const ecritDebut = dateAt(y2 + 1, 5, 20)
  events.push({ id: 'ecrit-debut', date: toISO(ecritDebut), type: 'ecrit', title: 'Concours écrits — début' })
  events.push({ id: 'ecrit-fin', date: toISO(dateAt(y2 + 1, 5, 30)), type: 'ecrit', title: 'Concours écrits — fin' })
  events.push({ id: 'oral-debut', date: toISO(dateAt(y2 + 1, 6, 15)), type: 'oral', title: 'Oraux — début' })

  const allVacWindows = [...vac1, ...vac2]
  const isBlocked = (d) => allVacWindows.some((w) => d >= w.start && d <= w.end)

  let dsCursor = addDays(annee1Rentree, 21)
  let dsIdx = 0
  while (dsCursor <= ecritDebut) {
    if (!isBlocked(dsCursor)) {
      events.push({ id: `ds-${dsIdx}`, date: toISO(dsCursor), type: 'ds', subjectId: DS_SUBJECTS[dsIdx % DS_SUBJECTS.length] })
      dsIdx++
      dsCursor = addDays(dsCursor, 21)
    } else {
      dsCursor = addDays(dsCursor, 1)
    }
  }

  KHOLLE_SUBJECTS.forEach((subjectId, si) => {
    let cursor = addDays(annee1Rentree, 14 + si * 2)
    let idx = 0
    while (cursor <= ecritDebut) {
      if (!isBlocked(cursor)) {
        events.push({ id: `colle-${subjectId}-${idx}`, date: toISO(cursor), type: 'colle', subjectId })
        idx++
        cursor = addDays(cursor, 14)
      } else {
        cursor = addDays(cursor, 1)
      }
    }
  })

  events.sort((a, b) => a.date.localeCompare(b.date))
  return events
}

export const eventTypeMeta = {
  rentree: { label: 'Rentrée', tone: 'bg-indigo-soft text-indigo' },
  vacances: { label: 'Vacances', tone: 'bg-teal-soft text-teal' },
  ds: { label: 'DS', tone: 'bg-coral-soft text-coral' },
  colle: { label: 'Colle', tone: 'bg-indigo-soft text-indigo' },
  concours_blanc: { label: 'Concours blanc', tone: 'bg-amber-soft text-amber' },
  ecrit: { label: 'Concours écrits', tone: 'bg-coral-soft text-coral' },
  oral: { label: 'Oraux', tone: 'bg-coral-soft text-coral' }
}
