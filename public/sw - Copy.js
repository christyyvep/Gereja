// MyRajawali Service Worker
const CACHE_NAME = 'myrajawali-v1.0.0'
const STATIC_CACHE = 'myrajawali-static-v1'
const DYNAMIC_CACHE = 'myrajawali-dynamic-v1'

// Files yang akan di-cache saat install
const STATIC_FILES = [
  '/',
  '/icons/icon-72.png',
  '/icons/icon-192.png', 
  '/icons/icon-512.png',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap'
]

// Halaman offline fallback
const OFFLINE_PAGE = '/offline.html'

// ===== INSTALL EVENT =====
self.addEventListener('install', event => {
  console.log('🚀 [SW] Installing MyRajawali Service Worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 [SW] Caching static files...')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('✅ [SW] Static files cached successfully')
        return self.skipWaiting() // Aktifkan SW baru langsung
      })
      .catch(error => {
        console.error('❌ [SW] Failed to cache static files:', error)
      })
  )
})

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', event => {
  console.log('🔄 [SW] Activating MyRajawali Service Worker...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Hapus cache lama
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ [SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ [SW] Service Worker activated')
      return self.clients.claim() // Kontrol semua tabs
    })
  )
})

// ===== FETCH EVENT =====
self.addEventListener('fetch', event => {
  const { request } = event
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Skip Chrome extensions
  if (request.url.startsWith('chrome-extension://')) return
  
  // Skip Firebase requests (let them go to network)
  if (request.url.includes('firebaseapp.com') || 
      request.url.includes('googleapis.com') ||
      request.url.includes('firebase.googleapis.com')) {
    return
  }
  
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Jika ada di cache, return cache
        if (cachedResponse) {
          console.log('📦 [SW] Serving from cache:', request.url)
          return cachedResponse
        }
        
        // Jika tidak ada, fetch dari network
        console.log('🌐 [SW] Fetching from network:', request.url)
        return fetch(request)
          .then(networkResponse => {
            // Cache response untuk request selanjutnya
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone()
              
              caches.open(DYNAMIC_CACHE).then(cache => {
                cache.put(request, responseClone)
              })
            }
            
            return networkResponse
          })
          .catch(error => {
            console.log('❌ [SW] Network failed:', error)
            
            // Jika offline, return halaman offline
            if (request.destination === 'document') {
              return caches.match(OFFLINE_PAGE)
            }
            
            // Untuk assets lain, return placeholder jika ada
            return new Response('Offline content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            })
          })
      })
  )
})

// ===== PUSH NOTIFICATION =====
self.addEventListener('push', event => {
  console.log('🔔 [SW] Push notification received')
  
  let notificationData = {}
  
  if (event.data) {
    notificationData = event.data.json()
  }
  
  const options = {
    body: notificationData.body || 'Ada informasi baru dari MyRajawali',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    image: notificationData.image,
    data: {
      url: notificationData.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi',
        icon: '/icons/icon-72.png'
      },
      {
        action: 'close',
        title: 'Tutup'
      }
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
    tag: 'myrajawali-notification'
  }
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'MyRajawali',
      options
    )
  )
})

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', event => {
  console.log('🖱️ [SW] Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'close') {
    return
  }
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Cari tab yang sudah buka MyRajawali
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Jika tidak ada, buka tab baru
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', event => {
  console.log('🔄 [SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync data saat koneksi kembali
      syncData()
    )
  }
})

// Helper function untuk sync data
function syncData() {
  console.log('📊 [SW] Syncing offline data...')
  // Implementasi sync data offline ke server
  return Promise.resolve()
}