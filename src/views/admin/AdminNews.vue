<!-- AdminNews.vue - Halaman Admin untuk CRUD News -->
<template>
  <div class="admin-news-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
        <!-- Desktop Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <!-- Header dengan judul dan tombol add -->
        <div class="page-header">
          <h1 class="page-title">Kelola Berita</h1>
          <button @click="showAddModal" class="add-button">
            <Plus class="add-icon" />
            Tambah Berita
          </button>
        </div>

        <!-- Filter dan Search -->
        <div class="filters-section">
          <div class="filter-group">
            <select v-model="selectedCategory" @change="filterNews" class="filter-select">
              <option value="">Semua Kategori</option>
              <option v-for="category in uniqueCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchQuery" 
                @input="filterNews"
                placeholder="Cari berita..."
                class="search-input"
              />
              <Search class="search-icon" />
            </div>
          </div>
        </div>

        <!-- Loading state desktop -->
        <div v-if="loading" class="loading-container desktop-loading">
          <div class="loading-spinner"></div>
          <p>Memuat berita...</p>
        </div>

        <!-- Error state desktop -->
        <div v-else-if="error" class="error-container desktop-error">
          <div class="error-card">
            <AlertCircle class="error-icon" />
            <h3>Oops! Terjadi Kesalahan</h3>
            <p class="error-text">{{ error }}</p>
            <button @click="fetchNews" class="retry-button">
              <RefreshCw class="retry-icon" />
              Coba Lagi
            </button>
          </div>
        </div>

        <!-- News Table desktop -->
        <div v-else-if="filteredNews.length > 0" class="news-table-container">
          <div class="table-wrapper">
            <table class="news-table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Event</th>
                  <th>Prioritas</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="news in paginatedNews" :key="news.id" class="table-row">
                  <td class="title-cell">
                    <div class="news-title">{{ news.title }}</div>
                    <div class="news-summary">{{ truncateText(news.summary || news.content, 80) }}</div>
                  </td>
                  <td class="category-cell">
                    <span class="category-label">{{ news.category || 'Umum' }}</span>
                  </td>
                  <td class="date-cell">{{ formatDate(news.date || news.createdAt) }}</td>
                  <td class="event-cell">
                    <span v-if="news.isEvent" class="event-badge">Event</span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td class="priority-cell">
                    <span :class="['priority-badge', `priority-${news.priority}`]">
                      {{ getPriorityText(news.priority) }}
                    </span>
                  </td>
                  <td class="action-cell">
                    <button @click="editNews(news)" class="edit-btn" title="Edit">
                      <Edit2 class="btn-icon" />
                    </button>
                    <button @click="deleteNews(news)" class="delete-btn" title="Hapus">
                      <Trash2 class="btn-icon" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="goToPage(currentPage - 1)" 
              :disabled="currentPage === 1" 
              class="pagination-btn"
            >
              Sebelumnya
            </button>
            
            <span class="pagination-info">
              Halaman {{ currentPage }} dari {{ totalPages }}
            </span>
            
            <button 
              @click="goToPage(currentPage + 1)" 
              :disabled="currentPage === totalPages" 
              class="pagination-btn"
            >
              Selanjutnya
            </button>
          </div>
        </div>

        <!-- Empty state desktop -->
        <div v-else class="desktop-empty">
          <div class="empty-card">
            <Newspaper class="empty-icon" />
            <h3>Belum Ada Berita</h3>
            <p>Klik tombol "Tambah Berita" untuk membuat berita baru.</p>
            <button @click="showAddModal" class="add-button-primary">
              <Plus class="add-icon" />
              Tambah Berita Pertama
            </button>
          </div>
        </div>
    </div>

    <!-- Modal Add/Edit News -->
    <NewsModal
      v-if="showModal"
      :news="selectedNews"
      :mode="modalMode"
      @close="hideModal"
      @save="saveNews"
    />

    <!-- Modal Konfirmasi Delete -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="Hapus Berita"
      :message="`Apakah Anda yakin ingin menghapus berita '${newsToDelete?.title}'?`"
      confirmText="Hapus"
      confirmColor="#ef4444"
      @confirm="confirmDelete"
      @cancel="hideDeleteModal"
    />
  </div>
</template>

<script>
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import NewsModal from '@/components/admin/NewsModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { 
  Newspaper,
  Plus,
  RefreshCw, 
  AlertCircle,
  Edit2,
  Trash2,
  Search
} from 'lucide-vue-next'
import { 
  getNews,
  createNews,
  updateNews,
  deleteNews as deleteNewsService
} from '@/services/news'

export default {
  name: 'AdminNews',
  
  components: {  
    BreadcrumbDesktop,
    NewsModal,
    ConfirmModal,    
    Newspaper,
    Plus,
    RefreshCw,
    AlertCircle,
    Edit2,
    Trash2,
    Search
  },
  
  data() {
    return {
      allNews: [],            // All news data
      filteredNews: [],       // Filtered news data
      loading: true,          // Status loading
      error: null,           // Pesan error
      
      // Filter dan Search
      selectedCategory: '',
      searchQuery: '',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Modal states
      showModal: false,
      modalMode: 'add',       // 'add' atau 'edit'
      selectedNews: null,
      
      // Delete confirmation
      showDeleteConfirm: false,
      newsToDelete: null,
      
      breadcrumbItems: [
        { text: 'Home', to: '/home' },
        { text: 'Admin', to: '/admin' },
        { text: 'Kelola Berita', to: null }
      ]
    }
  },
  
  computed: {
    paginatedNews() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredNews.slice(start, end)
    },
    
    totalPages() {
      return Math.ceil(this.filteredNews.length / this.itemsPerPage)
    },
    
    uniqueCategories() {
      const categories = this.allNews.map(news => news.category).filter(Boolean)
      return [...new Set(categories)].sort()
    }
  },
  
  async created() {
    await this.fetchNews()
  },
  
  methods: {
    /**
     * Mengambil data berita dari service
     */
    async fetchNews() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [AdminNews] Mengambil berita...')
        
        // Ambil semua berita (limit besar untuk admin)
        const newsData = await getNews(100)
        
        console.log('✅ [AdminNews] Berita berhasil dimuat:', newsData.length)
        
        this.allNews = newsData
        this.filterNews()
        
      } catch (error) {
        console.error('❌ [AdminNews] Error memuat berita:', error)
        this.error = 'Gagal memuat berita. Pastikan koneksi internet Anda stabil.'
      } finally {
        this.loading = false
      }
    },

    /**
     * Filter news berdasarkan kategori dan search query
     */
    filterNews() {
      let filtered = [...this.allNews]
      
      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(news => 
          (news.category || 'Umum') === this.selectedCategory
        )
      }
      
      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(news => 
          news.title?.toLowerCase().includes(query) ||
          news.content?.toLowerCase().includes(query) ||
          news.summary?.toLowerCase().includes(query) ||
          news.category?.toLowerCase().includes(query)
        )
      }
      
      this.filteredNews = filtered
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
     * Tampilkan modal untuk menambah berita baru
     */
    showAddModal() {
      this.modalMode = 'add'
      this.selectedNews = null
      this.showModal = true
    },

    /**
     * Tampilkan modal untuk edit berita
     * @param {Object} news - News to edit
     */
    editNews(news) {
      this.modalMode = 'edit'
      this.selectedNews = { ...news }
      this.showModal = true
    },

    /**
     * Sembunyikan modal
     */
    hideModal() {
      this.showModal = false
      this.selectedNews = null
    },

    /**
     * Simpan berita (create atau update)
     * @param {Object} newsData - Data berita
     */
    async saveNews(newsData) {
      try {
        console.log('💾 [AdminNews] Menyimpan berita...', newsData)

        if (this.modalMode === 'add') {
          const newNews = await createNews(newsData)
          this.allNews.unshift(newNews) // Add to beginning
          this.showNotification('Berita berhasil ditambahkan!', 'success')
        } else {
          await updateNews(this.selectedNews.id, newsData)
          
          // Update local data
          const index = this.allNews.findIndex(n => n.id === this.selectedNews.id)
          if (index !== -1) {
            this.allNews[index] = { ...this.allNews[index], ...newsData }
          }
          
          this.showNotification('Berita berhasil diperbarui!', 'success')
        }

        this.hideModal()
        this.filterNews()

      } catch (error) {
        console.error('❌ [AdminNews] Error menyimpan berita:', error)
        this.showNotification('Gagal menyimpan berita. Silakan coba lagi.', 'error')
      }
    },

    /**
     * Tampilkan konfirmasi delete
     * @param {Object} news - News to delete
     */
    deleteNews(news) {
      this.newsToDelete = news
      this.showDeleteConfirm = true
    },

    /**
     * Sembunyikan modal delete
     */
    hideDeleteModal() {
      this.showDeleteConfirm = false
      this.newsToDelete = null
    },

    /**
     * Konfirmasi delete berita
     */
    async confirmDelete() {
      try {
        console.log('🗑️ [AdminNews] Menghapus berita...', this.newsToDelete.id)

        await deleteNewsService(this.newsToDelete.id)
        
        // Remove from local data
        this.allNews = this.allNews.filter(n => n.id !== this.newsToDelete.id)
        this.filterNews()
        
        this.showNotification('Berita berhasil dihapus!', 'success')
        this.hideDeleteModal()

      } catch (error) {
        console.error('❌ [AdminNews] Error menghapus berita:', error)
        this.showNotification('Gagal menghapus berita. Silakan coba lagi.', 'error')
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
     * Get priority text
     * @param {number} priority - Priority number
     */
    getPriorityText(priority) {
      const priorityMap = {
        1: 'Tinggi',
        2: 'Sedang', 
        3: 'Rendah'
      }
      return priorityMap[priority] || 'Rendah'
    },

    /**
     * Tampilkan notifikasi
     * @param {string} message - Pesan notifikasi
     * @param {string} type - Tipe notifikasi
     */
    showNotification(message, type = 'info') {
      // Untuk sementara pakai alert, nanti bisa diganti dengan toast component
      const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
      }
      alert(`${icons[type]} ${message}`)
    }
  }
}
</script>

<style scoped>
/* ========================================
   CONTAINER UTAMA
========================================= */
.admin-news-container {
  background: #fcfcf7;
  min-height: 100vh;
}

/* ========================================
   DESKTOP LAYOUT
========================================= */

.desktop-layout {
  display: block;
  min-height: 100vh;
  background: #fcfcf7;
}

/* === PAGE HEADER === */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #41442A;
  margin: 0;
}

.add-button,
.add-button-primary {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-button:hover,
.add-button-primary:hover {
  background: #059669;
  transform: translateY(-1px);
}

.add-icon {
  width: 18px;
  height: 18px;
}

/* === FILTERS SECTION === */
.filters-section {
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.filter-group {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 140px;
}

.filter-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-input {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  width: 100%;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

/* === LOADING STATE === */
.desktop-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-family: 'Inter', sans-serif;
  color: #666;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* === ERROR STATE === */
.desktop-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.error-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
  margin-bottom: 16px;
}

.error-card h3 {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 8px 0;
}

.error-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
}

.retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.retry-icon {
  width: 16px;
  height: 16px;
}

/* === NEWS TABLE === */
.news-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.news-table {
  width: 100%;
  border-collapse: collapse;
}

.news-table thead {
  background: #f8f9fa;
}

.news-table th {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: left;
  padding: 16px 20px;
  border-bottom: 2px solid #e5e7eb;
}

.news-table td {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #374151;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.table-row:hover {
  background: #f9fafb;
}

.title-cell {
  max-width: 300px;
}

.news-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.news-summary {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.category-cell {
  font-weight: 500;
}

.category-label {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.priority-badge.priority-1 {
  background: #fef2f2;
  color: #dc2626;
}

.priority-badge.priority-2 {
  background: #fef3c7;
  color: #d97706;
}

.priority-badge.priority-3 {
  background: #f0f9ff;
  color: #0369a1;
}

.date-cell {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
}

.event-badge {
  background: #ede9fe;
  color: #5b21b6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.action-cell {
  white-space: nowrap;
}

.edit-btn,
.publish-btn,
.delete-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 4px;
}

.edit-btn {
  color: #10b981;
}

.edit-btn:hover {
  background: #ecfdf5;
}

.publish-btn {
  color: #3b82f6;
}

.publish-btn:hover {
  background: #eff6ff;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  background: #fef2f2;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* === PAGINATION === */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
}

.pagination-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #059669;
}

.pagination-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.pagination-info {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* === EMPTY STATE === */
.desktop-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-card {
  background: white;
  padding: 64px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-card h3 {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 12px 0;
}

.empty-card p {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 32px 0;
  line-height: 1.5;
}


@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-select,
  .search-box {
    min-width: auto;
    max-width: none;
  }
  
  .news-table th,
  .news-table td {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .title-cell {
    max-width: 200px;
  }
  
  .category-label {
    font-size: 11px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .pagination-btn {
    width: 100%;
  }
}

/* === ACCESSIBILITY === */
@media (prefers-reduced-motion: reduce) {
  .add-button:hover,
  .add-button-primary:hover,
  .retry-button:hover,
  .edit-btn,
  .publish-btn,
  .delete-btn {
    transform: none;
  }

  .loading-spinner {
    animation: none;
  }
}
</style>