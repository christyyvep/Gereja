// MyRajawali Service Worker - Development Friendly
const CACHE_NAME = 'myrajawali-v1.0.0'
const STATIC_CACHE = 'myrajawali-static-v1'
const DYNAMIC_CACHE = 'myrajawali-dynamic-v1'

// Detect environment
const isDevelopment = self.location.hostname === 'localhost' || 
                     self.location.hostname === '127.0.0.1' ||
                     self.location.port === '8080'

console.log(`🔧 [SW] Running in ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`)

// Files untuk di-cache (hanya di production)
const STATIC_FILES = [
  '/',
  '/icons/icon-72.png',
  '/icons/icon-192.png', 
  '/icons/icon-512.png',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap'
]

// ===== INSTALL EVENT =====
self.addEventListener('install', event => {
  console.log('🚀 [SW] Installing MyRajawali Service Worker...')
  
  // Di development, langsung skip tanpa cache berat
  if (isDevelopment) {
    console.log('⚡ [SW] Development mode: minimal caching, quick activation')
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log('✅ [SW] Development install complete')
        // JANGAN skipWaiting di development untuk hindari reload loop
        // return self.skipWaiting()
      })
    )
    return
  }
  
  // Di production, cache seperti biasa
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 [SW] Caching static files...')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('✅ [SW] Static files cached successfully')
        // Di production juga jangan langsung skipWaiting
        // Biarkan user yang decide kapan mau update
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
      // Di development, minimal cache management
      if (isDevelopment) {
        console.log('🧹 [SW] Development: gentle cache cleanup')
        return Promise.all(
          cacheNames.map(cacheName => {
            // Hanya hapus cache yang benar-benar old
            if (cacheName.includes('old') || cacheName.includes('temp')) {
              console.log('🗑️ [SW] Removing old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }
      
      // Di production, hapus cache lama
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ [SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ [SW] Service Worker activated')
      return self.clients.claim()
    })
  )
})

// ===== FETCH EVENT =====
self.addEventListener('fetch', event => {
  const { request } = event
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Skip Chrome extensions, webpack HMR, dan dev tools
  if (request.url.includes('chrome-extension://') || 
      request.url.includes('webpack') ||
      request.url.includes('hot-update') ||
      request.url.includes('sockjs-node') ||
      request.url.includes('__webpack_dev_server__')) {
    return
  }
  
  // Di development, bypass cache untuk resource tertentu
  if (isDevelopment) {
    // Hanya cache asset static yang tidak berubah
    if (request.url.includes('/icons/') || 
        request.url.includes('.woff') || 
        request.url.includes('.woff2')) {
      event.respondWith(
        caches.match(request).then(response => {
          return response || fetch(request)
        })
      )
    }
    return // Skip caching untuk yang lain di development
  }
  
  // Di production, gunakan cache strategy normal
  event.respondWith(
    caches.match(request)
      .then(response => {
        return response || fetch(request).then(fetchResponse => {
          // Cache dynamic content
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone()
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return fetchResponse
        })
      })
      .catch(() => {
        // Fallback untuk offline
        if (request.destination === 'document') {
          return caches.match('/') || Response.error()
        }
      })
  )
})

// ===== NOTIFICATION & SYNC (hanya di production) =====
if (!isDevelopment) {
  // Push notification handler
  self.addEventListener('push', event => {
    const notificationData = event.data ? event.data.json() : {}
    
    const options = {
      body: notificationData.body || 'Ada informasi baru dari MyRajawali',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: 'myrajawali-notification',
      vibrate: [200, 100, 200],
      requireInteraction: true
    }
    
    event.waitUntil(
      self.registration.showNotification(
        notificationData.title || 'MyRajawali',
        options
      )
    )
  })

  // Notification click
  self.addEventListener('notificationclick', event => {
    event.notification.close()
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          if (clientList.length > 0) {
            return clientList[0].focus()
          }
          return clients.openWindow('/')
        })
    )
  })

  // Background sync
  self.addEventListener('sync', event => {
    console.log('🔄 [SW] Background sync triggered:', event.tag)
    
    if (event.tag === 'background-sync') {
      event.waitUntil(syncData())
    }
  })
}

// Helper function
function syncData() {
  console.log('📊 [SW] Syncing offline data...')
  return Promise.resolve()
}