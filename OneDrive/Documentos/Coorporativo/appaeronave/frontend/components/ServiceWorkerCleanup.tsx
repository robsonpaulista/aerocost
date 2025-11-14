'use client'

import { useEffect } from 'react'

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    // Desregistrar todos os service workers antigos
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          // Desregistrar apenas service workers de localhost:3001 (porta antiga)
          if (registration.scope.includes('localhost:3001')) {
            registration.unregister().then((success) => {
              if (success) {
                console.log('Service worker antigo desregistrado:', registration.scope)
              }
            })
          }
        }
      })

      // Limpar cache do service worker
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              // Remover caches relacionados à aplicação antiga
              if (cacheName.includes('expoapi') || cacheName.includes('3001')) {
                return caches.delete(cacheName)
              }
            })
          )
        })
      }
    }
  }, [])

  return null
}

