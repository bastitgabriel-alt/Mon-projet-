import { supabase } from './supabaseClient.js'

const FUNCTION_URL = 'https://vgornmsdsfqactxaoieu.supabase.co/functions/v1/scan-course'
const MAX_DIMENSION = 1600

// Redimensionne l'image côté client avant l'envoi : les photos de cours
// prises au téléphone (souvent 3000px+) coûtent inutilement cher en tokens
// d'image et n'apportent rien de plus pour la lecture par le modèle.
function resizeImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve(dataUrl.split(',')[1])
    }
    img.onerror = reject
    img.src = objectUrl
  })
}

export async function analyzeCourseImage({ subject, file }) {
  const imageBase64 = await resizeImageToBase64(file)

  const {
    data: { session }
  } = await supabase.auth.getSession()

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({ subject, imageBase64, mediaType: 'image/jpeg' })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Le service de lecture de cours n'a pas répondu.")
  }
  return res.json()
}
