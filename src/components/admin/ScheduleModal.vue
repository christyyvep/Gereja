<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h3 class="modal-title">
          {{ mode === 'add' ? 'Tambah Jadwal Baru' : 'Edit Jadwal' }}
        </h3>
        <button @click="closeModal" class="close-button">
          <X class="close-icon" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <form @submit.prevent="saveSchedule" class="schedule-form">
          <!-- Jenis Ibadah -->
          <div class="form-group">
            <label for="jenisIbadah" class="form-label">
              Jenis Ibadah <span class="required">*</span>
            </label>
            <select 
              id="jenisIbadah"
              v-model="formData.jenisIbadah" 
              class="form-select"
              required
            >
              <option value="">Pilih Jenis Ibadah</option>
              <option 
                v-for="category in worshipCategories" 
                :key="category.value" 
                :value="category.value"
              >
                {{ category.label }}
              </option>
            </select>
          </div>

          <!-- Tanggal -->
          <div class="form-group">
            <label for="tanggal" class="form-label">
              Tanggal <span class="required">*</span>
            </label>
            <input 
              id="tanggal"
              type="date" 
              v-model="formData.tanggal" 
              class="form-input"
              required
            />
          </div>

          <!-- Tim Pelayanan Section -->
          <div class="form-section">
            <h4 class="section-title">
              <Users class="section-icon" />
              Tim Pelayanan
            </h4>
            
            <div class="form-row">
              <div class="form-group">
                <label for="pengkhotbah" class="form-label">Pengkhotbah</label>
                <input 
                  id="pengkhotbah"
                  type="text" 
                  v-model="formData.pengkhotbah" 
                  class="form-input"
                  placeholder="Nama pengkhotbah"
                />
              </div>
              
              <div class="form-group">
                <label for="worshipLeader" class="form-label">Worship Leader</label>
                <input 
                  id="worshipLeader"
                  type="text" 
                  v-model="formData.worshipLeader" 
                  class="form-input"
                  placeholder="Nama worship leader"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="singers" class="form-label">Singers</label>
                <input 
                  id="singers"
                  type="text" 
                  v-model="formData.singers" 
                  class="form-input"
                  placeholder="Nama penyanyi"
                />
              </div>
              
              <div class="form-group">
                <label for="music" class="form-label">Music</label>
                <input 
                  id="music"
                  type="text" 
                  v-model="formData.music" 
                  class="form-input"
                  placeholder="Nama pemusik"
                />
              </div>
            </div>
          </div>

          <!-- Tim Teknis Section -->
          <div class="form-section">
            <h4 class="section-title">
              <Settings class="section-icon" />
              Tim Teknis
            </h4>
            
            <div class="form-row">
              <div class="form-group">
                <label for="tambourine" class="form-label">Tambourine</label>
                <input 
                  id="tambourine"
                  type="text" 
                  v-model="formData.tambourine" 
                  class="form-input"
                  placeholder="Nama petugas tambourine"
                />
              </div>
              
              <div class="form-group">
                <label for="banners" class="form-label">Banners</label>
                <input 
                  id="banners"
                  type="text" 
                  v-model="formData.banners" 
                  class="form-input"
                  placeholder="Nama petugas banners"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="multimedia" class="form-label">Multimedia</label>
                <input 
                  id="multimedia"
                  type="text" 
                  v-model="formData.multimedia" 
                  class="form-input"
                  placeholder="Nama petugas multimedia"
                />
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-button">
              Batal
            </button>
            <button 
              type="submit" 
              class="save-button"
              :disabled="saving || !isFormValid"
            >
              <Save v-if="!saving" class="button-icon" />
              <div v-else class="loading-spinner-small"></div>
              {{ saving ? 'Menyimpan...' : (mode === 'add' ? 'Tambah Jadwal' : 'Simpan Perubahan') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { X, Users, Settings, Save } from 'lucide-vue-next'
import { WORSHIP_CATEGORIES } from '@/services/altarServantsSchedules'

export default {
  name: 'ScheduleModal',
  
  components: {
    X,
    Users,
    Settings,
    Save
  },
  
  props: {
    schedule: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'add' // 'add' atau 'edit'
    }
  },
  
  emits: ['close', 'save'],
  
  data() {
    return {
      saving: false,
      worshipCategories: WORSHIP_CATEGORIES,
      formData: {
        jenisIbadah: '',
        tanggal: '',
        pengkhotbah: '',
        worshipLeader: '',
        singers: '',
        music: '',
        tambourine: '',
        banners: '',
        multimedia: ''
      }
    }
  },
  
  computed: {
    isFormValid() {
      return this.formData.jenisIbadah && this.formData.tanggal
    }
  },
  
  mounted() {
    this.initializeForm()
    document.addEventListener('keydown', this.handleKeyPress)
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress)
  },
  
  methods: {
    /**
     * Initialize form dengan data schedule jika mode edit
     */
    initializeForm() {
      if (this.mode === 'edit' && this.schedule) {
        this.formData = {
          jenisIbadah: this.schedule.jenisIbadah || '',
          tanggal: this.schedule.tanggal || '',
          pengkhotbah: this.schedule.pelayananInfo?.pengkhotbah || '',
          worshipLeader: this.schedule.pelayananInfo?.worshipLeader || '',
          singers: this.schedule.pelayananInfo?.singers || '',
          music: this.schedule.pelayananInfo?.music || '',
          tambourine: this.schedule.pelayananInfo?.tambourine || '',
          banners: this.schedule.pelayananInfo?.banners || '',
          multimedia: this.schedule.pelayananInfo?.multimedia || ''
        }
      } else {
        // Set default tanggal ke hari ini untuk mode add
        const today = new Date()
        this.formData.tanggal = today.toISOString().split('T')[0]
      }
    },

    /**
     * Handle keypress events
     */
    handleKeyPress(event) {
      if (event.key === 'Escape') {
        this.closeModal()
      }
    },

    /**
     * Close modal
     */
    closeModal() {
      this.$emit('close')
    },

    /**
     * Save schedule
     */
    async saveSchedule() {
      if (!this.isFormValid || this.saving) return

      try {
        this.saving = true

        const scheduleData = {
          jenisIbadah: this.formData.jenisIbadah,
          tanggal: this.formData.tanggal,
          pelayananInfo: {
            pengkhotbah: this.formData.pengkhotbah,
            worshipLeader: this.formData.worshipLeader,
            singers: this.formData.singers,
            music: this.formData.music,
            tambourine: this.formData.tambourine,
            banners: this.formData.banners,
            multimedia: this.formData.multimedia
          }
        }

        this.$emit('save', scheduleData)

      } catch (error) {
        console.error('Error in saveSchedule:', error)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* Modal Content */
.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-icon {
  width: 20px;
  height: 20px;
}

/* Modal Body */
.modal-body {
  padding: 32px;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

/* Form Styles */
.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-input,
.form-select {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

/* Form Sections */
.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  background: #f9fafb;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 18px;
  height: 18px;
  color: #10b981;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  margin-top: 32px;
}

.cancel-button,
.save-button {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-button {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-button:hover {
  background: #f3f4f6;
}

.save-button {
  background: #10b981;
  color: white;
  border: 1px solid #10b981;
}

.save-button:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-icon {
  width: 16px;
  height: 16px;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }
  
  .modal-header {
    padding: 20px 24px;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .cancel-button,
  .save-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
  }
  
  .modal-content {
    border-radius: 0;
    margin: 0;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
  }
  
  .modal-body {
    padding: 20px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .modal-content {
    animation: none;
  }
  
  .save-button:hover:not(:disabled) {
    transform: none;
  }
}
</style>
