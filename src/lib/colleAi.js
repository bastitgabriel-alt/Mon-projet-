import { supabase } from './supabaseClient.js'

const FUNCTION_URL = 'https://vgornmsdsfqactxaoieu.supabase.co/functions/v1/colle-ai'

async function callColleAi(payload) {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Le service de l'IA colleur n'a pas répondu.")
  }
  return res.json()
}

export function askExaminerTurn({ subject, topic, history }) {
  return callColleAi({ mode: 'turn', subject, topic, history })
}

export function getColleFeedback({ subject, topic, history }) {
  return callColleAi({ mode: 'feedback', subject, topic, history })
}
