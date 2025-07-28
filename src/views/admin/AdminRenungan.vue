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
import { 
  BookOpen,
  Plus,
  RefreshCw, 
  AlertCircle,
  Edit2,
  Trash2,
  Search
} from 'lucide-vue-next'
import { 
  getDevotionalsForAdmin,
  addDevotional,
  updateDevotional,
  deleteDevotional
} from '@/services/devotionals'
import { useToast } from '@/composables/useToast'

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
    Search
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
      renunganToDelete: null
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

        // Add admin identifier untuk activity logging
        const adminId = this.userStore.userId || this.userStore.namaUser || 'admin'
        
        if (this.modalMode === 'add') {
          const enrichedData = { 
            ...renunganData, 
            createdBy: adminId 
          }
          const newRenunganId = await addDevotional(enrichedData)
          const newRenungan = { id: newRenunganId, ...enrichedData }
          this.allRenungan.unshift(newRenungan) // Add to beginning
          this.showNotification('Renungan berhasil ditambahkan!', 'success')
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
     * Tampilkan konfirmasi delete
     * @param {Object} renungan - Renungan to delete
     */
    deleteRenungan(renungan) {
      this.renunganToDelete = renungan
      this.showDeleteConfirm = true
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
        console.log('🗑️ [AdminRenungan] Menghapus renungan...', this.renunganToDelete.id)

        // Get admin ID for activity logging
        const adminId = this.userStore.userId || this.userStore.namaUser || 'admin'
        
        await deleteDevotional(this.renunganToDelete.id, adminId)
        
        // Remove from local data
        this.allRenungan = this.allRenungan.filter(r => r.id !== this.renunganToDelete.id)
        this.filterRenungan()
        
        this.showNotification('Renungan berhasil dihapus!', 'success')
        this.hideDeleteModal()

      } catch (error) {
        console.error('❌ [AdminRenungan] Error menghapus renungan:', error)
        this.showNotification('Gagal menghapus renungan. Silakan coba lagi.', 'error')
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
.action-cell {
  white-space: nowrap;
}

.edit-btn, .delete-btn {
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
