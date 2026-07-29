import { useEffect, useMemo, useState } from 'react'
import { subjects } from '../data/mockData.js'
import { supabase } from './supabaseClient.js'
import { generateAcademicCalendar } from '../utils/academicCalendar.js'

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const DEFAULT_TIME = { ds: '08:00', colle: '14:00' }

function eventTitle(e) {
  if (e.type === 'ds') return `DS de ${subjects.find((s) => s.id === e.subjectId)?.short || e.subjectId}`
  if (e.type === 'colle') return `Colle de ${subjects.find((s) => s.id === e.subjectId)?.short || e.subjectId}`
  return e.title
}

// Charge le calendrier académique réel (2 ans) de l'utilisateur si il/elle a
// complété l'onboarding de l'onglet Calendrier. Renvoie des événements déjà
// enrichis avec title/time pour rester compatibles avec nextUpcoming() et les
// composants qui affichaient jusqu'ici les événements de démo (weekEvents).
export function useAcademicCalendar(userId) {
  const [profile, setProfile] = useState(undefined) // undefined = chargement, null = pas d'onboarding

  useEffect(() => {
    supabase
      .from('user_academic_profile')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => setProfile(data || null))
  }, [userId])

  const events = useMemo(() => {
    if (!profile) return null
    return generateAcademicCalendar({ filiere: profile.filiere, annee: profile.annee, dateRentree: profile.date_rentree }).map(
      (e) => ({ ...e, time: DEFAULT_TIME[e.type] || '', title: eventTitle(e) })
    )
  }, [profile])

  const examTargetDate = useMemo(() => events?.find((e) => e.id === 'ecrit-debut')?.date ?? null, [events])

  return {
    loading: profile === undefined,
    hasProfile: Boolean(profile),
    events,
    examTargetDate
  }
}

// Filtre les événements réels à la semaine en cours et ajoute le champ `day`
// (nom du jour en français) attendu par le composant WeekPlan du dashboard.
export function thisWeekEvents(events) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return events
    .filter((e) => {
      const d = new Date(e.date)
      return d >= monday && d <= sunday
    })
    .map((e) => {
      const d = new Date(e.date)
      const dayName = DAY_NAMES[d.getDay()]
      return { ...e, day: dayName.charAt(0).toUpperCase() + dayName.slice(1), _sortDate: d }
    })
    .sort((a, b) => a._sortDate - b._sortDate)
}
