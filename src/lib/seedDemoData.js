import { supabase } from './supabaseClient.js'
import { scans as demoScans, fiches as demoFiches } from '../data/mockData.js'

// "18/07/2026" -> "2026-07-18"
function toIsoDate(frDate) {
  const [d, m, y] = frDate.split('/')
  return `${y}-${m}-${d}`
}

// Donne à chaque nouveau compte le même jeu de démo que le MVP (copies
// scannées + fiches), pour que la présentation à des testeurs/investisseurs
// reste riche dès la création du compte. N'agit qu'une fois : si l'élève a
// déjà des scans, on ne réinsère rien.
export async function seedDemoDataIfNeeded(userId) {
  const { count, error: countError } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (countError || count > 0) return

  for (const scan of demoScans) {
    const { data: inserted, error } = await supabase
      .from('scans')
      .insert({
        user_id: userId,
        subject_id: scan.subjectId,
        title: scan.title,
        scan_date: toIsoDate(scan.date),
        grade: scan.grade
      })
      .select()
      .single()
    if (error || !inserted) continue

    const annotationRows = scan.annotations.map((a) => ({
      scan_id: inserted.id,
      user_id: userId,
      pos_x: a.x,
      pos_y: a.y,
      category: a.category,
      comment: a.comment
    }))
    await supabase.from('annotations').insert(annotationRows)
  }

  const ficheRows = demoFiches.map((f) => ({
    user_id: userId,
    subject_id: f.subjectId,
    title: f.title,
    question: f.question,
    summary: f.summary,
    linked_category: f.linkedCategory,
    generated: f.generated,
    last_reviewed: f.lastReviewed ? toIsoDate(f.lastReviewed) : null
  }))
  await supabase.from('fiches').insert(ficheRows)
}
