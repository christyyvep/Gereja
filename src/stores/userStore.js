import { defineStore } from 'pinia'
import { loginJemaat, logoutJemaat, getCurrentJemaat, getRememberedUser, autoLoginRememberedUser} from '@/services/auth'
import { useStreakStore } from './streakStore'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isLoggedIn: false
  }),
  
  getters: {
    /**
     * Get user name with fallback
     * @returns {string}
     */
    namaUser: (state) => state.user?.nama || 'Jemaat',
    
    /**
     * Get user ID (consistent between id and nama)
     * @returns {string|null}
     */
    userId: (state) => state.user?.id || state.user?.nama || null,
    
    /**
     * Get user sector
     * @returns {string}
     */
    sektorUser: (state) => state.user?.sektor || '',
    
    /**
     * Get user status
     * @returns {string}
     */
    statusUser: (state) => state.user?.status || '',

    /**
     * Get current user role
     * @returns {string}
     */
    userRole: (state) => state.user?.role || 'jemaat',

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdmin: (state) => (state.user?.role || 'jemaat') === 'admin',

    /**
     * Check if user is pengurus or admin
     * PENGURUS ROLE TEMPORARILY HIDDEN - Only admin access
     * @returns {boolean}
     */
    isPengurus: (state) => {
      const role = state.user?.role || 'jemaat'
      // Only admin now, pengurus role is hidden
      return role === 'admin'
    },

    /**
     * Get role display name for UI
     * @returns {string}
     */
    roleDisplayName: (state) => {
      const role = state.user?.role || 'jemaat'
      const roleMap = {
        'admin': 'Administrator',
        'pengurus': 'Pengurus',
        'jemaat': 'Jemaat'
      }
      return roleMap[role] || 'Jemaat'
    }
  },
  
  actions: {
    /**
     * Login user with credentials
     * @param {string} nama - User name
     * @param {string} password - User password
     * @returns {Promise<Object>} User data
     */
    async login(nama, password) {
      try {
        console.log('🔐 [UserStore] Starting login process...')
        
        // Clear any existing data first
        this.clearUserData()

        // Authenticate user
        const userData = await loginJemaat(nama, password)
        console.log('✅ [UserStore] Authentication successful')
        
        // Set user data
        this.user = userData
        this.isLoggedIn = true
        
        console.log('👤 [UserStore] User role:', userData.role || 'jemaat')

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Initialize user-specific data
        await this.initializeUserData(userData.id || userData.nama)
        
        return userData
      } catch (error) {
        console.error('❌ [UserStore] Login failed:', error)
        this.clearUserData()
        throw error
      }
    },
    
    /**
     * Logout current user
     */
    logout(forgetMe = false) {
      console.log('🚪 [UserStore] Logging out user...', forgetMe ? '(forget me)' : '(respect remember me)')
      
      // Clear user-specific data
      if (this.user) {
        this.clearUserSpecificData(this.user.id || this.user.nama)
      }
      
      // Call enhanced auth logout
      logoutJemaat(forgetMe)  // ← Pass forgetMe parameter
      
      // Clear store data
      this.clearUserData()
      
      console.log('✅ [UserStore] Logout complete')
    },
    
    /**
     * Set user data from existing data (e.g., from localStorage)
     * @param {Object} userData - User data object
     * @returns {boolean} Success status
     */
    setUser(userData) {
      if (!this.validateUserData(userData)) {
        console.error('❌ [UserStore] Invalid user data provided')
        this.clearUserData()
        return false
      }
      
      this.user = userData
      this.isLoggedIn = true
      
      console.log('✅ [UserStore] User data set:', {
        nama: userData.nama,
        role: userData.role || 'jemaat',
        sektor: userData.sektor
      })
      
      // Initialize user-specific data
      this.initializeUserData(userData.id || userData.nama)
      
      return true
    },
    
    async getSavedUserData() {
      try {
        // Use getCurrentJemaat for consistency
        const userData = await getCurrentJemaat()
        if (userData && userData.nama) {
          console.log('📋 [UserStore] Found saved user:', userData.nama)
          return userData
        }
        return null
      } catch (error) {
        console.error('❌ [UserStore] Error getting saved user:', error)
        return null
      }
    },
    
    /**
     * Check and restore login status from localStorage (ENHANCED)
     * @returns {boolean} Login status
     */
    async checkLoginStatus() {
      try {
        console.log('🔍 [UserStore] Checking login status...')
        
        // First check current session - this includes remembered users
        const savedUser = await getCurrentJemaat()
        
        if (savedUser && savedUser.nama) {
          if (this.validateUserData(savedUser)) {
            this.setUser(savedUser)
            
            // Initialize streak data saat restore session
            await this.initializeUserData(savedUser.id || savedUser.nama)
            
            const loginType = savedUser.rememberMe ? 'remembered user' : 'session user'
            console.log(`✅ [UserStore] ${loginType} restored:`, savedUser.nama)
            return true
          }
        }
        
        // If no current session, check for legacy remembered user (fallback)
        const rememberedUser = getRememberedUser()
        
        if (rememberedUser && rememberedUser.nama !== savedUser?.nama) {
          try {
            console.log('🔄 [UserStore] Found legacy remembered user, migrating...')
            
            // Auto-login with remembered user
            const autoLoginData = await autoLoginRememberedUser(rememberedUser)
            this.setUser(autoLoginData)
            
            // Initialize streak data untuk auto-login
            await this.initializeUserData(autoLoginData.id || autoLoginData.nama)
            
            console.log('✅ [UserStore] Legacy auto-login successful with remembered user')
            return true
          } catch (error) {
            console.error('❌ [UserStore] Auto-login failed:', error)
          }
        }
        
        // No valid session or remembered user
        console.log('ℹ️ [UserStore] No valid user session found')
        this.clearUserData()
        return false
        
      } catch (error) {
        console.error('❌ [UserStore] Error checking login status:', error)
        this.clearUserData()
        return false
      }
    },
    
    /**
     * Set user role (for development/testing)
     * @param {string} role - New role for user
     * @returns {boolean} Success status
     */
    setUserRole(role) {
      const validRoles = ['jemaat', 'pengurus', 'admin']
      
      if (!validRoles.includes(role)) {
        console.error('❌ [UserStore] Invalid role:', role)
        return false
      }
      
      if (!this.user) {
        console.error('❌ [UserStore] No user logged in, cannot set role')
        return false
      }
      
      console.log(`🔄 [UserStore] Changing role: ${this.user.role || 'jemaat'} → ${role}`)
      
      // Update user object
      this.user.role = role
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(this.user))
      
      console.log('✅ [UserStore] Role updated successfully')
      return true
    },

    /**
     * Development helper: Set as admin
     */
    setAsAdmin() {
      return this.setUserRole('admin')
    },

    /**
     * Development helper: Set as pengurus
     */
    setAsPengurus() {
      return this.setUserRole('pengurus')
    },

    /**
     * Development helper: Set as jemaat
     */
    setAsJemaat() {
      return this.setUserRole('jemaat')
    },

    /**
     * Initialize user-specific data
     * @param {string} userId - User ID
     */
    async initializeUserData(userId) {
      if (!userId) return
      
      try {
        console.log('🚀 [UserStore] Initializing user data for:', userId)
        
        const streakStore = useStreakStore()
        
        // Force clear cache dulu untuk memastikan data fresh
        streakStore.clearUserStreak(userId)
        
        // Load & check streak
        await streakStore.loadUserStreak(userId)
        const currentStreak = await streakStore.checkStreak(userId)
        
        console.log(`✅ [UserStore] User data initialized. Streak: ${currentStreak}`)
        
      } catch (error) {
        console.error('❌ [UserStore] Error initializing user data:', error)
        // Don't throw, let login continue
      }
    },
    
    /**
     * Clear user-specific data from memory (preserve localStorage)
     * @param {string} userId - User ID
     */
    clearUserSpecificData(userId) {
      if (!userId) return
      
      // Clear streak data from memory (keep localStorage)
      const streakStore = useStreakStore()
      streakStore.clearUserStreak(userId)
    },
    
    /**
     * Clear all user data from memory
     */
    clearUserData() {
      this.user = null
      this.isLoggedIn = false
      
      // Clear all store data from memory
      const streakStore = useStreakStore()
      streakStore.clearAllStreaks()
    },
    
    /**
     * Validate user data structure
     * @param {Object} userData - User data to validate
     * @returns {boolean} Validation result
     */
    validateUserData(userData) {
      if (!userData || typeof userData !== 'object') {
        console.warn('❌ [UserStore] User data is not an object')
        return false
      }
      
      // Check required fields
      if (!userData.nama) {
        console.warn('❌ [UserStore] Missing required field: nama')
        return false
      }
      
      // Sektor tidak wajib, bisa kosong
      if (!Object.prototype.hasOwnProperty.call(userData, 'sektor')) {
        console.warn('⚠️ [UserStore] Missing sektor field, setting default')
        userData.sektor = ''
      }
      
      // Pastikan ada ID atau gunakan nama sebagai fallback
      if (!userData.id && userData.nama) {
        console.log('🔧 [UserStore] No ID found, using nama as ID')
        userData.id = userData.nama
      }
      
      console.log('✅ [UserStore] User data validation passed:', {
        nama: userData.nama,
        id: userData.id,
        sektor: userData.sektor || '(kosong)',
        role: userData.role || 'jemaat'
      })
      
      return true
    },

    /**
     * Get debug info for troubleshooting
     * @returns {Object} Debug information
     */
    getDebugInfo() {
      return {
        isLoggedIn: this.isLoggedIn,
        user: this.user,
        namaUser: this.namaUser,
        userRole: this.userRole,
        isPengurus: this.isPengurus,
        isAdmin: this.isAdmin,
        roleDisplayName: this.roleDisplayName
      }
    },

    /**
     * Development helper: Log all user info
     */
    debugUser() {
      console.log('🧪 [UserStore] === USER DEBUG INFO ===')
      console.table(this.getDebugInfo())
    },

    /**
     * Development helper: Set user manually for testing
     * @param {string} nama - Nama user
     * @returns {Promise<boolean>} Success status
     */
    async setUserManually(nama) {
      try {
        console.log('🛠️ [UserStore] Manually setting user:', nama)
        
        // Import auth functions
        const { checkJemaatExists, getJemaatDocId } = await import('@/services/auth')
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/services/firebase')
        
        // Check if user exists in database
        const exists = await checkJemaatExists(nama)
        if (!exists) {
          console.error('❌ [UserStore] User not found in database:', nama)
          return false
        }
        
        // Get user data from database
        const docId = await getJemaatDocId(nama)
        const userRef = doc(db, 'jemaat', docId)
        const userDoc = await getDoc(userRef)
        
        if (!userDoc.exists()) {
          console.error('❌ [UserStore] User document not found:', nama)
          return false
        }
        
        const userData = userDoc.data()
        
        // Remove password for security
        delete userData.password
        
        // Set ID and ensure required fields
        userData.id = docId
        userData.role = userData.role || 'jemaat'
        userData.isRegistered = userData.isRegistered || false
        
        // Set user data
        this.setUser(userData)
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        
        console.log('✅ [UserStore] User manually set successfully:', {
          nama: userData.nama,
          id: userData.id,
          role: userData.role,
          isRegistered: userData.isRegistered
        })
        
        return true
        
      } catch (error) {
        console.error('❌ [UserStore] Error setting user manually:', error)
        return false
      }
    },

    /**
     * Development helper: Check user data in database
     * @param {string} nama - Nama user
     * @returns {Promise<Object|null>} User data or null
     */
    async checkUserInDatabase(nama) {
      try {
        console.log('🔍 [UserStore] Checking user in database:', nama)
        
        // Import auth functions
        const { checkJemaatExists, getJemaatDocId } = await import('@/services/auth')
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/services/firebase')
        
        // Check if user exists
        const exists = await checkJemaatExists(nama)
        console.log('User exists:', exists)
        
        if (!exists) {
          return null
        }
        
        // Get user data
        const docId = await getJemaatDocId(nama)
        const userRef = doc(db, 'jemaat', docId)
        const userDoc = await getDoc(userRef)
        
        if (!userDoc.exists()) {
          return null
        }
        
        const userData = userDoc.data()
        delete userData.password // Remove password for security
        
        console.log('📊 [UserStore] User data from database:', {
          nama: userData.nama,
          id: docId,
          role: userData.role || '(no role)',
          isRegistered: userData.isRegistered || false,
          sektor: userData.sektor || '(no sektor)',
          status: userData.status || '(no status)'
        })
        
        return { id: docId, ...userData }
        
      } catch (error) {
        console.error('❌ [UserStore] Error checking user in database:', error)
        return null
      }
    },

    /**
     * Refresh user data from database (tanpa logout)
     * Berguna untuk mendapat konten terbaru tanpa login ulang
     * @returns {Promise<boolean>} Success status
     */
    async refreshUserData() {
      try {
        if (!this.user || !this.user.nama) {
          console.warn('⚠️ [UserStore] No user to refresh')
          return false
        }
        
        console.log('🔄 [UserStore] Refreshing user data from database...')
        
        // Import auth functions
        const { checkJemaatExists, getJemaatDocId } = await import('@/services/auth')
        const { doc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/services/firebase')
        
        // Get fresh user data from database
        const exists = await checkJemaatExists(this.user.nama)
        if (!exists) {
          console.error('❌ [UserStore] User no longer exists in database')
          return false
        }
        
        const docId = await getJemaatDocId(this.user.nama)
        const userRef = doc(db, 'jemaat', docId)
        const userDoc = await getDoc(userRef)
        
        if (!userDoc.exists()) {
          console.error('❌ [UserStore] User document not found')
          return false
        }
        
        const freshUserData = userDoc.data()
        delete freshUserData.password // Remove password for security
        
        // Preserve remember me settings and expiry
        const updatedUserData = {
          ...freshUserData,
          id: docId,
          rememberMe: this.user.rememberMe || false,
          rememberExpiry: this.user.rememberExpiry,
          autoLoggedIn: this.user.autoLoggedIn,
          autoLoginAt: this.user.autoLoginAt,
          refreshedAt: new Date().getTime()
        }
        
        // Update store
        this.user = updatedUserData
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUserData))
        
        console.log('✅ [UserStore] User data refreshed successfully:', {
          nama: updatedUserData.nama,
          role: updatedUserData.role || 'jemaat',
          refreshedAt: new Date(updatedUserData.refreshedAt).toLocaleString()
        })
        
        return true
        
      } catch (error) {
        console.error('❌ [UserStore] Error refreshing user data:', error)
        return false
      }
    },

    /**
     * Check if user needs data refresh (setiap 30 menit)
     * @returns {boolean} True jika perlu refresh
     */
    needsDataRefresh() {
      if (!this.user || !this.user.refreshedAt) {
        return true // Belum pernah refresh
      }
      
      const now = new Date().getTime()
      const lastRefresh = this.user.refreshedAt
      const thirtyMinutes = 30 * 60 * 1000 // 30 menit dalam milliseconds
      
      return (now - lastRefresh) > thirtyMinutes
    },

    /**
     * Auto refresh user data jika diperlukan
     * @returns {Promise<boolean>} Success status
     */
    async autoRefreshIfNeeded() {
      if (this.needsDataRefresh()) {
        console.log('⏰ [UserStore] Auto-refreshing user data...')
        return await this.refreshUserData()
      }
      
      console.log('✅ [UserStore] User data is fresh, no refresh needed')
      return true
    },
  }
})