<template>
  <router-view />
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import { useStreakStore } from '@/stores/streakStore'

export default {
  name: 'App',
  
  async created() {
    const userStore = useUserStore()
    const streakStore = useStreakStore()
    
    // Check if we're on login page - force clear all sessions ONLY if no active session
    if (this.$route.path === '/' || this.$route.name === 'LoginPage') {
      console.log('🔄 [App] On login page, checking if session should be cleared...')
      
      // Check if there's a valid active session first
      const hasValidSession = await userStore.checkLoginStatus()
      
      if (!hasValidSession) {
        console.log('🧹 [App] No valid session found, clearing all sessions...')
        await userStore.forceLogoutUser()
      } else {
        console.log('🔐 [App] Valid session found, redirecting to home...')
        this.$router.push('/home')
      }
      return
    }
    
    // Check login status terlebih dahulu
    const isLoggedIn = await userStore.checkLoginStatus()
    
    // If not logged in, redirect to login page
    if (!isLoggedIn) {
      console.log('🔐 [App] No valid session, redirecting to login...')
      this.$router.push('/')
      return
    }
    
    // Jika user login, check streak setiap kali app dibuka
    if (isLoggedIn && userStore.user) {
      const userId = userStore.user.id || userStore.user.nama
      if (userId) {
        try {
          // Auto-refresh user data jika diperlukan (untuk konten terbaru)
          console.log('🔄 [App] Auto-refreshing user data if needed...')
          await userStore.autoRefreshIfNeeded()
          
          console.log('🔥 [App] Checking daily streak for user:', userId)
          const currentStreak = await streakStore.checkDailyStreak(userId)
          console.log('✅ [App] Daily streak checked:', currentStreak)
        } catch (error) {
          console.error('❌ [App] Error during app initialization:', error)
        }
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');

* {
  font-family: 'Inter';
}

:root {
  --dp-font-family: 'Inter';
}

html, body {
  height: 100%;
  background-color: #fcfcf7;
}
body {
  font-family: 'Inter';
  margin: 0;
  padding: 0;
}
</style>