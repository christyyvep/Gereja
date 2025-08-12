<template>
  <div class="admin-kelola-jemaat">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div>
          <h1 class="page-title">
            <i class="fas fa-users"></i>
            Kelola Data Jemaat
          </h1>
          <p class="page-subtitle">Manajemen data anggota jemaat gereja</p>
        </div>
        <div>
          <button @click="loadData" :disabled="loading" class="btn-refresh">
            <i class="fas fa-sync-alt" :class="{ spinning: loading }"></i>
            Refresh
          </button>
          <button @click="showAddModal = true" class="btn-add">
            <i class="fas fa-plus"></i>
            Tambah Jemaat
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-info">
          <h3>{{ statistics.totalJemaat }}</h3>
          <p>Total Jemaat</p>
        </div>
      </div>

      <div class="stat-card men">
        <div class="stat-icon">
          <i class="fas fa-male"></i>
        </div>
        <div class="stat-info">
          <h3>{{ statistics.totalPria }}</h3>
          <p>Pria</p>
        </div>
      </div>

      <div class="stat-card women">
        <div class="stat-icon">
          <i class="fas fa-female"></i>
        </div>
        <div class="stat-info">
          <h3>{{ statistics.totalWanita }}</h3>
          <p>Wanita</p>
        </div>
      </div>

      <div class="stat-card registered">
        <div class="stat-icon">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-info">
          <h3>{{ statistics.totalRegistered }}</h3>
          <p>Sudah Registrasi</p>
          <small>{{ statistics.percentageRegistered }}%</small>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filters-left">
          <div class="filter-group">
            <label>Status Registrasi:</label>
            <select v-model="selectedFilter" @change="applyFilter">
              <option value="all">Semua Status</option>
              <option value="registered">Sudah Registrasi</option>
              <option value="not-registered">Belum Registrasi</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Jenis Kelamin:</label>
            <select v-model="selectedGender" @change="applyFilter">
              <option value="all">Semua</option>
              <option value="male">Pria</option>
              <option value="female">Wanita</option>
            </select>
          </div>
        </div>

        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Cari nama jemaat..."
            @input="performSearch"
          >
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data jemaat...</p>
    </div>

    <!-- Table Section -->
    <div v-else class="table-section">
      <div class="table-container">
        <table class="jemaat-table">
          <thead>
            <tr>
              <th class="status-cell">Status</th>
              <th class="name-cell">Nama</th>
              <th class="role-cell">Role</th>
              <th class="registration-cell">Status Registrasi</th>
              <th class="actions-cell">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedJemaat.length === 0">
              <td colspan="5" class="empty-state">
                <i class="fas fa-users-slash"></i>
                <h3>{{ searchTerm ? 'Tidak ada data yang sesuai' : 'Belum ada data jemaat' }}</h3>
                <p>{{ searchTerm ? 'Coba ubah kata kunci pencarian' : 'Mulai tambah data jemaat baru' }}</p>
              </td>
            </tr>
            <tr v-for="jemaat in paginatedJemaat" :key="jemaat.id" class="jemaat-row">
              <td class="status-cell">
                <div class="status-indicator">
                  <div v-if="!jemaat.isRegistered" class="new-indicator"></div>
                  <span class="status-badge" :class="jemaat.isRegistered ? 'active' : 'new'">
                    {{ jemaat.isRegistered ? 'Aktif' : 'Baru' }}
                  </span>
                </div>
              </td>
              
              <td class="name-cell">
                <div class="user-info">
                  <div class="user-name">{{ jemaat.nama || 'Tanpa Nama' }}</div>
                  <div class="user-details">
                    <div class="user-gender">
                      <i :class="getGenderIcon(jemaat.jenisKelamin)"></i>
                      {{ jemaat.jenisKelamin || '-' }}
                    </div>
                    <div v-if="jemaat.email" class="user-email">
                      <i class="fas fa-envelope"></i>
                      {{ jemaat.email }}
                    </div>
                  </div>
                </div>
              </td>
              
              <td class="role-cell">
                <span class="role-badge" :class="jemaat.role || 'jemaat'">
                  {{ jemaat.role === 'admin' ? 'Admin' : 'Jemaat' }}
                </span>
              </td>
              
              <td class="registration-cell">
                <div class="registration-info">
                  <span class="reg-status" :class="jemaat.isRegistered ? 'registered' : 'not-registered'">
                    {{ jemaat.isRegistered ? 'Terdaftar' : 'Belum Daftar' }}
                  </span>
                  <small v-if="jemaat.lastLoginAt" class="last-login">
                    {{ formatDateTime(jemaat.lastLoginAt) }}
                  </small>
                </div>
              </td>
              
              <td class="actions-cell">
                <div class="action-buttons">
                  <button @click="viewDetail(jemaat)" class="btn btn-detail" title="Lihat Detail">
                    <i class="fas fa-eye"></i>
                    Detail
                  </button>
                  <button @click="confirmDelete(jemaat)" class="btn btn-delete" title="Hapus">
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
      <div v-if="totalPages > 1" class="pagination-section">
        <div class="pagination-info">
          Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredJemaat.length) }} dari {{ filteredJemaat.length }} data
        </div>
        
        <div class="pagination-controls">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            <i class="fas fa-chevron-left"></i>
            Sebelumnya
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="goToPage(page)"
              class="page-number"
              :class="{ active: page === currentPage }"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            Selanjutnya
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detail Jemaat -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-user"></i>
            Detail Data Jemaat
          </h3>
          <button @click="closeModals" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Nama Lengkap:</label>
              <div class="detail-value">{{ selectedJemaat?.nama || '-' }}</div>
            </div>

            <div class="detail-item">
              <label>Jenis Kelamin:</label>
              <div class="detail-value">
                <i :class="getGenderIcon(selectedJemaat?.jenisKelamin)"></i>
                {{ selectedJemaat?.jenisKelamin || '-' }}
              </div>
            </div>

            <div class="detail-item">
              <label>Tanggal Lahir:</label>
              <div class="detail-value">{{ formatDate(selectedJemaat?.tanggalLahir) }}</div>
            </div>

            <div class="detail-item">
              <label>Status Pernikahan:</label>
              <div class="detail-value">{{ selectedJemaat?.status || '-' }}</div>
            </div>

            <div class="detail-item">
              <label>Sektor:</label>
              <div class="detail-value">{{ selectedJemaat?.sektor || '-' }}</div>
            </div>

            <div class="detail-item">
              <label>No. Telepon:</label>
              <div class="detail-value">{{ selectedJemaat?.noTelp || '-' }}</div>
            </div>

            <div class="detail-item">
              <label>Email:</label>
              <div class="detail-value">{{ selectedJemaat?.email || '-' }}</div>
            </div>

            <div class="detail-item">
              <label>Role:</label>
              <div class="detail-value">
                <span class="role-badge" :class="selectedJemaat?.role || 'jemaat'">
                  {{ selectedJemaat?.role === 'admin' ? 'Admin' : 'Jemaat' }}
                </span>
              </div>
            </div>

            <div class="detail-item">
              <label>Status Registrasi:</label>
              <div class="detail-value">
                <span class="status-badge" :class="selectedJemaat?.isRegistered ? 'registered' : 'unread'">
                  <i :class="selectedJemaat?.isRegistered ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  {{ selectedJemaat?.isRegistered ? 'Sudah Registrasi' : 'Belum Registrasi' }}
                </span>
              </div>
            </div>

            <div class="detail-item">
              <label>Terakhir Login:</label>
              <div class="detail-value">{{ formatDateTime(selectedJemaat?.lastLoginAt) }}</div>
            </div>

            <div class="detail-item">
              <label>Dibuat pada:</label>
              <div class="detail-value">{{ formatDateTime(selectedJemaat?.createdAt) }}</div>
            </div>

            <div class="detail-item">
              <label>Terakhir Diupdate:</label>
              <div class="detail-value">{{ formatDateTime(selectedJemaat?.lastUpdated) }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="editJemaat(selectedJemaat)" class="btn btn-detail">
            <i class="fas fa-edit"></i>
            Edit Data
          </button>
          <button @click="closeModals" class="btn btn-secondary">
            Tutup
          </button>
        </div>
      </div>
    </div>
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-user-plus" v-if="showAddModal"></i>
            <i class="fas fa-user-edit" v-if="showEditModal"></i>
            {{ showAddModal ? 'Tambah Jemaat Baru' : 'Edit Data Jemaat' }}
          </h3>
          <button @click="closeModals" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitForm" class="jemaat-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nama Lengkap *</label>
              <input 
                v-model="formData.nama" 
                type="text" 
                required 
                placeholder="Masukkan nama lengkap"
              >
            </div>

            <div class="form-group">
              <label>Jenis Kelamin *</label>
              <select v-model="formData.jenisKelamin" required>
                <option value="">Pilih jenis kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input 
                v-model="formData.tanggalLahir" 
                type="date"
                placeholder="YYYY-MM-DD"
              >
            </div>

            <div class="form-group">
              <label>Status Pernikahan</label>
              <select v-model="formData.status">
                <option value="">Pilih status</option>
                <option value="Belum Menikah">Belum Menikah</option>
                <option value="Menikah">Menikah</option>
                <option value="Duda/Janda">Duda/Janda</option>
              </select>
            </div>

            <div class="form-group">
              <label>Sektor</label>
              <input 
                v-model="formData.sektor" 
                type="text" 
                placeholder="Contoh: Sektor 1, Sektor A"
              >
            </div>

            <div class="form-group">
              <label>No. Telepon</label>
              <input 
                v-model="formData.noTelp" 
                type="tel" 
                placeholder="Contoh: 08123456789"
              >
            </div>

            <div class="form-group">
              <label>Email</label>
              <input 
                v-model="formData.email" 
                type="email" 
                placeholder="contoh@email.com"
              >
            </div>

            <div class="form-group">
              <label>Password {{ showAddModal ? '(Opsional)' : '(Kosongkan jika tidak diubah)' }}</label>
              <input 
                v-model="formData.password" 
                type="password" 
                placeholder="Password untuk login aplikasi"
              >
              <small class="form-hint">
                Jika diisi, jemaat akan dapat login ke aplikasi
              </small>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModals" class="btn-secondary">
              Batal
            </button>
            <button type="submit" :disabled="formSubmitting" class="btn-primary">
              <i class="fas fa-spinner fa-spin" v-if="formSubmitting"></i>
              <i class="fas fa-save" v-else></i>
              {{ formSubmitting ? 'Menyimpan...' : (showAddModal ? 'Tambah Jemaat' : 'Update Data') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Delete -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            Konfirmasi Hapus
          </h3>
        </div>
        
        <div class="modal-body">
          <p>Apakah Anda yakin ingin menghapus data jemaat:</p>
          <div class="delete-target">
            <strong>{{ deleteTarget?.nama }}</strong>
          </div>
          <p class="warning-text">
            <i class="fas fa-warning"></i>
            Data yang dihapus tidak dapat dikembalikan!
          </p>
        </div>

        <div class="form-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Batal
          </button>
          <button @click="performDelete" :disabled="deleteSubmitting" class="btn-danger">
            <i class="fas fa-spinner fa-spin" v-if="deleteSubmitting"></i>
            <i class="fas fa-trash" v-else></i>
            {{ deleteSubmitting ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  getAllJemaat, 
  getJemaatStatistics, 
  addJemaat, 
  updateJemaat, 
  deleteJemaat,
  searchJemaat 
} from '@/services/jemaatService.js'
import { useToast } from '@/composables/useToast.js'

export default {
  name: 'KelolaJemaat',
  setup() {
    const { showToast } = useToast()

    // Reactive data
    const loading = ref(false)
    const jemaatList = ref([])
    const statistics = ref({
      totalJemaat: 0,
      totalPria: 0,
      totalWanita: 0,
      totalRegistered: 0,
      totalNotRegistered: 0,
      percentageRegistered: 0
    })

    // Search and filter
    const searchTerm = ref('')
    const selectedFilter = ref('all')
    const selectedGender = ref('all')
    const filteredJemaat = ref([])

    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    // Modals
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const showDetailModal = ref(false)
    const showDeleteModal = ref(false)
    const selectedJemaat = ref(null)
    const editingJemaat = ref(null)
    const deleteTarget = ref(null)

    // Form
    const formSubmitting = ref(false)
    const deleteSubmitting = ref(false)
    const formData = reactive({
      nama: '',
      jenisKelamin: '',
      tanggalLahir: '',
      status: '',
      sektor: '',
      noTelp: '',
      email: '',
      password: ''
    })

    // Computed
    const totalPages = computed(() => {
      return Math.ceil(filteredJemaat.value.length / itemsPerPage.value)
    })

    const paginatedJemaat = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredJemaat.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const maxVisible = 5
      const startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
      const endPage = Math.min(totalPages.value, startPage + maxVisible - 1)
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    })

    // Methods
    const loadData = async () => {
      try {
        loading.value = true
        
        // Load jemaat list and statistics
        const [jemaatData, statsData] = await Promise.all([
          getAllJemaat(),
          getJemaatStatistics()
        ])
        
        jemaatList.value = jemaatData
        statistics.value = statsData
        filteredJemaat.value = jemaatData.filter(j => j.role !== 'admin')
        
      } catch (error) {
        console.error('Error loading data:', error)
        showToast('Gagal memuat data jemaat', 'error')
      } finally {
        loading.value = false
      }
    }

    const performSearch = async () => {
      if (searchTerm.value.trim() === '') {
        applyFilter()
        return
      }

      try {
        const results = await searchJemaat(searchTerm.value)
        filteredJemaat.value = results.filter(j => j.role !== 'admin')
        currentPage.value = 1
      } catch (error) {
        console.error('Search error:', error)
        showToast('Gagal melakukan pencarian', 'error')
      }
    }

    const applyFilter = () => {
      let filtered = jemaatList.value.filter(j => j.role !== 'admin')

      // Filter berdasarkan status registrasi
      switch (selectedFilter.value) {
        case 'registered':
          filtered = filtered.filter(j => j.isRegistered === true)
          break
        case 'not-registered':
          filtered = filtered.filter(j => j.isRegistered !== true)
          break
      }

      // Filter berdasarkan jenis kelamin
      switch (selectedGender.value) {
        case 'male':
          filtered = filtered.filter(j => j.jenisKelamin === 'Laki-laki' || j.jenisKelamin === 'Pria')
          break
        case 'female':
          filtered = filtered.filter(j => j.jenisKelamin === 'Perempuan' || j.jenisKelamin === 'Wanita')
          break
      }

      filteredJemaat.value = filtered
      currentPage.value = 1
    }

    const resetForm = () => {
      Object.keys(formData).forEach(key => {
        formData[key] = ''
      })
    }

    const editJemaat = (jemaat) => {
      editingJemaat.value = jemaat
      Object.keys(formData).forEach(key => {
        formData[key] = jemaat[key] || ''
      })
      formData.password = '' // Always empty for security
      showEditModal.value = true
      closeModals() // Close detail modal if open
    }

    const viewDetail = (jemaat) => {
      selectedJemaat.value = jemaat
      showDetailModal.value = true
    }

    const getGenderIcon = (jenisKelamin) => {
      if (jenisKelamin === 'Laki-laki' || jenisKelamin === 'Pria') {
        return 'fas fa-male'
      } else if (jenisKelamin === 'Perempuan' || jenisKelamin === 'Wanita') {
        return 'fas fa-female'
      }
      return 'fas fa-question'
    }

    const submitForm = async () => {
      try {
        formSubmitting.value = true

        if (showAddModal.value) {
          await addJemaat(formData)
          showToast('Jemaat berhasil ditambahkan', 'success')
        } else {
          await updateJemaat(editingJemaat.value.id, formData)
          showToast('Data jemaat berhasil diupdate', 'success')
        }

        closeModals()
        await loadData()
      } catch (error) {
        console.error('Form submit error:', error)
        showToast(error.message || 'Gagal menyimpan data', 'error')
      } finally {
        formSubmitting.value = false
      }
    }

    const confirmDelete = (jemaat) => {
      deleteTarget.value = jemaat
      showDeleteModal.value = true
    }

    const performDelete = async () => {
      try {
        deleteSubmitting.value = true
        await deleteJemaat(deleteTarget.value.id)
        showToast('Data jemaat berhasil dihapus', 'success')
        showDeleteModal.value = false
        await loadData()
      } catch (error) {
        console.error('Delete error:', error)
        showToast('Gagal menghapus data', 'error')
      } finally {
        deleteSubmitting.value = false
      }
    }

    const closeModals = () => {
      showAddModal.value = false
      showEditModal.value = false
      showDetailModal.value = false
      selectedJemaat.value = null
      editingJemaat.value = null
      resetForm()
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID')
      } catch {
        return dateString
      }
    }

    const formatDateTime = (timestamp) => {
      if (!timestamp) return '-'
      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        return date.toLocaleString('id-ID')
      } catch {
        return '-'
      }
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      // Data
      loading,
      jemaatList,
      statistics,
      searchTerm,
      selectedFilter,
      selectedGender,
      filteredJemaat,
      currentPage,
      itemsPerPage,
      showAddModal,
      showEditModal,
      showDetailModal,
      showDeleteModal,
      selectedJemaat,
      editingJemaat,
      deleteTarget,
      formSubmitting,
      deleteSubmitting,
      formData,

      // Computed
      totalPages,
      paginatedJemaat,
      visiblePages,

      // Methods
      loadData,
      performSearch,
      applyFilter,
      editJemaat,
      viewDetail,
      getGenderIcon,
      submitForm,
      confirmDelete,
      performDelete,
      closeModals,
      goToPage,
      formatDate,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.admin-kelola-jemaat {
  padding: 24px;
  background: #f8f9fc;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

/* Header Section */
.header-section {
  margin-bottom: 32px;
}

.header-content {
  margin-bottom: 24px;
}

.header-content > div {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.header-content > div > div:last-child {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-refresh, .btn-add {
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

.btn-add {
  background: #667eea;
  color: white;
}

.btn-refresh:hover, .btn-add:hover {
  background: #5a67d8;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  max-width: 100%;
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

.stat-card.men {
  border-left-color: #74b9ff;
}

.stat-card.women {
  border-left-color: #fd79a8;
}

.stat-card.registered {
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

.stat-card.men .stat-icon {
  background: #74b9ff;
}

.stat-card.women .stat-icon {
  background: #fd79a8;
}

.stat-card.registered .stat-icon {
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

.stat-info small {
  color: #48bb78;
  font-weight: bold;
  font-size: 12px;
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
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  max-width: 100%;
}

.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.jemaat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: fixed;
  min-width: 700px; /* Reduce min-width */
}

.status-cell {
  width: 12%;
  min-width: 80px;
  max-width: 100px;
  padding: 12px 8px;
}

.name-cell {
  width: 35%;
  min-width: 180px;
  max-width: 250px;
  padding: 12px 12px;
}

.role-cell {
  width: 15%;
  min-width: 80px;
  max-width: 100px;
  padding: 12px 8px;
}

.registration-cell {
  width: 23%;
  min-width: 120px;
  max-width: 160px;
  padding: 12px 12px;
}

.actions-cell {
  width: 15%;
  min-width: 100px;
  max-width: 120px;
  padding: 12px 8px;
  text-align: right;
}

.jemaat-table th {
  background: #f8fafc;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.jemaat-table td {
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
  font-size: 14px;
  line-height: 1.5;
}

.jemaat-row {
  transition: background-color 0.2s ease;
}

.jemaat-row:hover {
  background: #f8fafc;
}

/* Status Cell */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-indicator {
  width: 8px;
  height: 8px;
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
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.new {
  background: #fef2f2;
  color: #b91c1c;
}

.status-badge.active {
  background: #f0f9ff;
  color: #1e40af;
}

/* Name Cell */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  line-height: 1.3;
  margin-bottom: 2px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #718096;
}

.user-email {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-gender {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-gender i {
  width: 12px;
  color: #a0aec0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-badge.unread {
  background: #fed7d7;
  color: #c53030;
}

.status-badge.registered {
  background: #c6f6d5;
  color: #2f855a;
}

/* Role Cell */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.admin {
  background: #fef2f2;
  color: #b91c1c;
}

.role-badge.jemaat {
  background: #eff6ff;
  color: #1d4ed8;
}

/* Registration Cell */
.registration-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reg-status {
  font-weight: 600;
  font-size: 12px;
}

.reg-status.registered {
  color: #059669;
}

.reg-status.not-registered {
  color: #dc2626;
}

.last-login {
  font-size: 10px;
  color: #6b7280;
  line-height: 1.2;
}

/* Actions Cell */
.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: nowrap;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: auto;
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #718096;
  text-align: center;
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
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  color: #718096;
  font-size: 14px;
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 5px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f7fafc;
}

.modal-body {
  padding: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item label {
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 14px;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

/* Form styles from original component would go here */

/* Responsive Design */
@media (max-width: 1200px) {
  .admin-kelola-jemaat {
    padding: 16px;
  }
  
  .jemaat-table {
    min-width: 600px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .admin-kelola-jemaat {
    padding: 12px;
  }

  .page-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .stat-card {
    padding: 15px;
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .jemaat-table {
    min-width: 500px;
    font-size: 13px;
  }
  
  .jemaat-table th {
    padding: 12px 8px;
    font-size: 12px;
  }

  .btn {
    padding: 4px 8px;
    font-size: 10px;
    gap: 2px;
  }

  .action-buttons {
    gap: 4px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .pagination-section {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .admin-kelola-jemaat {
    padding: 8px;
  }
  
  .jemaat-table {
    min-width: 400px;
    font-size: 12px;
  }
  
  .status-cell, .role-cell, .actions-cell {
    min-width: 60px;
  }
  
  .name-cell {
    min-width: 140px;
  }
  
  .registration-cell {
    min-width: 100px;
  }
  
  .btn {
    padding: 3px 6px;
    font-size: 9px;
  }
}
</style>
