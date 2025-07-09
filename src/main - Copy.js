import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './services/firebase.js'

// ===== SERVICE WORKER REGISTRATION =====
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('✅ [PWA] Service Worker registered successfully:', registration.scope)
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          console.log('🔄 [PWA] Service Worker updating...')
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('🆕 [PWA] New content available, refresh needed')
              } else {
                console.log('✅ [PWA] Content cached for offline use')
              }
            }
          })
        })
        
      } catch (error) {
        console.error('❌ [PWA] Service Worker registration failed:', error)
      }
    })
  } else {
    console.warn('⚠️ [PWA] Service Worker not supported')
  }
}

// ===== MAIN APP INITIALIZATION =====
const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

// Initialize Service Worker
registerServiceWorker()

// Mount app
app.mount('#app')

console.log('🚀 [PWA] MyRajawali initialized with PWA support!')