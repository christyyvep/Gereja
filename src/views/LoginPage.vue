<!-- LoginPage.vue - Desktop Responsive Version -->
<template>
  <div class="login-page">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      
      <!-- Left Side - Branding & Welcome -->
      <div class="branding-section">
        <div class="branding-content">
          <!-- Church Info -->
          <div class="church-info">
            <div class="church-logo">
              <img src="@/assets/logos/logo-MyRajawali.png" alt="MyRajawali" class="logo-large"/>
            </div>
            <h1 class="church-name">Welcome to MyRajawali</h1>
            <p class="church-tagline">Melayani dengan Kasih Kristus</p>
          </div>
        </div>
        
        <!-- Decorative Elements -->
        <div class="decorative-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      
      <!-- Right Side - Login Form -->
      <div class="login-section">
        <div class="login-container">
          
          <!-- Mobile Logo (only visible on mobile) -->
          <div class="mobile-header">
            <img src="@/assets/logos/logo-MyRajawali.png" alt="Logo" class="logo-mobile"/>
            <h2 class="welcome-mobile">Welcome to MyRajawali</h2>
          </div>
          
          <!-- Login Card -->
          <div class="login-card">
            <div class="card-header">
              <h3 class="login-title">Masuk ke Akun</h3>
              <p class="login-subtitle">Masukan nama dan password kamu</p>
            </div>
            
            <form class="login-form" @submit.prevent="login">
              <!-- Input Nama -->
              <FormInput
                id="name"
                label="Nama"
                placeholder="Ketik nama Anda"
                v-model="nama"
                :error="errorNama"
                type="text"
                required
              />

              <!-- Input Password -->
              <PasswordInput
                id="password"
                label="Password"
                placeholder="Masukan password Anda"
                v-model="password"
                :error="errorPassword"
              />

              <!-- Remember & Forgot -->
              <div class="form-extras">
                <label class="remember-checkbox">
                  <input type="checkbox" v-model="rememberMe">
                  <span class="checkmark"></span>
                  Ingat saya
                </label>
                
                <button type="button" class="forgot-link" @click="showForgotPassword">
                  Lupa password?
                </button>
              </div>

              <!-- Submit Button -->
              <ButtonPrimary 
                type="submit" 
                :loading="isLoading"
                :disabled="isLoading"
                size="large"
                full-width
              >
                <span v-if="isLoading">Masuk...</span>
                <span v-else>Masuk</span>
              </ButtonPrimary>
            </form>
            
            <!-- Register Link -->
            <div class="register-section">
              <p class="register-text">
                Belum punya akun?
                <router-link to="/register" class="register-link">Daftar sekarang</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FormInput from '@/components/common/FormInput.vue'
import PasswordInput from '@/components/common/PasswordInput.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import { useUserStore } from '@/stores/userStore'
import { useStreakStore } from '@/stores/streakStore'

export default {
  name: 'LoginPage',
  
  components: {
    FormInput,
    PasswordInput,
    ButtonPrimary
  },
  
  data() {
    return {
      nama: '',
      password: '',
      errorNama: '',
      errorPassword: '',
      rememberMe: false,
      isLoading: false
    }
  },
  
  mounted() {
    // Check for remembered user on page load
    this.checkRememberedUser()
  },
  
  methods: {
    /**
     * Check if there's a remembered user for auto-login
     */
    async checkRememberedUser() {
      try {
        const rememberedUser = localStorage.getItem('rememberedUser')
        if (rememberedUser) {
          const userData = JSON.parse(rememberedUser)
          
          // Check if remember period is still valid
          const now = new Date().getTime()
          if (userData.rememberExpiry && now < userData.rememberExpiry) {
            console.log('🔄 Auto-login with remembered user:', userData.nama)
            
            // Auto-login the remembered user
            const userStore = useUserStore()
            userStore.setUser(userData)
            
            // Navigate to home
            await this.$router.push('/home')
            return
          } else {
            // Remember period expired, clear data
            localStorage.removeItem('rememberedUser')
            console.log('⏰ Remember period expired, cleared data')
          }
        }
      } catch (error) {
        console.error('Error checking remembered user:', error)
        localStorage.removeItem('rememberedUser')
      }
    },
    
    /**
     * Handle login form submission
     */
    async login() {
      try {
        // Reset errors
        this.clearErrors()
        
        // Validate inputs
        if (!this.validateInputs()) {
          return
        }
        
        // Set loading state
        this.isLoading = true
        
        // Get user store
        const userStore = useUserStore()
        
        // Attempt login
        const userData = await userStore.login(this.nama, this.password)
        
        // Handle remember me functionality
        this.handleRememberMe(userData)
        
        // Update streak for returning user
        await this.updateStreakForReturningUser(userData)
        
        // Success notification (optional)
        this.showSuccessMessage(`Selamat datang, ${userData.nama}!`)
        
        // Navigate to home
        await this.$router.push('/home')
        
        // ✨ SOLUSI UNTUK MASALAH CACHE ✨
        // Tunggu sebentar lalu refresh otomatis untuk tampilan fresh
        setTimeout(() => {
          console.log('🔄 Auto refresh untuk tampilan fresh...')
          window.location.reload()
        }, 500)
        
      } catch (error) {
        this.handleLoginError(error)
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Validate form inputs
     */
    validateInputs() {
      let isValid = true
      
      if (!this.nama.trim()) {
        this.errorNama = 'Nama harus diisi'
        isValid = false
      }
      
      if (!this.password.trim()) {
        this.errorPassword = 'Password harus diisi'
        isValid = false
      }
      
      return isValid
    },
    
    /**
     * Clear all error messages
     */
    clearErrors() {
      this.errorNama = ''
      this.errorPassword = ''
    },
    
    /**
     * Handle login errors
     */
    handleLoginError(error) {
      if (error.message.includes('Nama')) {
        this.errorNama = error.message
      } else if (error.message.includes('Password')) {
        this.errorPassword = error.message
      } else {
        this.errorNama = error.message || 'Terjadi kesalahan saat login'
      }
    },
    
    /**
     * Update streak for returning user
     */
    async updateStreakForReturningUser(userData) {
      try {
        console.log('📊 [LoginPage] Processing streak for user:', userData.nama)
        
        const streakStore = useStreakStore()
        const userId = userData.id || userData.nama
        
        // Force refresh streak data
        await streakStore.refreshStreak(userId)
        
        // Check & update streak
        const currentStreak = await streakStore.checkStreak(userId)
        console.log(`✅ [LoginPage] Streak updated: ${currentStreak}`)
        
      } catch (error) {
        console.error('❌ [LoginPage] Error updating streak:', error)
        // Don't block login if streak update fails
      }
    },
    
    /**
     * Show success message (placeholder)
     */
    showSuccessMessage(message) {
      // TODO: Implement proper toast notification
      console.log('Success:', message)
    },
    
    /**
     * Handle remember me functionality
     */
    handleRememberMe(userData) {
      if (this.rememberMe) {
        // Set expiry for 30 days
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30)
        
        const userDataWithExpiry = {
          ...userData,
          rememberMe: true,
          rememberExpiry: expiryDate.getTime()
        }
        
        // Save to localStorage with expiry
        localStorage.setItem('user', JSON.stringify(userDataWithExpiry))
        console.log('✅ Remember Me: Data saved for 30 days')
        
      } else {
        // Don't remember - set shorter expiry (1 day)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 1)
        
        const userDataWithExpiry = {
          ...userData,
          rememberMe: false,
          rememberExpiry: expiryDate.getTime()
        }
        
        localStorage.setItem('user', JSON.stringify(userDataWithExpiry))
        console.log('ℹ️ Remember Me: Data saved for 1 day only')
      }
    },
    
    /**
     * Handle forgot password
     */
    showForgotPassword() {
      alert(`🔒 Lupa Password?\n\nHubungi admin gereja untuk reset password:\n\n📧 Email: admin@gerejarajawali.org\n📞 Telepon: (0431) 123-4567\n⏰ Jam kerja: Senin-Jumat 08:00-16:00\n\nAdmin akan membantu reset password Anda.`)
    }
  }
}
</script>

<style scoped>
/* === BASE LAYOUT === */

.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fcfcf7 0%, #f5f5f0 100%);
  display: flex;
  align-items: stretch; /* Changed from center to stretch */
  justify-content: center;
  padding: 0; /* Removed padding */
  box-sizing: border-box;
}

.desktop-layout {
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 0; /* Removed border radius */
  overflow: hidden;
  box-shadow: none; /* Removed shadow */
  background: white;
}

/* === BRANDING SECTION (LEFT) === */

.branding-section {
  background: linear-gradient(135deg, #41442A 0%, #5a5e3d 50%, #6b7042 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: white;
  overflow: hidden;
}

.branding-content {
  text-align: center;
  z-index: 2;
  position: relative;
}

.church-info {
  margin-bottom: 0; /* Reduced spacing since we removed other sections */
}

.church-logo {
  margin-bottom: 24px;
}

.logo-large {
  width: 120px;
  height: 120px;
  object-fit: contain;
  /* Removed filter that was hiding the logo */
}

.church-name {
  font-family: 'Inter', sans-serif;
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.church-tagline {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 400;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
}

/* Removed all CSS for welcome-section, welcome-title, welcome-description, feature-highlights, feature-item, feature-icon, and login-footer classes since they're no longer used */

/* Decorative shapes */
.decorative-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -100px;
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: -75px;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: -50px;
  opacity: 0.05;
}

/* === LOGIN SECTION (RIGHT) === */

.login-section {
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.mobile-header {
  display: none;
}

.login-card {
  background: transparent; /* Removed white background */
  border-radius: 0; /* Removed border radius */
  padding: 40px;
  box-shadow: none; /* Removed shadow */
  border: none; /* Removed border */
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.login-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 24px;
}

.form-extras {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -8px 0 8px 0;
}

.remember-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.remember-checkbox input[type="checkbox"] {
  margin: 0;
  width: 16px;
  height: 16px;
  accent-color: #41442A;
}

.forgot-link {
  background: none;
  border: none;
  color: #41442A;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  padding: 0;
  transition: all 0.2s ease;
}

.forgot-link:hover {
  color: #5a5e3d;
  text-decoration: underline;
}

.register-section {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.register-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0;
}

.register-link {
  color: #41442A;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.register-link:hover {
  color: #5a5e3d;
  text-decoration: underline;
}

/* Removed footer-related CSS since footer was deleted */

/* === RESPONSIVE DESIGN === */

/* Tablet */
@media (max-width: 1024px) {
  .desktop-layout {
    height: 100vh; /* Keep full height */
  }
  
  .branding-section {
    padding: 40px 30px;
  }
  
  .church-name {
    font-size: 32px;
  }
  
  .login-section {
    padding: 30px;
  }
  
  .login-card {
    padding: 32px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .login-page {
    padding: 0;
    background: #fcfcf7;
  }
  
  .desktop-layout {
    grid-template-columns: 1fr;
    height: 100vh;
    max-height: none;
    border-radius: 0;
    box-shadow: none;
  }
  
  .branding-section {
    display: none;
  }
  
  .login-section {
    padding: 24px 16px;
    background: #fcfcf7;
  }
  
  .login-container {
    max-width: 360px;
  }
  
  .mobile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 32px;
  }
  
  .logo-mobile {
    width: 100px;
    height: 100px;
    object-fit: contain;
    margin-bottom: 16px;
  }
  
  .welcome-mobile {
    font-family: 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #41442A;
    margin: 0;
  }
  
  .login-card {
    box-shadow: none;
    border: none;
    background: #fcfcf7;
    padding: 0;
  }
  
  /* HIDE desktop card header on mobile */
  .card-header {
    display: none;
  }
  
  .login-form {
    gap: 20px;
  }
  
  .form-extras {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin: -8px 0 8px 0;
  }
  
  .remember-checkbox {
    font-size: 13px;
    white-space: nowrap;
  }
  
  .forgot-link {
    font-size: 13px;
    white-space: nowrap;
  }
}

/* Small mobile */
@media (max-width: 360px) {
  .login-section {
    padding: 16px 12px;
  }
  
  .login-container {
    max-width: 100%;
  }
  
  .welcome-mobile {
    font-size: 18px;
  }
  
  .login-title {
    font-size: 18px;
  }
  
  .form-extras {
    gap: 8px;
  }
}

/* === ACCESSIBILITY === */

@media (prefers-reduced-motion: reduce) {
  .forgot-link,
  .register-link,
  .footer-link {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .login-card {
    border: 2px solid #333;
  }
  
  .register-section {
    border-top-color: #333;
  }
}
</style>