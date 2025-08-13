<template>
  <div class="success-container">
    <!-- Mobile Layout (Default) -->
    <div class="mobile-layout">
      <div class="content-wrapper">
        <img src="@/assets/logos/logo-MyRajawali.png" alt="Logo MyRajawali" class="logo-img" />
        <h2>Welcome to MyRajawali<br />
          {{ userName ? `, ${userName}` : '' }}!</h2>
        <p class="desc-text">
          Akun MyRajawali Anda telah <strong>BERHASIL</strong> dibuat.<br />
          Klik lanjutkan untuk jelajahi aplikasi MyRajawali.<br />
          Tuhan Yesus Memberkati
        </p>
      </div>
      <ButtonPrimary @click="goToHome">Lanjutkan</ButtonPrimary>
    </div>

    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Left Side - Branding -->
      <div class="branding-section">
        <div class="branding-content">
          <div class="church-logo">
            <img src="@/assets/logos/logo-MyRajawali.png" alt="MyRajawali" class="logo-large"/>
          </div>
          <h1 class="church-name">Welcome to MyRajawali</h1>
          <p class="church-tagline">Melayani dengan Kasih Kristus</p>
        </div>
        
        <!-- Decorative Elements -->
        <div class="decorative-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
      
      <!-- Right Side - Success Message -->
      <div class="success-section">
        <div class="success-card">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          
          <h3 class="success-title">Registrasi Berhasil!</h3>
          <p class="success-subtitle">Welcome to MyRajawali{{ userName ? `, ${userName}` : '' }}!</p>
          
          <p class="success-message">
            Akun MyRajawali Anda telah <strong>berhasil</strong> dibuat.<br>
            Klik lanjutkan untuk jelajahi aplikasi MyRajawali.<br>
            <span class="blessing-text">Tuhan Yesus Memberkati</span>
          </p>
          
          <ButtonPrimary @click="goToHome" class="continue-button">
            Lanjutkan
          </ButtonPrimary>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import { useUserStore } from '@/stores/userStore'
import { getCurrentUser } from '@/services/auth-hybrid'

export default {
  name: 'SuccessRegister',
  components: {
    ButtonPrimary
  },
  data() {
    return {
      userName: ''
    }
  },
  created() {
    this.validateUserRegistration()
  },
  methods: {
    validateUserRegistration() {
      try {
        const userStore = useUserStore()
        
        // Check UserStore first
        if (userStore.isLoggedIn && userStore.user?.nama) {
          this.userName = userStore.user.nama
        } 
        // Fallback to localStorage
        else {
          const savedUser = getCurrentUser()
          if (savedUser?.nama) {
            this.userName = savedUser.nama
          }
        }
        
        // Redirect to login if no user data
        if (!this.userName) {
          this.$router.push('/')
        }
        
      } catch (error) {
        console.error('Validation error:', error)
        this.userName = 'User'
      }
    },
    
    goToHome() {
      // Ensure user session is valid
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        userStore.checkLoginStatus()
      }
      
      this.$router.push('/home')
    }
  }
}
</script>

<style scoped>
/* ===== MOBILE LAYOUT (DEFAULT) ===== */

.success-container {
  min-height: 100vh;
  background-color: #fcfcf7;
}

.mobile-layout {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  padding: 64px 16px;
  box-sizing: border-box;
}

.desktop-layout {
  display: none;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
  flex: 1;
  justify-content: center;
}

.logo-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-top: 40px;
}

h2 {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: #41442A;
}

.desc-text {
  font-family: 'Inter';
  font-size: 14px;
  line-height: 1.6;
  color: black;
}

/* ===== DESKTOP LAYOUT (769px+) ===== */

@media (min-width: 769px) {
  .success-container {
    height: 100vh;
    padding: 0;
  }

  .mobile-layout {
    display: none;
  }

  .desktop-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100vh;
    background: white;
  }

  /* Left Side - Branding */
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

  .church-logo {
    margin-bottom: 24px;
  }

  .logo-large {
    width: 120px;
    height: 120px;
    object-fit: contain;
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

  /* Decorative Shapes */
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

  /* Right Side - Success Message */
  .success-section {
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  .success-card {
    text-align: center;
    max-width: 400px;
  }

  .success-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: #e8f5e8;
    border-radius: 50%;
    margin: 0 auto 24px;
    color: #41442A;
  }

  .success-title {
    font-family: 'Inter', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #41442A;
    margin: 0 0 12px 0;
    line-height: 1.2;
  }

  .success-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: #333;
    margin: 0 0 32px 0;
    line-height: 1.4;
  }

  .success-message {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #555;
    margin: 0 0 32px 0;
  }

  .blessing-text {
    color: #41442A;
    font-weight: 500;
    font-style: italic;
  }

  .continue-button {
    width: 100%;
    max-width: 280px;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 600;
  }
}

/* Small Mobile Responsive */
@media (max-width: 360px) {
  .mobile-layout {
    padding: 48px 12px;
  }
  
  .logo-img {
    margin-top: 20px;
  }
  
  h2 {
    font-size: 18px;
  }
  
  .desc-text {
    font-size: 13px;
  }
}
</style>