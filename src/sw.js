import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

const BASE_PATH = self.registration.scope

self.addEventListener('push', (event) => {
  let data = { title: 'Marge', body: '' }
  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data = { title: 'Marge', body: event.data.text() }
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Marge', {
      body: data.body || '',
      icon: `${BASE_PATH}icon.svg`,
      badge: `${BASE_PATH}icon.svg`
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(BASE_PATH)
      return undefined
    })
  )
})
