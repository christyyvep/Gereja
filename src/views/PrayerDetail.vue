<!-- src/views/PrayerDetail.vue -->
<template>
    <div class="prayer-detail-container">
      <div class="prayer-detail-wrapper">
        <!-- Header dengan tombol back -->
        <HeaderWithBack title="Detail Prayer" />
  
        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Memuat detail doa...</p>
        </div>
  
        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">🙏</div>
          <h3>Doa Tidak Ditemukan</h3>
          <p class="error-text">{{ error }}</p>
          <ButtonPrimary @click="fetchPrayerDetail">Coba Lagi</ButtonPrimary>
        </div>
  
        <!-- ⭐ MAIN CONTENT: Sesuai mockup -->
        <div v-else-if="prayer" class="prayer-detail-content">
          
          <!-- ⭐ HEADER: Tanggal dan Status -->
          <div class="detail-header">
            <div class="prayer-date">
              <Calendar class="date-icon" />
              <span>{{ formatDate(prayer.createdAt) }}</span>
            </div>
            
            <div class="prayer-status" :class="getStatusClass(prayer.status)">
              <CheckCircle v-if="prayer.isPrayedByAdmin" class="status-icon" />
              <Clock v-else class="status-icon" />
              <span>{{ prayer.statusText }}</span>
            </div>
          </div>
  
          <!-- ⭐ DIVIDER -->
          <div class="section-divider"></div>
  
          <!-- ⭐ KATEGORI -->
          <div class="prayer-section">
            <h3 class="section-title">Kategori</h3>
            <div class="category-display">
              <span class="category-icon">{{ getCategoryIcon(prayer.category) }}</span>
              <span class="category-label">{{ getCategoryLabel(prayer.category) }}</span>
            </div>
          </div>
  
          <!-- ⭐ PERMINTAAN DOA (Konten Lengkap) -->
          <div class="prayer-section">
            <h3 class="section-title">Permintaan Doa</h3>
            <div class="prayer-content-box">
              <p class="prayer-full-text">{{ prayer.description }}</p>
            </div>
          </div>
  
          <!-- ⭐ ADMIN NOTES (jika ada) -->
          <div v-if="prayer.adminNotes" class="prayer-section">
            <h3 class="section-title">Catatan Gembala</h3>
            <div class="admin-notes-box">
              <p class="admin-notes-text">{{ prayer.adminNotes }}</p>
              <div class="admin-info">
                <span class="admin-date">{{ formatDate(prayer.prayedByAdminAt) }}</span>
              </div>
            </div>
          </div>
  
          <!-- ⭐ TESTIMONIES (jika ada) -->
          <div v-if="prayer.testimonies && prayer.testimonies.length > 0" class="prayer-section">
            <h3 class="section-title">Testimoni</h3>
            <div class="testimonies-list">
              <div 
                v-for="testimony in prayer.testimonies" 
                :key="testimony.id"
                class="testimony-card"
              >
                <p class="testimony-text">{{ testimony.content }}</p>
                <div class="testimony-meta">
                  <span class="testimony-date">{{ formatDate(testimony.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- ⭐ BUTTON: Tambah Testimoni -->
          <div class="action-section">
            <ButtonPrimary 
              @click="showTestimonyModal = true" 
              variant="primary"
              :fullWidth="true"
            >
              <MessageSquare class="btn-icon" />
              {{ prayer.hasTestimony ? 'Tambah Testimoni Lagi' : 'Tambah Testimoni' }}
            </ButtonPrimary>
          </div>
        </div>
      </div>
  
      <!-- ⭐ TESTIMONY MODAL -->
      <div v-if="showTestimonyModal" class="modal-overlay" @click="closeTestimonyModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Tambah Testimoni</h3>
            <button @click="closeTestimonyModal" class="close-btn">✕</button>
          </div>
          
          <div class="testimony-form">
            <p class="testimony-instruction">
              Bagikan bagaimana Tuhan menjawab doa Anda atau berikan update terkini tentang situasi ini.
            </p>
            
            <textarea 
              v-model="newTestimonyContent"
              placeholder="Tulis testimoni Anda di sini..."
              class="testimony-textarea"
              rows="5"
            ></textarea>
            
            <div class="modal-actions">
              <button class="cancel-btn" @click="closeTestimonyModal">Batal</button>
              <ButtonPrimary 
                @click="submitTestimony" 
                :loading="isSubmittingTestimony"
                :disabled="!newTestimonyContent.trim()"
              >
                {{ isSubmittingTestimony ? 'Mengirim...' : 'Kirim Testimoni' }}
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
  import { 
    Calendar, 
    Clock, 
    CheckCircle, 
    MessageSquare 
  } from 'lucide-vue-next'
  import { useUserStore } from '@/stores/userStore.js'
  
  // Import services
  import { 
    getPrayerRequest, 
    addTestimony, 
    getPrayerCategories 
  } from '@/services/prayerRequests.js'

  // Toast notification
  import { useToast } from '@/composables/useToast.js'
  
  export default {
    name: 'PrayerDetail',
    components: {
      HeaderWithBack,
      ButtonPrimary,
      Calendar,
      Clock,
      CheckCircle,
      MessageSquare
    },
  
    computed: {
      userStore() {
        return useUserStore()
      },
      
      currentUserId() {
        return this.userStore.userId || 'anonymous'
      },
  
      categories() {
        return getPrayerCategories()
      }
    },
    
    data() {
      return {
        prayer: null,
        loading: true,
        error: null,
        
        // Testimony modal
        showTestimonyModal: false,
        newTestimonyContent: '',
        isSubmittingTestimony: false
      }
    },

    setup() {
      const {
        showSuccess,
        showError,
        validationError
      } = useToast()

      return {
        showSuccess,
        showError,
        validationError
      }
    },
    
    async created() {
      await this.fetchPrayerDetail()
    },
    
    methods: {
      async fetchPrayerDetail() {
        try {
          this.loading = true
          this.error = null
          
          const prayerId = this.$route.params.id
          
          if (!prayerId) {
            throw new Error('ID prayer tidak ditemukan')
          }
          
          console.log('🔍 [PrayerDetail] Fetching prayer ID:', prayerId)
          
          const prayerData = await getPrayerRequest(prayerId)
          
          console.log('✅ [PrayerDetail] Prayer loaded:', prayerData.title || 'Untitled')
          
          // Security check
          if (prayerData.userId !== this.currentUserId) {
            throw new Error('Anda tidak memiliki akses untuk melihat doa ini')
          }
          
          this.prayer = prayerData
          
        } catch (error) {
          console.error('❌ [PrayerDetail] Error loading prayer:', error)
          this.handleError(error)
        } finally {
          this.loading = false
        }
      },
  
      handleError(error) {
        if (error.message.includes('tidak ditemukan')) {
          this.error = 'Doa yang Anda cari tidak ditemukan. Mungkin sudah dihapus atau ID tidak valid.'
        } else if (error.message.includes('akses')) {
          this.error = 'Anda tidak memiliki akses untuk melihat doa ini.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          this.error = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
        } else {
          this.error = 'Gagal memuat detail doa. Pastikan koneksi internet Anda stabil.'
        }
      },
  
      closeTestimonyModal() {
        this.showTestimonyModal = false
        this.newTestimonyContent = ''
        this.isSubmittingTestimony = false
      },
  
      async submitTestimony() {
        if (!this.newTestimonyContent.trim()) {
          this.validationError('Testimoni tidak boleh kosong!')
          return
        }
  
        try {
          this.isSubmittingTestimony = true
          
          console.log('📝 [PrayerDetail] Submitting testimony...')
          
          await addTestimony(
            this.prayer.id,
            this.newTestimonyContent.trim(),
            this.currentUserId
          )
          
          console.log('✅ [PrayerDetail] Testimony submitted successfully')
          
          await this.fetchPrayerDetail()
          this.closeTestimonyModal()
          
          this.showSuccess('Testimoni berhasil ditambahkan! Terima kasih telah berbagi.')
          
        } catch (error) {
          console.error('❌ [PrayerDetail] Error submitting testimony:', error)
          this.showError('Gagal menambahkan testimoni: ' + error.message)
        } finally {
          this.isSubmittingTestimony = false
        }
      },
  
      getCategoryLabel(categoryValue) {
        const category = this.categories.find(cat => cat.value === categoryValue)
        return category ? category.label : categoryValue
      },
  
      getCategoryIcon(categoryValue) {
        const category = this.categories.find(cat => cat.value === categoryValue)
        return category ? category.icon : '🙏'
      },
  
      getStatusClass(status) {
        return {
          'status-waiting': status === 'waiting',
          'status-prayed': status === 'prayed',
          'status-answered': status === 'answered'
        }
      },
      
      formatDate(dateString) {
        try {
          const date = new Date(dateString)
          return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        } catch {
          return 'Tanggal tidak valid'
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .prayer-detail-container {
    background: #fcfcf7;
    min-height: 100vh;
  }
  
  .prayer-detail-wrapper {
    padding: 16px;
    max-width: 360px;
    margin: 0 auto;
  }
  
  /* Loading & Error States */
  .loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px 16px;
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
  
  .error-icon {
    font-size: 48px;
    margin-bottom: 8px;
    opacity: 0.7;
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
    line-height: 1.4;
    margin: 0;
  }
  
  /* Detail Content */
  .prayer-detail-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .prayer-date {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-family: 'Inter';
    font-size: 14px;
  }
  
  .date-icon {
    width: 16px;
    height: 16px;
  }
  
  .prayer-status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status-waiting {
    background: #fff3cd;
    color: #856404;
  }
  
  .status-prayed {
    background: #d4edda;
    color: #155724;
  }
  
  .status-answered {
    background: #cce5ff;
    color: #0066cc;
  }
  
  .status-icon {
    width: 14px;
    height: 14px;
  }
  
  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #ddd, transparent);
    margin: -10px 0;
  }
  
  .prayer-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .section-title {
    font-family: 'Inter';
    font-size: 16px;
    font-weight: 600;
    color: #41442A;
    margin: 0 0 12px 0;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 8px;
  }
  
  .category-display {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f8f9fa;
    padding: 12px 16px;
    border-radius: 8px;
  }
  
  .category-icon {
    font-size: 20px;
  }
  
  .category-label {
    font-family: 'Inter';
    font-size: 14px;
    font-weight: 600;
    color: #41442A;
  }
  
  .prayer-content-box {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid #41442A;
  }
  
  .prayer-full-text {
    font-family: 'Inter';
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
  }
  
  .admin-notes-box {
    background: #e8f5e8;
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid #2e7d32;
  }
  
  .admin-notes-text {
    font-family: 'Inter';
    font-size: 14px;
    color: #1b5e20;
    line-height: 1.6;
    margin: 0 0 8px 0;
    font-style: italic;
  }
  
  .admin-info {
    display: flex;
    justify-content: flex-end;
  }
  
  .admin-date {
    font-family: 'Inter';
    font-size: 12px;
    color: #4caf50;
    font-weight: 500;
  }
  
  .testimonies-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .testimony-card {
    background: #fff8e1;
    border-radius: 8px;
    padding: 14px;
    border-left: 4px solid #ffc107;
  }
  
  .testimony-text {
    font-family: 'Inter';
    font-size: 13px;
    color: #333;
    line-height: 1.5;
    margin: 0 0 8px 0;
  }
  
  .testimony-meta {
    display: flex;
    justify-content: flex-end;
  }
  
  .testimony-date {
    font-family: 'Inter';
    font-size: 11px;
    color: #f57c00;
    font-style: italic;
  }
  
  .action-section {
    padding: 20px 0;
  }
  
  .btn-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }
  
  /* Modal styles */
  .modal-overlay {
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
  
  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 24px;
    max-width: 320px;
    width: 100%;
    animation: modalSlideIn 0.3s ease;
  }
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 16px;
  }
  
  .modal-header h3 {
    font-family: 'Inter';
    font-size: 18px;
    font-weight: 600;
    color: #41442A;
    margin: 0;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #999;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .close-btn:hover {
    background: #f0f0f0;
    color: #333;
  }
  
  .testimony-instruction {
    font-family: 'Inter';
    font-size: 13px;
    color: #666;
    line-height: 1.4;
    margin: 0 0 16px 0;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .testimony-textarea {
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
    margin-bottom: 16px;
  }
  
  .testimony-textarea:focus {
    outline: none;
    border-color: #5a5e3d;
    box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1);
  }
  
  .testimony-textarea::placeholder {
    color: #aaa;
  }
  
  .modal-actions {
    display: flex;
    gap: 12px;
  }
  
  .cancel-btn {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f5f5f5;
    color: #666;
    font-family: 'Inter';
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .cancel-btn:hover {
    background: #e0e0e0;
  }
  
  /* Responsive */
  @media (max-width: 360px) {
    .prayer-detail-wrapper {
      padding: 12px;
    }
    
    .prayer-section {
      padding: 16px;
    }
    
    .detail-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .modal-content {
      padding: 20px;
      margin: 10px;
    }
  }
  </style>