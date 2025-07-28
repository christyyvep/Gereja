<!-- CONTOH UPDATE LOGINPAGE.VUE untuk Enhanced Security -->
<template>
  <div class="login-container">
    <!-- Existing UI structure -->
    <div class="login-form">
      <!-- Email input -->
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          v-model="email"
          type="email"
          placeholder="Masukkan email Anda"
          :disabled="isLoading"
          @keyup.enter="handleLogin"
        />
      </div>

      <!-- Password input -->
      <div class="form-group">
        <label for="password">Password</label>
        <div class="password-input">
          <input 
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Masukkan password"
            :disabled="isLoading"
            @keyup.enter="handleLogin"
          />
          <button 
            type="button" 
            @click="showPassword = !showPassword"
            class="toggle-password"
          >
            <i :class="showPassword ? 'lucide-eye-off' : 'lucide-eye'"></i>
          </button>
        </div>
      </div>

      <!-- Security info -->
      <div v-if="rateLimitInfo" class="rate-limit-warning">
        <i class="lucide-alert-triangle"></i>
        <span>
          {{ rateLimitInfo.remainingAttempts }} percobaan tersisa. 
          Reset dalam {{ formatRetryTime(rateLimitInfo.retryAfter) }}.
        </span>
      </div>

      <!-- Login button -->
      <button 
        @click="handleLogin"
        :disabled="isLoading || !isFormValid"
        class="login-button"
      >
        <i v-if="isLoading" class="lucide-loader-2 animate-spin"></i>
        <i v-else class="lucide-log-in"></i>
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>

      <!-- Register link -->
      <div class="register-link">
        <p>Belum punya akun? 
          <router-link to="/register">Daftar di sini</router-link>
        </p>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="lucide-loader-2 animate-spin"></i>
        <p>Memverifikasi kredensial...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '../composables/useToast'

// UPDATED: Import enhanced auth service
import { 
  loginUser, 
  checkRateLimit, 
  logSecurityEvent 
} from '../services/auth-enhanced'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { showToast } = useToast()

    // Form state
    const email = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const isLoading = ref(false)
    const rateLimitInfo = ref(null)

    // Computed
    const isFormValid = computed(() => {
      return email.value.trim() && 
             password.value.trim() && 
             email.value.includes('@')
    })

    // Methods
    const formatRetryTime = (ms) => {
      if (!ms) return ''
      const minutes = Math.ceil(ms / 60000)
      return minutes > 1 ? `${minutes} menit` : '1 menit'
    }

    const checkLoginRateLimit = async () => {
      try {
        const result = checkRateLimit(`login_${email.value}`, 5, 15 * 60 * 1000)
        
        if (!result.allowed) {
          rateLimitInfo.value = result
          return false
        }
        
        rateLimitInfo.value = result.remainingAttempts < 3 ? result : null
        return true
      } catch (error) {
        console.error('Rate limit check error:', error)
        return true // Allow login attempt if rate limit check fails
      }
    }

    const handleLogin = async () => {
      if (!isFormValid.value || isLoading.value) return

      try {
        isLoading.value = true
        
        // Check rate limiting
        const rateLimitOk = await checkLoginRateLimit()
        if (!rateLimitOk) {
          showToast('Terlalu banyak percobaan login. Silakan tunggu.', 'error')
          return
        }

        // Attempt login with enhanced security
        const result = await loginUser(email.value, password.value)
        
        if (result.success) {
          // Login berhasil
          showToast(`Selamat datang, ${result.user.nama}!`, 'success')
          
          // Redirect ke intended page atau home
          const redirectTo = route.query.redirect || '/home'
          router.push(redirectTo)
        }
        
      } catch (error) {
        console.error('Login error:', error)
        
        // Show user-friendly error message
        let errorMessage = 'Login gagal. Silakan coba lagi.'
        
        if (error.message.includes('Email atau password salah')) {
          errorMessage = 'Email atau password tidak sesuai'
        } else if (error.message.includes('Terlalu banyak percobaan')) {
          errorMessage = 'Akun sementara dikunci karena terlalu banyak percobaan login'
        } else if (error.message.includes('Akun terkunci')) {
          errorMessage = error.message
        }
        
        showToast(errorMessage, 'error')
        
        // Update rate limit info
        await checkLoginRateLimit()
        
      } finally {
        isLoading.value = false
      }
    }

    const handleQueryParams = () => {
      // Handle various query parameters
      if (route.query.reason) {
        const reason = route.query.reason
        
        const messages = {
          'session_expired': 'Sesi Anda telah berakhir. Silakan login kembali.',
          'auth_required': 'Silakan login untuk mengakses halaman tersebut.',
          'admin_auth_required': 'Akses admin diperlukan. Silakan login sebagai admin.',
          'insufficient_privileges': 'Anda tidak memiliki izin untuk mengakses halaman tersebut.'
        }
        
        if (messages[reason]) {
          setTimeout(() => {
            showToast(messages[reason], 'warning')
          }, 500)
        }
      }
      
      if (route.query.logout === 'success') {
        setTimeout(() => {
          showToast('Logout berhasil', 'success')
        }, 500)
      }
    }

    // Lifecycle
    onMounted(() => {
      handleQueryParams()
      
      // Focus email input
      setTimeout(() => {
        const emailInput = document.getElementById('email')
        if (emailInput) emailInput.focus()
      }, 100)
      
      // Log page visit
      logSecurityEvent('login_page_visited')
    })

    onUnmounted(() => {
      // Clear sensitive data
      password.value = ''
    })

    return {
      email,
      password,
      showPassword,
      isLoading,
      rateLimitInfo,
      isFormValid,
      formatRetryTime,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
}

.rate-limit-warning {
  background: #fef3c7;
  color: #92400e;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.register-link {
  text-align: center;
  margin-top: 24px;
}

.register-link a {
  color: #3b82f6;
  text-decoration: none;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  background: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
}

.loading-spinner i {
  font-size: 32px;
  color: #3b82f6;
  margin-bottom: 16px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .login-form {
    padding: 24px;
    margin: 16px;
  }
}
</style>
