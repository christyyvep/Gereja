// Firebase Security Configuration dengan App Check dan Security Rules
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtGgShLr_s_gqqDGhOEPmh5VfwZUJDHeY",
  authDomain: "myrajawali-app.firebaseapp.com",
  projectId: "myrajawali-app",
  storageBucket: "myrajawali-app.appspot.com",
  messagingSenderId: "414682263250",
  appId: "1:414682263250:web:a0e1e2f3g4h5i6j7k8l9m0"
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const functions = getFunctions(app)

// App Check Configuration untuk keamanan tambahan
let appCheck = null
if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
  try {
    // Initialize App Check dengan ReCaptcha V3
    // CATATAN: Ganti dengan site key ReCaptcha V3 Anda yang sesungguhnya
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'), // Demo key, ganti dengan key asli
      isTokenAutoRefreshEnabled: true
    })
    console.log('✅ [Firebase] App Check initialized')
  } catch (error) {
    console.warn('⚠️ [Firebase] App Check initialization failed:', error)
  }
}

// Development Mode: Connect to emulators
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment untuk menggunakan emulator di development
  // connectAuthEmulator(auth, 'http://localhost:9099')
  // connectFirestoreEmulator(db, 'localhost', 8080)
  // connectFunctionsEmulator(functions, 'localhost', 5001)
}

// Security Settings
const securityConfig = {
  // Rate limiting settings
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 menit
  
  // Password requirements
  passwordMinLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  
  // Session settings
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 jam
  autoLogoutWarning: 5 * 60 * 1000, // 5 menit sebelum logout
  
  // Admin access settings
  adminRoles: ['admin', 'super_admin'],
  moderatorRoles: ['moderator', 'admin', 'super_admin']
}

// Fungsi untuk validasi password
export function validatePassword(password) {
  const errors = []
  
  if (!password || password.length < securityConfig.passwordMinLength) {
    errors.push(`Password minimal ${securityConfig.passwordMinLength} karakter`)
  }
  
  if (securityConfig.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf besar')
  }
  
  if (securityConfig.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil')
  }
  
  if (securityConfig.requireNumbers && !/\d/.test(password)) {
    errors.push('Password harus mengandung angka')
  }
  
  if (securityConfig.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password harus mengandung karakter khusus')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Fungsi untuk mengecek kekuatan password
export function checkPasswordStrength(password) {
  let score = 0
  const feedback = []
  
  // Length check
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  
  // Pattern checks
  if (!/(.)\1{2,}/.test(password)) score += 1 // No repeated characters
  if (!/123|abc|qwe|asd/i.test(password)) score += 1 // No common sequences
  
  const strength = score < 3 ? 'lemah' : score < 5 ? 'sedang' : score < 7 ? 'kuat' : 'sangat kuat'
  
  return {
    score,
    strength,
    feedback
  }
}

// Rate limiting dalam memory (untuk backup)
const rateLimitStore = new Map()

export function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const key = `rate_limit_${identifier}`
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }
  
  const data = rateLimitStore.get(key)
  
  // Reset window jika sudah lewat
  if (now - data.firstAttempt > windowMs) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }
  
  // Check limit
  if (data.attempts >= maxAttempts) {
    return { 
      allowed: false, 
      remainingAttempts: 0,
      retryAfter: windowMs - (now - data.firstAttempt)
    }
  }
  
  // Increment attempts
  data.attempts++
  return { 
    allowed: true, 
    remainingAttempts: maxAttempts - data.attempts 
  }
}

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.firstAttempt > securityConfig.lockoutDuration) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000) // Cleanup setiap 5 menit

// Error handler untuk Firebase errors
export function handleFirebaseError(error) {
  console.error('🔥 [Firebase Error]:', error)
  
  const errorMessages = {
    'permission-denied': 'Anda tidak memiliki izin untuk mengakses data ini',
    'unauthenticated': 'Silakan login terlebih dahulu',
    'not-found': 'Data tidak ditemukan',
    'already-exists': 'Data sudah ada',
    'failed-precondition': 'Operasi tidak dapat dilakukan saat ini',
    'aborted': 'Operasi dibatalkan karena konflik',
    'out-of-range': 'Parameter di luar jangkauan yang valid',
    'internal': 'Terjadi kesalahan internal server',
    'unavailable': 'Layanan sedang tidak tersedia',
    'deadline-exceeded': 'Operasi timeout',
    'resource-exhausted': 'Kuota terlampaui',
    'cancelled': 'Operasi dibatalkan',
    'invalid-argument': 'Parameter tidak valid'
  }
  
  return errorMessages[error.code] || error.message || 'Terjadi kesalahan sistem'
}

// Logging security events
export function logSecurityEvent(eventType, details = {}) {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    ip: null, // Will be filled by server
    ...details
  }
  
  console.log('🔐 [Security Event]:', event)
  
  // Di production, kirim ke logging service atau Firebase Analytics
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement proper security logging
    // analytics.logEvent('security_event', event)
  }
}

// Session management
export function isSessionValid() {
  const session = localStorage.getItem('myrajawali_session')
  if (!session) return false
  
  try {
    const sessionData = JSON.parse(session)
    const now = Date.now()
    
    if (now > sessionData.expiresAt) {
      localStorage.removeItem('myrajawali_session')
      return false
    }
    
    return true
  } catch (error) {
    localStorage.removeItem('myrajawali_session')
    return false
  }
}

export function updateSessionActivity() {
  const session = localStorage.getItem('myrajawali_session')
  if (!session) return
  
  try {
    const sessionData = JSON.parse(session)
    sessionData.lastActivity = Date.now()
    sessionData.expiresAt = Date.now() + securityConfig.sessionTimeout
    localStorage.setItem('myrajawali_session', JSON.stringify(sessionData))
  } catch (error) {
    console.error('Error updating session:', error)
  }
}

// Auto logout warning
let logoutWarningTimer = null
let autoLogoutTimer = null

export function setupAutoLogout(onWarning, onLogout) {
  clearTimeout(logoutWarningTimer)
  clearTimeout(autoLogoutTimer)
  
  const session = localStorage.getItem('myrajawali_session')
  if (!session) return
  
  try {
    const sessionData = JSON.parse(session)
    const now = Date.now()
    const timeToExpire = sessionData.expiresAt - now
    const timeToWarning = timeToExpire - securityConfig.autoLogoutWarning
    
    if (timeToWarning > 0) {
      logoutWarningTimer = setTimeout(onWarning, timeToWarning)
    }
    
    if (timeToExpire > 0) {
      autoLogoutTimer = setTimeout(onLogout, timeToExpire)
    }
  } catch (error) {
    console.error('Error setting up auto logout:', error)
  }
}

export {
  app,
  auth,
  db,
  functions,
  appCheck,
  securityConfig
}
