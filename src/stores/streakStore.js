// src/stores/streakStore.js
import { defineStore } from 'pinia'
import { 
  saveStreakToFirestore, 
  getStreakFromFirestore, 
  checkAndUpdateStreak 
} from '@/services/streakService'

export const useStreakStore = defineStore('streak', {
  state: () => ({
    streakData: {}, // Cache di memory untuk performa
    migrationCompleted: false,
    isLoading: false
  }),
  
  getters: {
    /**
     * ✅ PERBAIKAN: Get current streak count - default 1, bukan 0
     * @param {string} userId - User ID
     * @returns {number} Current streak count
     */
    currentStreak: (state) => (userId) => {
      if (!userId) return 1  // ✅ PERBAIKAN: Default 1
      
      const userStreak = state.streakData[userId]
      if (!userStreak) return 1  // ✅ PERBAIKAN: Default 1 jika belum ada data
      
      // ✅ PERBAIKAN: Pastikan minimal 1
      return Math.max(userStreak.streakCount || 1, 1)
    },

    /**
     * Get last login date for a user
     * @param {string} userId - User ID  
     * @returns {string|null} Last login date or null
     */
    lastLoginDate: (state) => (userId) => {
      if (!userId) return null
      return state.streakData[userId]?.lastLoginDate || null
    },

    /**
     * Get total logins for a user
     * @param {string} userId - User ID
     * @returns {number} Total login count
     */
    totalLogins: (state) => (userId) => {
      if (!userId) return 0
      return state.streakData[userId]?.totalLogins || 0
    },

    /**
     * Get longest streak for a user
     * @param {string} userId - User ID
     * @returns {number} Longest streak achieved
     */
    longestStreak: (state) => (userId) => {
      if (!userId) return 1  // ✅ PERBAIKAN: Default 1
      return Math.max(state.streakData[userId]?.longestStreak || 1, 1)
    }
  },
  
  actions: {
    /**
     * Load streak data from Firestore untuk user tertentu
     * @param {string} userId - User ID
     */
    async loadUserStreak(userId) {
      if (!userId) return
      
      try {
        this.isLoading = true
        console.log('📥 [StreakStore] Loading streak for user:', userId)
        
        // Ambil dari Firestore
        const firestoreData = await getStreakFromFirestore(userId)
        
        if (firestoreData) {
          // ✅ PERBAIKAN: Pastikan streakCount minimal 1
          const sanitizedData = {
            ...firestoreData,
            streakCount: Math.max(firestoreData.streakCount || 1, 1),
            totalLogins: firestoreData.totalLogins || 1,
            longestStreak: Math.max(firestoreData.longestStreak || 1, 1)
          }
          
          this.streakData[userId] = sanitizedData
          console.log('✅ [StreakStore] Streak loaded from Firestore:', sanitizedData)
        } else {
          // Jika belum ada data di Firestore, set default sementara
          this.streakData[userId] = this.getDefaultStreakData()
          console.log('📝 [StreakStore] No Firestore data, using default')
        }
        
      } catch (error) {
        console.error('❌ [StreakStore] Error loading streak:', error)
        // Fallback ke default data
        this.streakData[userId] = this.getDefaultStreakData()
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * ✅ PERBAIKAN: Check dan update streak (fungsi utama)
     * @param {string} userId - User ID
     * @returns {number} Updated streak count
     */
    async checkStreak(userId) {
      if (!userId) {
        console.error('❌ [StreakStore] No userId provided for checkStreak')
        return 1  // ✅ PERBAIKAN: Return 1, bukan 0
      }
      
      try {
        this.isLoading = true
        console.log('🔍 [StreakStore] Checking streak for user:', userId)
        
        // Gunakan service untuk check dan update di Firestore
        const newStreakCount = await checkAndUpdateStreak(userId)
        
        // ✅ PERBAIKAN: Pastikan minimal 1
        const finalStreakCount = Math.max(newStreakCount || 1, 1)
        
        // Update cache di memory
        await this.loadUserStreak(userId)
        
        console.log(`🔥 [StreakStore] Final streak count: ${finalStreakCount}`)
        return finalStreakCount
        
      } catch (error) {
        console.error('❌ [StreakStore] Error checking streak:', error)
        return 1  // ✅ PERBAIKAN: Return 1 sebagai fallback
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Migrasi data dari localStorage ke Firestore (one-time)
     * @param {string} userId - User ID
     */
    async migrateFromLocalStorage(userId) {
      try {
        console.log('🔄 [StreakStore] Checking for localStorage migration...')
        
        // Cek data lama di localStorage
        const userStreakKey = `streakData_${userId}`
        const oldData = localStorage.getItem(userStreakKey)
        
        if (oldData) {
          const parsedData = JSON.parse(oldData)
          console.log('📦 [StreakStore] Found old localStorage data:', parsedData)
          
          // ✅ PERBAIKAN: Sanitize data sebelum migrasi
          const sanitizedData = {
            ...parsedData,
            streakCount: Math.max(parsedData.streakCount || 1, 1),
            totalLogins: parsedData.totalLogins || 1,
            longestStreak: Math.max(parsedData.longestStreak || parsedData.streakCount || 1, 1)
          }
          
          // Migrasi ke Firestore
          await saveStreakToFirestore(userId, sanitizedData)
          
          // Update cache
          this.streakData[userId] = sanitizedData
          
          console.log('✅ [StreakStore] Migration completed with sanitized data')
        } else {
          console.log('📝 [StreakStore] No old data found')
        }
        
      } catch (error) {
        console.error('❌ [StreakStore] Migration error:', error)
      }
    },
    
    /**
     * Clear streak data for a specific user from memory
     * @param {string} userId - User ID
     */
    clearUserStreak(userId) {
      if (!userId) return
      
      if (this.streakData[userId]) {
        delete this.streakData[userId]
        console.log('🗑️ [StreakStore] Cleared user streak from memory')
      }
    },
    
    /**
     * Clear all streak data from memory
     */
    clearAllStreaks() {
      this.streakData = {}
      console.log('🗑️ [StreakStore] Cleared all streaks from memory')
    },

    /**
     * ✅ PERBAIKAN: Get default streak data - default = 1
     * @returns {Object} Default streak data
     */
    getDefaultStreakData() {
      return {
        lastLoginDate: '',
        streakCount: 1,  // ✅ PERBAIKAN: Default = 1, bukan 0
        totalLogins: 1,  // ✅ PERBAIKAN: Default = 1
        longestStreak: 1,  // ✅ PERBAIKAN: Default = 1
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },

    /**
     * Force refresh streak data from Firestore
     * @param {string} userId - User ID
     */
    async refreshStreak(userId) {
      if (!userId) return
      
      // Clear cache dan load ulang
      this.clearUserStreak(userId)
      await this.loadUserStreak(userId)
    }
  }
})