// Login Performance Fix - auth-optimized.js
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  connectFirestoreEmulator 
} from 'firebase/firestore'
import { app } from './firebase-security'

const db = getFirestore(app)

// Cache untuk login results
const loginCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 menit

export async function loginUser(username, password) {
  console.log('🚀 [AUTH-OPTIMIZED] Starting login process...')
  
  const startTime = Date.now()
  const cacheKey = `${username}:${password}`
  
  // Check cache first
  if (loginCache.has(cacheKey)) {
    const cached = loginCache.get(cacheKey)
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ [AUTH-OPTIMIZED] Using cached login result')
      return cached.result
    }
  }
  
  try {
    // Optimized query dengan limit dan timeout
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('username', '==', username),
      limit(1) // Only get first match
    )
    
    console.log('🔍 [AUTH-OPTIMIZED] Querying database...')
    
    // Add timeout untuk prevent hanging
    const queryPromise = getDocs(q)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Login timeout')), 10000) // 10 second timeout
    )
    
    const querySnapshot = await Promise.race([queryPromise, timeoutPromise])
    
    const queryTime = Date.now() - startTime
    console.log(`⏱️ [AUTH-OPTIMIZED] Query completed in ${queryTime}ms`)
    
    if (querySnapshot.empty) {
      console.log('❌ [AUTH-OPTIMIZED] User not found')
      throw new Error('Username tidak ditemukan')
    }
    
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    
    // Simple password check (in production, use proper hashing)
    if (userData.password !== password) {
      console.log('❌ [AUTH-OPTIMIZED] Invalid password')
      throw new Error('Password salah')
    }
    
    const result = {
      success: true,
      user: {
        id: userDoc.id,
        username: userData.username,
        role: userData.role || 'member',
        nama: userData.nama || userData.username,
        ...userData
      }
    }
    
    // Cache successful login
    loginCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    })
    
    const totalTime = Date.now() - startTime
    console.log(`✅ [AUTH-OPTIMIZED] Login successful in ${totalTime}ms`)
    
    return result
    
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`❌ [AUTH-OPTIMIZED] Login failed in ${totalTime}ms:, error.message`)
    
    return {
      success: false,
      error: error.message || 'Login gagal'
    }
  }
}

// Clear cache function
export function clearLoginCache() {
  loginCache.clear()
  console.log('🧹 [AUTH-OPTIMIZED] Login cache cleared')
}

// Check if user is admin (optimized)
export async function checkAdminRole(userId) {
  console.log('👑 [AUTH-OPTIMIZED] Checking admin role...')
  
  try {
    const adminRef = collection(db, 'admin')
    const q = query(
      adminRef,
      where('userId', '==', userId),
      limit(1)
    )
    
    const querySnapshot = await getDocs(q)
    const isAdmin = !querySnapshot.empty
    
    console.log(`👑 [AUTH-OPTIMIZED] Admin check: ${isAdmin}`)
    return isAdmin
    
  } catch (error) {
    console.error('❌ [AUTH-OPTIMIZED] Admin check failed:', error.message)
    return false
  }
}
