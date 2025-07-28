<!-- src/views/PrayerRequestPage.vue - RESPONSIVE DESIGN -->
<template>
  <div class="prayer-request-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />

      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <div class="page-header">
          <h1 class="page-title">Prayer Request</h1>
          <div class="header-actions">
            <ButtonPrimary @click="goToAddPrayer" class="add-button-desktop">
              <Plus class="add-icon" />
              Tambah Permintaan Doa
            </ButtonPrimary>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="loading-container desktop-loading">
          <div class="loading-spinner"></div>
          <p>Memuat daftar doa...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container desktop-error">
          <div class="error-card">
            <AlertCircle class="error-icon" />
            <h3>Terjadi Kesalahan</h3>
            <p class="error-text">{{ error }}</p>
            <button @click="fetchMyPrayerRequests" class="retry-button">
              <RefreshCw /> Coba Lagi
            </button>
          </div>
        </div>

        <!-- Prayer Requests Grid -->
        <div v-else-if="myPrayerRequests.length > 0" class="prayers-grid">
          <div 
            v-for="prayer in myPrayerRequests" 
            :key="prayer.id"
            class="prayer-card desktop-card"
            @click="goToPrayerDetail(prayer)"
          >
            <!-- Header: Category Badge dan Date sejajar -->
            <div class="card-header">
              <div class="category-badge" :class="getCategoryClass(prayer.category)">
                {{ getCategoryLabel(prayer.category) }}
              </div>
              
              <div class="prayer-date">
                {{ formatDate(prayer.createdAt) }}
              </div>
            </div>

            <!-- Status badges -->
            <div class="status-badges" v-if="prayer.isAnonymous || prayer.isUrgent">
              <div v-if="prayer.isAnonymous" class="anonymous-badge">
                <EyeOff class="status-icon" />
                Anonim
              </div>
              <div v-if="prayer.isUrgent" class="urgent-badge">
                <AlertCircle class="status-icon" />
                Mendesak
              </div>
            </div>

            <!-- Prayer Content -->
            <div class="prayer-content">
              {{ prayer.description }}
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-container desktop-empty">
          <div class="empty-card">
            <div class="empty-icon">🙏</div>
            <h3>Belum Ada Permintaan Doa</h3>
            <p>Anda belum memiliki permintaan doa. Mulai berbagi pergumulan Anda dengan jemaat!</p>
            <ButtonPrimary @click="goToAddPrayer">
              <Plus /> Tambah Permintaan Doa
            </ButtonPrimary>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <div class="prayer-wrapper">
        <!-- Header dengan tombol back -->
        <HeaderWithBack title="Prayer Request" :customBackAction="goToHomepage" />

        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Memuat daftar doa...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">😞</div>
          <h3>Terjadi Kesalahan</h3>
          <p class="error-text">{{ error }}</p>
          <ButtonPrimary @click="fetchMyPrayerRequests">Coba Lagi</ButtonPrimary>
        </div>

        <!-- Content ketika ada doa user -->
        <div v-else-if="myPrayerRequests.length > 0" class="prayers-content">  
          <!-- Daftar Prayer Cards SIMPLE sesuai wireframe -->
          <div class="prayers-list">
            <div 
              v-for="prayer in myPrayerRequests" 
              :key="prayer.id"
              class="prayer-card mobile-card"
              @click="goToPrayerDetail(prayer)"
            >
              <!-- Header: Category Badge dan Date sejajar -->
              <div class="card-header">
                <div class="category-badge" :class="getCategoryClass(prayer.category)">
                  {{ getCategoryLabel(prayer.category) }}
                </div>
                
                <div class="prayer-date">
                  {{ formatDate(prayer.createdAt) }}
                </div>
              </div>

              <!-- Prayer Content -->
              <div class="prayer-content">
                {{ prayer.description }}
              </div>

              <!-- Tambah Testimoni Button -->
              <!-- <button 
                class="testimony-btn" 
                @click.stop="openTestimonyModal(prayer)"
              >
                Tambah Testimoni
              </button> -->
            </div>
          </div>
        </div>

        <!-- Empty state sesuai wireframe -->
        <div v-else class="empty-container">
          <div class="empty-content">
            <div class="empty-icon">🙏</div>
            <h3>Belum Ada Permintaan Doa</h3>
            <p>Anda belum memiliki permintaan doa. Mulai berbagi pergumulan Anda dengan jemaat!</p>
          </div>
        </div>

        <!-- ⭐ FLOATING ACTION BUTTON - sesuai wireframe -->
        <button class="floating-add-btn" @click="goToAddPrayer" aria-label="Tambah Permintaan Doa">
          <Plus class="fab-icon" />
        </button>
      </div>
    </div>

    <!-- ⭐ PRAYER DETAIL MODAL -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <!-- Header dengan kategori dan tanggal -->
        <div class="detail-header">
          <div class="category-badge" :class="getCategoryClass(selectedPrayer?.category)">
            {{ getCategoryLabel(selectedPrayer?.category) }}
          </div>
          <div class="prayer-date">
            {{ formatDate(selectedPrayer?.createdAt) }}
          </div>
        </div>

        <!-- Status anonim -->
        <div v-if="selectedPrayer?.isAnonymous" class="anonymous-status">
          <EyeOff class="anonymous-icon" />
          <span>Mode Anonim</span>
        </div>

        <!-- Status urgent -->
        <div v-if="selectedPrayer?.isUrgent" class="urgent-status">
          <AlertCircle class="urgent-icon" />
          <span>Permintaan Mendesak</span>
        </div>

        <!-- Content -->
        <div class="detail-content">
          <h4>Permintaan Doa</h4>
          <p class="prayer-text">{{ selectedPrayer?.description }}</p>
        </div>

        <!-- Action buttons -->
        <div class="detail-actions">
          <button class="delete-btn" @click="confirmDeletePrayer">
            <Trash2 class="btn-icon" />
            Hapus Permintaan Doa
          </button>
          <button class="close-btn" @click="closeDetailModal">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- ⭐ DELETE CONFIRMATION MODAL -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="closeDeleteConfirm">
      <div class="modal-content delete-modal" @click.stop>
        <div class="delete-icon-container">
          <Trash2 class="delete-icon" />
        </div>
        <h3>Hapus Permintaan Doa?</h3>
        <p class="delete-message">
          Apakah Anda yakin ingin menghapus permintaan doa ini? 
          Tindakan ini tidak dapat dibatalkan.
        </p>
        
        <div class="delete-actions">
          <button class="cancel-btn" @click="closeDeleteConfirm">Batal</button>
          <button class="confirm-delete-btn" @click="deletePrayer" :disabled="isDeleting">
            {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ⭐ SUCCESS DELETE OVERLAY -->
    <div v-if="showDeleteSuccess" class="success-overlay" @click="closeDeleteSuccess">
      <div class="success-modal" @click.stop>
        <!-- Success Icon -->
        <div class="success-icon-container">
          <div class="success-icon delete-success">
            <Check class="check-mark" />
          </div>
        </div>

        <!-- Success Content -->
        <div class="success-content">
          <h2 class="success-title">Permintaan Doa Dihapus!</h2>
          <p class="success-message">
            Permintaan doa Anda telah berhasil dihapus dari daftar.
          </p>
        </div>

        <!-- Action Button -->
        <div class="success-actions">
          <ButtonPrimary @click="closeDeleteSuccess" :fullWidth="true">
            Tutup
          </ButtonPrimary>
        </div>
      </div>
    </div>

    <!-- ⭐ ERROR DELETE OVERLAY -->
    <div v-if="showDeleteError" class="error-overlay" @click="closeDeleteError">
      <div class="error-modal" @click.stop>
        <!-- Error Icon -->
        <div class="error-icon-container">
          <div class="error-icon-circle">
            <AlertCircle class="error-icon" />
          </div>
        </div>

        <!-- Error Content -->
        <div class="error-content">
          <h2 class="error-title">Gagal Menghapus! ❌</h2>
          <p class="error-message">
            {{ deleteErrorMessage }}
          </p>
        </div>

        <!-- Action Button -->
        <div class="error-actions">
          <ButtonPrimary @click="closeDeleteError" :fullWidth="true">
            Tutup
          </ButtonPrimary>
        </div>
      </div>
    </div>

    <!-- ⭐ TESTIMONY MODAL -->
    <div v-if="showTestimonyModal" class="modal-overlay" @click="closeTestimonyModal">
      <div class="modal-content" @click.stop>
        <h3>Tambah Testimoni</h3>
        <p class="modal-subtitle">Ceritakan bagaimana Tuhan menjawab doa Anda</p>
        
        <textarea 
          v-model="testimonyText"
          placeholder="Tulis testimoni Anda di sini..."
          class="testimony-textarea"
          rows="4"
          maxlength="500"
        ></textarea>
        
        <div class="char-counter">
          {{ testimonyText.length }}/500 karakter
        </div>
        
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeTestimonyModal">Batal</button>
          <ButtonPrimary 
            @click="submitTestimony" 
            :loading="isSubmittingTestimony"
            :disabled="!testimonyText.trim() || isSubmittingTestimony"
          >
            {{ isSubmittingTestimony ? 'Mengirim...' : 'Kirim Testimoni' }}
          </ButtonPrimary>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
// Desktop Layout Components
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import { Plus, EyeOff, AlertCircle, Trash2, RefreshCw, Check } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore.js'

// ⭐ IMPORT PERSONAL FUNCTIONS - hanya untuk user sendiri
import { getPrayerRequestsByUser, addTestimony, getPrayerCategories, deletePrayerRequest } from '@/services/prayerRequests.js'

// Toast notification
import { useToast } from '@/composables/useToast.js'

export default {
  name: 'PrayerRequestPage',
  components: {
    HeaderWithBack,
    ButtonPrimary,
    DesktopNavbar,
    BreadcrumbDesktop,
    Plus,
    EyeOff,
    AlertCircle,
    Trash2,
    RefreshCw,
    Check
  },

  computed: {
    userStore() {
      return useUserStore()
    },
    
    currentUserId() {
      // ⭐ ROBUST: Multiple fallbacks untuk user ID
      const store = this.userStore
      
      // Priority 1: Store user ID
      if (store.userId && store.userId !== 'anonymous') {
        return store.userId
      }
      
      // Priority 2: Store user object
      if (store.user?.id) return store.user.id
      if (store.user?.nama) return store.user.nama
      if (store.user?.userId) return store.user.userId
      
      // Priority 3: localStorage fallback
      try {
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          if (user.id) return user.id
          if (user.nama) return user.nama
          if (user.userId) return user.userId
        }
      } catch (e) {
        console.warn('Failed to get user from localStorage')
      }
      
      // Priority 4: Return demo user for development
      return 'demo-user'
    }
  },
  
  data() {
    return {
      myPrayerRequests: [], // ⭐ PERSONAL: Hanya doa milik user
      loading: true,
      error: null,
      
      // Detail Modal
      showDetailModal: false,
      selectedPrayer: null,
      
      // Delete Confirmation
      showDeleteConfirm: false,
      isDeleting: false,
      
      // Delete Success
      showDeleteSuccess: false,
      
      // Delete Error
      showDeleteError: false,
      deleteErrorMessage: '',
      
      // Testimony Modal
      showTestimonyModal: false,
      testimonyText: '',
      isSubmittingTestimony: false,
      
      // Categories
      categories: getPrayerCategories(),
      
      // Breadcrumb data
      breadcrumbItems: [
        {
          text: 'Prayer Request'
        }
      ]
    }
  },

  setup() {
    const {
      showSuccess,
      showError,
      showInfo,
      validationError
    } = useToast()

    return {
      showSuccess,
      showError,
      showInfo,
      validationError
    }
  },
  
  async created() {
    await this.fetchMyPrayerRequests() // ⭐ FETCH PERSONAL PRAYERS
  },
  
  methods: {
    // ⭐ NAVIGATION: Go back to homepage instead of previous page
    goToHomepage() {
      console.log('🏠 [PrayerRequest] Navigating to homepage')
      this.$router.push('/home')
    },

    // ⭐ FETCH PERSONAL PRAYERS - dengan fallback
    async fetchMyPrayerRequests() {
      try {
        this.loading = true
        this.error = null
        
        // ⭐ FALLBACK: Coba berbagai cara mendapat user ID
        let userId = this.currentUserId
        
        // Fallback 1: Coba dari localStorage
        if (!userId || userId === 'anonymous') {
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser)
              userId = user.id || user.nama || user.userId
            } catch (e) {
              console.warn('Failed to parse saved user')
            }
          }
        }
        
        // Fallback 2: Gunakan default user untuk testing
        if (!userId || userId === 'anonymous') {
          userId = 'demo-user' // Default untuk testing
          console.warn('🚧 [PrayerRequest] Using demo user for testing')
        }
        
        console.log('🔍 [PrayerRequest] Fetching prayers for user:', userId)
        
        // ⭐ FETCH: Ambil data dengan user ID yang tersedia
        const userPrayersData = await getPrayerRequestsByUser(userId, 50)
        
        console.log('✅ [PrayerRequest] Prayers loaded:', userPrayersData.length)
        
        // ⭐ DEMO: Jika kosong, tambahkan dummy data untuk testing
        if (userPrayersData.length === 0 && userId === 'demo-user') {
          this.myPrayerRequests = this.getDummyPrayerData()
          console.log('🚧 [PrayerRequest] Using dummy data for demo')
        } else {
          this.myPrayerRequests = userPrayersData
        }
        
      } catch (error) {
        console.error('❌ [PrayerRequest] Error:', error)
        
        // ⭐ GRACEFUL ERROR: Jangan crash, tapi tampilkan pesan
        if (error.message.includes('User ID harus diisi')) {
          this.error = 'Silakan login terlebih dahulu untuk melihat prayer request Anda.'
        } else {
          this.error = 'Gagal memuat daftar doa. Coba lagi nanti.'
        }
      } finally {
        this.loading = false
      }
    },
    
    // ⭐ GO TO ADD PRAYER - floating button action
    goToAddPrayer() {
      this.$router.push('/prayer-request/add')
    },

    // ⭐ GO TO PRAYER DETAIL - show detail modal
    goToPrayerDetail(prayer) {
      console.log('🔍 [PrayerRequest] Opening prayer detail:', prayer.id)
      this.selectedPrayer = prayer
      this.showDetailModal = true
    },

    // ⭐ DETAIL MODAL FUNCTIONS
    closeDetailModal() {
      this.showDetailModal = false
      this.selectedPrayer = null
    },

    // ⭐ DELETE FUNCTIONS
    confirmDeletePrayer() {
      this.showDetailModal = false
      this.showDeleteConfirm = true
    },

    closeDeleteConfirm() {
      this.showDeleteConfirm = false
      this.selectedPrayer = null
    },

    async deletePrayer() {
      if (!this.selectedPrayer) return

      try {
        this.isDeleting = true
        
        console.log('🗑️ [PrayerRequest] Deleting prayer:', this.selectedPrayer.id)
        
        // Call delete service
        await deletePrayerRequest(this.selectedPrayer.id)
        
        // Remove from local list
        this.myPrayerRequests = this.myPrayerRequests.filter(
          prayer => prayer.id !== this.selectedPrayer.id
        )
        
        console.log('✅ [PrayerRequest] Prayer deleted successfully')
        
        this.closeDeleteConfirm()
        
        // Show success overlay instead of alert
        this.showDeleteSuccess = true
        
      } catch (error) {
        console.error('❌ [PrayerRequest] Error deleting prayer:', error)
        this.deleteErrorMessage = error.message
        this.showDeleteError = true
      } finally {
        this.isDeleting = false
      }
    },

    // ⭐ NEW: Close delete success overlay
    closeDeleteSuccess() {
      this.showDeleteSuccess = false
      this.selectedPrayer = null
    },

    // ⭐ NEW: Close delete error overlay
    closeDeleteError() {
      this.showDeleteError = false
      this.deleteErrorMessage = ''
      this.selectedPrayer = null
    },

    // ⭐ TESTIMONY FUNCTIONS
    openTestimonyModal(prayer) {
      this.selectedPrayer = prayer
      this.testimonyText = ''
      this.showTestimonyModal = true
    },

    closeTestimonyModal() {
      this.showTestimonyModal = false
      this.selectedPrayer = null
      this.testimonyText = ''
    },

    async submitTestimony() {
      try {
        if (!this.testimonyText.trim()) {
          this.validationError('Testimoni tidak boleh kosong!')
          return
        }

        this.isSubmittingTestimony = true

        await addTestimony(
          this.selectedPrayer.id, 
          this.testimonyText.trim(), 
          this.currentUserId
        )

        // Refresh data
        await this.fetchMyPrayerRequests()
        
        this.closeTestimonyModal()
        this.showSuccess('Testimoni berhasil ditambahkan!')

      } catch (error) {
        console.error('Error submitting testimony:', error)
        this.showError('Gagal menambahkan testimoni: ' + error.message)
      } finally {
        this.isSubmittingTestimony = false
      }
    },

    // ⭐ HELPER FUNCTIONS
    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      } catch {
        return 'Tanggal tidak valid'
      }
    },

    getCategoryLabel(category) {
      const category_obj = this.categories.find(cat => cat.value === category)
      return category_obj ? category_obj.label : 'Lainnya'
    },

    getCategoryClass(category) {
      return `category-${category || 'other'}`
    },

    // ⭐ DEMO: Dummy data untuk testing
    getDummyPrayerData() {
      return [
        {
          id: 'demo-1',
          title: 'Doa untuk Kesehatan Keluarga',
          description: 'Mohon doa untuk kesehatan keluarga saya yang sedang sakit. Semoga Tuhan memberikan kesembuhan dan kekuatan.',
          category: 'health',
          userId: 'demo-user',
          status: 'active',
          isPrayed: false,
          prayedBy: [],
          isAnonymous: false,
          isUrgent: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 hari lalu
        },
        {
          id: 'demo-2',
          title: 'Pekerjaan Baru',
          description: 'Sedang mencari pekerjaan baru. Mohon doa agar diberi jalan dan kesempatan yang terbaik dari Tuhan.',
          category: 'work',
          userId: 'demo-user',
          status: 'active',
          isPrayed: true,
          prayedBy: ['admin'],
          isAnonymous: false,
          isUrgent: false,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 hari lalu
        },
        {
          id: 'demo-3',
          title: 'Hubungan dengan Tuhan',
          description: 'Mohon doa agar hubungan saya dengan Tuhan semakin dekat dan iman semakin kuat dalam menghadapi tantangan hidup.',
          category: 'spiritual',
          userId: 'demo-user',
          status: 'active',
          isPrayed: false,
          prayedBy: [],
          isAnonymous: false,
          isUrgent: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 hari lalu
        }
      ]
    }
  }
}
</script>

<style scoped>
.prayer-request-container {
  background: #fcfcf7;
  min-height: 100vh;
  position: relative;
}

/* =================
   DESKTOP LAYOUT 
   ================= */
.desktop-layout {
  display: none;
}

@media (min-width: 768px) {
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none;
  }
}

.desktop-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  padding-top: 40px; /* Space for fixed navbar */
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

.page-title {
  font-family: 'Inter';
  font-size: 32px;
  font-weight: 700;
  color: #41442A;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Custom styling untuk ButtonPrimary desktop */
.add-button-desktop {
  padding: 12px 20px !important;
  font-size: 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  height: auto !important;
  min-height: 40px !important;
  line-height: 1 !important;
}

.add-button-desktop span {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  line-height: 1 !important;
}

.add-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Desktop Loading */
.desktop-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e5e5;
  border-top: 4px solid #41442A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Desktop Error */
.desktop-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #d32f2f;
}

.error-card h3 {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #41442A;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #2d2f1c;
}

/* Desktop Prayer Grid */
.prayers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

/* Desktop Prayer Cards */
.desktop-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(65, 68, 42, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.desktop-card:hover {
  background: #fafafa;
  border-color: #41442A;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(65, 68, 42, 0.15);
}

.desktop-card:active {
  transform: translateY(-2px);
}

.desktop-card .prayer-content {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Status badges untuk desktop */
.status-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.anonymous-badge, .urgent-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
  font-family: 'Inter';
}

.anonymous-badge {
  background: #f3f4f6;
  color: #6b7280;
}

.urgent-badge {
  background: #fef2f2;
  color: #dc2626;
}

.status-icon {
  width: 12px;
  height: 12px;
}

/* Desktop Empty State */
.desktop-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.empty-card .empty-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.empty-card h3 {
  font-family: 'Inter';
  font-size: 24px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.empty-card p {
  font-family: 'Inter';
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* =================
   MOBILE LAYOUT 
   ================= */
.mobile-layout {
  display: block;
  padding-bottom: 100px; /* Space for floating button */
}

@media (min-width: 768px) {
  .mobile-layout {
    display: none;
  }
}

.prayer-wrapper {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
}

/* Mobile Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 16px;
  text-align: center;
}

.loading-container p {
  font-family: 'Inter';
  color: #666;
  margin: 0;
}

/* Mobile Error State */
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

/* Prayer Cards - SIMPLE sesuai wireframe */
.prayers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(65, 68, 42, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-card:hover {
  background: #fafafa;
  border-color: #41442A;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(65, 68, 42, 0.15);
}

.mobile-card:active {
  transform: translateY(0);
}

/* Card Header - Category dan Date sejajar */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* Category Badge - SIMPLE */
.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter';
  text-transform: uppercase;
}

.category-health { background: #fecaca; color: #991b1b; }
.category-work { background: #fed7aa; color: #9a3412; }
.category-family { background: #bbf7d0; color: #14532d; }
.category-finances { background: #a7f3d0; color: #064e3b; }
.category-education { background: #bfdbfe; color: #1e3a8a; }
.category-spiritual { background: #ddd6fe; color: #5b21b6; }
.category-relationship { background: #fce7f3; color: #be185d; }
.category-other { background: #e2e8f0; color: #475569; }

/* Date - SIMPLE */
.prayer-date {
  font-family: 'Inter';
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* Prayer Content - SIMPLE */
.prayer-content {
  font-family: 'Inter';
  font-size: 14px;
  color: #2d2f1c;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tambah Testimoni Button - SIMPLE */
.testimony-btn {
  width: 100%;
  padding: 10px;
  background: #f8f9fa;
  color: #41442A;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-family: 'Inter';
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.testimony-btn:hover {
  background: #41442A;
  color: white;
  border-color: #41442A;
}

/* Prevent button from triggering card click */
.testimony-btn:active {
  transform: scale(0.98);
}

/* Empty State - SIMPLE */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 32px 16px;
}

.empty-content {
  text-align: center;
  max-width: 280px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-content h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 12px 0;
}

.empty-content p {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

/* ⭐ FLOATING ACTION BUTTON - hanya untuk mobile */
.floating-add-btn {
  position: fixed;
  bottom: 80px; /* Above bottom navbar */
  right: 20px;
  width: 56px;
  height: 56px;
  background: #41442A;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(65, 68, 42, 0.3);
  transition: all 0.2s ease;
  z-index: 100;
}

@media (min-width: 768px) {
  .floating-add-btn {
    display: none; /* Hide on desktop */
  }
}

.floating-add-btn:hover {
  background: #2d2f1c;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(65, 68, 42, 0.4);
}

.floating-add-btn:active {
  transform: scale(0.95);
}

.fab-icon {
  width: 24px;
  height: 24px;
  color: white;
}

/* Modal Styles */
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

@media (min-width: 768px) {
  .modal-content {
    max-width: 480px;
  }
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

.modal-content h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 8px 0;
}

.modal-subtitle {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
}

.testimony-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  font-family: 'Inter';
  font-size: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  resize: vertical;
  box-sizing: border-box;
}

.testimony-textarea:focus {
  outline: none;
  border-color: #41442A;
}

.char-counter {
  text-align: right;
  font-family: 'Inter';
  font-size: 12px;
  color: #666;
  margin: 6px 0 16px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #666;
  font-family: 'Inter';
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #f9fafb;
}

/* Detail Modal Styles */
.detail-modal {
  max-width: 400px;
  width: 90%;
}

@media (min-width: 768px) {
  .detail-modal {
    max-width: 560px;
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.anonymous-status, .urgent-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
}

.anonymous-status {
  background: #f3f4f6;
  color: #6b7280;
}

.urgent-status {
  background: #fef2f2;
  color: #dc2626;
}

.anonymous-icon, .urgent-icon {
  width: 16px;
  height: 16px;
}

.detail-content h4 {
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 12px 0;
}

.prayer-text {
  font-family: 'Inter';
  font-size: 14px;
  color: #2d2f1c;
  line-height: 1.6;
  margin: 0 0 24px 0;
  white-space: pre-wrap;
}

.detail-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 768px) {
  .detail-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

.delete-btn, .close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  width: 100%;
}

@media (min-width: 768px) {
  .delete-btn, .close-btn {
    width: auto;
    min-width: 120px;
  }
}

.delete-btn {
  background: #dc2626;
  color: white;
}

.delete-btn:hover {
  background: #b91c1c;
}

.close-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.close-btn:hover {
  background: #e5e7eb;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* Delete Confirmation Modal */
.delete-modal {
  max-width: 320px;
  text-align: center;
}

@media (min-width: 768px) {
  .delete-modal {
    max-width: 400px;
  }
}

.delete-icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.delete-icon {
  width: 48px;
  height: 48px;
  color: #dc2626;
}

.delete-modal h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 12px 0;
}

.delete-message {
  font-family: 'Inter';
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.delete-actions {
  display: flex;
  gap: 12px;
}

.confirm-delete-btn {
  flex: 1;
  padding: 12px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.confirm-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ⭐ DELETE SUCCESS OVERLAY STYLES */
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

@media (min-width: 768px) {
  .success-modal {
    max-width: 480px;
    padding: 40px 32px 32px 32px;
  }
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

.success-icon.delete-success {
  background: linear-gradient(135deg, #f59e0b, #d97706);
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
  color: #d97706;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

@media (min-width: 768px) {
  .success-title {
    font-size: 24px;
  }
}

.success-message {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

@media (min-width: 768px) {
  .success-message {
    font-size: 16px;
  }
}

/* Success Actions */
.success-actions {
  margin-top: 20px;
}

/* ⭐ ERROR DELETE OVERLAY STYLES */
.error-overlay {
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

.error-modal {
  background: white;
  border-radius: 20px;
  padding: 32px 24px 24px 24px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideInScale 0.4s ease;
}

@media (min-width: 768px) {
  .error-modal {
    max-width: 480px;
    padding: 40px 32px 32px 32px;
  }
}

/* Error Icon */
.error-icon-container {
  margin-bottom: 20px;
}

.error-icon-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: successPulse 0.6s ease;
}

.error-icon {
  width: 40px;
  height: 40px;
  color: white;
  stroke-width: 3;
}

/* Error Content */
.error-content {
  margin-bottom: 24px;
}

.error-title {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

@media (min-width: 768px) {
  .error-title {
    font-size: 24px;
  }
}

.error-message {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

@media (min-width: 768px) {
  .error-message {
    font-size: 16px;
  }
}

/* Error Actions */
.error-actions {
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 360px) {
  .prayer-wrapper {
    padding: 12px;
  }
  
  .mobile-card {
    padding: 12px;
  }
  
  .floating-add-btn {
    width: 48px;
    height: 48px;
    bottom: 70px;
    right: 16px;
  }
  
  .fab-icon {
    width: 20px;
    height: 20px;
  }
}
</style>