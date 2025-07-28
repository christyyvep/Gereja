<template>
  <div class="admin-prayer-requests">
    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-praying-hands"></i>
          Kelola Prayer Requests
        </h1>
        <p class="page-subtitle">Kelola dan pantau permintaan doa dari jemaat</p>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fas fa-list"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalPrayers }}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        
        <div class="stat-card prayed">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ prayedPrayers }}</h3>
            <p>Sudah Didoakan</p>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <h3>{{ activePrayers }}</h3>
            <p>Belum Didoakan</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filters-left">
          <div class="filter-group">
            <label>Kategori:</label>
            <select v-model="filterCategory" @change="applyFilters">
              <option value="">Semua Kategori</option>
              <option v-for="category in prayerCategories" 
                      :key="category.value" 
                      :value="category.value">
                {{ category.icon }} {{ category.label }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Urgensi:</label>
            <select v-model="filterUrgency" @change="applyFilters">
              <option value="">Semua</option>
              <option value="urgent">Mendesak</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
        
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="applyFilters"
            placeholder="Cari berdasarkan judul, isi, atau nama user..."
          >
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat prayer requests...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPrayers.length === 0" class="empty-state">
      <i class="fas fa-praying-hands"></i>
      <h3>Tidak ada prayer request</h3>
      <p v-if="searchQuery || filterStatus || filterCategory">
        Tidak ada prayer request yang sesuai dengan filter
      </p>
      <p v-else>
        Belum ada prayer request dari jemaat
      </p>
    </div>

    <!-- Prayer Requests List -->
    <div v-else class="prayers-list">
      <div 
        v-for="prayer in paginatedPrayers" 
        :key="prayer.id"
        class="prayer-card"
        :class="{ 
          'prayed': prayer.isPrayed || prayer.isPrayedByAdmin
        }"
      >
        <!-- Card Header - All elements in one row -->
        <div class="prayer-header">
          <!-- User Info -->
          <div class="user-info">
            <i class="fas fa-user"></i>
            <span v-if="!prayer.isAnonymous">
              {{ getUserDisplayName(prayer) }}
            </span>
            <span v-else>Pengguna Anonim</span>
          </div>
          
          <!-- Category -->
          <div class="category">
            {{ getCategoryIcon(prayer.category) }} 
            {{ getCategoryLabel(prayer.category) }}
          </div>
          
          <!-- Urgent Status -->
          <div v-if="prayer.isUrgent" class="urgent-badge">
            🚨 Mendesak
          </div>
          
          <!-- Date -->
          <div class="date">
            {{ formatDate(prayer.createdAt) }}
          </div>
        </div>

        <!-- Prayer Content -->
        <div class="prayer-content">
          <h3 class="prayer-title">{{ prayer.title }}</h3>
          <p class="prayer-description">{{ getShortDescription(prayer.description) }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="prayer-actions">
          <button 
            @click="viewDetails(prayer)"
            class="btn btn-info"
          >
            <i class="fas fa-eye"></i>
            Lihat Detail
          </button>
          
          <button 
            v-if="!prayer.isPrayed && !prayer.isPrayedByAdmin"
            @click="markAsPrayed(prayer)"
            class="btn btn-primary"
            :disabled="processingId === prayer.id"
          >
            <i class="fas fa-check"></i>
            {{ processingId === prayer.id ? 'Memproses...' : 'Tandai Sudah Didoakan' }}
          </button>
          
          <span v-else class="prayed-status">
            <i class="fas fa-check-circle"></i>
            Sudah Didoakan
          </span>
          
          <!-- ⭐ NEW: Delete button for admin -->
          <button 
            @click="confirmDeletePrayer(prayer)"
            class="btn btn-danger"
            :disabled="processingId === prayer.id"
            title="Hapus Prayer Request"
          >
            <i class="fas fa-trash"></i>
            Hapus
          </button>
          
          <!-- ⭐ NEW: Refresh button -->
          <button 
            @click="refreshData"
            class="btn btn-secondary"
            :disabled="loading"
            title="Refresh Data"
          >
            <i class="fas fa-sync-alt"></i>
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="currentPage = 1" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ««
      </button>
      
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ‹
      </button>
      
      <span class="page-info">
        {{ currentPage }} / {{ totalPages }}
      </span>
      
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        ›
      </button>
      
      <button 
        @click="currentPage = totalPages" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        »»
      </button>
    </div>

    <!-- Modal untuk Detail Prayer - Using PrayerModal Component -->
    <PrayerModal
      :show="showDetailModal"
      :prayer="selectedPrayer"
      :show-admin-actions="true"
      :processing="processingModal"
      @close="closeDetailModal"
      @mark-as-prayed="handleMarkAsPrayed"
      @delete-prayer="handleDeleteFromModal"
    />

    <!-- ⭐ NEW: Modal untuk Konfirmasi Hapus -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="closeDeleteConfirm">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Konfirmasi Hapus Prayer Request</h3>
          <button @click="closeDeleteConfirm" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedPrayer" class="delete-confirmation">
            <div class="warning-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4>Apakah Anda yakin ingin menghapus prayer request ini?</h4>
            <div class="prayer-info">
              <p><strong>Judul:</strong> {{ selectedPrayer.title }}</p>
              <p><strong>Dari:</strong> {{ selectedPrayer.isAnonymous ? 'Pengguna Anonim' : getUserDisplayName(selectedPrayer) }}</p>
              <p><strong>Tanggal:</strong> {{ formatDate(selectedPrayer.createdAt) }}</p>
            </div>
            <p class="warning-text">
              <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Prayer request akan dihapus permanen dari database.
            </p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDeleteConfirm" class="btn btn-secondary">
            Batal
          </button>
          <button 
            @click="deletePrayer" 
            :disabled="isDeleting"
            class="btn btn-danger"
          >
            <i class="fas fa-trash"></i>
            {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  getAllPrayerRequestsForAdmin, 
  markPrayerAsPrayed,
  deletePrayerRequest,
  getPrayerCategories 
} from '@/services/prayerRequests'
import { getCurrentJemaat } from '@/services/auth'
import PrayerModal from '@/components/modals/PrayerModal.vue'

export default {
  name: 'AdminPrayerRequests',
  
  components: {
    PrayerModal
  },
  
  data() {
    return {
      // Data
      prayers: [],
      filteredPrayers: [],
      prayerCategories: [],
      
      // Loading states
      loading: true,
      processingId: null,
      
      // Filters
      searchQuery: '',
      filterCategory: '',
      filterUrgency: '',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Modals
      showDetailModal: false,
      showDeleteConfirm: false,
      selectedPrayer: null,
      
      // Modal processing state
      processingModal: false,
      
      // Delete states
      isDeleting: false,
      deleteErrorMessage: ''
    }
  },
  
  computed: {
    totalPrayers() {
      return this.prayers.length
    },
    
    activePrayers() {
      return this.prayers.filter(p => !p.isPrayed && !p.isPrayedByAdmin).length
    },
    
    prayedPrayers() {
      return this.prayers.filter(p => p.isPrayed || p.isPrayedByAdmin).length
    },
    
    totalPages() {
      return Math.ceil(this.filteredPrayers.length / this.itemsPerPage)
    },
    
    paginatedPrayers() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredPrayers.slice(start, end)
    }
  },
  
  async mounted() {
    await this.loadData()
  },
  
  methods: {
    async loadData() {
      try {
        this.loading = true
        
        // Load prayer categories
        this.prayerCategories = getPrayerCategories()
        
        // Load all prayer requests
        this.prayers = await getAllPrayerRequestsForAdmin(100)
        this.applyFilters()
        
        console.log('✅ [AdminPrayerRequests] Data loaded:', this.prayers.length)
        
      } catch (error) {
        console.error('❌ [AdminPrayerRequests] Error loading data:', error)
        this.$toast.error('Gagal memuat data prayer requests')
      } finally {
        this.loading = false
      }
    },
    
    applyFilters() {
      let filtered = [...this.prayers]
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(prayer => 
          prayer.title.toLowerCase().includes(query) ||
          prayer.description.toLowerCase().includes(query) ||
          prayer.userId.toLowerCase().includes(query) ||
          (prayer.userName && prayer.userName.toLowerCase().includes(query)) // ⭐ ADDED: Search by userName
        )
      }
      
      // Filter by category
      if (this.filterCategory) {
        filtered = filtered.filter(prayer => prayer.category === this.filterCategory)
      }
      
      // Filter by urgency
      if (this.filterUrgency) {
        if (this.filterUrgency === 'urgent') {
          filtered = filtered.filter(prayer => prayer.isUrgent)
        } else {
          filtered = filtered.filter(prayer => !prayer.isUrgent)
        }
      }
      
      this.filteredPrayers = filtered
      this.currentPage = 1 // Reset to first page
    },
    
    async markAsPrayed(prayer) {
      try {
        this.processingId = prayer.id
        
        const currentUser = await getCurrentJemaat()
        if (!currentUser) {
          throw new Error('User tidak ditemukan')
        }
        
        console.log('🙏 Marking prayer as prayed with user:', currentUser)
        
        await markPrayerAsPrayed(prayer.id, currentUser.id, '', currentUser.nama || currentUser.name || currentUser.id)
        
        // Update local data
        const index = this.prayers.findIndex(p => p.id === prayer.id)
        if (index !== -1) {
          this.prayers[index] = {
            ...this.prayers[index],
            isPrayed: true,
            isPrayedByAdmin: true,
            prayedByAdminId: currentUser.id,
            prayedByAdminAt: new Date().toISOString()
          }
        }
        
        this.applyFilters()
        this.$toast.success('Prayer request berhasil ditandai sudah didoakan')
        
      } catch (error) {
        console.error('❌ Error marking as prayed:', error)
        this.$toast.error('Gagal menandai prayer request: ' + (error.message || 'Unknown error'))
      } finally {
        this.processingId = null
      }
    },
    
    viewDetails(prayer) {
      this.selectedPrayer = prayer
      this.showDetailModal = true
    },
    
    closeDetailModal() {
      this.showDetailModal = false
      this.selectedPrayer = null
    },
    
    // ⭐ NEW: Delete functionality for admin
    confirmDeletePrayer(prayer) {
      this.selectedPrayer = prayer
      this.showDeleteConfirm = true
    },
    
    closeDeleteConfirm() {
      this.showDeleteConfirm = false
      this.selectedPrayer = null
      this.deleteErrorMessage = ''
    },

    // ⭐ NEW: Handlers for PrayerModal component
    async handleMarkAsPrayed(prayer) {
      try {
        this.processingModal = true
        
        console.log('✅ [AdminPrayerRequests] Marking prayer as prayed:', prayer.id)
        
        await markPrayerAsPrayed(prayer.id, true)
        
        // Update local data
        const index = this.prayers.findIndex(p => p.id === prayer.id)
        if (index !== -1) {
          this.prayers[index].isPrayedByAdmin = true
        }
        
        this.applyFilters()
        this.closeDetailModal()
        
        this.$toast.success('Prayer request berhasil ditandai sudah didoakan')
        
      } catch (error) {
        console.error('❌ [AdminPrayerRequests] Error marking prayer as prayed:', error)
        this.$toast.error('Gagal menandai prayer request sebagai sudah didoakan')
      } finally {
        this.processingModal = false
      }
    },

    async handleDeleteFromModal(prayer) {
      try {
        this.processingModal = true
        
        console.log('🗑️ [AdminPrayerRequests] Deleting prayer from modal:', prayer.id)
        
        await deletePrayerRequest(prayer.id)
        
        // Remove from local list
        this.prayers = this.prayers.filter(p => p.id !== prayer.id)
        this.applyFilters()
        
        this.closeDetailModal()
        this.$toast.success('Prayer request berhasil dihapus')
        
      } catch (error) {
        console.error('❌ [AdminPrayerRequests] Error deleting prayer from modal:', error)
        this.$toast.error('Gagal menghapus prayer request')
      } finally {
        this.processingModal = false
      }
    },
    
    // ⭐ NEW: Refresh data
    async refreshData() {
      console.log('🔄 [AdminPrayerRequests] Refreshing data...')
      await this.loadData()
      this.$toast.success('Data berhasil di-refresh')
    },
    
    // Helper methods
    getShortDescription(description) {
      if (!description) return ''
      
      const words = description.split(' ')
      const lines = []
      let currentLine = ''
      
      for (const word of words) {
        if ((currentLine + word).length > 50) {
          lines.push(currentLine.trim())
          currentLine = word + ' '
          if (lines.length >= 2) break
        } else {
          currentLine += word + ' '
        }
      }
      
      if (currentLine.trim() && lines.length < 2) {
        lines.push(currentLine.trim())
      }
      
      let result = lines.join('\n')
      if (words.length > lines.join(' ').split(' ').length) {
        result += '...'
      }
      
      return result
    },
    getCategoryIcon(category) {
      const categoryData = this.prayerCategories.find(c => c.value === category)
      return categoryData ? categoryData.icon : '🙏'
    },
    
    getCategoryLabel(category) {
      const categoryData = this.prayerCategories.find(c => c.value === category)
      return categoryData ? categoryData.label : 'Lainnya'
    },
    
    getUserDisplayName(prayer) {
      // Prioritas: userName > nama > userId (but exclude generic fallbacks)
      if (prayer.userName && prayer.userName.trim() && prayer.userName !== 'User') {
        return prayer.userName
      }
      if (prayer.nama && prayer.nama.trim() && prayer.nama !== 'User') {
        return prayer.nama
      }
      // Extract meaningful name from userId if possible
      if (prayer.userId && prayer.userId !== 'demo-user' && prayer.userId !== 'User' && 
          !prayer.userId.startsWith('unknown_user_')) {
        return prayer.userId
      }
      return 'User Tidak Dikenal'
    },
    
    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Invalid Date'
      }
    }
  }
}
</script>

<style scoped>
.admin-prayer-requests {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header Section */
.header-section {
  margin-bottom: 30px;
}

.header-content {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.page-subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-card.total .stat-icon { background: #3498db; }
.stat-card.pending .stat-icon { background: #f39c12; }
.stat-card.prayed .stat-icon { background: #27ae60; }

.stat-info h3 {
  font-size: 2rem;
  margin: 0;
  color: #2c3e50;
}

.stat-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Filters */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.filters-left {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 150px;
}

.search-box {
  position: relative;
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 4rem;
  color: #bdc3c7;
  margin-bottom: 20px;
}

/* Prayer Cards */
.prayers-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  max-width: 100%;
}

.prayer-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #3498db;
  max-width: 100%;
  word-wrap: break-word;
}

.prayer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.prayer-card.prayed {
  background: #f8f9fa;
  border-left-color: #6c757d;
  opacity: 0.7;
}

.prayer-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 30px;
  flex-wrap: wrap;
}

.prayer-card.prayed .prayer-header {
  background: #e9ecef;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
  font-size: 0.95rem;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category {
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.prayer-card.prayed .category {
  background: #6c757d;
}

.urgent-badge {
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.date {
  color: #7f8c8d;
  font-size: 0.85rem;
  white-space: nowrap;
  flex-shrink: 0;
  text-align: right;
  min-width: 80px;
}

.prayer-content {
  padding: 20px;
}

.prayer-title {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
}

.prayer-card.prayed .prayer-title {
  color: #6c757d;
}

.prayer-description {
  color: #555;
  margin-bottom: 15px;
  line-height: 1.6;
  white-space: pre-line;
}

.prayer-card.prayed .prayer-description {
  color: #6c757d;
}

.prayer-actions {
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.prayer-card.prayed .prayer-actions {
  background: #e9ecef;
}

.prayed-status {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #27ae60;
  font-weight: 600;
  font-size: 0.9rem;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary { background: #3498db; color: white; }
.btn-success { background: #27ae60; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-danger { 
  background: #e74c3c; 
  color: white; 
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.page-info {
  padding: 8px 15px;
  font-weight: 600;
  color: #2c3e50;
}

/* Modals */
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
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  margin: 10px;
}

/* ⭐ NEW: Delete Modal Styles */
.delete-modal {
  max-width: 500px;
}

.delete-confirmation {
  text-align: center;
  padding: 20px;
}

.warning-icon {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 20px;
}

.delete-confirmation h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.prayer-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  text-align: left;
}

.prayer-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.warning-text {
  color: #e74c3c;
  font-size: 0.9rem;
  margin: 20px 0;
  padding: 10px;
  background: #fdf2f2;
  border-radius: 6px;
  border-left: 4px solid #e74c3c;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ⭐ NEW: Enhanced Button Styles */
.btn-danger { 
  background: #e74c3c; 
  color: white; 
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.btn-secondary { 
  background: #6c757d; 
  color: white; 
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

/* ⭐ IMPROVED: Prayer Actions Layout */
.prayer-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.prayer-actions .btn {
  font-size: 0.8rem;
  padding: 6px 12px;
}

@media (max-width: 768px) {
  .admin-prayer-requests {
    padding: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filters-left {
    flex-direction: column;
    gap: 15px;
  }
  
  .filter-group select {
    min-width: 100%;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .prayers-list {
    grid-template-columns: 1fr;
  }
  
  .prayer-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    min-height: auto;
    padding: 12px 16px;
  }
  
  .user-info {
    white-space: normal;
    overflow: visible;
    text-overflow: initial;
    min-width: auto;
    font-size: 0.9rem;
  }
  
  .category, .urgent-badge {
    font-size: 0.75rem;
    padding: 3px 6px;
  }
  
  .date {
    font-size: 0.8rem;
    text-align: left;
    min-width: auto;
  }
  
  .prayer-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .modal-content {
    margin: 10px;
    max-height: 90vh;
  }
}
</style>
