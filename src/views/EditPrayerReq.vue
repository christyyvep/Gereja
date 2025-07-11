<!-- src/views/EditPrayerReq.vue - EDIT PRAYER REQUEST PAGE -->
<template>
  <div class="edit-prayer-container">
    <div class="edit-prayer-wrapper">
      <!-- Header dengan tombol back -->
      <HeaderWithBack title="Edit Permintaan Doa" />

      <!-- Loading state while fetching prayer data -->
      <div v-if="loadingPrayer" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Memuat data permintaan doa...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="fetchError" class="error-container">
        <div class="error-icon">😞</div>
        <h3>Terjadi Kesalahan</h3>
        <p class="error-text">{{ fetchError }}</p>
        <ButtonPrimary @click="fetchPrayerData">Coba Lagi</ButtonPrimary>
      </div>

      <!-- Form container -->
      <div v-else class="form-container">
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
              :loading="isSubmitting"
              :disabled="!canSubmit"
              :fullWidth="true"
            >
              <template v-if="!isSubmitting">
                <Save class="btn-icon" />
                Simpan Perubahan
              </template>
              <template v-else>
                Menyimpan...
              </template>
            </ButtonPrimary>
          </div>
        </form>
      </div>

      <!-- ⭐ SUCCESS POPUP setelah berhasil edit -->
      <div v-if="showSuccessPopup" class="success-overlay">
        <div class="success-popup">
          <div class="success-icon">
            <CheckCircle class="check-circle" />
          </div>
          
          <h3>Berhasil Diperbarui!</h3>
          
          <div class="success-summary">
            <div class="summary-item">
              <span class="summary-label">Kategori:</span>
              <span class="summary-value">{{ getCategoryLabel() }}</span>
            </div>
            
            <div v-if="formData.isAnonymous" class="summary-item">
              <span class="summary-status anonymous">Mode Anonim</span>
            </div>
            
            <div v-if="formData.isUrgent" class="summary-item">
              <span class="summary-status urgent">Mendesak</span>
            </div>
          </div>
          
          <p class="success-message">
            {{ getSuccessMessage() }}
          </p>
          
          <div class="success-actions">
            <ButtonPrimary @click="goToPrayerRequestPage" :fullWidth="true">
              <ArrowLeft class="btn-icon" />
              Kembali ke Daftar Doa
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import SelectDropdown from '@/components/common/SelectDropdown.vue'
import { EyeOff, Check, Save, CheckCircle, ArrowLeft } from 'lucide-vue-next'
import { updatePrayerRequest, getPrayerRequestById, getPrayerCategories } from '@/services/prayerRequests.js'
import { useUserStore } from '@/stores/userStore.js'

export default {
  name: 'EditPrayerReq',
  components: {
    HeaderWithBack,
    ButtonPrimary,
    SelectDropdown,
    EyeOff,
    Check,
    Save,
    CheckCircle,
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
      
      // Loading states
      loadingPrayer: true,
      isSubmitting: false,
      fetchError: null,
      
      // Prayer data
      originalPrayer: null,
      
      // Categories
      categories: getPrayerCategories(),

      // Success popup state
      showSuccessPopup: false
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
        !this.isSubmitting &&
        this.hasChanges()
      )
    },

    prayerId() {
      return this.$route.params.id
    }
  },

  async created() {
    await this.fetchPrayerData()
  },
  
  methods: {
    // ⭐ FETCH PRAYER DATA untuk editing
    async fetchPrayerData() {
      try {
        this.loadingPrayer = true
        this.fetchError = null
        
        if (!this.prayerId) {
          throw new Error('ID permintaan doa tidak valid')
        }
        
        console.log('🔍 [EditPrayer] Fetching prayer data for ID:', this.prayerId)
        
        // ⭐ FETCH: Get prayer data by ID
        const prayerData = await getPrayerRequestById(this.prayerId)
        
        if (!prayerData) {
          throw new Error('Permintaan doa tidak ditemukan')
        }
        
        // ⭐ POPULATE FORM dengan data existing
        this.originalPrayer = prayerData
        this.formData = {
          category: prayerData.category || '',
          prayerText: prayerData.description || '',
          isAnonymous: Boolean(prayerData.isAnonymous),
          isUrgent: Boolean(prayerData.isUrgent)
        }
        
        console.log('✅ [EditPrayer] Prayer data loaded:', prayerData)
        
      } catch (error) {
        console.error('❌ [EditPrayer] Error fetching prayer data:', error)
        this.fetchError = error.message
      } finally {
        this.loadingPrayer = false
      }
    },

    // ⭐ CHECK if form has changes
    hasChanges() {
      if (!this.originalPrayer) return false
      
      return (
        this.formData.category !== this.originalPrayer.category ||
        this.formData.prayerText !== this.originalPrayer.description ||
        this.formData.isAnonymous !== Boolean(this.originalPrayer.isAnonymous) ||
        this.formData.isUrgent !== Boolean(this.originalPrayer.isUrgent)
      )
    },

    async submitPrayerRequest() {
      try {
        if (!this.validateForm()) {
          return
        }
        
        this.isSubmitting = true
        this.clearErrors()
        
        console.log('💾 [EditPrayer] Updating prayer request...')
        
        // ⭐ UPDATE: Submit updated prayer request
        await updatePrayerRequest(this.prayerId, this.formData)
        
        console.log('✅ [EditPrayer] Prayer request updated successfully')
        
        // ⭐ SHOW success popup
        this.showSuccessPopup = true
        
      } catch (error) {
        console.error('❌ [EditPrayer] Error updating prayer request:', error)
        this.handleSubmissionError(error)
      } finally {
        this.isSubmitting = false
      }
    },

    // ⭐ VALIDATION
    validateForm() {
      this.clearErrors()
      let isValid = true
      
      if (!this.formData.category.trim()) {
        this.errors.category = 'Kategori harus dipilih'
        isValid = false
      }
      
      if (!this.formData.prayerText.trim()) {
        this.errors.prayerText = 'Permintaan doa tidak boleh kosong'
        isValid = false
      } else if (this.formData.prayerText.length > 1000) {
        this.errors.prayerText = 'Permintaan doa maksimal 1000 karakter'
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
        alert('❌ Gagal memperbarui permintaan doa!\n\nError: ' + error.message)
      }
    },

    // ⭐ SUCCESS FUNCTIONS
    getSuccessMessage() {
      const anonymousText = this.formData.isAnonymous ? ' secara anonim' : ''
      const urgentText = this.formData.isUrgent ? ' dan ditandai sebagai mendesak' : ''
      
      return `Permintaan doa Anda telah berhasil diperbarui${anonymousText}${urgentText}. Perubahan sudah tersimpan.`
    },

    getCategoryLabel() {
      const category = this.categories.find(cat => cat.value === this.formData.category)
      return category ? `${category.icon} ${category.label}` : 'Lainnya'
    },

    goToPrayerRequestPage() {
      this.$router.push('/prayer-request')
    }
  }
}
</script>

<style scoped>
/* ⭐ SAMA SEPERTI AddPrayerReq.vue - CONSISTENT STYLING */
.edit-prayer-container {
  background: #fcfcf7;
  min-height: 100vh;
}

.edit-prayer-wrapper {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 16px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #41442A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  font-family: 'Inter';
  color: #666;
  margin: 0;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 16px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
}

.error-container h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.error-text {
  color: #d32f2f;
  font-family: 'Inter';
  font-size: 14px;
  margin: 0;
}

/* Form Styles */
.form-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.prayer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  color: #41442A;
  margin-bottom: 4px;
}

.required {
  color: #dc2626;
}

/* Toggle Section */
.toggle-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.toggle-info {
  flex: 1;
}

.toggle-label {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  color: #41442A;
  margin-bottom: 4px;
  display: block;
}

.toggle-desc {
  font-family: 'Inter';
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: #ccc;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-input:checked + .toggle-switch {
  background: #41442A;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-switch .toggle-slider {
  transform: translateX(20px);
}

.anonymous-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 8px;
  font-family: 'Inter';
  font-size: 13px;
  color: #6b7280;
}

.anonymous-icon {
  width: 16px;
  height: 16px;
}

/* Textarea */
.prayer-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  font-family: 'Inter';
  font-size: 14px;
  line-height: 1.5;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.prayer-textarea:focus {
  outline: none;
  border-color: #41442A;
}

.prayer-textarea.error {
  border-color: #dc2626;
}

.char-counter {
  text-align: right;
  font-family: 'Inter';
  font-size: 12px;
  color: #6b7280;
}

.char-counter .warning {
  color: #f59e0b;
}

.char-counter .error {
  color: #dc2626;
}

.error-text {
  color: #dc2626;
  font-family: 'Inter';
  font-size: 12px;
  margin: 0;
}

/* Checkbox */
.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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
  color: #41442A;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  border: 2px solid #41442A;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 2px;
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
  line-height: 1.4;
}

/* Submit Section */
.submit-section {
  margin-top: 8px;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* Success Popup */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.success-popup {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  max-width: 320px;
  width: 100%;
  text-align: center;
  animation: successSlideIn 0.4s ease;
}

@keyframes successSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.check-circle {
  width: 64px;
  height: 64px;
  color: #22c55e;
}

.success-popup h3 {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 700;
  color: #41442A;
  margin: 0 0 16px 0;
}

.success-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8faf9;
  border-radius: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-family: 'Inter';
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-family: 'Inter';
  font-size: 13px;
  color: #41442A;
  font-weight: 600;
}

.summary-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Inter';
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.summary-status.anonymous {
  background: #f3f4f6;
  color: #6b7280;
}

.summary-status.urgent {
  background: #fef2f2;
  color: #dc2626;
}

.success-message {
  font-family: 'Inter';
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Responsive */
@media (max-width: 360px) {
  .edit-prayer-wrapper {
    padding: 12px;
  }
  
  .form-container {
    padding: 16px;
  }
  
  .success-popup {
    padding: 24px 20px;
  }
}
</style>
