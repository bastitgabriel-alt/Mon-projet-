import { supabase } from './supabaseClient.js'
import { badgeDefinitions } from '../data/badges.js'
import { computeStreak } from '../utils/streak.js'

async function fetchStats(userId) {
  const [{ count: scans }, { data: reviewRows }, { data: moodRows }, { data: ficheRows }] = await Promise.all([
    supabase.from('scans').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('review_log').select('id').eq('user_id', userId),
    supabase.from('moods').select('mood_date').eq('user_id', userId),
    supabase.from('fiches').select('repetitions').eq('user_id', userId)
  ])

  return {
    scans: scans || 0,
    reviews: (reviewRows || []).length,
    streak: computeStreak((moodRows || []).map((m) => m.mood_date)),
    mastered: (ficheRows || []).filter((f) => f.repetitions >= 3).length
  }
}

// Calcule les stats courantes, débloque tout succès nouvellement atteint
// (insertion idempotente, jamais retiré ensuite) et renvoie l'état complet
// utile à l'affichage : succès acquis, nouveaux, et prochain objectif.
export async function checkAndAwardBadges(userId) {
  const [stats, { data: earnedRows }] = await Promise.all([
    fetchStats(userId),
    supabase.from('badges_earned').select('badge_id').eq('user_id', userId)
  ])

  const earnedIds = new Set((earnedRows || []).map((r) => r.badge_id))
  const newlyEarned = badgeDefinitions.filter((b) => !earnedIds.has(b.id) && stats[b.metric] >= b.threshold)

  if (newlyEarned.length > 0) {
    await supabase
      .from('badges_earned')
      .upsert(
        newlyEarned.map((b) => ({ user_id: userId, badge_id: b.id })),
        { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
      )
    newlyEarned.forEach((b) => earnedIds.add(b.id))
  }

  const earned = badgeDefinitions.filter((b) => earnedIds.has(b.id))
  const locked = badgeDefinitions
    .filter((b) => !earnedIds.has(b.id))
    .map((b) => ({ ...b, remaining: b.threshold - stats[b.metric] }))
    .filter((b) => b.remaining > 0)
    .sort((a, b) => a.remaining - b.remaining)

  return { stats, earned, newlyEarned, nextBadge: locked[0] || null }
}
