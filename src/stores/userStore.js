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
     * @returns {boolean}
     */
    isPengurus: (state) => {
      const role = state.user?.role || 'jemaat'
      return role === 'pengurus' || role === 'admin'
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
    
    getSavedUserData() {
      try {
        // Check localStorage directly
        const userDataString = localStorage.getItem('user')
        if (userDataString) {
          const userData = JSON.parse(userDataString)
          if (userData && userData.nama) {
            console.log('📋 [UserStore] Found saved user:', userData.nama)
            return userData
          }
        }
        return null
      } catch (error) {
        console.error('❌ [UserStore] Error getting saved user:', error)
        return null
      }
    },
    
    /**
     * Check and restore login status from localStorage (UPDATED)
     * @returns {boolean} Login status
     */
    async checkLoginStatus() {
      try {
        console.log('🔍 [UserStore] Checking login status...')
        
        // First check current session
        const savedUser = getCurrentJemaat()
        
        if (savedUser && savedUser.nama) {
          if (this.validateUserData(savedUser)) {
            this.setUser(savedUser)
            
            // Initialize streak data saat restore session
            await this.initializeUserData(savedUser.id || savedUser.nama)
            
            console.log('✅ [UserStore] Current session restored')
            return true
          }
        }
        
        // If no current session, check for remembered user
        const rememberedUser = getRememberedUser()
        
        if (rememberedUser) {
          try {
            // Auto-login with remembered user
            const autoLoginData = await autoLoginRememberedUser(rememberedUser)
            this.setUser(autoLoginData)
            
            // Initialize streak data untuk auto-login
            await this.initializeUserData(autoLoginData.id || autoLoginData.nama)
            
            console.log('✅ [UserStore] Auto-login successful with remembered user')
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
        return false
      }
      
      // Check required fields
      if (!userData.nama || !userData.sektor) {
        console.warn('❌ [UserStore] Missing required fields (nama, sektor)')
        return false
      }
      
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
    }
  }
})