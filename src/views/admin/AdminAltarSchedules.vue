<template>
  <div class="admin-altar-schedules-container">
    <!-- Header dengan judul dan tombol add -->
    <div class="page-header">
      <h1 class="page-title">Kelola Jadwal Pelayan Altar</h1>
      <AdminButton
        @click="showAddModal"
        variant="primary"
        :icon="Plus"
      >
        Tambah Jadwal
      </AdminButton>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Memuat jadwal...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <AlertCircle class="error-icon" />
        <h3>Oops! Terjadi Kesalahan</h3>
        <p class="error-text">{{ error }}</p>
        <AdminButton
          @click="fetchSchedules"
          variant="secondary"
          :icon="RefreshCw"
        >
          Coba Lagi
        </AdminButton>
      </div>
    </div>

    <!-- Schedules Table -->
    <div v-else-if="schedules.length > 0" class="schedules-table-container">
      <div class="table-wrapper">
        <table class="schedules-table">
          <thead>
            <tr>
              <th>Jenis Ibadah</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="schedule in schedules" :key="schedule.id" class="table-row">
              <td class="category-cell">
                <span class="category-label">{{ schedule.categoryLabel }}</span>
              </td>
              <td class="date-cell">{{ schedule.displayDate }}</td>
              <td class="status-cell">
                <span class="status-badge active">Aktif</span>
              </td>
              <td class="action-cell">
                <button @click="viewScheduleDetail(schedule)" class="view-btn" title="Lihat Detail">
                  <Eye class="btn-icon" />
                </button>
                <button @click="editSchedule(schedule)" class="edit-btn" title="Edit">
                  <Edit2 class="btn-icon" />
                </button>
                <button @click="deleteSchedule(schedule)" class="delete-btn" title="Hapus">
                  <Trash2 class="btn-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-card">
        <CalendarDays class="empty-icon" />
        <h3>Belum Ada Jadwal Pelayan Altar</h3>
        <p>Klik tombol "Tambah Jadwal" untuk membuat jadwal pelayan altar baru.</p>
        <AdminButton
          @click="showAddModal"
          variant="primary"
          :icon="Plus"
        >
          Tambah Jadwal Pertama
        </AdminButton>
      </div>
    </div>

    <!-- Modal Add/Edit Schedule -->
    <div v-if="showModal" class="modal-overlay" @click="hideModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>{{ modalMode === 'add' ? 'Tambah Jadwal Baru' : 'Edit Jadwal' }}</h2>
          <button @click="hideModal" class="close-btn">
            <X class="close-icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveSchedule">
            <!-- Jenis Ibadah -->
            <div class="form-group">
              <label class="form-label">Jenis Ibadah *</label>
              <select v-model="formData.jenisIbadah" class="form-select" required>
                <option value="">Pilih jenis ibadah</option>
                <option v-for="category in worshipCategories" :key="category.value" :value="category.value">
                  {{ category.label }}
                </option>
              </select>
            </div>

            <!-- Tanggal -->
            <div class="form-group">
              <label class="form-label">Tanggal *</label>
              <input 
                type="date" 
                v-model="formData.tanggal" 
                class="form-input" 
                required 
              />
            </div>

            <!-- Pengkhotbah -->
            <div class="form-group">
              <label class="form-label">Pengkhotbah</label>
              <input 
                type="text" 
                v-model="formData.pengkhotbah" 
                class="form-input" 
                placeholder="Nama pengkhotbah"
              />
            </div>

            <!-- Worship Leader -->
            <div class="form-group">
              <label class="form-label">Worship Leader</label>
              <input 
                type="text" 
                v-model="formData.worshipLeader" 
                class="form-input" 
                placeholder="Nama worship leader"
              />
            </div>

            <!-- Singers -->
            <div class="form-group">
              <label class="form-label">Singers</label>
              <input 
                type="text" 
                v-model="formData.singers" 
                class="form-input" 
                placeholder="Nama singers"
              />
            </div>

            <!-- Music -->
            <div class="form-group">
              <label class="form-label">Music</label>
              <input 
                type="text" 
                v-model="formData.music" 
                class="form-input" 
                placeholder="Instrumen musik (Piano, Guitar, dll)"
              />
            </div>

            <!-- Tambourine -->
            <div class="form-group">
              <label class="form-label">Tambourine</label>
              <input 
                type="text" 
                v-model="formData.tambourine" 
                class="form-input" 
                placeholder="Nama penanggung jawab tambourine"
              />
            </div>

            <!-- Banners -->
            <div class="form-group">
              <label class="form-label">Banners</label>
              <input 
                type="text" 
                v-model="formData.banners" 
                class="form-input" 
                placeholder="Tim banner"
              />
            </div>

            <!-- Multimedia -->
            <div class="form-group">
              <label class="form-label">Multimedia</label>
              <input 
                type="text" 
                v-model="formData.multimedia" 
                class="form-input" 
                placeholder="Penanggung jawab multimedia"
              />
            </div>

            <!-- Deskripsi -->
            <div class="form-group">
              <label class="form-label">Deskripsi</label>
              <textarea 
                v-model="formData.description" 
                class="form-input" 
                rows="3"
                placeholder="Catatan atau deskripsi tambahan untuk jadwal ini..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="hideModal" class="btn-cancel">
                Batal
              </button>
              <button type="submit" class="btn-save" :disabled="!formData.jenisIbadah || !formData.tanggal">
                {{ modalMode === 'add' ? 'Simpan' : 'Update' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Detail Schedule -->
    <div v-if="showDetailModal" class="modal-overlay" @click="hideDetailModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Detail Jadwal Pelayan Altar</h2>
          <button @click="hideDetailModal" class="close-btn">
            <X class="close-icon" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="detail-view">
            <!-- Jenis Ibadah -->
            <div class="detail-group">
              <label class="detail-label">Jenis Ibadah</label>
              <div class="detail-value">
                <span class="category-label">{{ selectedSchedule?.categoryLabel || '-' }}</span>
              </div>
            </div>

            <!-- Tanggal -->
            <div class="detail-group">
              <label class="detail-label">Tanggal</label>
              <div class="detail-value">{{ selectedSchedule?.displayDate || '-' }}</div>
            </div>

            <!-- Status -->
            <div class="detail-group">
              <label class="detail-label">Status</label>
              <div class="detail-value">
                <span class="status-badge active">Aktif</span>
              </div>
            </div>

            <!-- Informasi Pelayanan -->
            <div class="detail-section">
              <h3 class="section-title">Informasi Pelayanan</h3>
              
              <div class="detail-grid">
                <!-- Pengkhotbah -->
                <div class="detail-group">
                  <label class="detail-label">Pengkhotbah</label>
                  <div class="detail-value">{{ selectedSchedule?.pelayananInfo?.pengkhotbah || '-' }}</div>
                </div>

                <!-- Worship Leader -->
                <div class="detail-group">
                  <label class="detail-label">Worship Leader</label>
                  <div class="detail-value">{{ selectedSchedule?.pelayananInfo?.worshipLeader || '-' }}</div>
                </div>

                <!-- Singers -->
                <div class="detail-group">
                  <label class="detail-label">Singers</label>
                  <div class="detail-value">{{ selectedSchedule?.pelayananInfo?.singers || '-' }}</div>
                </div>

                <!-- Music -->
                <div class="detail-group">
                  <label class="detail-label">Music</label>
                  <div class="detail-value">{{ selectedSchedule?.pelayananInfo?.music || '-' }}</div>
                </div>

                <!-- Tambourine -->
                <div class="detail-group">
                  <label class="detail-label">Tambourine</label>
                  <div class="detail-value">{{ selectedSchedule?.pelayananInfo?.tambourine || '-' }}</div>
                </div>

                <!-- Banners -->
                <div class="detail-group">
                  <label class="detail-label">Banners</label>
                  <div class="detail-value">{{ selectedSchedule?.pelayananInfo?.banners || '-' }}</div>
                </div>

                <!-- Multimedia -->
                <div class="detail-group">
                  <label class="detail-label">Multimedia</label>
                  <div class="detail-value">{{ selectedSchedule?.pelayananInfo?.multimedia || '-' }}</div>
                </div>
              </div>
            </div>

            <!-- Deskripsi -->
            <div v-if="selectedSchedule?.description" class="detail-section">
              <h3 class="section-title">Deskripsi</h3>
              <div class="detail-description">
                {{ selectedSchedule.description }}
              </div>
            </div>

            <div class="detail-actions">
              <button @click="editFromDetail" class="btn-edit-from-detail">
                <Edit2 class="btn-icon" />
                Edit Jadwal
              </button>
              <button @click="hideDetailModal" class="btn-close">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Delete -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="Hapus Jadwal"
      :message="`Apakah Anda yakin ingin menghapus jadwal ${scheduleToDelete?.categoryLabel}?`"
      confirmText="Hapus"
      confirmColor="#ef4444"
      @confirm="confirmDelete"
      @cancel="hideDeleteModal"
    />
  </div>
</template>

<script>
import { 
  CalendarDays,
  Plus,
  RefreshCw, 
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  X
} from 'lucide-vue-next'
import AdminButton from '@/components/admin/AdminButton.vue'
import { 
  getAltarServantsSchedules,
  createAltarServantsSchedule,
  updateAltarServantsSchedule,
  deleteAltarServantsSchedule,
  WORSHIP_CATEGORIES
} from '@/services/altarServantsSchedules'

export default {
  name: 'AdminAltarSchedules',
  
  components: {    
    AdminButton,
    CalendarDays,
    AlertCircle,
    Edit2,
    Trash2,
    Eye,
    X
  },
  
  data() {
    return {
      // Icon components for AdminButton props
      Plus,
      RefreshCw,
      
      schedules: [],          // Array jadwal
      loading: true,          // Status loading
      error: null,           // Pesan error
      
      // Modal states
      showModal: false,
      showDetailModal: false,
      modalMode: 'add',       // 'add', 'edit', atau 'view'
      selectedSchedule: null,
      
      // Form data
      formData: {
        jenisIbadah: '',
        tanggal: '',
        pengkhotbah: '',
        worshipLeader: '',
        singers: '',
        music: '',
        tambourine: '',
        banners: '',
        multimedia: '',
        description: ''
      },
      
      // Delete confirmation
      showDeleteConfirm: false,
      scheduleToDelete: null,
      
      // Worship categories
      worshipCategories: WORSHIP_CATEGORIES
    }
  },
  
  async created() {
    await this.fetchSchedules()
  },
  
  methods: {
    /**
     * Mengambil data jadwal dari service
     */
    async fetchSchedules() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [AdminAltarSchedules] Mengambil jadwal...')
        
        const schedulesData = await getAltarServantsSchedules()
        
        console.log('✅ [AdminAltarSchedules] Jadwal berhasil dimuat:', schedulesData.length)
        
        this.schedules = schedulesData
      } catch (error) {
        console.error('❌ [AdminAltarSchedules] Error memuat jadwal:', error)
        this.error = 'Gagal memuat jadwal. Pastikan koneksi internet Anda stabil.'
      } finally {
        this.loading = false
      }
    },

    /**
     * Tampilkan modal untuk menambah jadwal baru
     */
    showAddModal() {
      this.modalMode = 'add'
      this.selectedSchedule = null
      this.resetForm()
      this.showModal = true
    },

    /**
     * Tampilkan detail jadwal
     * @param {Object} schedule - Schedule to view
     */
    viewScheduleDetail(schedule) {
      this.selectedSchedule = { ...schedule }
      this.showDetailModal = true
    },

    /**
     * Tampilkan modal untuk edit jadwal
     * @param {Object} schedule - Schedule to edit
     */
    editSchedule(schedule) {
      this.modalMode = 'edit'
      this.selectedSchedule = { ...schedule }
      
      // Populate form data
      this.formData = {
        jenisIbadah: schedule.jenisIbadah || '',
        tanggal: schedule.tanggal || '',
        pengkhotbah: schedule.pelayananInfo?.pengkhotbah || '',
        worshipLeader: schedule.pelayananInfo?.worshipLeader || '',
        singers: schedule.pelayananInfo?.singers || '',
        music: schedule.pelayananInfo?.music || '',
        tambourine: schedule.pelayananInfo?.tambourine || '',
        banners: schedule.pelayananInfo?.banners || '',
        multimedia: schedule.pelayananInfo?.multimedia || '',
        description: schedule.description || ''
      }
      
      this.showModal = true
    },

    /**
     * Sembunyikan modal
     */
    hideModal() {
      this.showModal = false
      this.selectedSchedule = null
      this.resetForm()
    },

    /**
     * Sembunyikan detail modal
     */
    hideDetailModal() {
      this.showDetailModal = false
      this.selectedSchedule = null
    },

    /**
     * Edit jadwal dari modal detail
     */
    editFromDetail() {
      // Tutup modal detail
      this.hideDetailModal()
      // Buka modal edit dengan data yang sama
      this.editSchedule(this.selectedSchedule)
    },

    /**
     * Reset form data
     */
    resetForm() {
      this.formData = {
        jenisIbadah: '',
        tanggal: '',
        pengkhotbah: '',
        worshipLeader: '',
        singers: '',
        music: '',
        tambourine: '',
        banners: '',
        multimedia: '',
        description: ''
      }
    },

    /**
     * Simpan jadwal (create atau update)
     */
    async saveSchedule() {
      try {
        console.log('💾 [AdminAltarSchedules] Menyimpan jadwal...', this.formData)

        const scheduleData = {
          jenisIbadah: this.formData.jenisIbadah,
          tanggal: this.formData.tanggal,
          pengkhotbah: this.formData.pengkhotbah,
          worshipLeader: this.formData.worshipLeader,
          singers: this.formData.singers,
          music: this.formData.music,
          tambourine: this.formData.tambourine,
          banners: this.formData.banners,
          multimedia: this.formData.multimedia,
          description: this.formData.description || '', // Tambahkan description
          adminId: 'admin' // TODO: Get from user store
        }

        if (this.modalMode === 'add') {
          await createAltarServantsSchedule(scheduleData)
          this.showNotification('Jadwal berhasil ditambahkan!', 'success')
        } else {
          await updateAltarServantsSchedule(this.selectedSchedule.id, scheduleData)
          this.showNotification('Jadwal berhasil diperbarui!', 'success')
        }

        this.hideModal()
        await this.fetchSchedules()

      } catch (error) {
        console.error('❌ [AdminAltarSchedules] Error menyimpan jadwal:', error)
        this.showNotification('Gagal menyimpan jadwal. Silakan coba lagi.', 'error')
      }
    },

    /**
     * Tampilkan konfirmasi delete
     * @param {Object} schedule - Schedule to delete
     */
    deleteSchedule(schedule) {
      if (confirm(`Apakah Anda yakin ingin menghapus jadwal ${schedule.categoryLabel}?`)) {
        this.confirmDelete(schedule)
      }
    },

    /**
     * Konfirmasi delete jadwal
     */
    async confirmDelete(schedule) {
      try {
        console.log('🗑️ [AdminAltarSchedules] Menghapus jadwal...', schedule.id)

        await deleteAltarServantsSchedule(schedule.id)
        
        this.showNotification('Jadwal berhasil dihapus!', 'success')
        await this.fetchSchedules()

      } catch (error) {
        console.error('❌ [AdminAltarSchedules] Error menghapus jadwal:', error)
        this.showNotification('Gagal menghapus jadwal. Silakan coba lagi.', 'error')
      }
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
.admin-altar-schedules-container {
  background: #fcfcf7;
  min-height: calc(100vh - 64px);
  padding: 24px;
}

/* ========================================
   PAGE HEADER
========================================= */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #41442A;
  margin: 0;
}

/* ========================================
   LOADING & ERROR STATES
========================================= */
.loading-container {
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

.error-container {
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

/* ========================================
   SCHEDULES TABLE
========================================= */
.schedules-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.schedules-table {
  width: 100%;
  border-collapse: collapse;
}

.schedules-table thead {
  background: #f8f9fa;
}

.schedules-table th {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: left;
  padding: 16px 20px;
  border-bottom: 2px solid #e5e7eb;
}

.schedules-table td {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #374151;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.table-row:hover {
  background: #f9fafb;
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

.date-cell {
  color: #6b7280;
  font-size: 13px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.action-cell {
  white-space: nowrap;
}

.edit-btn,
.delete-btn,
.view-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 4px;
}

.view-btn {
  color: #3b82f6;
}

.view-btn:hover {
  background: #eff6ff;
}

.edit-btn {
  color: #10b981;
}

.edit-btn:hover {
  background: #ecfdf5;
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

/* ========================================
   EMPTY STATE
========================================= */
.empty-state {
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

/* ========================================
   MODAL STYLES
========================================= */
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
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-icon {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
}

/* ========================================
   FORM STYLES
========================================= */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #374151;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-select {
  background: white;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #059669;
}

.btn-save:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* ========================================
   DETAIL VIEW STYLES
========================================= */
.detail-view {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-group {
  margin-bottom: 20px;
}

.detail-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.detail-value {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6b7280;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.detail-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 20px 0;
}

.detail-description {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-edit-from-detail {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit-from-detail:hover {
  background: #059669;
}

.btn-close {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #4b5563;
}

/* ========================================
   RESPONSIVE ADJUSTMENTS
========================================= */
@media (max-width: 768px) {
  .admin-altar-schedules-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .schedules-table th,
  .schedules-table td {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .category-label {
    font-size: 11px;
  }
  
  .modal-container {
    width: 95%;
    margin: 20px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .detail-group {
    margin-bottom: 16px;
  }
  
  .detail-actions {
    flex-direction: column;
  }
}

/* ========================================
   ACCESSIBILITY
========================================= */
@media (prefers-reduced-motion: reduce) {
  .edit-btn,
  .delete-btn,
  .view-btn {
    transform: none;
  }

  .loading-spinner {
    animation: none;
  }
}
</style>
