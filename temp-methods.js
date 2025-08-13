    /**
     * Force refresh user data from localStorage
     * Useful for when localStorage is updated externally
     */
    refreshUserDataFromStorage() {
      console.log('🔄 [UserStore] Forcing refresh of user data from localStorage...')
      
      try {
        const savedUser = getCurrentUser()
        if (savedUser && this.validateUserData(savedUser)) {
          console.log('✅ [UserStore] Refreshed user data:', savedUser.nama)
          this.setUser(savedUser)
          return true
        } else {
          console.log('❌ [UserStore] No valid user data found during refresh')
          this.clearUserData()
          return false
        }
      } catch (error) {
        console.error('❌ [UserStore] Error refreshing user data:', error)
        this.clearUserData()
        return false
      }
    },

    /**
     * Force update user role (for testing/debugging)
     * @param {string} newRole - New role to set
     */
    forceUpdateRole(newRole) {
      console.log(`🔧 [UserStore] Force updating role to: ${newRole}`)
      
      if (this.user) {
        // Update in memory
        this.user.role = newRole
        this.user.roleUpdatedAt = new Date().toISOString()
        
        // Update in localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('myrajawali_user', JSON.stringify(this.user))
        
        console.log('✅ [UserStore] Role force updated successfully')
        return true
      } else {
        console.log('❌ [UserStore] No user found to update role')
        return false
      }
    },

    /**
     * Watch localStorage changes and update store accordingly
     */
    setupStorageWatcher() {
      console.log('👁️ [UserStore] Setting up localStorage watcher...')
      
      window.addEventListener('storage', (e) => {
        if (e.key === 'user' || e.key === 'myrajawali_user') {
          console.log('🔄 [UserStore] localStorage changed, refreshing user data...')
          this.refreshUserDataFromStorage()
        }
      })
      
      console.log('✅ [UserStore] Storage watcher setup complete')
    }
  }
})
