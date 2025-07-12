<template>
  <div class="lapor-bantuan-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />

      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- Desktop Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <!-- Page Header -->
        <div class="page-header">
          <h1 class="page-title">Lapor dan Bantuan</h1>
          <p class="page-subtitle">Sampaikan keluhan, saran, atau butuh bantuan? Kami siap membantu Anda!</p>
        </div>

        <!-- Desktop Form Card -->
        <div class="form-card">
          <form @submit.prevent="submitReport" class="report-form">
            <!-- Jenis Laporan -->
            <div class="form-group">
              <label for="jenisLaporan" class="form-label">Jenis Laporan</label>
              <select 
                id="jenisLaporan" 
                v-model="formData.jenisLaporan" 
                class="form-select"
                required
              >
                <option value="">Pilih jenis laporan...</option>
                <option value="keluhan_pelayanan">Keluhan Pelayanan</option>
                <option value="perbaikan_gereja">Perbaikan Gereja</option>
                <option value="error_aplikasi">Error Aplikasi</option>
                <option value="saran_pengembangan">Saran Pengembangan Aplikasi</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <!-- Deskripsi -->
            <div class="form-group">
              <label for="deskripsi" class="form-label">Deskripsi</label>
              <textarea 
                id="deskripsi"
                v-model="formData.deskripsi"
                class="form-textarea"
                placeholder="Jelaskan laporan Anda dengan detail..."
                rows="6"
                required
              ></textarea>
            </div>

            <!-- Submit Button -->
            <ButtonPrimary 
              type="submit" 
              :disabled="isSubmitting"
              class="submit-button"
            >
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
            </ButtonPrimary>
          </form>
        </div>
      </main>
    </div>

    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <!-- Mobile Header -->
      <div class="mobile-header">
        <HeaderWithBack title="Lapor dan Bantuan" />
      </div>

      <!-- Mobile Content -->
      <div class="mobile-content">
        <div class="mobile-form-card">
          <div class="form-header">
            <h2 class="form-title">Lapor dan Bantuan</h2>
            <p class="form-subtitle">Sampaikan keluhan, saran, atau butuh bantuan dengan mudah!</p>
          </div>

          <form @submit.prevent="submitReport" class="report-form">
            <!-- Jenis Laporan -->
            <div class="form-group">
              <label for="jenisLaporanMobile" class="form-label">Jenis Laporan</label>
              <select 
                id="jenisLaporanMobile" 
                v-model="formData.jenisLaporan" 
                class="form-select"
                required
              >
                <option value="">Pilih jenis laporan...</option>
                <option value="keluhan_pelayanan">Keluhan Pelayanan</option>
                <option value="perbaikan_gereja">Perbaikan Gereja</option>
                <option value="error_aplikasi">Error Aplikasi</option>
                <option value="saran_pengembangan">Saran Pengembangan Aplikasi</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <!-- Deskripsi -->
            <div class="form-group">
              <label for="deskripsiMobile" class="form-label">Deskripsi</label>
              <textarea 
                id="deskripsiMobile"
                v-model="formData.deskripsi"
                class="form-textarea"
                placeholder="Jelaskan laporan Anda dengan detail..."
                rows="5"
                required
              ></textarea>
            </div>

            <!-- Submit Button -->
            <ButtonPrimary 
              type="submit" 
              :disabled="isSubmitting"
              class="submit-button mobile-submit"
            >
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
            </ButtonPrimary>
          </form>
        </div>
      </div>
    </div>

    <!-- Success Overlay -->
    <div v-if="showSuccessModal" class="success-overlay" @click="closeSuccessModal">
      <div class="success-modal" @click.stop>
        <div class="success-icon">
          <CheckCircle class="success-check" />
        </div>
        <h3 class="success-title">Laporan Berhasil Dikirim!</h3>
        <p class="success-message">
          Terima kasih atas laporan Anda. Tim admin akan segera menindaklanjuti.<br>
          <strong>Tuhan Yesus Memberkati!</strong>
        </p>
        <ButtonPrimary @click="closeSuccessModal" class="success-ok-btn">
          OK
        </ButtonPrimary>
      </div>
    </div>

    <!-- Error Overlay -->
    <div v-if="showErrorModal" class="error-overlay" @click="closeErrorModal">
      <div class="error-modal" @click.stop>
        <div class="error-icon">
          <AlertCircle class="error-alert" />
        </div>
        <h3 class="error-title">Gagal Mengirim Laporan</h3>
        <p class="error-message">{{ errorMessage }}</p>
        <ButtonPrimary @click="closeErrorModal" class="error-ok-btn">
          Coba Lagi
        </ButtonPrimary>
      </div>
    </div>
  </div>
</template>

<script>
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'

// Firebase imports
import { db } from '@/services/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// User store untuk get user info
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'LaporBantuanPage',
  
  components: {
    DesktopNavbar,
    BreadcrumbDesktop,
    HeaderWithBack,
    ButtonPrimary,
    CheckCircle,
    AlertCircle
  },
  
  data() {
    return {
      formData: {
        jenisLaporan: '',
        deskripsi: ''
      },
      isSubmitting: false,
      showSuccessModal: false,
      showErrorModal: false,
      errorMessage: ''
    }
  },
  
  computed: {
    breadcrumbItems() {
      return [
        { 
          text: 'Lapor dan Bantuan'
        }
      ]
    },
    
    userStore() {
      return useUserStore()
    },
    
    currentUser() {
      return this.userStore.user
    }
  },
  
  methods: {
    /**
     * Submit laporan ke Firebase
     */
    async submitReport() {
      // Validasi form
      if (!this.formData.jenisLaporan || !this.formData.deskripsi.trim()) {
        this.showError('Mohon lengkapi semua field yang diperlukan')
        return
      }
      
      this.isSubmitting = true
      
      try {
        console.log('📝 [LaporBantuan] Mengirim laporan:', this.formData)
        
        // Prepare data untuk Firebase
        const reportData = {
          jenisLaporan: this.formData.jenisLaporan,
          deskripsi: this.formData.deskripsi.trim(),
          
          // User info
          userId: this.currentUser?.id || 'anonymous',
          userName: this.currentUser?.nama || 'Anonim',
          userRole: this.currentUser?.role || 'jemaat',
          
          // Status tracking
          status: 'pending', // pending, in_progress, resolved, closed
          isRead: false,
          
          // Timestamps
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          
          // Additional info for admin
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        }
        
        // Kirim ke Firebase collection 'reports'
        const reportsRef = collection(db, 'reports')
        const docRef = await addDoc(reportsRef, reportData)
        
        console.log('✅ [LaporBantuan] Laporan berhasil dikirim dengan ID:', docRef.id)
        
        // Reset form
        this.resetForm()
        
        // Show success modal
        this.showSuccessModal = true
        
      } catch (error) {
        console.error('❌ [LaporBantuan] Error mengirim laporan:', error)
        this.showError('Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.')
      } finally {
        this.isSubmitting = false
      }
    },
    
    /**
     * Reset form data
     */
    resetForm() {
      this.formData = {
        jenisLaporan: '',
        deskripsi: ''
      }
    },
    
    /**
     * Show error modal
     */
    showError(message) {
      this.errorMessage = message
      this.showErrorModal = true
    },
    
    /**
     * Close success modal
     */
    closeSuccessModal() {
      this.showSuccessModal = false
      // Navigate ke AccountPage setelah laporan berhasil dikirim
      this.$router.push('/account')
    },
    
    /**
     * Close error modal
     */
    closeErrorModal() {
      this.showErrorModal = false
      this.errorMessage = ''
    },
    
    /**
     * Handle keyboard events for accessibility
     */
    handleKeydown(event) {
      if (event.key === 'Escape') {
        if (this.showSuccessModal) {
          this.closeSuccessModal()
        }
        if (this.showErrorModal) {
          this.closeErrorModal()
        }
      }
    }
  },
  
  // Keyboard accessibility
  mounted() {
    // ESC key untuk close modal
    document.addEventListener('keydown', this.handleKeydown)
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  }
}
</script>

<style scoped>
/* ========================================
   CONTAINER & LAYOUT RESPONSIVE
========================================= */
.lapor-bantuan-container {
  background: #fcfcf7;
  min-height: 100vh;
}

/* ========================================
   DESKTOP LAYOUT (1024px+)
========================================= */
.desktop-layout {
  display: none;
}

/* Desktop: 1024px ke atas */
@media (min-width: 1024px) {
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none !important;
  }
}

.desktop-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}

/* ========================================
   PAGE HEADER (DESKTOP)
========================================= */
.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-family: 'Inter', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* ========================================
   FORM CARD STYLES
========================================= */
.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 48px;
  max-width: 600px;
  margin: 0 auto;
}

/* ========================================
   MOBILE LAYOUT (≤1023px)
========================================= */
.mobile-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 80px;
}

/* Mobile: Hide on desktop */
@media (min-width: 1024px) {
  .mobile-layout {
    display: none !important;
  }
}

/* Mobile Header Wrapper */
.mobile-header {
  flex-shrink: 0;
  background: #fcfcf7;
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.mobile-content {
  flex: 1;
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
  overflow-x: hidden;
}

.mobile-form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.form-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* ========================================
   FORM ELEMENTS
========================================= */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  background: white;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-select:focus {
  outline: none;
  border-color: #41442A;
  box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #41442A;
  box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1);
}

.form-textarea::placeholder {
  color: #999;
}

/* ========================================
   SUBMIT BUTTON
========================================= */
.submit-button {
  width: 100%;
  margin-top: 16px;
}

/* Desktop button styling */
@media (min-width: 1024px) {
  .submit-button {
    max-width: 200px;
    margin: 24px auto 0;
    display: block;
  }
}

/* ========================================
   SUCCESS OVERLAY & MODAL
========================================= */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.success-modal {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  animation: modalSlideIn 0.3s ease-out;
  margin: auto;
  position: relative;
}

.success-icon {
  margin-bottom: 16px;
}

.success-check {
  width: 48px;
  height: 48px;
  color: #4CAF50;
}

.success-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.success-message {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.success-ok-btn {
  min-width: 120px;
}

/* ========================================
   ERROR OVERLAY & MODAL
========================================= */
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.error-modal {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  animation: modalSlideIn 0.3s ease-out;
  margin: auto;
  position: relative;
}

.error-icon {
  margin-bottom: 16px;
}

.error-alert {
  width: 48px;
  height: 48px;
  color: #f44336;
}

.error-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.error-message {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.error-ok-btn {
  min-width: 120px;
}

/* ========================================
   ANIMATIONS
========================================= */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ========================================
   RESPONSIVE ADJUSTMENTS
========================================= */

/* Small Mobile: 320px - 480px */
@media (max-width: 480px) {
  .mobile-header {
    padding: 12px;
  }
  
  .mobile-content {
    padding: 12px;
  }
  
  .mobile-form-card {
    padding: 20px;
  }
  
  .success-modal,
  .error-modal {
    padding: 24px 20px;
    max-width: 320px;
  }
  
  .success-overlay,
  .error-overlay {
    padding: 16px;
  }
  
  .form-title {
    font-size: 18px;
  }
  
  .form-subtitle {
    font-size: 13px;
  }
}

/* Large Mobile: 481px - 768px */
@media (min-width: 481px) and (max-width: 768px) {
  .mobile-content {
    padding: 20px;
    max-width: 500px;
  }
  
  .mobile-form-card {
    padding: 28px;
  }
}

/* Tablet: 769px - 1023px */
@media (min-width: 769px) and (max-width: 1023px) {
  .mobile-content {
    padding: 24px;
    max-width: 600px;
  }
  
  .mobile-form-card {
    padding: 32px;
  }
  
  .form-title {
    font-size: 24px;
  }
  
  .form-subtitle {
    font-size: 16px;
  }
}

/* Desktop: 1024px - 1440px */
@media (min-width: 1024px) and (max-width: 1440px) {
  .desktop-content {
    padding: 24px;
  }
  
  .form-card {
    padding: 36px;
  }
  
  .page-title {
    font-size: 28px;
  }
}

/* Large Desktop: 1441px+ */
@media (min-width: 1441px) {
  .desktop-content {
    padding: 40px;
  }
  
  .form-card {
    padding: 48px;
    max-width: 700px;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .page-subtitle {
    font-size: 18px;
  }
}

/* ========================================
   ACCESSIBILITY
========================================= */
@media (prefers-reduced-motion: reduce) {
  .success-modal,
  .error-modal {
    animation: none;
  }
  
  .form-select,
  .form-textarea {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .form-select,
  .form-textarea {
    border-color: #000;
  }
  
  .form-select:focus,
  .form-textarea:focus {
    border-color: #000;
    box-shadow: 0 0 0 2px #000;
  }
}
</style>