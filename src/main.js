import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './services/firebase.js'
import { ToastPlugin } from './utils/toast.js'

// Enhanced Security Imports
import { startSecurityMonitoring, stopSecurityMonitoring } from './middleware/authGuard'
import { logSecurityEvent } from './services/firebase-security'
import SecuritySessionWarning from './components/SecuritySessionWarning.vue'

// Image Optimization
import { preloadCriticalImages } from './utils/imageOptimization'

// Global Error Handler
const handleGlobalError = (error, instance, info) => {
  console.error('🚨 Vue Global Error:', error)
  console.error('🔍 Component Info:', info)
  
  // Specific handler for parentNode null errors
  if (error?.message?.includes('parentNode')) {
    console.warn('⚠️ DOM parentNode error caught and handled')
    return false // Prevent error from bubbling up
  }
  
  // Log other errors but don't crash the app
  if (process.env.NODE_ENV === 'development') {
    console.error('Full error details:', error)
  }
}

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.warn('🚨 Unhandled Promise Rejection:', event.reason)
  
  // Don't crash the app for DOM-related errors
  if (event.reason?.message?.includes('parentNode')) {
    console.warn('⚠️ DOM parentNode promise rejection caught')
    event.preventDefault()
  }
})

// ===== ENVIRONMENT DETECTION =====
const isDevelopment = process.env.NODE_ENV === 'development'
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1'

console.log(`🔧 [PWA] Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`)

// ===== SMART SERVICE WORKER REGISTRATION =====
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    
    // Development mode info
    if (isDevelopment && isLocalhost) {
      console.log('⚠️ [PWA] Development mode - Service Worker with gentle behavior')
      console.log('🛠️ [PWA] Debug: Open DevTools > Application > Service Workers to manage')
    }
    
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          // Update check interval (lebih lama di development)
          updateViaCache: isDevelopment ? 'none' : 'imports'
        })
        
        console.log('✅ [PWA] Service Worker registered:', registration.scope)
        
        // Handle updates dengan sangat gentle
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          console.log('🔄 [PWA] Service Worker update detected')
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Ada SW lama yang aktif
                console.log('🆕 [PWA] New content available')
                
                if (isDevelopment) {
                  console.log('🛑 [PWA] Development: Auto-reload DISABLED')
                  console.log('💡 [PWA] Manual refresh needed or unregister SW in DevTools')
                } else {
                  console.log('🔄 [PWA] Production: Please refresh for updates')
                  // Optional: Show toast notification ke user
                  // showUpdateToast()
                }
              } else {
                // First time install
                console.log('✅ [PWA] Content cached for offline use')
              }
            }
          })
        })
        
        // Periodic update check (hanya di production, interval panjang)
        if (!isDevelopment) {
          setInterval(() => {
            registration.update()
          }, 300000) // Check setiap 5 menit (bukan 1 menit)
        }
        
      } catch (error) {
        console.error('❌ [PWA] Service Worker registration failed:', error)
      }
    })
  } else {
    console.warn('⚠️ [PWA] Service Worker not supported in this browser')
  }
}

// ===== DEVELOPMENT HELPER FUNCTIONS =====
if (isDevelopment) {
  // Easy unregister
  window.unregisterSW = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log('🗑️ [PWA] Service Worker unregistered')
      }
      console.log('🔄 [PWA] Please refresh page manually')
    } catch (error) {
      console.error('❌ [PWA] Failed to unregister SW:', error)
    }
  }
  
  // Clear all caches
  window.clearSWCache = async () => {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('🧹 [PWA] All caches cleared')
    } catch (error) {
      console.error('❌ [PWA] Failed to clear caches:', error)
    }
  }
  
  // Reset everything
  window.resetPWA = async () => {
    await window.unregisterSW()
    await window.clearSWCache()
    localStorage.clear()
    sessionStorage.clear()
    console.log('🔄 [PWA] Complete PWA reset done. Refresh page manually.')
  }

  
  // ✅ BARU: Debug tools untuk testing user login
  window.debugUser = {
    async checkCurrent() {
      const { useUserStore } = await import('./stores/userStore')
      const userStore = useUserStore()
      console.log('👤 [Debug] Current user:', userStore.user)
      console.log('🔐 [Debug] Is logged in:', userStore.isLoggedIn)
      console.log('🆔 [Debug] User ID:', userStore.userId)
      console.log('📋 [Debug] User name:', userStore.namaUser)
      if (userStore.user) {
        console.log('💾 [Debug] Remember Me:', userStore.user.rememberMe)
        console.log('⏰ [Debug] Remember Expiry:', userStore.user.rememberExpiry ? new Date(userStore.user.rememberExpiry) : 'None')
      }
      return userStore.user
    },
    
    async checkDatabase(nama) {
      const { useUserStore } = await import('./stores/userStore')
      const userStore = useUserStore()
      const result = await userStore.checkUserInDatabase(nama)
      return result
    },
    
    async setUser(nama) {
      const { useUserStore } = await import('./stores/userStore')
      const userStore = useUserStore()
      const success = await userStore.setUserManually(nama)
      if (success) {
        console.log('✅ [Debug] User set successfully. Check current user:')
        return await this.checkCurrent()
      }
      return false
    },
    
    async checkLoginStatus() {
      const { useUserStore } = await import('./stores/userStore')
      const userStore = useUserStore()
      const isLoggedIn = await userStore.checkLoginStatus()
      console.log('🔍 [Debug] Login status check result:', isLoggedIn)
      return isLoggedIn
    },
    
    async refreshData() {
      const { useUserStore } = await import('./stores/userStore')
      const userStore = useUserStore()
      const success = await userStore.refreshUserData()
      console.log('🔄 [Debug] Refresh result:', success)
      return success
    },
    
    async autoRefresh() {
      const { useUserStore } = await import('./stores/userStore')
      const userStore = useUserStore()
      const success = await userStore.autoRefreshIfNeeded()
      console.log('⚡ [Debug] Auto-refresh result:', success)
      return success
    },
    
    async needsRefresh() {
      const { useUserStore } = await import('./stores/userStore')
      const userStore = useUserStore()
      const needs = userStore.needsDataRefresh()
      console.log('⏰ [Debug] Needs refresh:', needs)
      return needs
    },
    
    async clearUser() {
      const { useUserStore } = await import('./stores/userStore')
      const userStore = useUserStore()
      userStore.logout(true) // Force forget
      console.log('🗑️ [Debug] User data cleared')
    },
    
    checkStorage() {
      const user = localStorage.getItem('user')
      const rememberedUser = localStorage.getItem('rememberedUser')
      console.log('💾 [Debug] localStorage user:', user ? JSON.parse(user) : null)
      console.log('💾 [Debug] localStorage rememberedUser:', rememberedUser ? JSON.parse(rememberedUser) : null)
      return { user: user ? JSON.parse(user) : null, rememberedUser: rememberedUser ? JSON.parse(rememberedUser) : null }
    }
  }

  // ✅ BARU: Debug tools untuk testing streak
  window.debugStreak = {
    async checkCurrent() {
      const { useUserStore } = await import('./stores/userStore')
      const { useStreakStore } = await import('./stores/streakStore')
      const userStore = useUserStore()
      const streakStore = useStreakStore()
      const userId = userStore.user?.id || userStore.user?.nama
      if (userId) {
        const current = streakStore.currentStreak(userId)
        console.log('🔥 [Debug] Current streak:', current)
        return current
      }
      console.log('❌ [Debug] No user logged in')
      return 0
    },
    
    async forceCheck() {
      const { useUserStore } = await import('./stores/userStore')
      const { useStreakStore } = await import('./stores/streakStore')
      const { forceCheckStreak } = await import('./services/streakService')
      const userStore = useUserStore()
      const userId = userStore.user?.id || userStore.user?.nama
      if (userId) {
        console.log('🔄 [Debug] Force checking streak...')
        const result = await forceCheckStreak(userId)
        console.log('✅ [Debug] Force check result:', result)
        // Refresh store
        const streakStore = useStreakStore()
        await streakStore.loadUserStreak(userId)
        return result
      }
      console.log('❌ [Debug] No user logged in')
      return 0
    },
    
    async resetToOne() {
      const { useUserStore } = await import('./stores/userStore')
      const { saveStreakToFirestore } = await import('./services/streakService')
      const userStore = useUserStore()
      const userId = userStore.user?.id || userStore.user?.nama
      if (userId) {
        const resetData = {
          userId: userId,
          streakCount: 1,
          lastLoginDate: '',
          totalLogins: 1,
          longestStreak: 1,
          updatedAt: new Date().toISOString()
        }
        await saveStreakToFirestore(userId, resetData)
        console.log('🔄 [Debug] Streak reset to 1')
        // Refresh store
        const { useStreakStore } = await import('./stores/streakStore')
        const streakStore = useStreakStore()
        await streakStore.loadUserStreak(userId)
        return 1
      }
      console.log('❌ [Debug] No user logged in')
      return 0
    }
  }
  
  console.log('🧪 [PWA] Development helpers loaded:')
  console.log('   🗑️ unregisterSW() - Remove Service Worker')
  console.log('   🧹 clearSWCache() - Clear all caches')  
  console.log('   🔄 resetPWA() - Complete reset')
  console.log('   🔥 debugStreak.checkCurrent() - Check current streak')
  console.log('   🔄 debugStreak.forceCheck() - Force check streak')
  console.log('   ⚡ debugStreak.resetToOne() - Reset streak to 1')
}

// ===== MAIN APP INITIALIZATION =====
const app = createApp(App)
const pinia = createPinia()

// Add global error handler
app.config.errorHandler = handleGlobalError

app.use(router)
app.use(pinia)
app.use(ToastPlugin)

// Register global security component
app.component('SecuritySessionWarning', SecuritySessionWarning)

// ===== SECURITY INITIALIZATION =====
// Start security monitoring
startSecurityMonitoring()

// Log app initialization
logSecurityEvent('app_initialized', {
  timestamp: new Date().toISOString(),
  environment: isDevelopment ? 'development' : 'production',
  userAgent: navigator.userAgent
})

// Setup security event listeners
window.addEventListener('beforeunload', () => {
  logSecurityEvent('app_beforeunload', {
    timestamp: new Date().toISOString()
  })
})

window.addEventListener('unload', () => {
  stopSecurityMonitoring()
})

// Handle visibility changes for security
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    logSecurityEvent('app_hidden', {
      timestamp: new Date().toISOString()
    })
  } else {
    logSecurityEvent('app_visible', {
      timestamp: new Date().toISOString()
    })
  }
})

// Initialize Service Worker with smart behavior
registerServiceWorker()

// ===== SETUP USER STORE AND STORAGE WATCHER =====
;(async () => {
  try {
    const { useUserStore } = await import('./stores/userStore')
    const userStore = useUserStore()
    
    // Setup storage watcher for reactivity
    userStore.setupStorageWatcher()
    
    // Check login status on app start
    await userStore.checkLoginStatus()
    
    console.log('✅ [Main] User store initialized with storage watcher')
  } catch (error) {
    console.error('❌ [Main] Error initializing user store:', error)
  }
})()

// ===== MOUNT VUE APP =====
app.mount('#app')

// ⚡ Preload critical images for better performance
preloadCriticalImages().then(() => {
  console.log('✅ [Image] Critical images preloaded')
}).catch(error => {
  console.warn('⚠️ [Image] Failed to preload some critical images:', error)
})

console.log('🚀 [PWA] MyRajawali initialized with enhanced security!')
console.log('🔐 [Security] Security monitoring active')
console.log('⚡ [Performance] Image optimization active')

// Add security debug tools in development
if (isDevelopment) {
  window.debugSecurity = {
    async getCurrentUser() {
      const { getCurrentUser } = await import('./services/auth-hybrid-minimal')
      return getCurrentUser()
    },
    
    async logEvent(type, details = {}) {
      logSecurityEvent(type, details)
      console.log('🔐 [Debug] Security event logged:', type, details)
    },
    
    async checkSession() {
      const { isSessionValid } = await import('./services/firebase-security')
      const valid = isSessionValid()
      console.log('🔐 [Debug] Session valid:', valid)
      return valid
    },
    
    async forceSessionWarning() {
      const event = new CustomEvent('sessionWarning', {
        detail: { timeToExpire: 60000 } // 1 minute
      })
      window.dispatchEvent(event)
      console.log('🔐 [Debug] Session warning triggered')
    },
    
    async testRateLimit(identifier) {
      const { checkRateLimit } = await import('./services/firebase-security')
      const result = checkRateLimit(identifier, 3, 60000) // 3 attempts per minute
      console.log('🔐 [Debug] Rate limit check:', result)
      return result
    }
  }
  
  console.log('🔐 [Security] Debug tools loaded:')
  console.log('   👤 debugSecurity.getCurrentUser() - Get current user')
  console.log('   📝 debugSecurity.logEvent(type, details) - Log security event')
  console.log('   ✅ debugSecurity.checkSession() - Check session validity')
  console.log('   ⚠️ debugSecurity.forceSessionWarning() - Trigger session warning')
  console.log('   🚫 debugSecurity.testRateLimit(id) - Test rate limiting')
}