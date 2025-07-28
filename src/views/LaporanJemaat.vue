<!-- src/views/LaporanJemaat.vue -->
<template>
  <div class="laporan-jemaat-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />

      <!-- Desktop Content -->
      <main class="main-content">
        <!-- Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <div class="page-header">
          <h1 class="page-title">
            <MessageSquare class="title-icon" />
            Laporan & Saran
          </h1>
          <p class="page-subtitle">
            Sampaikan keluhan, saran, atau apresiasi Anda untuk kemajuan gereja
          </p>
        </div>

        <!-- Desktop Form -->
        <div class="desktop-form-container">
          <div class="form-card">
            <form @submit.prevent="submitLaporan" class="laporan-form desktop-form">
              <!-- Form Fields -->
              <div class="form-columns">
                <!-- Left Column: Jenis Laporan -->
                <div class="left-column">
                  <!-- Jenis Laporan -->
                  <SelectDropdown
                    id="jenis-laporan"
                    label="Jenis Laporan"
                    placeholder="Pilih jenis laporan"
                    v-model="form.jenisLaporan"
                    :options="jenisLaporanOptions"
                    :required="true"
                  />

                  <!-- Anonymous Option -->
                  <div class="form-group">
                    <div class="toggle-section">
                      <div class="toggle-info">
                        <label class="toggle-label">Mode Anonim</label>
                        <p class="toggle-desc">
                          Sembunyikan identitas Anda dalam laporan ini
                        </p>
                      </div>
                      
                      <div class="toggle-container">
                        <input 
                          type="checkbox" 
                          id="anonymous-toggle-desktop"
                          v-model="form.isAnonymous"
                          class="toggle-input"
                        />
                        <label for="anonymous-toggle-desktop" class="toggle-switch">
                          <div class="toggle-slider"></div>
                        </label>
                      </div>
                    </div>
                    
                    <!-- Anonymous info -->
                    <div v-if="form.isAnonymous" class="anonymous-info">
                      <EyeOff class="anonymous-icon" />
                      <span>Laporan ini akan ditampilkan sebagai "Anonim"</span>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Isi Laporan -->
                <div class="right-column">
                  <!-- Isi Laporan -->
                  <div class="form-group">
                    <label for="deskripsi-desktop" class="form-label">
                      Isi Laporan <span class="required">*</span>
                    </label>
                    <textarea
                      id="deskripsi-desktop"
                      v-model="form.deskripsi"
                      placeholder="Jelaskan keluhan, saran, atau apresiasi Anda dengan detail..."
                      class="laporan-textarea desktop-textarea"
                      rows="12"
                      maxlength="1000"
                    ></textarea>
                    
                    <!-- Character counter -->
                    <div class="char-counter">
                      <span :class="{ 'warning': charCount > 900, 'error': charCount > 1000 }">
                        {{ charCount }}/1000 karakter
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="form-actions">
                <ButtonPrimary 
                  type="submit" 
                  :disabled="!canSubmit || isSubmitting"
                  :loading="isSubmitting"
                  :fullWidth="false"
                >
                  <Send class="btn-icon" />
                  {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
                </ButtonPrimary>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <div class="laporan-wrapper">
        <!-- Header dengan tombol back -->
        <HeaderWithBack title="Laporan & Saran" />

        <!-- Form container -->
        <div class="form-container">
          <!-- Form fields -->
          <form @submit.prevent="submitLaporan" class="laporan-form mobile-form">

            <!-- Mobile Jenis Laporan -->
            <SelectDropdown
              id="jenis-laporan-mobile"
              label="Jenis Laporan"
              placeholder="Pilih jenis laporan"
              v-model="form.jenisLaporan"
              :options="jenisLaporanOptions"
              :required="true"
            />

            <!-- Mobile Isi Laporan -->
            <div class="form-group">
              <label for="deskripsi-mobile" class="form-label">
                Isi Laporan <span class="required">*</span>
              </label>
              <textarea
                id="deskripsi-mobile"
                v-model="form.deskripsi"
                placeholder="Jelaskan keluhan, saran, atau apresiasi Anda dengan detail..."
                class="laporan-textarea mobile-textarea"
                rows="8"
                maxlength="1000"
              ></textarea>
              
              <!-- Character counter -->
              <div class="char-counter">
                <span :class="{ 'warning': charCount > 900, 'error': charCount > 1000 }">
                  {{ charCount }}/1000 karakter
                </span>
              </div>
            </div>

            <!-- Mobile Anonymous Option -->
            <div class="form-group">
              <div class="toggle-section mobile-toggle">
                <div class="toggle-info">
                  <label class="toggle-label">Mode Anonim</label>
                  <p class="toggle-desc">
                    Sembunyikan identitas Anda dalam laporan ini
                  </p>
                </div>
                
                <div class="toggle-container">
                  <input 
                    type="checkbox" 
                    id="anonymous-toggle-mobile"
                    v-model="form.isAnonymous"
                    class="toggle-input"
                  />
                  <label for="anonymous-toggle-mobile" class="toggle-switch">
                    <div class="toggle-slider"></div>
                  </label>
                </div>
              </div>
              
              <!-- Anonymous info -->
              <div v-if="form.isAnonymous" class="anonymous-info mobile-anonymous">
                <EyeOff class="anonymous-icon" />
                <span>Laporan ini akan ditampilkan sebagai "Anonim"</span>
              </div>
            </div>

            <!-- Mobile Submit Button -->
            <div class="form-actions mobile-actions">
              <ButtonPrimary 
                type="submit" 
                :disabled="!canSubmit || isSubmitting"
                :loading="isSubmitting"
              >
                <Send class="btn-icon" />
                {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
              </ButtonPrimary>
            </div>

          </form>
        </div>
      </div>
    </div>
    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="modal-body">
          <div class="success-icon">
            <CheckCircle class="success-check" />
          </div>
          <h3>Laporan Berhasil Dikirim!</h3>
          <p>Terima kasih atas laporan Anda. Tim admin akan meninjau dan menindaklanjuti laporan ini.</p>
          <ButtonPrimary @click="closeSuccessModal" :fullWidth="false">
            OK
          </ButtonPrimary>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toast } from '@/utils/toast'
import { useUserStore } from '@/stores/userStore'
import { submitLaporan } from '@/services/laporanJemaat'

// Layout Components
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'

// Common Components
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import SelectDropdown from '@/components/common/SelectDropdown.vue'

// Icons
import { MessageSquare, EyeOff, Send, CheckCircle } from 'lucide-vue-next'

export default {
  name: 'LaporanJemaat',
  
  components: {
    DesktopNavbar,
    HeaderWithBack,
    BreadcrumbDesktop,
    ButtonPrimary,
    SelectDropdown,
    MessageSquare,
    EyeOff,
    Send,
    CheckCircle
  },
  
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  
  data() {
    return {
      form: {
        jenisLaporan: '',
        deskripsi: '',
        isAnonymous: false
      },
      isSubmitting: false,
      showSuccessModal: false,
      jenisLaporanOptions: [
        { value: 'keluhan', label: 'Keluhan Pelayanan' },
        { value: 'saran', label: 'Saran Perbaikan' },
        { value: 'pujian', label: 'Pujian dan Apresiasi' },
        { value: 'perbaikan_gereja', label: 'Perbaikan Fasilitas Gereja' },
        { value: 'error_aplikasi', label: 'Error Aplikasi' },
        { value: 'bantuan_teknis', label: 'Bantuan Teknis' },
        { value: 'lainnya', label: 'Lainnya' }
      ],
      breadcrumbItems: [
        { text: 'Laporan & Saran' }
      ]
    }
  },
  
  mounted() {
    console.log('📋 Breadcrumb items:', this.breadcrumbItems)
  },
  
  computed: {
    charCount() {
      return this.form.deskripsi.length
    },
    
    canSubmit() {
      return this.form.jenisLaporan && 
             this.form.deskripsi.trim().length >= 10 &&
             this.form.deskripsi.trim().length <= 1000
    }
  },
  
  methods: {
    async submitLaporan() {
      if (!this.validateForm()) return
      
      try {
        this.isSubmitting = true
        
        console.log('🚀 Submitting laporan...')
        console.log('👤 User data:', this.userStore.user)
        
        // Prepare data with proper null/undefined handling
        const laporanData = {
          jenisLaporan: this.form.jenisLaporan,
          deskripsi: this.form.deskripsi.trim(),
          isAnonymous: this.form.isAnonymous,
          // Handle userId - use nama as primary identifier (sesuai sistem auth MyRajawali)
          userId: this.userStore.user?.nama || this.userStore.user?.id || 'anonymous_' + Date.now(),
          // Handle userName - sesuai sistem custom auth
          userName: this.form.isAnonymous 
            ? 'Anonim' 
            : (this.userStore.user?.nama || 'Unknown User'),
          // System fields
          status: 'pending',
          priority: 'normal'
        }
        
        console.log('📄 Laporan data to submit:', laporanData)
        
        // Extract user ID for activity logging
        const userId = this.userStore.user?.nama || this.userStore.user?.id || 'anonymous_' + Date.now()
        console.log('🔑 User ID for activity logging:', userId)
        
        // Validate that no field is undefined
        const undefinedFields = Object.entries(laporanData)
          .filter(([, value]) => value === undefined)
          .map(([key]) => key)
        
        if (undefinedFields.length > 0) {
          console.error('❌ Found undefined fields:', undefinedFields)
          throw new Error(`Data tidak lengkap. Field kosong: ${undefinedFields.join(', ')}`)
        }
        
        console.log('📤 Calling submitLaporan with user ID:', userId)
        const result = await submitLaporan(laporanData, userId)
        
        if (result.success) {
          console.log('✅ Laporan submitted successfully:', result.id)
          this.showSuccessModal = true
          this.resetForm()
          toast.success('Laporan berhasil dikirim!')
        }
        
      } catch (error) {
        console.error('❌ Error submitting laporan:', error)
        toast.error('Gagal mengirim laporan: ' + error.message)
      } finally {
        this.isSubmitting = false
      }
    },
    
    validateForm() {
      if (!this.form.jenisLaporan) {
        toast.error('Pilih jenis laporan terlebih dahulu')
        return false
      }
      
      if (!this.form.deskripsi.trim()) {
        toast.error('Isi laporan tidak boleh kosong')
        return false
      }
      
      if (this.form.deskripsi.trim().length < 10) {
        toast.error('Isi laporan minimal 10 karakter')
        return false
      }
      
      return true
    },
    
    resetForm() {
      this.form = {
        jenisLaporan: '',
        deskripsi: '',
        isAnonymous: false
      }
    },
    
    closeSuccessModal() {
      this.showSuccessModal = false
    }
  }
}
</script>

<style scoped>
/* ===== MAIN CONTAINER ===== */
.laporan-jemaat-container {
  width: 100%;
  min-height: 100vh;
  background: #fcfcf7; /* Match HomePage background */
}

/* ===== DESKTOP LAYOUT (≥769px) ===== */
.desktop-layout {
  display: none;
}

@media (min-width: 769px) {
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none;
  }
}

/* Desktop Content - Same structure as navbar */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  padding-top: 40px;
  padding-bottom: 40px;
}

/* Page Header - Remove additional constraints */
.page-header {
  margin-bottom: 32px;
}

/* Breadcrumb alignment - Remove additional constraints */
.main-content :deep(.breadcrumb-container) {
  margin-bottom: 24px;
  display: block !important;
  opacity: 1 !important;
}

/* Page Title */
.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: #667eea;
  width: 32px;
  height: 32px;
}

/* Page Subtitle */
.page-subtitle {
  color: #718096;
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

/* Desktop Form Container - Remove width constraints */
.desktop-form-container {
  width: 100%;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  width: 100%;
  box-sizing: border-box;
}

.desktop-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Form Columns Layout */
.form-columns {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  align-items: start;
  width: 100%;
}

@media (max-width: 1024px) {
  .form-columns {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
  min-width: 0; /* Prevent flex item overflow */
}

/* Toggle Section */
.toggle-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .toggle-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .toggle-container {
    align-self: flex-start;
    margin-left: 0 !important;
  }
}

.toggle-info {
  flex: 1;
}

.toggle-label {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.toggle-desc {
  font-size: 14px;
  color: #718096;
  margin: 0;
  line-height: 1.4;
}

.toggle-container {
  flex-shrink: 0;
  margin-left: 16px;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  display: block;
  width: 56px;
  height: 32px;
  background: #cbd5e0;
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle-switch:hover {
  background: #a0aec0;
}

.toggle-input:checked + .toggle-switch {
  background: #667eea;
}

.toggle-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toggle-input:checked + .toggle-switch .toggle-slider {
  transform: translateX(24px);
}

/* Anonymous Info */
.anonymous-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #edf2f7;
  border-radius: 8px;
  font-size: 14px;
  color: #4a5568;
  margin-top: 12px;
}

.anonymous-icon {
  width: 16px;
  height: 16px;
  color: #718096;
}

/* Textarea */
.laporan-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  line-height: 1.6;
  background: white;
  box-sizing: border-box;
  max-width: 100%;
}

.laporan-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.desktop-textarea {
  min-height: 300px;
}

/* Character Counter */
.char-counter {
  text-align: right;
  margin-top: 8px;
  font-size: 12px;
  color: #718096;
}

.char-counter .warning {
  color: #ed8936;
}

.char-counter .error {
  color: #e53e3e;
}

/* Form Labels */
.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  display: block;
}

.required {
  color: #e53e3e;
  margin-left: 2px;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* ===== MOBILE LAYOUT (<769px) ===== */
.mobile-layout {
  display: block;
  min-height: 100vh;
  background: #fcfcf7; /* Match HomePage background */
  padding-bottom: 0px;
}

@media (min-width: 769px) {
  .mobile-layout {
    display: none;
  }
}

.laporan-wrapper {
  min-height: calc(100vh - 80px);
}

/* Mobile Form Container */
.form-container {
  padding: 20px;
}

.mobile-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
}

/* Mobile Toggle */
.mobile-toggle {
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.mobile-toggle .toggle-container {
  align-self: flex-start;
  margin-left: 0;
}

.mobile-anonymous {
  margin-top: 0;
}

/* Mobile Textarea */
.mobile-textarea {
  min-height: 200px;
}

/* Mobile Actions */
.mobile-actions {
  margin-top: 16px;
  justify-content: center;
}

/* ===== SUCCESS MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.modal-body {
  padding: 32px;
  text-align: center;
}

.success-icon {
  margin-bottom: 20px;
}

.success-check {
  width: 64px;
  height: 64px;
  color: #48bb78;
}

.success-modal h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.success-modal p {
  color: #718096;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

/* ===== SIMPLE BREADCRUMB STYLES ===== */
.simple-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 0;
  font-size: 14px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.simple-breadcrumb .breadcrumb-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.simple-breadcrumb .breadcrumb-link:hover {
  text-decoration: underline;
}

.simple-breadcrumb .breadcrumb-separator {
  color: #a0aec0;
  margin: 0 4px;
}

.simple-breadcrumb .breadcrumb-current {
  color: #4a5568;
  font-weight: 600;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */
@media (max-width: 1240px) {
  .main-content {
    padding: 32px;
  }
  
  .form-card {
    padding: 36px;
  }
}

@media (max-width: 1024px) {
  .main-content {
    padding: 24px;
  }
  
  .form-columns {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .form-card {
    padding: 32px;
    border-radius: 12px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .form-card {
    padding: 24px;
    border-radius: 12px;
    margin: 0 -4px;
  }
  
  .page-title {
    font-size: 24px;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .title-icon {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 16px 12px;
  }
  
  .form-card {
    padding: 20px;
    border-radius: 8px;
    margin: 0 -8px;
  }
  
  .form-container {
    padding: 16px;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .success-check {
    width: 48px;
    height: 48px;
  }
  
  .toggle-section {
    padding: 16px;
  }
}
</style>
