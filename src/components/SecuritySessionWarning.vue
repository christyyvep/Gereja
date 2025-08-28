<!-- Security Session Warning Component -->
<template>
  <div v-if="showWarning" class="security-session-warning">
    <div class="warning-overlay" @click.self="handleOverlayClick">
      <div class="warning-modal">
        <div class="warning-icon">
          <i class="lucide-alert-triangle"></i>
        </div>
        
        <h3 class="warning-title">Sesi Akan Berakhir</h3>
        
        <div class="warning-content">
          <p>Sesi login Anda akan berakhir dalam:</p>
          <div class="countdown-timer">
            <span class="countdown-number">{{ formatTime(timeLeft) }}</span>
          </div>
          <p class="warning-text">
            Klik "Perpanjang Sesi" untuk melanjutkan atau "Logout" untuk keluar sekarang.
          </p>
        </div>
        
        <div class="warning-actions">
          <button 
            @click="extendSession" 
            class="btn-extend"
            :disabled="isExtending"
          >
            <i v-if="isExtending" class="lucide-loader-2 animate-spin"></i>
            <i v-else class="lucide-refresh-cw"></i>
            {{ isExtending ? 'Memperpanjang...' : 'Perpanjang Sesi' }}
          </button>
          
          <button 
            @click="logoutNow" 
            class="btn-logout"
            :disabled="isExtending"
          >
            <i class="lucide-log-out"></i>
            Logout Sekarang
          </button>
        </div>
        
        <div class="auto-logout-info">
          <small>
            <i class="lucide-info"></i>
            Otomatis logout jika tidak ada respon dalam {{ Math.ceil(timeLeft / 1000) }} detik
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { logoutUser, getCurrentUser } from '../services/auth-hybrid-minimal'
import { logSecurityEvent, updateSessionActivity } from '../services/firebase-security'
import { useToast } from '../composables/useToast'

export default {
  name: 'SecuritySessionWarning',
  setup() {
    const router = useRouter()
    const { showToast } = useToast()
    
    const showWarning = ref(false)
    const timeLeft = ref(0)
    const isExtending = ref(false)
    let countdownInterval = null
    let warningTimer = null
    let autoLogoutTimer = null

    const formatTime = (ms) => {
      const seconds = Math.ceil(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      
      if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
      }
      return `${seconds}s`
    }

    const startCountdown = (duration) => {
      timeLeft.value = duration
      
      countdownInterval = setInterval(() => {
        timeLeft.value -= 1000
        
        if (timeLeft.value <= 0) {
          clearInterval(countdownInterval)
          autoLogout()
        }
      }, 1000)
    }

    const showSessionWarning = (event) => {
      const warningDuration = event.detail.timeToExpire
      
      logSecurityEvent('session_warning_shown', {
        timeToExpire: warningDuration,
        userId: getCurrentUser()?.userId
      })
      
      showWarning.value = true
      startCountdown(warningDuration)
    }

    const extendSession = async () => {
      try {
        isExtending.value = true
        
        const currentUser = getCurrentUser()
        if (!currentUser) {
          throw new Error('User tidak ditemukan')
        }

        // Update session activity
        updateSessionActivity()
        
        logSecurityEvent('session_extended', {
          userId: currentUser.userId,
          extendedAt: new Date().toISOString()
        })
        
        showToast('Sesi berhasil diperpanjang', 'success')
        hideWarning()
        
      } catch (error) {
        console.error('Error extending session:', error)
        showToast('Gagal memperpanjang sesi', 'error')
        
        logSecurityEvent('session_extend_failed', {
          error: error.message,
          userId: getCurrentUser()?.userId
        })
        
        // Force logout jika extend gagal
        setTimeout(() => autoLogout(), 2000)
      } finally {
        isExtending.value = false
      }
    }

    const logoutNow = async () => {
      try {
        logSecurityEvent('manual_logout_from_warning', {
          userId: getCurrentUser()?.userId
        })
        
        await logoutUser()
        hideWarning()
        showToast('Logout berhasil', 'success')
        router.push('/')
      } catch (error) {
        console.error('Error during logout:', error)
        showToast('Error saat logout', 'error')
        
        // Force redirect anyway
        hideWarning()
        router.push('/')
      }
    }

    const autoLogout = async () => {
      try {
        logSecurityEvent('auto_logout', {
          reason: 'session_timeout',
          userId: getCurrentUser()?.userId
        })
        
        await logoutUser()
        hideWarning()
        showToast('Sesi berakhir. Silakan login kembali.', 'warning')
        router.push('/?reason=session_expired')
      } catch (error) {
        console.error('Error during auto logout:', error)
        hideWarning()
        router.push('/?reason=session_expired')
      }
    }

    const hideWarning = () => {
      showWarning.value = false
      timeLeft.value = 0
      
      if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
      }
      
      if (warningTimer) {
        clearTimeout(warningTimer)
        warningTimer = null
      }
      
      if (autoLogoutTimer) {
        clearTimeout(autoLogoutTimer)
        autoLogoutTimer = null
      }
    }

    const handleOverlayClick = () => {
      // Prevent closing by clicking overlay for security
      logSecurityEvent('session_warning_overlay_click', {
        userId: getCurrentUser()?.userId
      })
    }

    onMounted(() => {
      // Listen for session warning events
      window.addEventListener('sessionWarning', showSessionWarning)
      
      // Listen untuk keyboard events
      const handleKeyDown = (event) => {
        if (showWarning.value) {
          if (event.key === 'Enter') {
            extendSession()
          } else if (event.key === 'Escape') {
            logoutNow()
          }
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      
      // Cleanup function
      onUnmounted(() => {
        window.removeEventListener('sessionWarning', showSessionWarning)
        document.removeEventListener('keydown', handleKeyDown)
        hideWarning()
      })
    })

    return {
      showWarning,
      timeLeft,
      isExtending,
      formatTime,
      extendSession,
      logoutNow,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
.security-session-warning {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.warning-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.warning-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.warning-icon {
  margin-bottom: 16px;
}

.warning-icon i {
  font-size: 48px;
  color: #f59e0b;
}

.warning-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 16px;
}

.warning-content {
  margin-bottom: 24px;
}

.warning-content p {
  color: #6b7280;
  margin-bottom: 12px;
  line-height: 1.5;
}

.countdown-timer {
  margin: 20px 0;
}

.countdown-number {
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  font-size: 32px;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 12px;
  border: 2px solid #f59e0b;
  min-width: 120px;
}

.warning-text {
  font-size: 14px;
  color: #4b5563;
}

.warning-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-extend,
.btn-logout {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-extend {
  background: #10b981;
  color: white;
}

.btn-extend:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-extend:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-logout {
  background: #ef4444;
  color: white;
}

.btn-logout:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-logout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auto-logout-info {
  color: #9ca3af;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.auto-logout-info i {
  font-size: 14px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .warning-modal {
    padding: 24px;
    margin: 16px;
    max-width: none;
  }
  
  .warning-actions {
    flex-direction: column;
  }
  
  .countdown-number {
    font-size: 28px;
    padding: 10px 20px;
  }
}
</style>
