<!-- src/views/admin/AdminLaporanJemaat.vue -->
<template>
  <div class="admin-laporan-jemaat">
    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 class="page-title">
              <i class="fas fa-file-alt"></i>
              Laporan Jemaat
            </h1>
            <p class="page-subtitle">Kelola dan pantau laporan dari jemaat</p>
          </div>
          
          <!-- Debug buttons -->
          <div style="display: flex; gap: 12px;">
            <button 
              @click="fetchLaporan" 
              class="btn-refresh"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt" :class="{ spinning: loading }"></i>
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
            <button 
              @click="debugFirestore" 
              class="btn-debug"
            >
              <i class="fas fa-bug"></i>
              Debug
            </button>
          </div>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fas fa-list"></i>
          </div>
          <div class="stat-info">
            <h3>{{ totalLaporan }}</h3>
            <p>Total Laporan</p>
          </div>
        </div>
        
        <div class="stat-card new">
          <div class="stat-icon">
            <i class="fas fa-bell"></i>
          </div>
          <div class="stat-info">
            <h3>{{ laporanBaru }}</h3>
            <p>Laporan Baru</p>
          </div>
        </div>
        
        <div class="stat-card processed">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <h3>{{ laporanDibaca }}</h3>
            <p>Sudah Dibaca</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filters-left">
          <div class="filter-group">
            <label>Jenis Laporan:</label>
            <select v-model="filterJenis" @change="applyFilters">
              <option value="">Semua Jenis</option>
              <option value="keluhan">Keluhan Pelayanan</option>
              <option value="saran">Saran Perbaikan</option>
              <option value="pujian">Pujian dan Apresiasi</option>
              <option value="perbaikan_gereja">Perbaikan Fasilitas Gereja</option>
              <option value="error_aplikasi">Error Aplikasi</option>
              <option value="bantuan_teknis">Bantuan Teknis</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Status:</label>
            <select v-model="filterStatus" @change="applyFilters">
              <option value="">Semua Status</option>
              <option value="baru">Belum Dibaca</option>
              <option value="dibaca">Sudah Dibaca</option>
            </select>
          </div>
        </div>
        
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="applyFilters"
            placeholder="Cari laporan..."
          >
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat laporan...</p>
    </div>

    <!-- Table -->
    <div v-else-if="filteredLaporan.length > 0" class="table-section">
      <div class="table-container">
        <table class="laporan-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Nama</th>
              <th>Jenis Laporan</th>
              <th>Isi Laporan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="laporan in paginatedLaporan" :key="laporan.id" class="laporan-row">
              <!-- Status indicator -->
              <td class="status-cell">
                <div class="status-indicator">
                  <div 
                    v-if="!laporan.isRead" 
                    class="new-indicator"
                    title="Laporan Baru"
                  ></div>
                  <span :class="['status-badge', laporan.isRead ? 'read' : 'unread']">
                    {{ laporan.isRead ? 'Dibaca' : 'Baru' }}
                  </span>
                </div>
              </td>
              
              <!-- Tanggal -->
              <td class="date-cell">
                <span class="date-text">{{ formatDate(laporan.createdAt) }}</span>
                <span class="time-text">{{ formatTime(laporan.createdAt) }}</span>
              </td>
              
              <!-- Nama -->
              <td class="name-cell">
                <div class="user-info">
                  <span class="user-name">{{ laporan.userName || 'Anonim' }}</span>
                  <span v-if="laporan.isAnonymous" class="anonymous-badge">
                    <i class="fas fa-eye-slash"></i> Anonim
                  </span>
                </div>
              </td>
              
              <!-- Jenis Laporan -->
              <td class="type-cell">
                <span :class="['type-badge', laporan.jenisLaporan]">
                  <i :class="getJenisIcon(laporan.jenisLaporan)"></i>
                  {{ getJenisLabel(laporan.jenisLaporan) }}
                </span>
              </td>
              
              <!-- Isi Laporan (1 baris) -->
              <td class="content-cell">
                <div class="content-preview">
                  {{ truncateText(laporan.deskripsi, 80) }}
                </div>
              </td>
              
              <!-- Aksi -->
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    class="btn btn-detail" 
                    @click="lihatDetail(laporan)"
                    title="Lihat Detail"
                  >
                    <i class="fas fa-eye"></i>
                    Detail
                  </button>
                  <button 
                    class="btn btn-delete" 
                    @click="confirmDelete(laporan)"
                    title="Hapus Laporan"
                  >
                    <i class="fas fa-trash"></i>
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="pagination-section" v-if="totalPages > 1">
        <div class="pagination-info">
          Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{ filteredLaporan.length }} laporan
        </div>
        <div class="pagination-controls">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
            Sebelumnya
          </button>
          
          <span class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              :class="['page-number', { active: page === currentPage }]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </span>
          
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Selanjutnya
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-file-alt"></i>
      <h3>Tidak ada laporan</h3>
      <p v-if="searchQuery || filterStatus || filterJenis">
        Tidak ada laporan yang sesuai dengan filter
      </p>
      <p v-else>
        Belum ada laporan dari jemaat
      </p>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>Detail Laporan</h3>
          <button class="close-btn" @click="closeDetailModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedLaporan">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Tanggal:</label>
              <span>{{ formatDateTime(selectedLaporan.createdAt) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Nama:</label>
              <span>{{ selectedLaporan.userName || 'Anonim' }}</span>
            </div>
            
            <div class="detail-item">
              <label>Jenis Laporan:</label>
              <span :class="['type-badge', selectedLaporan.jenisLaporan]">
                <i :class="getJenisIcon(selectedLaporan.jenisLaporan)"></i>
                {{ getJenisLabel(selectedLaporan.jenisLaporan) }}
              </span>
            </div>
            
            <div class="detail-item full-width">
              <label>Isi Laporan:</label>
              <div class="content-full">
                {{ selectedLaporan.deskripsi }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailModal">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Konfirmasi Hapus</h3>
        </div>
        
        <div class="modal-body">
          <p>Apakah Anda yakin ingin menghapus laporan ini?</p>
          <p class="warning-text">Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDeleteModal">
            Batal
          </button>
          <button class="btn-danger" @click="deleteLaporan" :disabled="isDeleting">
            <i class="fas fa-trash"></i>
            {{ isDeleting ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toast } from '@/utils/toast'
import { useUserStore } from '@/stores/userStore'
import { 
  getAllLaporanForAdmin, 
  markLaporanAsRead, 
  deleteLaporan,
  subscribeLaporanUpdates,
  getJenisIcon,
  getJenisLabel 
} from '@/services/laporanJemaat'

export default {
  name: 'AdminLaporanJemaat',
  
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  
  data() {
    return {
      // Data laporan
      allLaporan: [],
      filteredLaporan: [],
      
      // Loading state
      loading: true,
      
      // Filters
      searchQuery: '',
      filterJenis: '',
      filterStatus: '',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Modals
      showDetailModal: false,
      showDeleteModal: false,
      selectedLaporan: null,
      isDeleting: false,
      
      // Realtime listener
      unsubscribeLaporan: null
    }
  },
  
  computed: {
    // Stats
    totalLaporan() {
      return this.allLaporan.length
    },
    
    laporanBaru() {
      return this.allLaporan.filter(l => !l.isRead).length
    },
    
    laporanDibaca() {
      return this.allLaporan.filter(l => l.isRead).length
    },
    
    // Pagination
    totalPages() {
      return Math.ceil(this.filteredLaporan.length / this.itemsPerPage)
    },
    
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage
    },
    
    endIndex() {
      return Math.min(this.startIndex + this.itemsPerPage, this.filteredLaporan.length)
    },
    
    paginatedLaporan() {
      return this.filteredLaporan.slice(this.startIndex, this.endIndex)
    },
    
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  
  async created() {
    console.log('🚀 AdminLaporanJemaat component created')
    await this.initializeData()
  },
  
  async beforeUnmount() {
    // Cleanup realtime listener
    if (this.unsubscribeLaporan) {
      console.log('🧹 Cleaning up realtime listener...')
      this.unsubscribeLaporan()
    }
  },
  
  methods: {
    async initializeData() {
      console.log('🔄 Initializing admin laporan data...')
      this.loading = true
      
      try {
        // Strategy 1: Try manual fetch first to ensure we can get data
        console.log('📥 Strategy 1: Manual fetch first...')
        await this.fetchLaporan()
        
        // Strategy 2: Setup realtime listener if manual fetch succeeded
        if (this.allLaporan.length > 0) {
          console.log('✅ Manual fetch succeeded, setting up realtime listener...')
          await this.setupRealtimeListener()
        } else {
          console.log('⚠️ Manual fetch returned empty, retrying with realtime listener...')
          await this.setupRealtimeListener()
          
          // Fallback after realtime listener attempt
          setTimeout(async () => {
            if (this.allLaporan.length === 0) {
              console.log('⚠️ Still no data, trying one more manual fetch...')
              await this.fetchLaporan()
            }
          }, 5000)
        }
      } catch (error) {
        console.error('❌ Error initializing data:', error)
        this.loading = false
      }
    },

    async setupRealtimeListener() {
      try {
        console.log('🎧 Setting up realtime listener for laporan jemaat...')
        
        // Setup realtime listener untuk auto-update data (now async)
        this.unsubscribeLaporan = await subscribeLaporanUpdates((laporan) => {
          console.log('📡 Realtime update received:', laporan?.length || 0, 'documents')
          console.log('📡 Sample data:', laporan?.slice(0, 2))
          
          if (Array.isArray(laporan)) {
            this.allLaporan = laporan
            this.applyFilters()
            this.loading = false
            
            if (laporan.length > 0) {
              console.log('✅ Realtime data successfully loaded!')
            } else {
              console.log('⚠️ Realtime listener returned empty array')
            }
          } else {
            console.error('❌ Realtime callback received non-array data:', laporan)
          }
        })
        
      } catch (error) {
        console.error('❌ Error setting up realtime listener:', error)
        this.loading = false
      }
    },
    
    async fetchLaporan() {
      try {
        console.log('📥 Fetching laporan manually...')
        this.loading = true
        
        const laporan = await getAllLaporanForAdmin()
        console.log('📊 Manual fetch result:', laporan?.length || 0, 'documents')
        console.log('📊 Sample manual data:', laporan?.slice(0, 2))
        
        if (Array.isArray(laporan)) {
          this.allLaporan = laporan
          this.applyFilters()
          
          if (laporan.length > 0) {
            console.log('✅ Manual fetch successfully loaded data!')
          } else {
            console.log('⚠️ Manual fetch returned empty array')
            console.log('💡 Suggestion: Create sample data or check Firebase Console')
          }
        } else {
          console.error('❌ Manual fetch returned non-array data:', laporan)
          this.allLaporan = []
          this.applyFilters()
        }
        
      } catch (error) {
        console.error('❌ Error fetching laporan:', error)
        this.allLaporan = []
        this.applyFilters()
        toast.error('Gagal memuat laporan: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    async debugFirestore() {
      console.log('🐛 Debug Firestore Connection...')
      console.log('📊 Current allLaporan:', this.allLaporan)
      console.log('📊 Current filteredLaporan:', this.filteredLaporan)
      console.log('📊 Loading state:', this.loading)
      
      // Check Firebase connection
      try {
        const { db } = await import('@/services/firebase')
        console.log('🔥 Firebase DB object:', db)
        console.log('🔥 Firebase config:', db._delegate?._databaseId || 'Config not accessible')
        
        // Try to read collections
        const { collection, getDocs } = await import('firebase/firestore')
        
        // Show all collections we're trying
        const collections = ['laporan_jemaat', 'prayer_requests', 'reports', 'jemaat_reports', 'news']
        let foundData = false
        
        for (const collName of collections) {
          try {
            console.log(`🔍 Testing collection: ${collName}`)
            const snapshot = await getDocs(collection(db, collName))
            console.log(`📊 Collection ${collName} size:`, snapshot.size)
            
            if (!snapshot.empty) {
              foundData = true
              // Show sample data from each collection
              const firstDoc = snapshot.docs[0]
              console.log(`📄 Sample doc from ${collName}:`, {
                id: firstDoc.id,
                data: firstDoc.data()
              })
            }
          } catch (e) {
            console.log(`❌ Collection ${collName} error:`, e.message)
          }
        }
        
        if (!foundData) {
          console.log('⚠️ No data found in any collection!')
          console.log('💡 Suggestion: Create test data manually in Firebase Console')
        }
        
        // Test the service functions directly
        console.log('🧪 Testing service functions...')
        const { getAllLaporanForAdmin } = await import('@/services/laporanJemaat')
        const serviceResult = await getAllLaporanForAdmin()
        console.log('📊 Service getAllLaporanForAdmin result:', serviceResult)
        
        toast.success(`Debug completed. Found ${foundData ? 'some' : 'no'} data. Check console for details.`)
      } catch (error) {
        console.error('❌ Debug error:', error)
        toast.error('Debug failed: ' + error.message)
      }
    },
    
    applyFilters() {
      let filtered = [...this.allLaporan]
      
      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(laporan => 
          laporan.userName.toLowerCase().includes(query) ||
          laporan.deskripsi.toLowerCase().includes(query) ||
          this.getJenisLabel(laporan.jenisLaporan).toLowerCase().includes(query)
        )
      }
      
      // Filter by jenis
      if (this.filterJenis) {
        filtered = filtered.filter(laporan => laporan.jenisLaporan === this.filterJenis)
      }
      
      // Filter by status
      if (this.filterStatus) {
        if (this.filterStatus === 'baru') {
          filtered = filtered.filter(laporan => !laporan.isRead)
        } else if (this.filterStatus === 'dibaca') {
          filtered = filtered.filter(laporan => laporan.isRead)
        }
      }
      
      this.filteredLaporan = filtered
      this.currentPage = 1 // Reset to first page
    },
    
    lihatDetail(laporan) {
      this.selectedLaporan = laporan
      this.showDetailModal = true
      
      // Mark as read if not already
      if (!laporan.isRead) {
        this.markAsRead(laporan)
      }
    },
    
    async markAsRead(laporan) {
      // Store original state sebelum try block
      const originalState = laporan.isRead
      
      try {
        // Update locally first untuk immediate feedback
        laporan.isRead = true
        
        // Update in Firebase
        const adminId = this.userStore.user?.id || 'admin'
        await markLaporanAsRead(laporan.id, adminId)
        
        console.log('Marked as read:', laporan.id)
        
      } catch (error) {
        console.error('Error marking as read:', error)
        // Revert local change jika gagal
        laporan.isRead = originalState
        toast.error('Gagal menandai sebagai dibaca: ' + error.message)
      }
    },
    
    confirmDelete(laporan) {
      this.selectedLaporan = laporan
      this.showDeleteModal = true
    },
    
    async deleteLaporan() {
      if (!this.selectedLaporan) return
      
      try {
        this.isDeleting = true
        
        // Delete from Firebase
        await deleteLaporan(this.selectedLaporan.id)
        
        // Remove from local array (akan ter-update otomatis via realtime listener)
        const index = this.allLaporan.findIndex(l => l.id === this.selectedLaporan.id)
        if (index !== -1) {
          this.allLaporan.splice(index, 1)
        }
        
        this.applyFilters()
        this.closeDeleteModal()
        
        toast.success('Laporan berhasil dihapus')
        
      } catch (error) {
        console.error('Error deleting laporan:', error)
        toast.error('Gagal menghapus laporan: ' + error.message)
      } finally {
        this.isDeleting = false
      }
    },
    
    closeDetailModal() {
      this.showDetailModal = false
      this.selectedLaporan = null
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false
      this.selectedLaporan = null
      this.isDeleting = false
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    // Utility functions
    getJenisIcon,
    getJenisLabel,
    
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },
    
    formatTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatDateTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.admin-laporan-jemaat {
  padding: 24px;
  background: #f8f9fc;
  min-height: 100vh;
  max-width: 1400px; /* ⭐ ADD: Max width untuk prevent over-stretching */
  margin: 0 auto; /* ⭐ ADD: Center the container */
  width: 100%; /* ⭐ ADD: Full width up to max-width */
}

/* Header Section */
.header-section {
  margin-bottom: 32px;
}

.header-content {
  margin-bottom: 24px;
}

/* ⭐ ADD: Responsive header layout */
.header-content > div {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* ⭐ Change from center to flex-start */
  gap: 16px; /* ⭐ ADD: Gap between elements */
  flex-wrap: wrap; /* ⭐ ADD: Allow wrapping on smaller screens */
}

/* ⭐ ADD: Button container responsive */
.header-content > div > div:last-child {
  display: flex;
  gap: 12px;
  flex-shrink: 0; /* ⭐ Prevent buttons from shrinking */
}

.btn-refresh, .btn-debug {
  padding: 8px 16px;
  border: 1px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-refresh:hover, .btn-debug:hover {
  background: #667eea;
  color: white;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  line-height: 1.2;
}

.page-title i {
  color: #667eea;
  font-size: 28px;
}

.page-subtitle {
  color: #718096;
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* ⭐ IMPROVE: Better responsive grid */
  gap: 24px;
  margin-bottom: 32px;
  max-width: 100%; /* ⭐ ADD: Prevent overflow */
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  border-left: 4px solid;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.stat-card.total {
  border-left-color: #667eea;
}

.stat-card.new {
  border-left-color: #f56565;
}

.stat-card.processed {
  border-left-color: #48bb78;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.stat-card.total .stat-icon {
  background: #667eea;
}

.stat-card.new .stat-icon {
  background: #f56565;
}

.stat-card.processed .stat-icon {
  background: #48bb78;
}

.stat-info h3 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #2d3748;
  line-height: 1;
}

.stat-info p {
  font-size: 14px;
  font-weight: 500;
  color: #718096;
  margin: 0;
  line-height: 1.2;
}

/* Filters Section */
.filters-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
}

.filters-left {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 4px;
}

.filter-group select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #2d3748;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 16px;
  color: #a0aec0;
  font-size: 16px;
  z-index: 1;
}

.search-box input {
  padding: 12px 16px 12px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-box input::placeholder {
  color: #a0aec0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #718096;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  margin-bottom: 24px;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* ⭐ ADD: Smooth scrolling on iOS */
  border-radius: 12px; /* ⭐ KEEP: Border radius for aesthetics */
}

/* ⭐ ADD: Scroll indicator for table */
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ⭐ ADD: Container overflow protection */
* {
  box-sizing: border-box;
}

.admin-laporan-jemaat * {
  max-width: 100%;
}

/* ⭐ ADD: Ensure table doesn't break layout */
.laporan-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: auto; /* ⭐ Allow flexible column widths */
}

/* ⭐ ADD: Minimum widths for important columns */
.status-cell {
  width: 140px;
  min-width: 120px; /* ⭐ Reduce min-width for smaller screens */
  padding-right: 20px;
}

.date-cell {
  width: 140px;
  min-width: 120px; /* ⭐ Reduce min-width */
}

.name-cell {
  width: 160px;
  min-width: 140px; /* ⭐ Reduce min-width */
}

.type-cell {
  width: 180px;
  min-width: 160px; /* ⭐ Reduce min-width */
}

.content-cell {
  max-width: 300px;
  min-width: 200px; /* ⭐ Reduce min-width */
}

.actions-cell {
  width: 140px;
  min-width: 120px; /* ⭐ Reduce min-width */
  text-align: right;
}

.laporan-table th {
  background: #f8fafc;
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.laporan-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
  font-size: 14px;
  line-height: 1.5;
}

.laporan-row {
  transition: background-color 0.2s ease;
}

.laporan-row:hover {
  background: #f8fafc;
}

/* Status Cell */
/* ⭐ NOTE: Styles moved to main table section above */

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-indicator {
  width: 10px;
  height: 10px;
  background: #f56565;
  border-radius: 50%;
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.status-badge.unread {
  background: #fed7d7;
  color: #c53030;
}

.status-badge.read {
  background: #c6f6d5;
  color: #2f855a;
}

/* Date Cell */
/* ⭐ NOTE: Styles moved to main table section above */

.date-text {
  display: block;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  margin-bottom: 2px;
}

.time-text {
  display: block;
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

/* Name Cell */
/* ⭐ NOTE: Styles moved to main table section above */

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.anonymous-badge {
  font-size: 11px;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 4px;
  font-style: italic;
}

.anonymous-badge i {
  font-size: 10px;
}

/* Type Cell */
/* ⭐ NOTE: Styles moved to main table section above */

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.type-badge i {
  font-size: 14px;
}

.type-badge.keluhan {
  background: #fed7d7;
  color: #c53030;
}

.type-badge.saran {
  background: #bee3f8;
  color: #2b6cb0;
}

.type-badge.pujian {
  background: #c6f6d5;
  color: #2f855a;
}

.type-badge.perbaikan_gereja {
  background: #feebc8;
  color: #c05621;
}

.type-badge.error_aplikasi {
  background: #fed7d7;
  color: #c53030;
}

.type-badge.bantuan_teknis {
  background: #e9d8fd;
  color: #6b46c1;
}

.type-badge.lainnya {
  background: #e2e8f0;
  color: #4a5568;
}

/* Content Cell */
/* ⭐ NOTE: Styles moved to main table section above */

.content-preview {
  color: #4a5568;
  line-height: 1.5;
  font-size: 14px;
  word-break: break-word;
}

/* Actions Cell */
/* ⭐ NOTE: Styles moved to main table section above */

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: nowrap; /* ⭐ FORCE: Always horizontal, no wrapping */
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-detail {
  background: #667eea;
  color: white;
}

.btn-detail:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-delete {
  background: #f56565;
  color: white;
}

.btn-delete:hover {
  background: #e53e3e;
  transform: translateY(-1px);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
  flex-wrap: wrap; /* ⭐ ADD: Allow wrapping on smaller screens */
  gap: 16px; /* ⭐ ADD: Gap when wrapped */
}

.pagination-info {
  color: #718096;
  font-size: 14px;
  white-space: nowrap; /* ⭐ ADD: Prevent text wrapping */
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0; /* ⭐ ADD: Prevent controls from shrinking */
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: #f7fafc;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-number:not(.active):hover {
  background: #f7fafc;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #718096;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #cbd5e0;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #4a5568;
}

.empty-state p {
  margin: 0;
  text-align: center;
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #718096;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-btn:hover {
  color: #4a5568;
  background: #f7fafc;
}

.modal-body {
  padding: 24px;
}

.detail-grid {
  display: grid;
  gap: 16px;
}

.detail-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: start;
}

.detail-item.full-width {
  grid-template-columns: 1fr;
}

.detail-item label {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.content-full {
  background: #f7fafc;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
  color: #4a5568;
  white-space: pre-wrap;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #f7fafc;
}

.btn-danger {
  padding: 10px 20px;
  border: none;
  background: #f56565;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-danger:hover {
  background: #e53e3e;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-modal .modal-body {
  text-align: center;
}

.warning-text {
  color: #f56565;
  font-size: 14px;
  margin-top: 8px;
}

/* ========================================
   RESPONSIVE DESIGN - DESKTOP FIRST
========================================= */

/* Large Desktop: 1440px+ */
@media (min-width: 1441px) {
  .admin-laporan-jemaat {
    max-width: 1600px;
    margin: 0 auto;
    padding: 32px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
  
  .page-title {
    font-size: 36px;
  }
}

/* Standard Desktop: 1024px - 1440px */
@media (min-width: 1024px) and (max-width: 1440px) {
  .admin-laporan-jemaat {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
  
  .page-title {
    font-size: 30px;
  }
}

/* Small Desktop/Large Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  .admin-laporan-jemaat {
    padding: 20px;
    max-width: 100%;
  }
  
  .page-title {
    font-size: 26px;
  }
  
  .page-subtitle {
    font-size: 15px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 28px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .filters-left {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .search-box {
    min-width: auto;
    grid-column: 1 / -1;
  }
  
  /* Table adjustments */
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .laporan-table {
    min-width: 900px;
  }
  
  .laporan-table th,
  .laporan-table td {
    padding: 14px 16px;
    font-size: 13px;
  }
  
  /* Actions column adjustments */
  .action-buttons {
    flex-direction: row; /* ⭐ FIXED: Keep horizontal layout even on mobile */
    gap: 4px; /* ⭐ FIXED: Reduce gap for mobile but keep horizontal */
    justify-content: center; /* ⭐ FIXED: Center buttons on mobile */
  }
  
  .btn {
    padding: 6px 12px;
    font-size: 11px;
  }
}

/* Tablet Portrait: 600px - 767px */
@media (min-width: 600px) and (max-width: 767px) {
  .admin-laporan-jemaat {
    padding: 18px;
  }
  
  .page-title {
    font-size: 24px;
    gap: 8px;
  }
  
  .page-title i {
    font-size: 22px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 18px;
    margin-bottom: 24px;
  }
  
  .stat-card {
    padding: 18px;
    gap: 16px;
  }
  
  .filters-section {
    padding: 18px;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 18px;
  }
  
  .filters-left {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  
  /* Table responsive */
  .table-container {
    border-radius: 0;
    margin: 0 -18px;
    overflow-x: auto;
  }
  
  .laporan-table {
    min-width: 800px;
    font-size: 12px;
  }
  
  .laporan-table th {
    padding: 12px 14px;
    font-size: 11px;
  }
  
  .laporan-table td {
    padding: 12px 14px;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 14px;
    padding: 16px 18px;
  }
  
  .pagination-controls {
    justify-content: center;
  }
}

/* Mobile Landscape: 480px - 599px */
@media (min-width: 480px) and (max-width: 599px) {
  .admin-laporan-jemaat {
    padding: 16px;
  }
  
  .header-content > div {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 22px;
    gap: 8px;
  }
  
  .page-title i {
    font-size: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  .stat-card {
    padding: 16px;
    gap: 14px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .stat-info h3 {
    font-size: 24px;
  }
  
  .filters-section {
    padding: 16px;
  }
  
  /* Table responsive - full width scroll */
  .table-container {
    border-radius: 0;
    margin: 0 -16px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .laporan-table {
    min-width: 700px;
    font-size: 12px;
  }
  
  .laporan-table th {
    padding: 10px 12px;
    font-size: 10px;
  }
  
  .laporan-table td {
    padding: 10px 12px;
  }
  
  /* Keep action buttons horizontal */
  .action-buttons {
    flex-direction: row; /* ⭐ FIXED: Always horizontal */
    gap: 3px; /* ⭐ FIXED: Minimal gap for small screens */
    justify-content: center;
    min-width: 120px; /* ⭐ FIXED: Adequate width for both buttons */
  }
  
  .btn {
    padding: 6px 8px;
    font-size: 10px;
    white-space: nowrap;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px 10px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 18px;
  }
  
  .detail-item {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

/* Mobile Portrait: 320px - 479px */
@media (max-width: 479px) {
  .admin-laporan-jemaat {
    padding: 12px;
  }
  
  .header-content > div {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .page-title {
    font-size: 20px;
    gap: 6px;
    line-height: 1.2;
  }
  
  .page-title i {
    font-size: 18px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 18px;
  }
  
  .stat-card {
    padding: 14px;
    gap: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .stat-info h3 {
    font-size: 20px;
  }
  
  .stat-info p {
    font-size: 12px;
  }
  
  .filters-section {
    padding: 14px;
  }
  
  .filters-row {
    gap: 14px;
  }
  
  .filters-left {
    gap: 12px;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .filter-group label {
    font-size: 13px;
  }
  
  .filter-group select {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .search-box input {
    padding: 10px 12px 10px 40px;
    font-size: 13px;
  }
  
  /* Extreme mobile table */
  .table-container {
    border-radius: 0;
    margin: 0 -12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .laporan-table {
    min-width: 600px;
    font-size: 11px;
  }
  
  .laporan-table th {
    padding: 8px 10px;
    font-size: 9px;
  }
  
  .laporan-table td {
    padding: 8px 10px;
    font-size: 11px;
  }
  
  /* Compact action buttons */
  .actions-cell {
    width: 110px; /* ⭐ FIXED: Wider to fit horizontal buttons */
    min-width: 110px;
  }
  
  .action-buttons {
    flex-direction: row; /* ⭐ FIXED: Keep horizontal even on smallest screens */
    gap: 2px; /* ⭐ FIXED: Minimal gap for very small screens */
    justify-content: center;
    flex-wrap: nowrap; /* ⭐ FIXED: Never wrap buttons */
  }
  
  .btn {
    padding: 4px 8px; /* ⭐ FIXED: Slightly more horizontal padding */
    font-size: 10px; /* ⭐ FIXED: Slightly larger font for readability */
    white-space: nowrap;
  }
  
  .btn i {
    display: none; /* Hide icons on very small screens */
  }
  
  /* Pagination responsive */
  .pagination-section {
    flex-direction: column;
    gap: 12px;
    padding: 12px 14px;
  }
  
  .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .page-numbers {
    gap: 2px;
  }
  
  .page-number {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  /* Modal adjustments */
  .modal-content {
    width: 98%;
    margin: 10px 5px;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .modal-header h3 {
    font-size: 16px;
  }
  
  .detail-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  
  .detail-item label {
    font-size: 12px;
  }
  
  .content-full {
    padding: 12px;
    font-size: 13px;
  }
}

/* ========================================
   ACCESSIBILITY & MOTION
========================================= */
@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }
  
  .stat-card:hover {
    transform: none;
  }
  
  .btn {
    transition: none;
  }
  
  .btn:hover {
    transform: none;
  }
  
  .spinning {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .stat-card {
    border: 2px solid #000;
  }
  
  .laporan-table th {
    border: 2px solid #000;
  }
  
  .laporan-table td {
    border: 1px solid #000;
  }
}
</style>
