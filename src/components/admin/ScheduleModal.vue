<!-- ScheduleModal.vue - Modal untuk Add/Edit Jadwal -->
<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          {{ mode === 'add' ? 'Tambah Jadwal Baru' : 'Edit Jadwal' }}
        </h2>
        <button @click="closeModal" class="close-button">
          <X />
        </button>
      </div>
      
      <!-- Modal Body -->
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="schedule-form">
          
          <!-- Basic Information Section -->
          <div class="form-section">
            <h3 class="section-title">
              <Info />
              Informasi Dasar
            </h3>
            
            <!-- Title -->
            <div class="form-group">
              <label for="title" class="form-label required">Judul Jadwal</label>
              <input
                id="title"
                v-model="formData.title"
                type="text"
                class="form-input"
                :class="{ 'error': errors.title }"
                placeholder="Contoh: Ibadah Minggu Pagi"
                maxlength="100"
                required
              />
              <div v-if="errors.title" class="error-message">
                {{ errors.title }}
              </div>
            </div>
            
            <!-- Category -->
            <div class="form-group">
              <label for="category" class="form-label required">Jenis Ibadah</label>
              <select
                id="category"
                v-model="formData.category"
                class="form-select"
                :class="{ 'error': errors.category }"
                required
              >
                <option value="">Pilih jenis ibadah</option>
                <option 
                  v-for="cat in categories" 
                  :key="cat.value" 
                  :value="cat.value"
                >
                  {{ cat.label }}
                </option>
              </select>
              <div v-if="errors.category" class="error-message">
                {{ errors.category }}
              </div>
            </div>
            
            <!-- Day and Time Row -->
            <div class="form-row">
              <!-- Day of Week -->
              <div class="form-group">
                <label for="dayOfWeek" class="form-label required">Hari</label>
                <select
                  id="dayOfWeek"
                  v-model="formData.dayOfWeek"
                  class="form-select"
                  :class="{ 'error': errors.dayOfWeek }"
                  required
                >
                  <option value="">Pilih hari</option>
                  <option value="daily">Setiap Hari</option>
                  <option value="0">Minggu</option>
                  <option value="1">Senin</option>
                  <option value="2">Selasa</option>
                  <option value="3">Rabu</option>
                  <option value="4">Kamis</option>
                  <option value="5">Jumat</option>
                  <option value="6">Sabtu</option>
                </select>
                <div v-if="errors.dayOfWeek" class="error-message">
                  {{ errors.dayOfWeek }}
                </div>
              </div>
              
              <!-- Time -->
              <div class="form-group">
                <label for="time" class="form-label required">Waktu</label>
                <input
                  id="time"
                  v-model="formData.time"
                  type="time"
                  class="form-input"
                  :class="{ 'error': errors.time }"
                  required
                />
                <div v-if="errors.time" class="error-message">
                  {{ errors.time }}
                </div>
              </div>
            </div>
            
            <!-- Location -->
            <div class="form-group">
              <label for="location" class="form-label">Lokasi</label>
              <input
                id="location"
                v-model="formData.location"
                type="text"
                class="form-input"
                placeholder="Contoh: Gedung Gereja Utama"
                maxlength="100"
              />
            </div>
          </div>
          
          <!-- Content Section -->
          <div class="form-section">
            <h3 class="section-title">
              <MessageSquare />
              Konten Jadwal
            </h3>
            
            <!-- Theme -->
            <div class="form-group">
              <label for="theme" class="form-label">Tema Ibadah</label>
              <input
                id="theme"
                v-model="formData.theme"
                type="text"
                class="form-input"
                placeholder="Contoh: Berkat Tuhan dalam Hidup Kita"
                maxlength="150"
              />
              <div class="form-help">
                Tema bisa diubah setiap minggu
              </div>
            </div>
            
            <!-- Speaker -->
            <div class="form-group">
              <label for="speaker" class="form-label">Pengkhotbah</label>
              <input
                id="speaker"
                v-model="formData.speaker"
                type="text"
                class="form-input"
                placeholder="Contoh: Pdt. John Doe"
                maxlength="100"
              />
            </div>
            
            <!-- Special Notes -->
            <div class="form-group">
              <label for="specialNotes" class="form-label">Catatan Khusus</label>
              <textarea
                id="specialNotes"
                v-model="formData.specialNotes"
                class="form-textarea"
                rows="3"
                placeholder="Catatan atau pengumuman khusus untuk jadwal ini..."
                maxlength="500"
              ></textarea>
              <div class="character-count">
                {{ formData.specialNotes?.length || 0 }}/500
              </div>
            </div>
          </div>
          
          <!-- Settings Section -->
          <div class="form-section">
            <h3 class="section-title">
              <Settings />
              Pengaturan
            </h3>
            
            <div class="form-checkboxes">
              <!-- Is Published -->
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    v-model="formData.isPublished"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">
                    <strong>Publikasikan Jadwal</strong>
                    <small>Jadwal akan tampil di halaman jemaat</small>
                  </span>
                </label>
              </div>
              
              <!-- Is Special Event -->
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    v-model="formData.isSpecialEvent"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">
                    <strong>Acara Khusus</strong>
                    <small>Tandai sebagai kebaktian khusus</small>
                  </span>
                </label>
              </div>
            </div>
          </div>
          
        </form>
      </div>
      
      <!-- Modal Footer -->
      <div class="modal-footer">
        <button 
          type="button" 
          @click="closeModal" 
          class="btn-secondary"
          :disabled="isSaving"
        >
          Batal
        </button>
        
        <button 
          type="submit" 
          @click="handleSubmit"
          class="btn-primary"
          :disabled="isSaving || !isFormValid"
        >
          <template v-if="isSaving">
            <Loader2 class="animate-spin" />
            Menyimpan...
          </template>
          <template v-else>
            <Save />
            {{ mode === 'add' ? 'Tambah Jadwal' : 'Simpan Perubahan' }}
          </template>
        </button>
      </div>
      
    </div>
  </div>
</template>

<script>
import { 
  X, 
  Info, 
  MessageSquare, 
  Settings, 
  Save, 
  Loader2 
} from 'lucide-vue-next'

import { WORSHIP_CATEGORIES } from '@/services/schedules'  // ⭐ KONSISTEN dengan yang lain

export default {
  name: 'ScheduleModal',
  
  components: {
    X,
    Info,
    MessageSquare,
    Settings,
    Save,
    Loader2
  },
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'add', // 'add' atau 'edit'
      validator: (value) => ['add', 'edit'].includes(value)
    },
    scheduleData: {
      type: Object,
      default: null
    }
  },
  
  emits: ['close', 'save'],
  
  data() {
    return {
      isSaving: false,
      
      // Form data
      formData: {
        title: '',
        category: '',
        dayOfWeek: '',
        time: '',
        location: 'Gedung Gereja Utama',
        theme: '',
        speaker: '',
        specialNotes: '',
        isPublished: true,
        isSpecialEvent: false
      },
      
      // Form validation errors
      errors: {},
      
      // Categories from service
      categories: WORSHIP_CATEGORIES
    }
  },
  
  computed: {
    isFormValid() {
      const required = ['title', 'category', 'dayOfWeek', 'time']
      return required.every(field => {
        const value = this.formData[field]
        return value !== null && value !== undefined && value !== ''
      })
    }
  },
  
  watch: {
    // Reset form when modal shows/hides
    show(newValue) {
      if (newValue) {
        this.initializeForm()
        this.clearErrors()
      }
    },
    
    // Watch scheduleData changes for edit mode
    scheduleData: {
      handler(newValue) {
        if (newValue && this.mode === 'edit') {
          this.populateForm(newValue)
        }
      },
      immediate: true
    }
  },
  
  methods: {
    // ===================================
    // 🔄 FORM INITIALIZATION
    // ===================================
    
    initializeForm() {
      if (this.mode === 'edit' && this.scheduleData) {
        this.populateForm(this.scheduleData)
      } else {
        this.resetForm()
      }
    },
    
    resetForm() {
      this.formData = {
        title: '',
        category: '',
        dayOfWeek: '',
        time: '',
        location: 'Gedung Gereja Utama',
        theme: '',
        speaker: '',
        specialNotes: '',
        isPublished: true,
        isSpecialEvent: false
      }
    },
    
    populateForm(data) {
      this.formData = {
        title: data.title || '',
        category: data.category || '',
        dayOfWeek: data.dayOfWeek !== undefined ? String(data.dayOfWeek) : '',
        time: data.time || '',
        location: data.location || 'Gedung Gereja Utama',
        theme: data.theme || '',
        speaker: data.speaker || '',
        specialNotes: data.specialNotes || '',
        isPublished: data.isPublished !== false,
        isSpecialEvent: data.isSpecialEvent || false
      }
    },
    
    // ===================================
    // ✅ FORM VALIDATION
    // ===================================
    
    validateForm() {
      this.errors = {}
      let isValid = true
      
      // Required field validation
      if (!this.formData.title || this.formData.title.trim().length === 0) {
        this.errors.title = 'Judul jadwal harus diisi'
        isValid = false
      } else if (this.formData.title.trim().length < 3) {
        this.errors.title = 'Judul minimal 3 karakter'
        isValid = false
      }
      
      if (!this.formData.category) {
        this.errors.category = 'Jenis ibadah harus dipilih'
        isValid = false
      }
      
      if (!this.formData.dayOfWeek && this.formData.dayOfWeek !== 0) {
        this.errors.dayOfWeek = 'Hari ibadah harus dipilih'
        isValid = false
      }
      
      if (!this.formData.time) {
        this.errors.time = 'Waktu ibadah harus diisi'
        isValid = false
      }
      
      // Time format validation
      if (this.formData.time && !/^\d{2}:\d{2}$/.test(this.formData.time)) {
        this.errors.time = 'Format waktu tidak valid'
        isValid = false
      }
      
      return isValid
    },
    
    clearErrors() {
      this.errors = {}
    },
    
    // ===================================
    // 💾 FORM SUBMISSION
    // ===================================
    
    async handleSubmit() {
      try {
        // Validate form first
        if (!this.validateForm()) {
          console.log('❌ [ScheduleModal] Form validation failed:', this.errors)
          return
        }
        
        this.isSaving = true
        
        // Prepare data for saving
        const saveData = this.prepareSaveData()
        
        console.log('💾 [ScheduleModal] Submitting form:', saveData)
        
        // Emit save event to parent
        this.$emit('save', saveData)
        
        // Note: Parent component will handle the actual saving
        // and close the modal when done
        
      } catch (error) {
        console.error('❌ [ScheduleModal] Error in handleSubmit:', error)
        this.isSaving = false
      }
    },
    
    prepareSaveData() {
      // Convert dayOfWeek to proper type
      let dayOfWeek = this.formData.dayOfWeek
      if (dayOfWeek !== 'daily') {
        dayOfWeek = parseInt(dayOfWeek)
      }
      
      return {
        title: this.formData.title.trim(),
        category: this.formData.category,
        dayOfWeek: dayOfWeek,
        time: this.formData.time,
        location: this.formData.location?.trim() || 'Gedung Gereja Utama',
        theme: this.formData.theme?.trim() || '',
        speaker: this.formData.speaker?.trim() || '',
        specialNotes: this.formData.specialNotes?.trim() || '',
        isPublished: this.formData.isPublished,
        isSpecialEvent: this.formData.isSpecialEvent,
        
        // Add admin ID (you can get this from auth service)
        adminId: 'current-admin-id' // TODO: Get from auth service
      }
    },
    
    // ===================================
    // 🔄 MODAL CONTROLS
    // ===================================
    
    closeModal() {
      this.isSaving = false
      this.$emit('close')
    },
    
    handleOverlayClick() {
      if (!this.isSaving) {
        this.closeModal()
      }
    },
    
    // Called by parent when save is successful
    onSaveSuccess() {
      this.isSaving = false
      this.closeModal()
    },
    
    // Called by parent when save fails
    onSaveError() {
      this.isSaving = false
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.close-button {
  width: 40px;
  height: 40px;
  border: none;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Modal Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Form Sections */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title svg {
  width: 18px;
  height: 18px;
  color: #8B7355;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  color: #41442A;
  margin: 0;
}

.form-label.required::after {
  content: ' *';
  color: #dc2626;
}

/* Form Inputs */
.form-input,
.form-select,
.form-textarea {
  font-family: 'Inter';
  font-size: 14px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: white;
  color: #41442A;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #8B7355;
  box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #dc2626;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Form Help Text */
.form-help {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

.character-count {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
}

.error-message {
  font-size: 12px;
  color: #dc2626;
  margin-top: -4px;
}

/* Checkboxes */
.form-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.4;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e5e5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-input:checked + .checkbox-custom {
  background: #41442A;
  border-color: #41442A;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.checkbox-text small {
  color: #6b7280;
  font-size: 12px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px 24px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.btn-secondary,
.btn-primary {
  padding: 12px 20px;
  border-radius: 8px;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.btn-secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #e5e5e5;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-primary {
  background: #41442A;
  color: white;
  border: 1px solid #41442A;
}

.btn-primary:hover {
  background: #5a5e3d;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none;
  }
}
</style>