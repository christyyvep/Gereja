<!-- src/views/AddPrayerRequestPage.vue - WITH SUCCESS POPUP -->
<template>
  <div class="add-prayer-container">
    <div class="add-prayer-wrapper">
      <!-- Header dengan tombol back -->
      <HeaderWithBack title="Permintaan Doa Baru" />

      <!-- Form container -->
      <div class="form-container">

        <!-- Form fields -->
        <form @submit.prevent="submitPrayerRequest" class="prayer-form">
          
          <!-- Kategori dropdown -->
          <SelectDropdown
            id="prayer-category"
            label="Kategori"
            placeholder="Pilih kategori permintaan doa"
            v-model="formData.category"
            :options="categoryOptions"
            :error="errors.category"
            :required="true"
          />

          <!-- Toggle mode anonim -->
          <div class="form-group">
            <div class="toggle-section">
              <div class="toggle-info">
                <label class="toggle-label">Mode Anonim</label>
                <p class="toggle-desc">
                  Sembunyikan identitas Anda dalam permintaan doa ini
                </p>
              </div>
              
              <div class="toggle-container">
                <input 
                  type="checkbox" 
                  id="anonymous-toggle"
                  v-model="formData.isAnonymous"
                  class="toggle-input"
                />
                <label for="anonymous-toggle" class="toggle-switch">
                  <div class="toggle-slider"></div>
                </label>
              </div>
            </div>
            
            <!-- Anonymous info -->
            <div v-if="formData.isAnonymous" class="anonymous-info">
              <EyeOff class="anonymous-icon" />
              <span>Permintaan ini akan ditampilkan sebagai "Anonim"</span>
            </div>
          </div>

          <!-- Textarea permintaan doa -->
          <div class="form-group">
            <label for="prayer-text" class="form-label">
              Permintaan Doa <span class="required">*</span>
            </label>
            <textarea
              id="prayer-text"
              v-model="formData.prayerText"
              placeholder="Tulis permintaan doa Anda di sini..."
              class="prayer-textarea"
              :class="{ 'error': errors.prayerText }"
              rows="6"
              maxlength="1000"
            ></textarea>
            
            <!-- Character counter -->
            <div class="char-counter">
              <span :class="{ 'warning': charCount > 900, 'error': charCount > 1000 }">
                {{ charCount }}/1000 karakter
              </span>
            </div>
            
            <!-- Error message -->
            <p v-if="errors.prayerText" class="error-text">{{ errors.prayerText }}</p>
          </div>

          <!-- Checkbox urgent (optional) -->
          <div class="form-group">
            <div class="checkbox-container">
              <input 
                type="checkbox" 
                id="urgent-prayer"
                v-model="formData.isUrgent"
                class="checkbox-input"
              />
              <label for="urgent-prayer" class="checkbox-label">
                <div class="checkbox-box">
                  <Check v-if="formData.isUrgent" class="check-icon" />
                </div>
                <span class="checkbox-text">Ini adalah permintaan doa yang mendesak</span>
              </label>
            </div>
          </div>

          <!-- Submit button -->
          <div class="submit-section">
            <ButtonPrimary 
              type="submit" 
              :disabled="!canSubmit || isSubmitting"
              :loading="isSubmitting"
            >
              <Send class="btn-icon" />
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Permintaan Doa' }}
            </ButtonPrimary>
          </div>

        </form>
      </div>
    </div>

    <!-- ⭐ SUCCESS POPUP MODAL -->
    <div v-if="showSuccessPopup" class="success-overlay" @click="closeSuccessPopup">
      <div class="success-modal" @click.stop>
        <!-- Success Icon -->
        <div class="success-icon-container">
          <div class="success-icon">
            <Check class="check-mark" />
          </div>
        </div>

        <!-- Success Content -->
        <div class="success-content">
          <h2 class="success-title">Permintaan Doa Terkirim! 🙏</h2>
          <p class="success-message">
            {{ getSuccessMessage() }}
          </p>
          
          <!-- Prayer Info -->
          <div class="prayer-info">
            <div class="info-item">
              <span class="info-label">Kategori:</span>
              <span class="info-value">{{ getCategoryLabel() }}</span>
            </div>
            <div v-if="formData.isAnonymous" class="info-item">
              <EyeOff class="info-icon" />
              <span class="info-value">Dikirim sebagai Anonim</span>
            </div>
            <div v-if="formData.isUrgent" class="info-item">
              <Zap class="info-icon urgent" />
              <span class="info-value">Ditandai sebagai Mendesak</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="success-actions">
          <ButtonPrimary @click="goToPrayerRequestPage" :fullWidth="true">
            <ArrowLeft class="btn-icon" />
            Kembali ke Daftar Doa
          </ButtonPrimary>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import SelectDropdown from '@/components/common/SelectDropdown.vue'
import { EyeOff, Check, Send, Zap, ArrowLeft } from 'lucide-vue-next'
import { addPrayerRequest, getPrayerCategories } from '@/services/prayerRequests.js'
import { useUserStore } from '@/stores/userStore.js'

export default {
  name: 'AddPrayerReq',
  components: {
    HeaderWithBack,
    ButtonPrimary,
    SelectDropdown,
    EyeOff,
    Check,
    Send,
    Zap,
    ArrowLeft
  },
  
  data() {
    return {
      formData: {
        category: '',
        prayerText: '',
        isAnonymous: false,
        isUrgent: false
      },
      
      errors: {
        category: '',
        prayerText: ''
      },
      
      isSubmitting: false,
      categories: getPrayerCategories(),

      // ⭐ NEW: Success popup state
      showSuccessPopup: false,
      submittedPrayerId: null
    }
  },
  
  computed: {
    userStore() {
      return useUserStore()
    },
    
    categoryOptions() {
      return this.categories.map(cat => ({
        value: cat.value,
        label: `${cat.icon} ${cat.label}`
      }))
    },
    
    charCount() {
      return this.formData.prayerText.length
    },
    
    canSubmit() {
      return (
        this.formData.category.trim() !== '' &&
        this.formData.prayerText.trim() !== '' &&
        this.formData.prayerText.length <= 1000 &&
        !this.isSubmitting
      )
    }
  },
  
  methods: {
    async submitPrayerRequest() {
      try {
        if (!this.validateForm()) {
          return
        }
        
        this.isSubmitting = true
        this.clearErrors()
        
        console.log('🙏 [AddPrayer] Submitting prayer request...')
        
        // Get current user data
        const userData = this.userStore.user
        if (!userData) {
          throw new Error('User tidak ditemukan. Silakan login ulang.')
        }
        
        // Submit prayer request
        const prayerId = await addPrayerRequest(this.formData, userData)
        
        console.log('✅ [AddPrayer] Prayer request submitted successfully:', prayerId)
        
        // ⭐ SAVE prayer ID and show success popup
        this.submittedPrayerId = prayerId
        this.showSuccessPopup = true
        
      } catch (error) {
        console.error('❌ [AddPrayer] Error submitting prayer request:', error)
        this.handleSubmissionError(error)
      } finally {
        this.isSubmitting = false
      }
    },

    // ⭐ NEW: Get success message berdasarkan kondisi
    getSuccessMessage() {
      const anonymousText = this.formData.isAnonymous ? ' secara anonim' : ''
      const urgentText = this.formData.isUrgent ? ' dan telah ditandai sebagai mendesak' : ''
      
      return `Permintaan doa Anda telah berhasil dikirim${anonymousText}${urgentText}. Jemaat akan mendoakan Anda. Terima kasih telah berbagi pergumulan.`
    },

    // ⭐ NEW: Get category label
    getCategoryLabel() {
      const category = this.categories.find(cat => cat.value === this.formData.category)
      return category ? `${category.icon} ${category.label}` : 'Lainnya'
    },

    // ⭐ NEW: Close success popup
    closeSuccessPopup() {
      this.showSuccessPopup = false
      
      // ⭐ AUTO REDIRECT setelah popup ditutup
      setTimeout(() => {
        this.goToPrayerRequestPage()
      }, 300) // Small delay untuk smooth transition
    },

    // ⭐ NEW: Go to prayer request page
    goToPrayerRequestPage() {
      console.log('🚀 [AddPrayer] Redirecting to prayer request page...')
      this.$router.push('/prayer-request')
    },
    
    validateForm() {
      this.clearErrors()
      let isValid = true
      
      // Validate category
      if (!this.formData.category || this.formData.category.trim() === '') {
        this.errors.category = 'Kategori harus dipilih'
        isValid = false
      }
      
      // Validate prayer text
      if (!this.formData.prayerText || this.formData.prayerText.trim() === '') {
        this.errors.prayerText = 'Permintaan doa harus diisi'
        isValid = false
      } else if (this.formData.prayerText.length > 1000) {
        this.errors.prayerText = 'Permintaan doa maksimal 1000 karakter'
        isValid = false
      } else if (this.formData.prayerText.trim().length < 10) {
        this.errors.prayerText = 'Permintaan doa minimal 10 karakter'
        isValid = false
      }
      
      return isValid
    },
    
    clearErrors() {
      this.errors = {
        category: '',
        prayerText: ''
      }
    },
    
    handleSubmissionError(error) {
      if (error.message.includes('Kategori')) {
        this.errors.category = error.message
      } else if (error.message.includes('Permintaan doa') || error.message.includes('karakter')) {
        this.errors.prayerText = error.message
      } else {
        // General error with alert fallback
        alert('❌ Gagal mengirim permintaan doa!\n\nError: ' + error.message)
      }
    }
  }
}
</script>

<style scoped>
.add-prayer-container {
  background: #fcfcf7;
  min-height: 100vh;
}

.add-prayer-wrapper {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* Form container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.banner-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.banner-text h3 {
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.banner-text p {
  font-family: 'Inter';
  font-size: 13px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.3;
}

/* Form */
.prayer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #dc3545;
}

/* Toggle section */
.toggle-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.toggle-info {
  flex: 1;
  margin-right: 16px;
}

.toggle-label {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.toggle-desc {
  font-family: 'Inter';
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.3;
}

/* Toggle switch */
.toggle-container {
  position: relative;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  display: block;
  width: 44px;
  height: 24px;
  background: #ccc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.toggle-input:checked + .toggle-switch {
  background: #41442A;
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-switch .toggle-slider {
  transform: translateX(20px);
}

/* Anonymous info */
.anonymous-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  font-family: 'Inter';
  font-size: 12px;
  color: #666;
}

.anonymous-icon {
  width: 14px;
  height: 14px;
}

/* Textarea */
.prayer-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  font-family: 'Inter';
  font-size: 14px;
  border: 2px solid #41442A;
  border-radius: 8px;
  background: white;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.5;
  transition: border-color 0.2s ease;
}

.prayer-textarea:focus {
  outline: none;
  border-color: #5a5e3d;
  box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1);
}

.prayer-textarea.error {
  border-color: #dc3545;
}

.prayer-textarea::placeholder {
  color: #aaa;
}

/* Character counter */
.char-counter {
  text-align: right;
  margin-top: 6px;
}

.char-counter span {
  font-family: 'Inter';
  font-size: 12px;
  color: #666;
}

.char-counter .warning {
  color: #ff9800;
}

.char-counter .error {
  color: #dc3545;
  font-weight: 600;
}

/* Checkbox */
.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.checkbox-input {
  display: none;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-family: 'Inter';
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  border: 2px solid #41442A;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 1px;
}

.checkbox-input:checked + .checkbox-label .checkbox-box {
  background: #41442A;
  border-color: #41442A;
}

.check-icon {
  width: 12px;
  height: 12px;
  color: white;
}

.checkbox-text {
  font-weight: 500;
}

/* Submit section */
.submit-section {
  margin-top: 20px;
}

.btn-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

/* Error text */
.error-text {
  color: #dc3545;
  font-family: 'Inter';
  font-size: 12px;
  margin-top: 6px;
  margin-bottom: 0;
}

/* ⭐ SUCCESS POPUP STYLES */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.success-modal {
  background: white;
  border-radius: 20px;
  padding: 32px 24px 24px 24px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideInScale 0.4s ease;
}

@keyframes slideInScale {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Success Icon */
.success-icon-container {
  margin-bottom: 20px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: successPulse 0.6s ease;
}

@keyframes successPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.check-mark {
  width: 40px;
  height: 40px;
  color: white;
  stroke-width: 3;
}

/* Success Content */
.success-content {
  margin-bottom: 24px;
}

.success-title {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 700;
  color: #16a34a;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.success-message {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

/* Prayer Info */
.prayer-info {
  background: #f8faf9;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-family: 'Inter';
  font-size: 13px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: #374151;
  min-width: 60px;
}

.info-value {
  color: #16a34a;
  font-weight: 500;
}

.info-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.info-icon.urgent {
  color: #f59e0b;
}

/* Success Actions */
.success-actions {
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 360px) {
  .add-prayer-wrapper {
    padding: 12px;
    padding-bottom: 40px;
  }
  
  .info-banner {
    padding: 16px;
  }
  
  .banner-text h3 {
    font-size: 15px;
  }
  
  .banner-text p {
    font-size: 12px;
  }
  
  .toggle-section,
  .checkbox-container {
    padding: 14px;
  }
  
  .prayer-textarea {
    min-height: 100px;
  }

  .success-modal {
    padding: 24px 20px 20px 20px;
    margin: 10px;
  }

  .success-icon {
    width: 70px;
    height: 70px;
  }

  .check-mark {
    width: 35px;
    height: 35px;
  }

  .success-title {
    font-size: 18px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .toggle-switch,
  .toggle-slider,
  .checkbox-box,
  .prayer-textarea,
  .success-overlay,
  .success-modal,
  .success-icon {
    transition: none;
    animation: none;
  }
}
</style>