<!-- RenunganModal.vue - Modal untuk Tambah/Edit Renungan -->
<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h3 class="modal-title">
          {{ mode === 'add' ? 'Tambah Renungan Baru' : 'Edit Renungan' }}
        </h3>
        <button @click="closeModal" class="close-button">
          <X class="close-icon" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <form @submit.prevent="saveRenungan" class="renungan-form">
          
          <!-- Informasi Dasar Section -->
          <div class="form-section">
            <h4 class="section-title">
              <FileText class="section-icon" />
              Informasi Dasar
            </h4>
            
            <!-- Judul -->
            <div class="form-group">
              <label for="title" class="form-label">
                Judul Renungan <span class="required">*</span>
              </label>
              <input 
                id="title"
                type="text" 
                v-model="formData.title" 
                class="form-input"
                placeholder="Masukkan judul renungan"
                required
              />
            </div>

            <!-- Ayat Alkitab -->
            <div class="form-group">
              <label for="verse" class="form-label">
                Ayat Alkitab <span class="required">*</span>
              </label>
              <input 
                id="verse"
                type="text" 
                v-model="formData.verse" 
                class="form-input"
                placeholder="Contoh: Yohanes 3:16"
                required
              />
              <div class="form-help">Referensi ayat yang akan dijadikan dasar renungan</div>
            </div>

            <!-- Isi Renungan -->
            <div class="form-group">
              <label for="content" class="form-label">
                Isi Renungan <span class="required">*</span>
              </label>
              <textarea 
                id="content"
                v-model="formData.content" 
                class="form-textarea"
                placeholder="Tulis isi renungan harian..."
                rows="8"
                required
              />
              <div class="form-help">Isi renungan yang akan dibagikan kepada jemaat</div>
            </div>

            <!-- Tanggal -->
            <div class="form-group">
              <label for="date" class="form-label">
                Tanggal Renungan <span class="required">*</span>
              </label>
              <input 
                id="date"
                type="date" 
                v-model="formData.date" 
                class="form-input"
                required
              />
              <div class="form-help">Tanggal untuk renungan ini ditampilkan</div>
            </div>
          </div>

          <!-- Thumbnail Section -->
          <div class="form-section">
            <h4 class="section-title">
              <ImageIcon class="section-icon" />
              Thumbnail Renungan
            </h4>
            
            <div class="form-group">
              <label class="form-label">
                Upload Thumbnail <span class="required">*</span>
              </label>
              <p class="form-help">Upload 4 ukuran thumbnail yang diperlukan untuk tampilan optimal</p>
              
              <div class="required-thumbnails-grid">
                <!-- Card Mobile -->
                <div class="thumbnail-upload-item">
                  <label class="thumbnail-label">Card Mobile <span class="required">*</span></label>
                  <div class="file-upload-container">
                    <input 
                      type="file"
                      id="cardMobile"
                      @change="(e) => handleRequiredUpload(e, 'cardMobile')"
                      accept="image/*"
                      class="file-input"
                      :disabled="uploadStates.cardMobile.loading"
                      :required="mode === 'add'"
                    />
                    <label for="cardMobile" class="file-upload-label" :class="{ 'uploading': uploadStates.cardMobile.loading }">
                      <div v-if="uploadStates.cardMobile.loading" class="upload-spinner"></div>
                      <Upload v-else class="upload-icon" />
                      <span>
                        {{ uploadStates.cardMobile.loading ? 'Uploading...' : 
                           formData.thumbnails.cardMobile ? 'Ganti' : 'Upload' }}
                      </span>
                    </label>
                    <div v-if="uploadStates.cardMobile.error" class="upload-error">
                      {{ uploadStates.cardMobile.error }}
                    </div>
                    <div v-if="formData.thumbnails.cardMobile" class="file-preview">
                      <img :src="formData.thumbnails.cardMobile" alt="Card Mobile" class="preview-image" />
                      <button type="button" @click="removeThumbnail('cardMobile')" class="remove-preview">
                        <X class="remove-icon" />
                      </button>
                    </div>
                  </div>
                  <div class="size-hint">Recommended: 300x200px</div>
                </div>

                <!-- Card Desktop -->
                <div class="thumbnail-upload-item">
                  <label class="thumbnail-label">Card Desktop <span class="required">*</span></label>
                  <div class="file-upload-container">
                    <input 
                      type="file"
                      id="cardDesktop"
                      @change="(e) => handleRequiredUpload(e, 'cardDesktop')"
                      accept="image/*"
                      class="file-input"
                      :disabled="uploadStates.cardDesktop.loading"
                      :required="mode === 'add'"
                    />
                    <label for="cardDesktop" class="file-upload-label" :class="{ 'uploading': uploadStates.cardDesktop.loading }">
                      <div v-if="uploadStates.cardDesktop.loading" class="upload-spinner"></div>
                      <Upload v-else class="upload-icon" />
                      <span>
                        {{ uploadStates.cardDesktop.loading ? 'Uploading...' : 
                           formData.thumbnails.cardDesktop ? 'Ganti' : 'Upload' }}
                      </span>
                    </label>
                    <div v-if="uploadStates.cardDesktop.error" class="upload-error">
                      {{ uploadStates.cardDesktop.error }}
                    </div>
                    <div v-if="formData.thumbnails.cardDesktop" class="file-preview">
                      <img :src="formData.thumbnails.cardDesktop" alt="Card Desktop" class="preview-image" />
                      <button type="button" @click="removeThumbnail('cardDesktop')" class="remove-preview">
                        <X class="remove-icon" />
                      </button>
                    </div>
                  </div>
                  <div class="size-hint">Recommended: 400x250px</div>
                </div>

                <!-- Detail Mobile -->
                <div class="thumbnail-upload-item">
                  <label class="thumbnail-label">Detail Mobile <span class="required">*</span></label>
                  <div class="file-upload-container">
                    <input 
                      type="file"
                      id="detailMobile"
                      @change="(e) => handleRequiredUpload(e, 'detailMobile')"
                      accept="image/*"
                      class="file-input"
                      :disabled="uploadStates.detailMobile.loading"
                      :required="mode === 'add'"
                    />
                    <label for="detailMobile" class="file-upload-label" :class="{ 'uploading': uploadStates.detailMobile.loading }">
                      <div v-if="uploadStates.detailMobile.loading" class="upload-spinner"></div>
                      <Upload v-else class="upload-icon" />
                      <span>
                        {{ uploadStates.detailMobile.loading ? 'Uploading...' : 
                           formData.thumbnails.detailMobile ? 'Ganti' : 'Upload' }}
                      </span>
                    </label>
                    <div v-if="uploadStates.detailMobile.error" class="upload-error">
                      {{ uploadStates.detailMobile.error }}
                    </div>
                    <div v-if="formData.thumbnails.detailMobile" class="file-preview">
                      <img :src="formData.thumbnails.detailMobile" alt="Detail Mobile" class="preview-image" />
                      <button type="button" @click="removeThumbnail('detailMobile')" class="remove-preview">
                        <X class="remove-icon" />
                      </button>
                    </div>
                  </div>
                  <div class="size-hint">Recommended: 360x240px</div>
                </div>

                <!-- Detail Desktop -->
                <div class="thumbnail-upload-item">
                  <label class="thumbnail-label">Detail Desktop <span class="required">*</span></label>
                  <div class="file-upload-container">
                    <input 
                      type="file"
                      id="detailDesktop"
                      @change="(e) => handleRequiredUpload(e, 'detailDesktop')"
                      accept="image/*"
                      class="file-input"
                      :disabled="uploadStates.detailDesktop.loading"
                      :required="mode === 'add'"
                    />
                    <label for="detailDesktop" class="file-upload-label" :class="{ 'uploading': uploadStates.detailDesktop.loading }">
                      <div v-if="uploadStates.detailDesktop.loading" class="upload-spinner"></div>
                      <Upload v-else class="upload-icon" />
                      <span>
                        {{ uploadStates.detailDesktop.loading ? 'Uploading...' : 
                           formData.thumbnails.detailDesktop ? 'Ganti' : 'Upload' }}
                      </span>
                    </label>
                    <div v-if="uploadStates.detailDesktop.error" class="upload-error">
                      {{ uploadStates.detailDesktop.error }}
                    </div>
                    <div v-if="formData.thumbnails.detailDesktop" class="file-preview">
                      <img :src="formData.thumbnails.detailDesktop" alt="Detail Desktop" class="preview-image" />
                      <button type="button" @click="removeThumbnail('detailDesktop')" class="remove-preview">
                        <X class="remove-icon" />
                      </button>
                    </div>
                  </div>
                  <div class="size-hint">Recommended: 800x400px</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="cancel-button">
              Batal
            </button>
            <button type="submit" class="save-button" :disabled="!isFormValid || isUploading">
              <div v-if="isUploading" class="button-spinner"></div>
              {{ isUploading ? 'Uploading...' : (mode === 'add' ? 'Tambah Renungan' : 'Simpan Perubahan') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  X, 
  FileText, 
  ImageIcon as Image, 
  Upload
} from 'lucide-vue-next'
import { uploadToCloudinary as cloudinaryUpload } from '@/utils/cloudinary'

export default {
  name: 'RenunganModal',
  components: {
    X,
    FileText,
    ImageIcon: Image,
    Upload
  },
  props: {
    renungan: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      required: true,
      validator: (value) => ['add', 'edit'].includes(value)
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      formData: {
        title: '',
        verse: '',
        content: '',
        date: '',
        thumbnails: {
          cardMobile: '',
          cardDesktop: '',
          detailMobile: '',
          detailDesktop: ''
        }
      },
      uploadStates: {
        cardMobile: { loading: false, error: null },
        cardDesktop: { loading: false, error: null },
        detailMobile: { loading: false, error: null },
        detailDesktop: { loading: false, error: null }
      }
    }
  },
  computed: {
    isFormValid() {
      const basicFieldsValid = this.formData.title && 
                              this.formData.verse && 
                              this.formData.content && 
                              this.formData.date

      // For add mode, all thumbnails are required
      if (this.mode === 'add') {
        const thumbnailsValid = this.formData.thumbnails.cardMobile &&
                               this.formData.thumbnails.cardDesktop &&
                               this.formData.thumbnails.detailMobile &&
                               this.formData.thumbnails.detailDesktop
        return basicFieldsValid && thumbnailsValid
      }

      // For edit mode, basic fields are enough
      return basicFieldsValid
    },
    isUploading() {
      return Object.values(this.uploadStates).some(state => state.loading)
    }
  },
  created() {
    this.initializeForm()
  },
  methods: {
    initializeForm() {
      if (this.mode === 'edit' && this.renungan) {
        // Populate form with existing data
        this.formData = {
          title: this.renungan.title || '',
          verse: this.renungan.verse || '',
          content: this.renungan.content || '',
          date: this.formatDateForInput(this.renungan.date),
          thumbnails: {
            cardMobile: this.renungan.thumbnails?.cardMobile || '',
            cardDesktop: this.renungan.thumbnails?.cardDesktop || '',
            detailMobile: this.renungan.thumbnails?.detailMobile || '',
            detailDesktop: this.renungan.thumbnails?.detailDesktop || ''
          }
        }
      } else {
        // Set default date to today for new renungan
        const today = new Date().toISOString().split('T')[0]
        this.formData.date = today
      }
    },

    formatDateForInput(date) {
      if (!date) return ''
      
      try {
        let dateObj = date
        if (date.toDate) {
          dateObj = date.toDate()
        } else if (typeof date === 'string') {
          dateObj = new Date(date)
        }
        
        return dateObj.toISOString().split('T')[0]
      } catch (error) {
        return ''
      }
    },

    async handleRequiredUpload(event, type) {
      const file = event.target.files[0]
      if (!file) return

      console.log(`📸 [RenunganModal] Uploading ${type}:`, file.name)

      // Reset previous error
      this.uploadStates[type].error = null
      this.uploadStates[type].loading = true

      try {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error('File harus berupa gambar')
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Ukuran file tidak boleh lebih dari 5MB')
        }

        // Upload to Cloudinary
        const uploadedUrl = await this.uploadToCloudinary(file, type)

        // Update form data
        this.formData.thumbnails[type] = uploadedUrl
        
        console.log(`✅ [RenunganModal] ${type} uploaded:`, uploadedUrl)

      } catch (error) {
        console.error(`❌ [RenunganModal] Upload ${type} failed:`, error)
        
        // Enhanced error handling with troubleshooting tips
        let errorMessage = error.message
        
        if (error.message.includes('API key')) {
          errorMessage = `Upload gagal: API Key bermasalah. Cek konfigurasi Cloudinary.`
        } else if (error.message.includes('preset')) {
          errorMessage = `Upload gagal: Upload preset tidak valid. Gunakan 'ml_default' atau buat preset di Cloudinary dashboard.`
        } else if (error.message.includes('unauthorized')) {
          errorMessage = `Upload gagal: Tidak ada akses. Pastikan upload preset adalah 'unsigned'.`
        } else if (error.message.includes('network')) {
          errorMessage = `Upload gagal: Masalah koneksi. Cek internet dan coba lagi.`
        }
        
        this.uploadStates[type].error = errorMessage
        
        // Log troubleshooting info
        console.log('🔧 [DEBUG] Cloudinary config:', {
          cloudName: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.VUE_APP_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
          hasApiKey: !!process.env.VUE_APP_CLOUDINARY_API_KEY
        })
        
        console.log('💡 [TROUBLESHOOT] Try running this in console:')
        console.log('testMultiplePresets()')
        
        // Clear the file input
        event.target.value = ''
      } finally {
        this.uploadStates[type].loading = false
      }
    },

    async uploadToCloudinary(file, type) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File harus berupa gambar!')
      }
      
      // Validate file size (max 10MB for more flexibility)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Ukuran file maksimal 10MB!')
      }
      
      console.log(`🔄 [RenunganModal] Uploading ${type}:`, {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type
      })

      try {
        // Use the working uploadToCloudinary function from utils with 'renungan' content type
        const uploadedUrl = await cloudinaryUpload(file, type, 'renungan')
        console.log(`✅ [RenunganModal] Upload successful:`, uploadedUrl)
        return uploadedUrl
        
      } catch (error) {
        console.error(`❌ [RenunganModal] Cloudinary upload failed:`, error)
        throw new Error(`Upload gagal: ${error.message}`)
      }
    },

    removeThumbnail(type) {
      this.formData.thumbnails[type] = ''
      this.uploadStates[type].error = null
      
      // Clear the corresponding file input
      const input = document.getElementById(type)
      if (input) {
        input.value = ''
      }
    },

    async saveRenungan() {
      if (!this.isFormValid) return

      try {
        console.log('💾 [RenunganModal] Saving renungan...', this.formData)

        // Prepare data for save
        const renunganData = {
          title: this.formData.title.trim(),
          verse: this.formData.verse.trim(),
          content: this.formData.content.trim(),
          date: this.formData.date,
          thumbnails: { ...this.formData.thumbnails }
        }

        // Emit save event
        this.$emit('save', renunganData)

      } catch (error) {
        console.error('❌ [RenunganModal] Error saving:', error)
      }
    },

    closeModal() {
      this.$emit('close')
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
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

/* Modal Content */
.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 20px 0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-title {
  font-family: 'Inter';
  font-size: 24px;
  font-weight: 700;
  color: #41442A;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.close-button:hover {
  background: #f0f0f0;
}

.close-icon {
  width: 20px;
  height: 20px;
  color: #666;
}

/* Modal Body */
.modal-body {
  padding: 24px;
}

/* Form Sections */
.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 20px 0;
}

.section-icon {
  width: 20px;
  height: 20px;
  color: #41442A;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Inter';
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #41442A;
  box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.form-help {
  font-family: 'Inter';
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* Thumbnail Upload Grid */
.required-thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.thumbnail-upload-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.thumbnail-label {
  display: block;
  font-family: 'Inter';
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

/* File Upload */
.file-upload-container {
  position: relative;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.file-upload-label:hover {
  border-color: #41442A;
  background: #f0f0f0;
}

.file-upload-label.uploading {
  border-color: #41442A;
  background: #f8f9fa;
  cursor: not-allowed;
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: #666;
}

.upload-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f0f0f0;
  border-top: 2px solid #41442A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.file-upload-label span {
  font-family: 'Inter';
  font-size: 13px;
  color: #666;
  text-align: center;
}

.upload-error {
  color: #ef4444;
  font-family: 'Inter';
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
}

/* File Preview */
.file-preview {
  position: relative;
  margin-top: 8px;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.remove-preview {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.remove-preview:hover {
  background: rgba(0, 0, 0, 0.9);
}

.remove-icon {
  width: 12px;
  height: 12px;
  color: white;
}

.size-hint {
  font-family: 'Inter';
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: center;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
  position: sticky;
  bottom: 0;
}

.cancel-button, .save-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-button {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.cancel-button:hover {
  background: #f0f0f0;
}

.save-button {
  background: #41442A;
  border: none;
  color: white;
}

.save-button:hover:not(:disabled) {
  background: #2d2f1c;
}

.save-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: stretch;
  }

  .modal-content {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
  }

  .modal-header, .modal-body, .modal-footer {
    padding: 16px;
  }

  .required-thumbnails-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .cancel-button, .save-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
