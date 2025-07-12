<template>
  <div class="admin-altar-schedules-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />

      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- Desktop Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <!-- Header dengan judul dan tombol add -->
        <div class="page-header">
          <h1 class="page-title">Kelola Jadwal Pelayan Altar</h1>
          <button @click="showAddModal" class="add-button">
            <Plus class="add-icon" />
            Tambah Jadwal
          </button>
        </div>

        <!-- Loading state desktop -->
        <div v-if="loading" class="loading-container desktop-loading">
          <div class="loading-spinner"></div>
          <p>Memuat jadwal...</p>
        </div>

        <!-- Error state desktop -->
        <div v-else-if="error" class="error-container desktop-error">
          <div class="error-card">
            <AlertCircle class="error-icon" />
            <h3>Oops! Terjadi Kesalahan</h3>
            <p class="error-text">{{ error }}</p>
            <button @click="fetchSchedules" class="retry-button">
              <RefreshCw class="retry-icon" />
              Coba Lagi
            </button>
          </div>
        </div>

        <!-- Schedules Table desktop -->
        <div v-else-if="schedules.length > 0" class="schedules-table-container">
          <div class="table-wrapper">
            <table class="schedules-table">
              <thead>
                <tr>
                  <th>Jenis Ibadah</th>
                  <th>Tanggal</th>
                  <th>Pengkhotbah</th>
                  <th>Worship Leader</th>
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
                  <td class="person-cell">{{ schedule.pelayananInfo.pengkhotbah || '-' }}</td>
                  <td class="person-cell">{{ schedule.pelayananInfo.worshipLeader || '-' }}</td>
                  <td class="status-cell">
                    <span class="status-badge active">Aktif</span>
                  </td>
                  <td class="action-cell">
                    <button @click="editSchedule(schedule)" class="edit-btn">
                      <Edit2 class="btn-icon" />
                    </button>
                    <button @click="deleteSchedule(schedule)" class="delete-btn">
                      <Trash2 class="btn-icon" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty state desktop -->
        <div v-else class="desktop-empty">
          <div class="empty-card">
            <CalendarDays class="empty-icon" />
            <h3>Belum Ada Jadwal Pelayan Altar</h3>
            <p>Klik tombol "Tambah Jadwal" untuk membuat jadwal pelayan altar baru.</p>
            <button @click="showAddModal" class="add-button-primary">
              <Plus class="add-icon" />
              Tambah Jadwal Pertama
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Add/Edit Schedule -->
    <ScheduleModal
      v-if="showModal"
      :schedule="selectedSchedule"
      :mode="modalMode"
      @close="hideModal"
      @save="saveSchedule"
    />

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
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import ScheduleModal from '@/components/admin/ScheduleModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { 
  CalendarDays,
  Plus,
  RefreshCw, 
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-vue-next'
import { 
  getAltarServantsSchedules,
  createAltarServantsSchedule,
  updateAltarServantsSchedule,
  deleteAltarServantsSchedule
} from '@/services/altarServantsSchedules'

export default {
  name: 'AdminAltarSchedules',
  
  components: {
    DesktopNavbar,        
    BreadcrumbDesktop,
    ScheduleModal,
    ConfirmModal,    
    CalendarDays,
    Plus,
    RefreshCw,
    AlertCircle,
    Edit2,
    Trash2
  },
  
  data() {
    return {
      schedules: [],          // Array jadwal
      loading: true,          // Status loading
      error: null,           // Pesan error
      
      // Modal states
      showModal: false,
      modalMode: 'add',       // 'add' atau 'edit'
      selectedSchedule: null,
      
      // Delete confirmation
      showDeleteConfirm: false,
      scheduleToDelete: null,
      
      breadcrumbItems: [
        { text: 'Home', to: '/home' },
        { text: 'Admin', to: '/admin' },
        { text: 'Jadwal Pelayan Altar', to: null }
      ]
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
      this.showModal = true
    },

    /**
     * Tampilkan modal untuk edit jadwal
     * @param {Object} schedule - Schedule to edit
     */
    editSchedule(schedule) {
      this.modalMode = 'edit'
      this.selectedSchedule = { ...schedule }
      this.showModal = true
    },

    /**
     * Sembunyikan modal
     */
    hideModal() {
      this.showModal = false
      this.selectedSchedule = null
    },

    /**
     * Simpan jadwal (create atau update)
     * @param {Object} scheduleData - Data jadwal
     */
    async saveSchedule(scheduleData) {
      try {
        console.log('💾 [AdminAltarSchedules] Menyimpan jadwal...', scheduleData)

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
      this.scheduleToDelete = schedule
      this.showDeleteConfirm = true
    },

    /**
     * Sembunyikan modal delete
     */
    hideDeleteModal() {
      this.showDeleteConfirm = false
      this.scheduleToDelete = null
    },

    /**
     * Konfirmasi delete jadwal
     */
    async confirmDelete() {
      try {
        console.log('🗑️ [AdminAltarSchedules] Menghapus jadwal...', this.scheduleToDelete.id)

        await deleteAltarServantsSchedule(this.scheduleToDelete.id)
        
        this.showNotification('Jadwal berhasil dihapus!', 'success')
        this.hideDeleteModal()
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

/* === DESKTOP CONTENT === */
.desktop-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}

/* === PAGE HEADER === */
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

/* === SCHEDULES TABLE === */
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

.person-cell {
  color: #374151;
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

/* === RESPONSIVE ADJUSTMENTS === */
@media (max-width: 1200px) {
  .desktop-content {
    padding: 24px;
    max-width: 100%;
  }
  
  .page-title {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
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
}

/* === ACCESSIBILITY === */
@media (prefers-reduced-motion: reduce) {
  .add-button:hover,
  .add-button-primary:hover,
  .retry-button:hover,
  .edit-btn,
  .delete-btn {
    transform: none;
  }

  .loading-spinner {
    animation: none;
  }
}
</style>
