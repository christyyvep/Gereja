<!-- src/views/PrayerRequestPage.vue - SIMPLE WIREFRAME -->
<template>
  <div class="prayer-request-container">
    <div class="prayer-wrapper">
      <!-- Header dengan tombol back -->
      <HeaderWithBack title="Prayer Request" />

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
            class="prayer-card"
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
import { Plus, EyeOff, AlertCircle, Trash2 } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore.js'

// ⭐ IMPORT PERSONAL FUNCTIONS - hanya untuk user sendiri
import { getPrayerRequestsByUser, addTestimony, getPrayerCategories, deletePrayerRequest } from '@/services/prayerRequests.js'

export default {
  name: 'PrayerRequestPage',
  components: {
    HeaderWithBack,
    ButtonPrimary,
    Plus,
    EyeOff,
    AlertCircle,
    Trash2
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
      
      // Testimony Modal
      showTestimonyModal: false,
      testimonyText: '',
      isSubmittingTestimony: false,
      
      // Categories
      categories: getPrayerCategories()
    }
  },
  
  async created() {
    await this.fetchMyPrayerRequests() // ⭐ FETCH PERSONAL PRAYERS
  },
  
  methods: {
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
        
        // Show success message
        alert('✅ Permintaan doa berhasil dihapus!')
        
      } catch (error) {
        console.error('❌ [PrayerRequest] Error deleting prayer:', error)
        alert('❌ Gagal menghapus permintaan doa: ' + error.message)
      } finally {
        this.isDeleting = false
      }
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
          alert('Testimoni tidak boleh kosong!')
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
        alert('✅ Testimoni berhasil ditambahkan!')

      } catch (error) {
        console.error('Error submitting testimony:', error)
        alert('❌ Gagal menambahkan testimoni: ' + error.message)
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
  padding-bottom: 100px; /* Space for floating button */
}

.prayer-wrapper {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
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

/* Prayer Cards - SIMPLE sesuai wireframe */
.prayers-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prayer-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(65, 68, 42, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.prayer-card:hover {
  background: #fafafa;
  border-color: #41442A;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(65, 68, 42, 0.15);
}

.prayer-card:active {
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

/* ⭐ FLOATING ACTION BUTTON - sesuai wireframe */
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

/* Responsive */
@media (max-width: 360px) {
  .prayer-wrapper {
    padding: 12px;
  }
  
  .prayer-card {
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