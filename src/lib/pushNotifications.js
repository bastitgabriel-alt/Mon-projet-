import { supabase } from './supabaseClient.js'

// Clé publique VAPID générée pour ce projet — sans danger à exposer côté
// client, c'est son rôle (elle identifie notre "serveur d'application"
// auprès du service de push du navigateur, elle ne permet pas d'envoyer).
const VAPID_PUBLIC_KEY = 'BFFaXdbQbcG5yPafMhChFj6krru_IMkjzZQGkQkSAoVbh_aTWOUqMlKRD49_s6yA3FjkPk3RgPSt0FyUX6429f0'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function isPushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

export function getNotificationPermission() {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

export async function subscribeToPush(userId) {
  if (!isPushSupported()) throw new Error('Les notifications ne sont pas supportées sur cet appareil/navigateur.')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Permission refusée.')

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
  }

  const json = subscription.toJSON()
  await supabase.from('push_subscriptions').upsert(
    { user_id: userId, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
    { onConflict: 'user_id,endpoint' }
  )
}

export async function scheduleNotification({ userId, delaySeconds, title, body }) {
  await cancelPendingNotifications(userId)
  const fireAt = new Date(Date.now() + delaySeconds * 1000).toISOString()
  await supabase.from('scheduled_notifications').insert({ user_id: userId, fire_at: fireAt, title, body })
}

export async function cancelPendingNotifications(userId) {
  await supabase.from('scheduled_notifications').delete().eq('user_id', userId).eq('sent', false)
}
