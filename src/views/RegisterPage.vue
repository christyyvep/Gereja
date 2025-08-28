<!-- RegisterPage.vue - Clean & Simple -->
<template>
  <div class="register-page">
    <!-- Left Side - Branding (Desktop Only) -->
    <div class="branding-section">
      <div class="branding-content">
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
    
    <!-- Right Side - Register Form -->
    <div class="register-section">
      <div class="register-container">
        <div class="card-header">
          <h3 class="register-title">Buat Akun Baru</h3>
          <p class="register-subtitle">Silakan lengkapi data diri Anda</p>
        </div>
        
        <div class="form-wrapper">
          <!-- Input Nama - Back to AutoComplete -->
          <div class="form-group">
            <AutoCompleteInput
              id="nama"
              label="Nama"
              placeholder="Ketik nama lengkap Anda"
              v-model="nama"
              :error="namaError"
              @suggestion-selected="onSuggestionSelected"
              @nama-validated="onNamaValidated"
            />
          </div>

          <!-- Input Tanggal Lahir - HTML5 Date -->
          <div class="form-group">
            <label for="tanggalLahir">Tanggal lahir</label>
            <input
              type="date"
              id="tanggalLahir"
              v-model="tanggalLahir"
              class="form-input"
              placeholder="Pilih tanggal lahir"
            />
          </div>

          <!-- Select Status - Back to SelectDropdown -->
          <div class="form-group">
            <SelectDropdown
              id="status"
              label="Status"
              placeholder="Pilih status"
              v-model="status"
              :options="statusOptions"
              :error="statusError"
            />
          </div>

          <!-- Select Sektor - Back to SelectDropdown -->
          <div class="form-group">
            <SelectDropdown
              id="sektor"
              label="Sektor"
              placeholder="Pilih sektor"
              v-model="sektor"
              :options="sektorOptions"
            />
          </div>

          <!-- Input Keluarga -->
          <div class="form-group">
            <label for="keluarga">Keluarga</label>
            <input
              type="text"
              id="keluarga"
              v-model="keluarga"
              class="form-input"
              placeholder="Contoh: Kel. Potabuga-Gerungan"
            />
          </div>

          <!-- Input Password -->
          <div class="form-group">
            <PasswordInput
              id="password"
              label="Password"
              placeholder="Masukan password Anda"
              v-model="password"
              :error="passwordError"
            />
          </div>

          <!-- Konfirmasi Password -->
          <div class="form-group">
            <PasswordInput
              id="confirmPassword"
              label="Konfirmasi Password"
              placeholder="Konfirmasi kata sandi Anda"
              v-model="confirmPassword"
              :error="confirmPasswordError"
            />
          </div>

          <!-- Error message -->
          <p v-if="errorMsg" class="warning-text">{{ errorMsg }}</p>

          <!-- Submit button -->
          <ButtonPrimary 
            @click="register"
            :disabled="!canSubmit"
            :class="{ 'disabled': !canSubmit }"
            size="large"
            full-width
          >
            {{ submitButtonText }}
          </ButtonPrimary>
          
          <!-- Login Link -->
          <div class="login-section">
            <p class="login-text">
              Sudah punya akun?
              <router-link to="/" class="login-link">Masuk sekarang</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { registerUser } from '@/services/auth-hybrid-minimal'
import { useUserStore } from '@/stores/userStore'
import AutoCompleteInput from '@/components/common/AutoCompleteInput.vue'
import PasswordInput from '@/components/common/PasswordInput.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import SelectDropdown from '@/components/common/SelectDropdown.vue'

export default {
  name: 'RegisterPage',
  components: {
    AutoCompleteInput,
    PasswordInput,
    ButtonPrimary,
    SelectDropdown
  },
  data() {
    return {
      nama: '',
      tanggalLahir: '',
      status: '',
      sektor: '',
      keluarga: '',
      password: '',
      confirmPassword: '',
      
      namaError: '',
      statusError: '',
      passwordError: '',
      confirmPasswordError: '',
      errorMsg: '',

      statusOptions: ['Menikah', 'Single', 'Janda/Duda'],
      sektorOptions: ['Sektor Anugerah', 'Sektor Tesalonika', 'Non-Sektoral'],

      selectedUserData: null,
      namaExists: false,
      isSubmitting: false
    }
  },
  
  computed: {
    canSubmit() {
      return (
        this.nama.trim().length > 0 &&
        this.namaExists &&
        this.tanggalLahir &&
        this.status &&
        this.sektor &&
        this.keluarga.trim().length > 0 &&
        this.password.length >= 6 &&
        this.confirmPassword.length >= 6 &&
        this.password === this.confirmPassword &&
        !this.isSubmitting
      )
    },
    
    submitButtonText() {
      if (this.isSubmitting) return 'Mendaftarkan...'
      if (!this.canSubmit) return 'Lengkapi Data'
      return 'Registrasi Akun'
    }
  },

  methods: {
    onSuggestionSelected(suggestion) {
      this.selectedUserData = suggestion;
      this.nama = suggestion.nama;
      
      if (suggestion.sektor) {
        this.sektor = suggestion.sektor;
      }
      
      this.namaError = '';
      this.errorMsg = '';
    },
    
    onNamaValidated(validation) {
      this.namaExists = validation.exists;
      
      if (validation.exists) {
        this.selectedUserData = validation.userData;
        this.namaError = '';
        this.errorMsg = '';
        
        if (validation.userData.isRegistered) {
          this.namaError = 'Nama ini sudah terdaftar. Silakan langsung login.';
        }
      } else {
        this.selectedUserData = null;
        this.namaError = 'Nama anda belum terdaftar, segera hubungi gembala/admin';
      }
    },

    async register() {
      try {
        this.isSubmitting = true;
        this.clearAllErrors();
        
        if (!this.validateAllFields()) {
          return;
        }
        
        if (!this.namaExists || !this.selectedUserData) {
          this.errorMsg = 'Silakan pilih nama dari suggestion yang tersedia';
          return;
        }
        
        if (this.selectedUserData.isRegistered) {
          this.namaError = 'Nama ini sudah terdaftar. Silakan langsung login.';
          return;
        }
        
        const userData = {
          tanggalLahir: this.tanggalLahir,
          status: this.status,
          sektor: this.sektor,
          keluarga: this.keluarga
        };
        
        await registerUser(this.nama, this.password, userData);
        
        const completeUserData = {
          id: this.selectedUserData.id,
          nama: this.nama,
          tanggalLahir: this.tanggalLahir,
          status: this.status,
          sektor: this.sektor,
          keluarga: this.keluarga,
          isRegistered: true,
          registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(completeUserData));
        
        const userStore = useUserStore();
        userStore.setUser(completeUserData);
        
        this.initializeNewUserStreak();
        
        this.$router.push('/success-register');
        
      } catch (error) {
        this.handleRegistrationError(error);
      } finally {
        this.isSubmitting = false;
      }
    },
    
    initializeNewUserStreak() {
      const today = new Date().toDateString();
      const newStreakData = {
        lastLoginDate: today,
        streakCount: 1
      };
      
      localStorage.setItem('streakData', JSON.stringify(newStreakData));
    },
    
    handleRegistrationError(error) {
      if (error.message.includes('Nama') || error.message.includes('belum terdaftar')) {
        this.namaError = error.message;
      } else if (error.message.includes('Password')) {
        this.passwordError = error.message;
      } else if (error.message.includes('sudah terdaftar')) {
        this.namaError = error.message;
      } else {
        this.errorMsg = error.message || 'Terjadi kesalahan saat registrasi. Coba lagi.';
      }
    },

    validateAllFields() {
      let isValid = true;

      if (!this.nama.trim()) {
        this.namaError = 'Nama harus diisi';
        isValid = false;
      }

      if (!this.tanggalLahir) {
        this.errorMsg = 'Tanggal lahir harus diisi';
        isValid = false;
      }

      if (!this.status) {
        this.statusError = 'Status harus dipilih';
        isValid = false;
      }

      if (!this.sektor) {
        this.errorMsg = 'Sektor harus dipilih';
        isValid = false;
      }

      if (!this.keluarga.trim()) {
        this.errorMsg = 'Keluarga harus diisi';
        isValid = false;
      }

      if (this.password.length < 6) {
        this.passwordError = 'Password minimal 6 karakter';
        isValid = false;
      }

      if (this.confirmPassword.length < 6) {
        this.confirmPasswordError = 'Konfirmasi password minimal 6 karakter';
        isValid = false;
      }

      if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = 'Password tidak sama';
        isValid = false;
      }
      
      return isValid;
    },

    clearAllErrors() {
      this.namaError = '';
      this.statusError = '';
      this.passwordError = '';
      this.confirmPasswordError = '';
      this.errorMsg = '';
    }
  }
}
</script>
      
<style scoped>
/* === MAIN LAYOUT === */
.register-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: #fcfcf7;
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

/* === REGISTER SECTION (RIGHT) === */
.register-section {
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-title {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.register-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

/* === FORM STYLES === */
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Fix button alignment */
:deep(.button-container) {
  width: 100% !important;
  max-width: 360px !important;
}

.form-group {
  width: 100%;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333;
}

/* UNIFORM INPUT STYLING - FORCE SAME AS COMPONENTS */
.uniform-input {
  width: 100% !important;
  max-width: 100% !important;
  height: 46px !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
  font-family: 'Inter', sans-serif !important;
  border: 2px solid #e1e5e9 !important;
  border-radius: 8px !important;
  background-color: white !important;
  box-sizing: border-box !important;
  color: #333 !important;
  transition: all 0.2s ease !important;
}

.uniform-input:focus {
  border-color: #41442A !important;
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1) !important;
}

.uniform-input:not(:focus):invalid {
  color: #999 !important;
}

.uniform-input:valid {
  color: #333 !important;
}

.warning-text {
  font-size: 13px;
  color: #dc3545;
  font-family: 'Inter', sans-serif;
  text-align: center;
  padding: 12px 16px;
  background-color: #fdf2f2;
  border-radius: 8px;
  border-left: 4px solid #dc3545;
  margin: 0;
}

.login-section {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.login-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-link {
  color: #41442A;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.login-link:hover {
  color: #5a5e3d;
  text-decoration: underline;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* MATCH ALL COMPONENTS TO FORMINPUT STYLING */
.form-group {
  width: 100%;
  max-width: 360px;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333;
}

/* Force all inputs to match FormInput style */
.form-group input,
.form-group select,
:deep(.autocomplete-container input),
:deep(.select-dropdown select),
:deep(.password-input-wrapper input) {
  width: 100% !important;
  max-width: 360px !important;
  height: 44px !important;
  padding: 12px !important;
  font-size: 14px !important;
  font-family: 'Inter', sans-serif !important;
  border: 2px solid #41442A !important;
  border-radius: 6px !important;
  background-color: #fcfcf7 !important;
  box-sizing: border-box !important;
  color: #777 !important;
  outline: none !important;
  transition: all 0.2s ease !important;
}

.form-group input:focus,
.form-group select:focus,
:deep(.autocomplete-container input:focus),
:deep(.select-dropdown select:focus),
:deep(.password-input-wrapper input:focus) {
  border-color: #5a5e3d !important;
  box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1) !important;
  color: #333 !important;
}

.form-group input:not(:placeholder-shown),
:deep(.autocomplete-container input:not(:placeholder-shown)),
:deep(.select-dropdown select:valid),
:deep(.password-input-wrapper input:not(:placeholder-shown)) {
  color: #333 !important;
}

/* Force containers to match */
:deep(.autocomplete-container),
:deep(.select-dropdown),
:deep(.password-input-wrapper) {
  width: 100% !important;
  max-width: 360px !important;
}

/* Fix password input padding for icon */
:deep(.password-input-wrapper input) {
  padding-right: 40px !important;
}

/* Fix select dropdown styling */
:deep(.select-dropdown select) {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>') !important;
  background-repeat: no-repeat !important;
  background-position: right 12px center !important;
  background-size: 12px !important;
  padding-right: 40px !important;
}

/* === RESPONSIVE DESIGN === */

/* Tablet */
@media (max-width: 1024px) {
  .branding-section {
    padding: 40px 30px;
  }
  
  .church-name {
    font-size: 32px;
  }
  
  .register-section {
    padding: 30px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .register-page {
    display: block;
    background: #fcfcf7;
  }
  
  .branding-section {
    display: none;
  }
  
  .register-section {
    padding: 24px 16px;
    background: #fcfcf7;
    min-height: 100vh;
  }
  
  .register-container {
    max-width: 360px;
    margin: 0 auto;
  }
  
  .register-title {
    font-size: 20px;
  }
  
  .register-subtitle {
    font-size: 14px;
  }
  
  label {
    font-weight: bold;
  }
  
  /* Mobile uniform styling */
  .uniform-input,
  :deep(.autocomplete-container input),
  :deep(.select-dropdown select),
  :deep(.password-input-wrapper input) {
    height: 44px !important;
    padding: 12px !important;
    border: 2px solid #41442A !important;
    border-radius: 6px !important;
    background-color: #fcfcf7 !important;
    color: #777 !important;
  }
  
  .uniform-input:focus,
  :deep(.autocomplete-container input:focus),
  :deep(.select-dropdown select:focus),
  :deep(.password-input-wrapper input:focus) {
    border-color: #41442A !important;
    box-shadow: none !important;
    color: #333 !important;
  }
  
  .warning-text {
    font-size: 12px;
    padding: 8px;
    border-radius: 4px;
    background-color: #ffebee;
    border-left: 4px solid #d32f2f;
  }
}

/* Small mobile */
@media (max-width: 360px) {
  .register-section {
    padding: 16px 12px;
  }
  
  .register-title {
    font-size: 18px;
  }
  
  .register-subtitle {
    font-size: 13px;
  }
  
  .form-wrapper {
    gap: 18px;
  }
}
</style>