import { supabase } from './supabaseClient.js'
import { resizeImageToBase64 } from './imageResize.js'

const FUNCTION_URL = 'https://vgornmsdsfqactxaoieu.supabase.co/functions/v1/scan-copy'

export async function analyzeCopyImage({ subject, file }) {
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
    throw new Error(err.error || "Le service d'analyse de copie n'a pas répondu.")
  }
  return res.json()
}
