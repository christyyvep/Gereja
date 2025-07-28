<!-- CONTOH UPDATE REGISTERPAGE.VUE untuk Enhanced Security -->
<template>
  <div class="register-container">
    <div class="register-form">
      <div class="form-header">
        <h2>Daftar Akun Baru</h2>
        <p>Silakan lengkapi form pendaftaran</p>
      </div>

      <!-- Nama input with autocomplete -->
      <div class="form-group">
        <label for="nama">Nama Lengkap</label>
        <div class="autocomplete-container">
          <input 
            id="nama"
            v-model="nama"
            type="text"
            placeholder="Masukkan nama lengkap"
            :disabled="isLoading"
            @input="handleNamaInput"
            @keyup.enter="focusNextField"
            autocomplete="off"
          />
          
          <!-- Autocomplete suggestions -->
          <div v-if="suggestions.length > 0" class="suggestions-list">
            <div 
              v-for="suggestion in suggestions" 
              :key="suggestion.id"
              @click="selectSuggestion(suggestion)"
              class="suggestion-item"
            >
              <span class="suggestion-name">{{ suggestion.nama }}</span>
              <span class="suggestion-sektor">{{ suggestion.sektor }}</span>
            </div>
          </div>
        </div>
        
        <!-- Validation message -->
        <div v-if="namaValidation.message" :class="namaValidationClass">
          <i :class="namaValidation.isValid ? 'lucide-check' : 'lucide-x'"></i>
          {{ namaValidation.message }}
        </div>
      </div>

      <!-- Email input -->
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          v-model="email"
          type="email"
          placeholder="contoh@email.com"
          :disabled="isLoading"
          @blur="validateEmail"
          @keyup.enter="focusNextField"
        />
        
        <div v-if="emailValidation.message" :class="emailValidationClass">
          <i :class="emailValidation.isValid ? 'lucide-check' : 'lucide-x'"></i>
          {{ emailValidation.message }}
        </div>
      </div>

      <!-- Password input with strength indicator -->
      <div class="form-group">
        <label for="password">Password</label>
        <div class="password-container">
          <div class="password-input">
            <input 
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimal 8 karakter"
              :disabled="isLoading"
              @input="checkPasswordStrength"
              @keyup.enter="focusNextField"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="toggle-password"
            >
              <i :class="showPassword ? 'lucide-eye-off' : 'lucide-eye'"></i>
            </button>
          </div>
          
          <!-- Password strength indicator -->
          <div v-if="password" class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill"
                :class="strengthClass"
                :style="{ width: strengthWidth }"
              ></div>
            </div>
            <div class="strength-text">
              <span :class="strengthTextClass">
                Kekuatan: {{ passwordStrength.strength }}
              </span>
            </div>
            
            <!-- Password requirements -->
            <div class="password-requirements">
              <div 
                v-for="requirement in passwordRequirements" 
                :key="requirement.text"
                :class="requirement.met ? 'requirement-met' : 'requirement-unmet'"
              >
                <i :class="requirement.met ? 'lucide-check' : 'lucide-x'"></i>
                {{ requirement.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm password -->
      <div class="form-group">
        <label for="confirmPassword">Konfirmasi Password</label>
        <input 
          id="confirmPassword"
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="Masukkan ulang password"
          :disabled="isLoading"
          @keyup.enter="handleRegister"
        />
        <button 
          type="button" 
          @click="showConfirmPassword = !showConfirmPassword"
          class="toggle-password"
        >
          <i :class="showConfirmPassword ? 'lucide-eye-off' : 'lucide-eye'"></i>
        </button>
        
        <div v-if="passwordMatch.message" :class="passwordMatchClass">
          <i :class="passwordMatch.isMatch ? 'lucide-check' : 'lucide-x'"></i>
          {{ passwordMatch.message }}
        </div>
      </div>

      <!-- Terms agreement -->
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            v-model="agreeTerms"
            type="checkbox"
            :disabled="isLoading"
          />
          <span class="checkmark"></span>
          Saya setuju dengan 
          <a href="#" @click.prevent="showTerms = true">Syarat & Ketentuan</a>
        </label>
      </div>

      <!-- Security info -->
      <div class="security-info">
        <i class="lucide-shield-check"></i>
        <div>
          <strong>Data Anda Aman</strong>
          <p>Password dienkripsi dengan bcrypt dan disimpan dengan keamanan tingkat enterprise.</p>
        </div>
      </div>

      <!-- Register button -->
      <button 
        @click="handleRegister"
        :disabled="!isFormValid || isLoading"
        class="register-button"
      >
        <i v-if="isLoading" class="lucide-loader-2 animate-spin"></i>
        <i v-else class="lucide-user-plus"></i>
        {{ isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang' }}
      </button>

      <!-- Login link -->
      <div class="login-link">
        <p>Sudah punya akun? 
          <router-link to="/">Login di sini</router-link>
        </p>
      </div>
    </div>

    <!-- Terms modal -->
    <div v-if="showTerms" class="modal-overlay" @click="showTerms = false">
      <div class="modal-content" @click.stop>
        <h3>Syarat & Ketentuan</h3>
        <div class="terms-content">
          <p>Dengan mendaftar, Anda menyetujui:</p>
          <ul>
            <li>Penggunaan aplikasi MyRajawali sesuai tujuan</li>
            <li>Menjaga kerahasiaan akun dan password</li>
            <li>Tidak menyalahgunakan fitur aplikasi</li>
            <li>Mengikuti panduan komunitas gereja</li>
          </ul>
        </div>
        <button @click="showTerms = false" class="close-modal">
          Tutup
        </button>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="lucide-loader-2 animate-spin"></i>
        <p>Membuat akun baru...</p>
        <small>Mohon tunggu, sedang memverifikasi data</small>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'

// UPDATED: Import enhanced services
import { 
  registerUser, 
  getAllJemaatNames,
  validatePassword,
  checkPasswordStrength,
  logSecurityEvent 
} from '../services/auth-enhanced'

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const { showToast } = useToast()

    // Form state
    const nama = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const agreeTerms = ref(false)
    const isLoading = ref(false)
    const showTerms = ref(false)

    // Validation state
    const namaValidation = ref({ isValid: false, message: '' })
    const emailValidation = ref({ isValid: false, message: '' })
    const passwordStrength = ref({ score: 0, strength: '', feedback: [] })

    // Autocomplete
    const allJemaatNames = ref([])
    const suggestions = ref([])

    // Computed properties
    const isFormValid = computed(() => {
      return namaValidation.value.isValid &&
             emailValidation.value.isValid &&
             passwordStrength.value.score >= 3 &&
             passwordMatch.value.isMatch &&
             agreeTerms.value
    })

    const namaValidationClass = computed(() => ({
      'validation-message': true,
      'validation-success': namaValidation.value.isValid,
      'validation-error': !namaValidation.value.isValid && namaValidation.value.message
    }))

    const emailValidationClass = computed(() => ({
      'validation-message': true,
      'validation-success': emailValidation.value.isValid,
      'validation-error': !emailValidation.value.isValid && emailValidation.value.message
    }))

    const passwordMatch = computed(() => {
      if (!confirmPassword.value) return { isMatch: false, message: '' }
      
      if (password.value === confirmPassword.value) {
        return { isMatch: true, message: 'Password cocok' }
      } else {
        return { isMatch: false, message: 'Password tidak cocok' }
      }
    })

    const passwordMatchClass = computed(() => ({
      'validation-message': true,
      'validation-success': passwordMatch.value.isMatch,
      'validation-error': !passwordMatch.value.isMatch && passwordMatch.value.message
    }))

    const strengthClass = computed(() => {
      const score = passwordStrength.value.score
      if (score < 2) return 'strength-weak'
      if (score < 4) return 'strength-medium'
      if (score < 6) return 'strength-good'
      return 'strength-strong'
    })

    const strengthWidth = computed(() => {
      return `${(passwordStrength.value.score / 8) * 100}%`
    })

    const strengthTextClass = computed(() => {
      const score = passwordStrength.value.score
      if (score < 2) return 'text-red-600'
      if (score < 4) return 'text-yellow-600'
      if (score < 6) return 'text-blue-600'
      return 'text-green-600'
    })

    const passwordRequirements = computed(() => {
      const pwd = password.value
      return [
        { text: 'Minimal 8 karakter', met: pwd.length >= 8 },
        { text: 'Mengandung huruf besar', met: /[A-Z]/.test(pwd) },
        { text: 'Mengandung huruf kecil', met: /[a-z]/.test(pwd) },
        { text: 'Mengandung angka', met: /\d/.test(pwd) }
      ]
    })

    // Methods
    const loadJemaatNames = async () => {
      try {
        allJemaatNames.value = await getAllJemaatNames()
      } catch (error) {
        console.error('Error loading jemaat names:', error)
      }
    }

    const handleNamaInput = () => {
      const input = nama.value.toLowerCase().trim()
      
      if (input.length < 2) {
        suggestions.value = []
        namaValidation.value = { isValid: false, message: '' }
        return
      }

      // Filter suggestions
      suggestions.value = allJemaatNames.value
        .filter(jemaat => 
          jemaat.nama.toLowerCase().includes(input) && 
          !jemaat.isRegistered
        )
        .slice(0, 5)

      // Validate nama
      validateNama()
    }

    const validateNama = () => {
      if (!nama.value.trim()) {
        namaValidation.value = { isValid: false, message: '' }
        return
      }

      const foundJemaat = allJemaatNames.value.find(
        jemaat => jemaat.nama.toLowerCase() === nama.value.toLowerCase().trim()
      )

      if (!foundJemaat) {
        namaValidation.value = { 
          isValid: false, 
          message: 'Nama tidak terdaftar dalam database jemaat' 
        }
      } else if (foundJemaat.isRegistered) {
        namaValidation.value = { 
          isValid: false, 
          message: 'Nama ini sudah terdaftar' 
        }
      } else {
        namaValidation.value = { 
          isValid: true, 
          message: `Ditemukan: ${foundJemaat.nama} (${foundJemaat.sektor || 'No sektor'})` 
        }
      }
    }

    const selectSuggestion = (suggestion) => {
      nama.value = suggestion.nama
      suggestions.value = []
      validateNama()
      
      // Focus next field
      setTimeout(() => {
        document.getElementById('email')?.focus()
      }, 100)
    }

    const validateEmail = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      if (!email.value.trim()) {
        emailValidation.value = { isValid: false, message: '' }
        return
      }

      if (!emailRegex.test(email.value)) {
        emailValidation.value = { 
          isValid: false, 
          message: 'Format email tidak valid' 
        }
      } else {
        emailValidation.value = { 
          isValid: true, 
          message: 'Email valid' 
        }
      }
    }

    const checkPasswordStrength = () => {
      if (!password.value) {
        passwordStrength.value = { score: 0, strength: '', feedback: [] }
        return
      }

      passwordStrength.value = checkPasswordStrength(password.value)
    }

    const focusNextField = (event) => {
      const current = event.target
      const form = current.closest('.register-form')
      const inputs = Array.from(form.querySelectorAll('input'))
      const currentIndex = inputs.indexOf(current)
      
      if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus()
      }
    }

    const handleRegister = async () => {
      if (!isFormValid.value || isLoading.value) return

      try {
        isLoading.value = true
        
        // Additional password validation
        const passwordValidationResult = validatePassword(password.value)
        if (!passwordValidationResult.isValid) {
          showToast(passwordValidationResult.errors.join(', '), 'error')
          return
        }

        // Prepare user data
        const userData = {
          nama: nama.value.trim(),
          email: email.value.toLowerCase().trim(),
          password: password.value
        }

        // Register user with enhanced security
        const result = await registerUser(userData)
        
        if (result.success) {
          showToast('Registrasi berhasil! Silakan login.', 'success')
          
          // Log success
          logSecurityEvent('registration_completed', {
            nama: userData.nama,
            email: userData.email
          })
          
          // Redirect to success page or login
          router.push('/success-register')
        }
        
      } catch (error) {
        console.error('Registration error:', error)
        
        let errorMessage = 'Registrasi gagal. Silakan coba lagi.'
        
        if (error.message.includes('sudah terdaftar')) {
          errorMessage = 'Akun dengan data ini sudah terdaftar'
        } else if (error.message.includes('tidak ditemukan')) {
          errorMessage = 'Nama tidak ditemukan dalam database jemaat'
        } else if (error.message.includes('Password minimal')) {
          errorMessage = error.message
        }
        
        showToast(errorMessage, 'error')
        
      } finally {
        isLoading.value = false
      }
    }

    // Lifecycle
    onMounted(() => {
      loadJemaatNames()
      
      // Focus first input
      setTimeout(() => {
        document.getElementById('nama')?.focus()
      }, 100)
      
      // Log page visit
      logSecurityEvent('register_page_visited')
    })

    // Watch for nama changes to clear suggestions when clicked outside
    watch(nama, (newVal) => {
      if (!newVal) {
        suggestions.value = []
      }
    })

    return {
      // Form data
      nama,
      email,
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      agreeTerms,
      isLoading,
      showTerms,
      
      // Validation
      namaValidation,
      emailValidation,
      passwordStrength,
      passwordMatch,
      
      // Autocomplete
      suggestions,
      
      // Computed
      isFormValid,
      namaValidationClass,
      emailValidationClass,
      passwordMatchClass,
      strengthClass,
      strengthWidth,
      strengthTextClass,
      passwordRequirements,
      
      // Methods
      handleNamaInput,
      selectSuggestion,
      validateEmail,
      checkPasswordStrength,
      focusNextField,
      handleRegister
    }
  }
}
</script>

<style scoped>
/* ... Same styles as LoginPage with additional register-specific styles ... */

.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-form {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.autocomplete-container {
  position: relative;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-item:hover {
  background: #f9fafb;
}

.suggestion-name {
  font-weight: 600;
  color: #1f2937;
}

.suggestion-sektor {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-weak { background: #ef4444; }
.strength-medium { background: #f59e0b; }
.strength-good { background: #3b82f6; }
.strength-strong { background: #10b981; }

.password-requirements {
  font-size: 12px;
  margin-top: 8px;
}

.requirement-met {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.requirement-unmet {
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.validation-message {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.validation-success {
  color: #10b981;
}

.validation-error {
  color: #ef4444;
}

.security-info {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.security-info i {
  color: #0ea5e9;
  font-size: 20px;
  margin-top: 2px;
}

.security-info strong {
  color: #0c4a6e;
  display: block;
  margin-bottom: 4px;
}

.security-info p {
  color: #075985;
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.terms-content {
  margin: 16px 0;
}

.terms-content ul {
  padding-left: 20px;
}

.terms-content li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.close-modal {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .register-form {
    padding: 24px;
    margin: 16px;
  }
  
  .suggestion-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
