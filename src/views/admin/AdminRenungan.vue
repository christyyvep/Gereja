<!-- AdminRenungan.vue - Halaman Admin untuk CRUD Renungan -->
<template>
  <div class="admin-renungan-container">
    <!-- Header dengan judul dan tombol add -->
    <div class="page-header">
      <h1 class="page-title">Kelola Renungan Harian</h1>
      <AdminButton 
        @click="showAddModal" 
        :icon="Plus"
        variant="primary"
        size="md"
      >
        Tambah Renungan
      </AdminButton>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="filterRenungan"
          placeholder="Cari renungan..."
          class="search-input"
        />
        <Search class="search-icon" />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Memuat renungan...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <AlertCircle class="error-icon" />
        <h3>Oops! Terjadi Kesalahan</h3>
        <p class="error-text">{{ error }}</p>
        <AdminButton 
          @click="fetchRenungan" 
          :icon="RefreshCw"
          variant="danger"
          size="sm"
        >
          Coba Lagi
        </AdminButton>
      </div>
    </div>

    <!-- Renungan Table -->
    <div v-else-if="filteredRenungan.length > 0" class="renungan-table-container">
      <div class="table-wrapper">
        <table class="renungan-table">
          <thead>
            <tr>
              <th>Judul</th>
              <th>Ayat Alkitab</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="renungan in paginatedRenungan" :key="renungan.id" class="table-row">
              <td class="title-cell">
                <div class="renungan-title">{{ renungan.title }}</div>
                <div class="renungan-summary">{{ truncateText(renungan.content, 80) }}</div>
              </td>
              <td class="verse-cell">
                <span class="verse-text">{{ renungan.verse || '-' }}</span>
              </td>
              <td class="date-cell">{{ formatDate(renungan.date || renungan.createdAt) }}</td>
              <td class="action-cell">
                <button @click="editRenungan(renungan)" class="edit-btn" title="Edit">
                  <Edit2 class="btn-icon" />
                </button>
                <button 
                  @click="broadcastToTelegram(renungan)" 
                  class="telegram-btn" 
                  title="Broadcast ke Telegram"
                  :disabled="broadcastingIds.includes(renungan.id)"
                >
                  <Send class="btn-icon" v-if="!broadcastingIds.includes(renungan.id)" />
                  <div class="btn-loading" v-else></div>
                </button>
                <button @click="deleteRenungan(renungan)" class="delete-btn" title="Hapus">
                  <Trash2 class="btn-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <AdminButton 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1" 
          variant="secondary"
          size="sm"
        >
          Sebelumnya
        </AdminButton>
        
        <span class="pagination-info">
          Halaman {{ currentPage }} dari {{ totalPages }}
        </span>
        
        <AdminButton 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages" 
          variant="secondary"
          size="sm"
        >
          Selanjutnya
        </AdminButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="desktop-empty">
      <div class="empty-card">
        <BookOpen class="empty-icon" />
        <h3>Belum Ada Renungan</h3>
        <p>Klik tombol "Tambah Renungan" untuk membuat renungan baru.</p>
        <AdminButton 
          @click="showAddModal" 
          :icon="Plus"
          variant="primary"
          size="lg"
        >
          Tambah Renungan Pertama
        </AdminButton>
      </div>
    </div>

    <!-- Modal Add/Edit Renungan -->
    <RenunganModal
      v-if="showModal"
      :renungan="selectedRenungan"
      :mode="modalMode"
      @close="hideModal"
      @save="saveRenungan"
    />

    <!-- Modal Konfirmasi Delete -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="Hapus Renungan"
      :message="`Apakah Anda yakin ingin menghapus renungan '${renunganToDelete?.title}'?`"
      confirmText="Hapus"
      confirmColor="#ef4444"
      @confirm="confirmDelete"
      @cancel="hideDeleteModal"
    />
  </div>
</template>

<script>
import RenunganModal from '@/components/admin/RenunganModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import AdminButton from '@/components/admin/AdminButton.vue'
import { useUserStore } from '@/stores/userStore'
import { 
  BookOpen,
  Plus,
  RefreshCw, 
  AlertCircle,
  Edit2,
  Trash2,
  Search,
  Send
} from 'lucide-vue-next'
import { 
  getDevotionalsForAdmin,
  addDevotional,
  updateDevotional,
  deleteDevotional
} from '@/services/devotionals'
import { useToast } from '@/composables/useToast'
import telegramService from '@/services/telegramService'
import { scheduleRenunganTelegram } from '@/services/telegramScheduler'

export default {
  name: 'AdminRenungan',
  
  setup() {
    const {
      showSuccess,
      showError,
      saveSuccess,
      saveError,
      deleteSuccess,
      deleteError,
      updateSuccess,
      updateError
    } = useToast()
    
    return {
      showSuccess,
      showError,
      saveSuccess,
      saveError,
      deleteSuccess,
      deleteError,
      updateSuccess,
      updateError
    }
  },
  
  components: {  
    RenunganModal,
    ConfirmModal,
    AdminButton,    
    BookOpen,
    AlertCircle,
    Edit2,
    Trash2,
    Search,
    Send
  },
  
  data() {
    return {
      // Icon components for AdminButton props
      Plus,
      RefreshCw,
      
      allRenungan: [],         // All renungan data
      filteredRenungan: [],    // Filtered renungan data
      loading: true,           // Status loading
      error: null,            // Pesan error
      
      // Search
      searchQuery: '',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Modal states
      showModal: false,
      modalMode: 'add',        // 'add' atau 'edit'
      selectedRenungan: null,
      
      // Delete confirmation
      showDeleteConfirm: false,
      renunganToDelete: null,
      
      // Telegram broadcast
      // Telegram broadcasting state
      broadcastingIds: []      // IDs renungan yang sedang dikirim ke Telegram
    }
  },
  
  computed: {
    paginatedRenungan() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredRenungan.slice(start, end)
    },
    
    totalPages() {
      return Math.ceil(this.filteredRenungan.length / this.itemsPerPage)
    },
    
    // Add userStore as computed property
    userStore() {
      return useUserStore()
    }
  },
  
  async created() {
    await this.fetchRenungan()
  },
  
  methods: {
    /**
     * Mengambil data renungan dari service
     */
    async fetchRenungan() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [AdminRenungan] Mengambil renungan...')
        
        // Ambil semua renungan untuk admin (termasuk yang dijadwalkan)
        const renunganData = await getDevotionalsForAdmin(100)
        
        console.log('✅ [AdminRenungan] Renungan berhasil dimuat:', renunganData.length)
        
        this.allRenungan = renunganData
        this.filterRenungan()
        
      } catch (error) {
        console.error('❌ [AdminRenungan] Error memuat renungan:', error)
        this.error = 'Gagal memuat renungan. Pastikan koneksi internet Anda stabil.'
      } finally {
        this.loading = false
      }
    },

    /**
     * Filter renungan berdasarkan search query
     */
    filterRenungan() {
      let filtered = [...this.allRenungan]
      
      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(renungan => 
          renungan.title?.toLowerCase().includes(query) ||
          renungan.content?.toLowerCase().includes(query) ||
          renungan.verse?.toLowerCase().includes(query)
        )
      }
      
      this.filteredRenungan = filtered
      this.currentPage = 1 // Reset to first page when filtering
    },

    /**
     * Pagination
     */
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    /**
     * Tampilkan modal untuk menambah renungan baru
     */
    showAddModal() {
      this.modalMode = 'add'
      this.selectedRenungan = null
      this.showModal = true
    },

    /**
     * Tampilkan modal untuk edit renungan
     * @param {Object} renungan - Renungan to edit
     */
    editRenungan(renungan) {
      this.modalMode = 'edit'
      this.selectedRenungan = { ...renungan }
      this.showModal = true
    },

    /**
     * Sembunyikan modal
     */
    hideModal() {
      this.showModal = false
      this.selectedRenungan = null
    },

    /**
     * Simpan renungan (create atau update)
     * @param {Object} renunganData - Data renungan
     */
    async saveRenungan(renunganData) {
      try {
        console.log('💾 [AdminRenungan] Menyimpan renungan...', renunganData)

        // Get admin ID for activity logging dengan fallback ke localStorage
        const adminId = this.getAdminId()
        
        if (this.modalMode === 'add') {
          const enrichedData = { 
            ...renunganData, 
            createdBy: adminId 
          }
          const newRenunganId = await addDevotional(enrichedData)
          const newRenungan = { id: newRenunganId, ...enrichedData }
          this.allRenungan.unshift(newRenungan) // Add to beginning
          
          // 🚀 SMART AUTO-SCHEDULE: Cek apakah renungan untuk hari ini atau masa depan
          if (renunganData.date) {
            try {
              console.log('📅 [AdminRenungan] Processing renungan scheduling...')
              
              const renunganDate = new Date(renunganData.date)
              const today = new Date()
              
              // Reset time untuk perbandingan tanggal saja
              renunganDate.setHours(0, 0, 0, 0)
              today.setHours(0, 0, 0, 0)
              
              const scheduledDate = new Date(renunganData.date).toISOString().split('T')[0]
              
              if (renunganDate.getTime() === today.getTime()) {
                // 🚀 HARI INI: Langsung kirim sekarang
                console.log('� [AdminRenungan] Renungan untuk hari ini, kirim langsung!')
                
                // Konfirmasi admin
                const confirmSend = confirm(
                  `Renungan ini untuk hari ini (${this.formatDate(renunganData.date)}).\n\n` +
                  `Kirim sekarang ke semua jemaat Telegram?`
                )
                
                if (confirmSend) {
                  try {
                    // Import telegram service untuk kirim langsung
                    const result = await telegramService.sendRenunganToTelegram(newRenungan)
                    
                    if (result.success) {
                      this.showNotification(
                        `Renungan berhasil ditambahkan dan langsung dikirim ke ${result.results.success} jemaat Telegram!`, 
                        'success'
                      )
                      
                      if (result.results.failed > 0) {
                        console.warn(`⚠️ ${result.results.failed} jemaat gagal menerima renungan`)
                      }
                    } else {
                      throw new Error('Gagal mengirim ke Telegram')
                    }
                  } catch (sendError) {
                    console.error('❌ [AdminRenungan] Gagal kirim langsung:', sendError)
                    // Fallback: jadwalkan untuk nanti
                    await scheduleRenunganTelegram(newRenungan, scheduledDate)
                    this.showNotification(
                      'Renungan berhasil ditambahkan, tetapi gagal dikirim langsung. Sudah dijadwalkan untuk dikirim otomatis nanti.', 
                      'success'
                    )
                  }
                } else {
                  // Admin pilih tidak kirim sekarang, jadwalkan saja
                  await scheduleRenunganTelegram(newRenungan, scheduledDate)
                  this.showNotification(
                    `Renungan berhasil ditambahkan dan dijadwalkan untuk dikirim otomatis pada ${this.formatDate(renunganData.date)}!`, 
                    'success'
                  )
                }
              } else if (renunganDate.getTime() > today.getTime()) {
                // 📅 MASA DEPAN: Jadwalkan untuk dikirim otomatis pukul 00:00
                console.log('📅 [AdminRenungan] Renungan untuk masa depan, dijadwalkan otomatis')
                await scheduleRenunganTelegram(newRenungan, scheduledDate)
                this.showNotification(
                  `Renungan berhasil ditambahkan dan dijadwalkan untuk dikirim otomatis pada ${this.formatDate(renunganData.date)} pukul 00:00!`, 
                  'success'
                )
              } else {
                // 📜 MASA LALU: Hanya simpan, tidak kirim/jadwalkan
                console.log('📜 [AdminRenungan] Renungan untuk masa lalu, hanya disimpan')
                this.showNotification(
                  `Renungan untuk tanggal masa lalu (${this.formatDate(renunganData.date)}) berhasil ditambahkan sebagai arsip.`, 
                  'success'
                )
              }
              
            } catch (scheduleError) {
              console.error('❌ [AdminRenungan] Auto-schedule/send failed:', scheduleError)
              this.showNotification('Renungan berhasil ditambahkan, tetapi gagal diproses untuk Telegram. Anda bisa kirim manual.', 'success')
            }
          } else {
            this.showNotification('Renungan berhasil ditambahkan!', 'success')
          }
        } else {
          const enrichedData = { 
            ...renunganData, 
            updatedBy: adminId 
          }
          await updateDevotional(this.selectedRenungan.id, enrichedData)
          
          // Update local data
          const index = this.allRenungan.findIndex(r => r.id === this.selectedRenungan.id)
          if (index !== -1) {
            this.allRenungan[index] = { ...this.allRenungan[index], ...enrichedData }
          }
          
          this.showNotification('Renungan berhasil diperbarui!', 'success')
        }

        this.hideModal()
        this.filterRenungan()

      } catch (error) {
        console.error('❌ [AdminRenungan] Error menyimpan renungan:', error)
        this.showNotification('Gagal menyimpan renungan. Silakan coba lagi.', 'error')
      }
    },

    /**
     * Validasi authentication dan permissions untuk admin (RELAXED)
     */
    async validateAdminPermissions() {
      try {
        console.log('🔐 [AdminRenungan] Validating admin permissions...')
        
        // Check bypass flag first
        const bypassValidation = localStorage.getItem('admin_bypass_validation')
        if (bypassValidation === 'true') {
          console.log('🚀 [AdminRenungan] Bypass validation enabled')
          return true
        }
        
        // Check user store (relaxed validation)
        if (!this.userStore) {
          console.warn('⚠️ [AdminRenungan] No userStore, checking localStorage...')
          
          // Fallback to localStorage
          const localUser = localStorage.getItem('myrajawali_user')
          if (localUser) {
            const userData = JSON.parse(localUser)
            console.log('🔄 [AdminRenungan] Using localStorage user:', userData.nama)
            return true
          }
          
          throw new Error('User tidak ditemukan. Silakan login ulang.')
        }
        
        // Check if user has nama (relaxed - don't require namaUser specifically)
        const userName = this.getAdminName()
        if (!userName || userName === 'Admin') {
          console.warn('⚠️ [AdminRenungan] No specific userName, using fallback')
          console.warn('⚠️ [AdminRenungan] No userName in userStore, checking localStorage...')
          
          const localUser = localStorage.getItem('myrajawali_user')
          if (localUser) {
            const userData = JSON.parse(localUser)
            if (userData.nama) {
              console.log('🔄 [AdminRenungan] Found user in localStorage:', userData.nama)
              return true
            }
          }
          
          throw new Error('Nama user tidak ditemukan. Silakan login ulang.')
        }
        
        // Check role (relaxed - accept multiple role formats)
        let userRole = 'jemaat'
        if (this.userStore && this.userStore.role) {
          userRole = this.userStore.role
        } else {
          // Fallback ke localStorage
          const localUser = localStorage.getItem('myrajawali_user')
          if (localUser) {
            const userData = JSON.parse(localUser)
            userRole = userData.role || 'jemaat'
          }
        }
        const allowedRoles = ['admin', 'gembala', 'operator', 'moderator']
        
        if (!allowedRoles.includes(userRole)) {
          // Check localStorage for role
          const localUser = localStorage.getItem('myrajawali_user')
          if (localUser) {
            const userData = JSON.parse(localUser)
            if (allowedRoles.includes(userData.role)) {
              console.log('🔄 [AdminRenungan] Found valid role in localStorage:', userData.role)
              return true
            }
          }
          
          throw new Error(`Role '${userRole}' tidak memiliki akses untuk menghapus renungan.`)
        }
        
        // Session check (relaxed - allow expired sessions for now)
        const session = localStorage.getItem('myrajawali_session')
        if (!session) {
          console.warn('⚠️ [AdminRenungan] No session found, but allowing based on user data')
          // Don't throw error, just warn
        } else {
          const sessionData = JSON.parse(session)
          if (sessionData.expiresAt && sessionData.expiresAt < Date.now()) {
            console.warn('⚠️ [AdminRenungan] Session expired, but allowing for admin')
            // Don't throw error for admin users
          }
        }
        
        console.log('✅ [AdminRenungan] Admin permissions validated (relaxed):', {
          user: userName,
          role: userRole,
          method: 'relaxed_validation'
        })
        
        return true
        
      } catch (error) {
        console.error('❌ [AdminRenungan] Permission validation failed:', error)
        throw error
      }
    },

    /**
     * Tampilkan konfirmasi delete
     * @param {Object} renungan - Renungan to delete
     */
    async deleteRenungan(renungan) {
      try {
        // Validate permissions first
        await this.validateAdminPermissions()
        
        this.renunganToDelete = renungan
        this.showDeleteConfirm = true
        
      } catch (error) {
        console.error('❌ [AdminRenungan] Cannot delete - permission error:', error)
        this.showNotification(error.message, 'error')
      }
    },

    /**
     * Sembunyikan modal delete
     */
    hideDeleteModal() {
      this.showDeleteConfirm = false
      this.renunganToDelete = null
    },

    /**
     * Konfirmasi delete renungan
     */
    async confirmDelete() {
      try {
        console.log('🗑️ [AdminRenungan] Memulai proses hapus renungan...', {
          id: this.renunganToDelete?.id,
          title: this.renunganToDelete?.title,
          user: this.userStore.namaUser
        })

        if (!this.renunganToDelete) {
          throw new Error('Tidak ada renungan yang dipilih untuk dihapus')
        }

        // Get admin ID untuk activity logging dengan fallback
        const adminId = this.getAdminId()
        console.log(`👤 [AdminRenungan] Admin ID: ${adminId}`)
        
        // Perform delete
        const deleteResult = await deleteDevotional(this.renunganToDelete.id, adminId)
        console.log('✅ [AdminRenungan] Delete result:', deleteResult)
        
        // Remove from local data
        const originalLength = this.allRenungan.length
        this.allRenungan = this.allRenungan.filter(r => r.id !== this.renunganToDelete.id)
        console.log(`📋 [AdminRenungan] Local data updated: ${originalLength} -> ${this.allRenungan.length}`)
        
        // Refresh filtered data
        this.filterRenungan()
        
        this.showNotification('Renungan berhasil dihapus!', 'success')
        this.hideDeleteModal()

      } catch (error) {
        console.error('❌ [AdminRenungan] Error menghapus renungan:', error)
        console.error('❌ [AdminRenungan] Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack,
          renunganId: this.renunganToDelete?.id,
          adminName: this.getAdminName(),
          adminId: this.getAdminId()
        })
        
        let errorMessage = 'Gagal menghapus renungan. '
        
        // Provide specific error messages
        if (error.message.includes('permission-denied')) {
          errorMessage += 'Anda tidak memiliki akses untuk menghapus renungan. Pastikan Anda login sebagai admin.'
        } else if (error.message.includes('not found')) {
          errorMessage += 'Renungan tidak ditemukan atau sudah dihapus.'
        } else {
          errorMessage += error.message
        }
        
        this.showNotification(errorMessage, 'error')
      }
    },

    /**
     * Format tanggal
     * @param {*} date - Date object or string
     */
    formatDate(date) {
      if (!date) return '-'
      
      try {
        let dateObj = date
        if (date.toDate) {
          dateObj = date.toDate()
        } else if (typeof date === 'string') {
          dateObj = new Date(date)
        }
        
        return dateObj.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } catch (error) {
        return '-'
      }
    },

    /**
     * Truncate text
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     */
    truncateText(text, maxLength = 100) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substr(0, maxLength) + '...'
    },

    /**
     * Tampilkan notifikasi
     */
    showNotification(message, type) {
      if (type === 'success') {
        this.showSuccess(message)
      } else {
        this.showError(message)
      }
    },

    /**
     * Broadcast renungan ke Telegram jemaat yang sudah approved
     */
    async broadcastToTelegram(renungan) {
      if (this.broadcastingIds.includes(renungan.id)) return
      
      // Konfirmasi admin
      const confirmed = confirm(`Kirim renungan "${renungan.title}" ke Telegram?\n\nRenungan akan dikirim ke semua jemaat yang sudah di-approve.`)
      if (!confirmed) return
      
      this.broadcastingIds.push(renungan.id)
      
      try {
        console.log('📤 Broadcasting renungan to Telegram:', renungan.title)
        
        // Kirim melalui telegram service
        const result = await telegramService.sendRenunganToTelegram(renungan)
        
        if (result.success) {
          this.showSuccess(`Renungan berhasil dikirim ke ${result.results.success} jemaat Telegram!`)
          
          if (result.results.failed > 0) {
            console.warn(`⚠️ ${result.results.failed} jemaat gagal menerima renungan`)
          }
        } else {
          throw new Error('Broadcast gagal')
        }
        
      } catch (error) {
        console.error('❌ Error broadcasting renungan:', error)
        this.showError('Gagal mengirim renungan ke Telegram: ' + error.message)
      } finally {
        // Remove from broadcasting list
        this.broadcastingIds = this.broadcastingIds.filter(id => id !== renungan.id)
      }
    },

    /**
     * Get admin ID dengan fallback ke localStorage jika userStore tidak tersedia
     */
    getAdminId() {
      try {
        // Try userStore first
        if (this.userStore && (this.userStore.userId || this.userStore.namaUser)) {
          return this.userStore.userId || this.userStore.namaUser
        }
        
        // Fallback ke localStorage
        const localUser = localStorage.getItem('myrajawali_user')
        if (localUser) {
          const userData = JSON.parse(localUser)
          return userData.id || userData.nama || 'admin'
        }
        
        return 'admin'
      } catch (error) {
        console.warn('⚠️ [AdminRenungan] Error getting admin ID:', error)
        return 'admin'
      }
    },

    /**
     * Get admin name dengan fallback
     */
    getAdminName() {
      try {
        // Try userStore first
        if (this.userStore && this.userStore.namaUser) {
          return this.userStore.namaUser
        }
        
        // Fallback ke localStorage
        const localUser = localStorage.getItem('myrajawali_user')
        if (localUser) {
          const userData = JSON.parse(localUser)
          return userData.nama || 'Admin'
        }
        
        return 'Admin'
      } catch (error) {
        console.warn('⚠️ [AdminRenungan] Error getting admin name:', error)
        return 'Admin'
      }
    }
  }
}
</script>

<style scoped>
.admin-renungan-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
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

/* Search Section */
.search-section {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Inter';
  font-size: 14px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #666;
}

/* Loading & Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  gap: 16px;
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
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
}

.error-text {
  color: #666;
  font-family: 'Inter';
  font-size: 14px;
  margin: 0;
}

/* Table Styles */
.renungan-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.table-wrapper {
  overflow-x: auto;
}

.renungan-table {
  width: 100%;
  border-collapse: collapse;
}

.renungan-table th {
  background: #f8f9fa;
  padding: 16px;
  text-align: left;
  font-family: 'Inter';
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
}

.renungan-table td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}

.table-row:hover {
  background: #f8f9fa;
}

/* Table Cell Styles */
.title-cell {
  max-width: 300px;
}

.renungan-title {
  font-family: 'Inter';
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.renungan-summary {
  font-family: 'Inter';
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.verse-cell {
  max-width: 200px;
}

.verse-text {
  font-family: 'Inter';
  font-size: 13px;
  color: #555;
  font-style: italic;
}

.date-cell {
  font-family: 'Inter';
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

/* Action Buttons */
.edit-btn, .delete-btn, .telegram-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 4px;
  transition: all 0.2s ease;
}

.edit-btn {
  color: #1976d2;
}

.edit-btn:hover {
  background: #e3f2fd;
}

.telegram-btn {
  color: #0088cc;
  position: relative;
}

.telegram-btn:hover:not(:disabled) {
  background: #e8f4fd;
}

.telegram-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn {
  color: #d32f2f;
}

.delete-btn:hover {
  background: #ffebee;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn-loading {
  width: 16px;
  height: 16px;
  border: 2px solid #e3f2fd;
  border-top: 2px solid #0088cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.pagination-info {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
}

/* Empty State */
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

.empty-icon {
  width: 64px;
  height: 64px;
  color: #ccc;
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

/* Responsive */
@media (max-width: 768px) {
  .admin-renungan-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
    text-align: center;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select, .search-box {
    max-width: none;
  }

  .renungan-table {
    font-size: 14px;
  }

  .renungan-table th,
  .renungan-table td {
    padding: 12px 8px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
