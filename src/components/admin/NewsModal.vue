<!-- NewsModal.vue - UI Diperbaiki dan Disederhanakan -->
<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h3 class="modal-title">
          {{ mode === 'add' ? 'Tambah Berita Baru' : 'Edit Berita' }}
        </h3>
        <button @click="closeModal" class="close-button">
          <X class="close-icon" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <form @submit.prevent="saveNews" class="news-form">
          
          <!-- Informasi Dasar Section -->
          <div class="form-section">
            <h4 class="section-title">
              <FileText class="section-icon" />
              Informasi Dasar
            </h4>
            
            <!-- Judul -->
            <div class="form-group">
              <label for="title" class="form-label">
                Judul Berita <span class="required">*</span>
              </label>
              <input 
                id="title"
                type="text" 
                v-model="formData.title" 
                class="form-input"
                placeholder="Masukkan judul berita"
                required
              />
            </div>

            <!-- Kategori -->
            <div class="form-group">
              <label for="category" class="form-label">
                Kategori <span class="required">*</span>
              </label>
              <select 
                id="category"
                v-model="formData.category" 
                class="form-select"
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="pengumuman">Pengumuman</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="informasi">Informasi</option>
                <option value="event">Event</option>
                <option value="ibadah">Ibadh</option>
                <option value="komunitas">Komunitas</option>
              </select>
            </div>

            <!-- Summary -->
            <div class="form-group">
              <label for="summary" class="form-label">
                Ringkasan <span class="required">*</span>
              </label>
              <textarea 
                id="summary"
                v-model="formData.summary" 
                class="form-textarea"
                placeholder="Ringkasan singkat berita yang akan ditampilkan di card"
                rows="3"
                required
              />
            </div>
          </div>

          <!-- Informasi Kegiatan Section -->
          <div class="form-section">
            <h4 class="section-title">
              <Calendar class="section-icon" />
              Informasi Kegiatan
            </h4>
            
            <!-- Row 1: Tanggal Publikasi & Tanggal Kegiatan -->
            <div class="form-row">
              <div class="form-group">
                <label for="publishDate" class="form-label">
                  Tanggal Publikasi <span class="required">*</span>
                </label>
                <input 
                  id="publishDate"
                  type="date" 
                  v-model="formData.publishDate" 
                  class="form-input"
                  required
                />
                <div class="form-help">Tanggal berita dipublikasikan</div>
              </div>
              
              <div class="form-group">
                <label for="date" class="form-label">
                  Tanggal Kegiatan
                </label>
                <input 
                  id="date"
                  type="date" 
                  v-model="formData.date" 
                  class="form-input"
                />
                <div class="form-help">Tanggal pelaksanaan kegiatan (opsional)</div>
              </div>
            </div>

            <!-- Row 2: Waktu & Lokasi -->
            <div class="form-row">
              <div class="form-group">
                <label for="time" class="form-label">
                  Waktu Kegiatan
                </label>
                <input 
                  id="time"
                  type="text" 
                  v-model="formData.time" 
                  class="form-input"
                  placeholder="Contoh: 10.00 WITA, 19:30-21:00"
                />
                <div class="form-help">Format bebas, contoh: 10.00 WITA</div>
              </div>
              
              <div class="form-group">
                <label for="location" class="form-label">
                  Lokasi Kegiatan
                </label>
                <input 
                  id="location"
                  type="text" 
                  v-model="formData.location" 
                  class="form-input"
                  placeholder="Contoh: Gereja, Aula, Online"
                />
                <div class="form-help">Tempat pelaksanaan kegiatan</div>
              </div>
            </div>
          </div>

          <!-- Pengaturan Tampilan Section -->
          <div class="form-section">
            <h4 class="section-title">
              <Settings class="section-icon" />
              Pengaturan Tampilan
            </h4>
            
            <!-- Priority dan Status dalam grid yang rapi -->
            <div class="settings-grid">
              <!-- Priority -->
              <div class="form-group">
                <label for="priority" class="form-label">
                  Prioritas <span class="required">*</span>
                </label>
                <select 
                  id="priority"
                  v-model="formData.priority" 
                  class="form-select"
                  required
                >
                  <option :value="1">1 - Sangat Tinggi</option>
                  <option :value="2">2 - Tinggi</option>
                  <option :value="3">3 - Sedang</option>
                  <option :value="4">4 - Rendah</option>
                  <option :value="5">5 - Sangat Rendah</option>
                </select>
                <div class="form-help">Menentukan urutan tampilan di halaman berita</div>
              </div>
              
              <!-- Status Toggles -->
              <div class="form-group">
                <label class="form-label">Status Berita</label>
                <div class="toggle-group">
                  <label class="toggle-item">
                    <input 
                      type="checkbox" 
                      v-model="formData.isEvent"
                      class="toggle-checkbox"
                    />
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">Ini adalah event/kegiatan</span>
                  </label>
                  
                  <label class="toggle-item">
                    <input 
                      type="checkbox" 
                      v-model="formData.showInAnnouncement"
                      class="toggle-checkbox"
                    />
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">Tampilkan di announcement</span>
                  </label>
                </div>
                <div class="form-help">Berita akan muncul di banner pengumuman homepage</div>
              </div>
            </div>
          </div>

          <!-- Thumbnail & Gambar Section -->
          <div class="form-section">
            <h4 class="section-title">
              <ImageIcon class="section-icon" />
              Thumbnail & Gambar
            </h4>
            
            <!-- Required Thumbnails -->
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
                      :required="mode === 'add'"
                    />
                    <label for="cardDesktop" class="file-upload-label">
                      <Upload class="upload-icon" />
                      <span>{{ formData.thumbnails.cardDesktop ? 'Ganti' : 'Upload' }}</span>
                    </label>
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
                      :required="mode === 'add'"
                    />
                    <label for="detailMobile" class="file-upload-label">
                      <Upload class="upload-icon" />
                      <span>{{ formData.thumbnails.detailMobile ? 'Ganti' : 'Upload' }}</span>
                    </label>
                    <div v-if="formData.thumbnails.detailMobile" class="file-preview">
                      <img :src="formData.thumbnails.detailMobile" alt="Detail Mobile" class="preview-image" />
                      <button type="button" @click="removeThumbnail('detailMobile')" class="remove-preview">
                        <X class="remove-icon" />
                      </button>
                    </div>
                  </div>
                  <div class="size-hint">Recommended: 350x220px</div>
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
                      :required="mode === 'add'"
                    />
                    <label for="detailDesktop" class="file-upload-label">
                      <Upload class="upload-icon" />
                      <span>{{ formData.thumbnails.detailDesktop ? 'Ganti' : 'Upload' }}</span>
                    </label>
                    <div v-if="formData.thumbnails.detailDesktop" class="file-preview">
                      <img :src="formData.thumbnails.detailDesktop" alt="Detail Desktop" class="preview-image" />
                      <button type="button" @click="removeThumbnail('detailDesktop')" class="remove-preview">
                        <X class="remove-icon" />
                      </button>
                    </div>
                  </div>
                  <div class="size-hint">Recommended: 600x350px</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Link Tambahan Section -->
          <div class="form-section">
            <h4 class="section-title">
              <Link class="section-icon" />
              Link Tambahan (Opsional)
            </h4>
            
            <div class="links-container">
              <div 
                v-for="(link, index) in formData.attachLinks" 
                :key="index"
                class="link-item"
              >
                <div class="link-inputs">
                  <input 
                    type="url"
                    v-model="link.url"
                    class="form-input"
                    placeholder="https://example.com"
                  />
                  <input 
                    type="text"
                    v-model="link.description"
                    class="form-input"
                    placeholder="Deskripsi link"
                  />
                </div>
                <button 
                  type="button" 
                  @click="removeLink(index)"
                  class="remove-link-btn"
                >
                  <X class="remove-icon" />
                </button>
              </div>
              
              <button 
                type="button" 
                @click="addLink"
                class="add-link-btn"
              >
                <Plus class="add-icon" />
                Tambah Link
              </button>
            </div>
          </div>

          <!-- Additional Info Section -->
          <div class="form-section">
            <h4 class="section-title">
              <User class="section-icon" />
              Informasi Tambahan
            </h4>
            
            <!-- Author dan Source Row -->
            <div class="form-row">
              <div class="form-group">
                <label for="author" class="form-label">Penulis</label>
                <input 
                  id="author"
                  type="text" 
                  v-model="formData.author" 
                  class="form-input"
                  placeholder="Nama penulis"
                />
              </div>
              
              <div class="form-group">
                <label for="source" class="form-label">Sumber</label>
                <input 
                  id="source"
                  type="text" 
                  v-model="formData.source" 
                  class="form-input"
                  placeholder="Admin, Tim Media, dll"
                />
              </div>
            </div>

            <!-- Tags -->
            <div class="form-group">
              <label for="tags" class="form-label">Tags</label>
              <input 
                id="tags"
                type="text" 
                v-model="tagsInput" 
                class="form-input"
                placeholder="Pisahkan dengan koma: gereja, ibadah, komunitas"
              />
              <div class="form-help">
                Tags membantu kategorisasi dan pencarian berita
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <!-- ✅ DEBUG: Form validation status -->
            <div v-if="false" class="debug-validation" style="margin-bottom: 10px; padding: 8px; background: #f3f4f6; border-radius: 4px; font-size: 12px;">
              <strong>Debug Form Validation:</strong><br>
              Valid: {{ isFormValid }}<br>
              Saving: {{ saving }}<br>
              Button Disabled: {{ saving || !isFormValid }}<br>
              Title: {{ !!formData.title.trim() }} ({{ formData.title.length }} chars)<br>
              Category: {{ !!formData.category.trim() }} ({{ formData.category.length }} chars)<br>
              Summary: {{ !!formData.summary.trim() }} ({{ formData.summary.length }} chars)<br>
              PublishDate: {{ !!formData.publishDate }} ({{ formData.publishDate }})<br>
              Mode: {{ mode }}
            </div>
            
            <button type="button" @click="closeModal" class="cancel-button">
              Batal
            </button>
            <button 
              type="submit" 
              class="save-button"
              :disabled="saving || !isFormValid"
              :title="isFormValid ? '' : 'Form belum lengkap'"
            >
              <Save v-if="!saving" class="button-icon" />
              <div v-else class="loading-spinner-small"></div>
              {{ saving ? 'Menyimpan...' : (mode === 'add' ? 'Tambah Berita' : 'Simpan Perubahan') }}
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
  ImageIcon, 
  Settings, 
  Save, 
  Calendar,
  Link,
  Plus,
  User,
  Upload
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { CLOUDINARY_CONFIG } from '@/utils/cloudinary'

export default {
  name: 'NewsModal',
  
  components: {
    X,
    FileText,
    ImageIcon,
    Settings,
    Save,
    Calendar,
    Link,
    Plus,
    User,
    Upload
  },
  
  props: {
    news: {
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
      tagsInput: '',
      uploadStates: {
        cardMobile: { loading: false, error: null },
        cardDesktop: { loading: false, error: null },
        detailMobile: { loading: false, error: null },
        detailDesktop: { loading: false, error: null }
      },
      formData: {
        // Basic fields
        title: '',
        category: '',
        summary: '',
        
        // Date fields
        publishDate: '',
        date: '',
        time: '', 
        location: '',
        
        // Display settings
        priority: 3,
        showInAnnouncement: false,
        isEvent: false,
        
        // Media
        thumbnails: {
          cardMobile: '',
          cardDesktop: '',
          detailMobile: '',
          detailDesktop: ''
        },
        
        // Additional info
        author: '',
        source: 'Admin',
        tags: [],
        
        // Links
        attachLinks: []
      }
    }
  },
  
  computed: {
    isFormValid() {
      // Basic validation untuk semua mode
      const basicValid = this.formData.title.trim() && 
                        this.formData.category.trim() && 
                        this.formData.summary.trim() && 
                        this.formData.publishDate
      
      // ✅ PERBAIKAN: Untuk mode edit, tidak perlu semua thumbnail wajib
      // Karena news lama mungkin belum memiliki 4 ukuran thumbnail
      if (this.mode === 'edit') {
        console.log('🔍 [NewsModal] Edit mode validation - basic fields only')
        return basicValid
      }
      
      // Untuk mode add, tetap wajibkan semua thumbnail
      const thumbnailValid = this.formData.thumbnails.cardMobile &&
                             this.formData.thumbnails.cardDesktop &&
                             this.formData.thumbnails.detailMobile &&
                             this.formData.thumbnails.detailDesktop
      
      console.log('🔍 [NewsModal] Add mode validation:', {
        basicValid,
        thumbnailValid,
        overall: basicValid && thumbnailValid
      })
      
      return basicValid && thumbnailValid
    },

    userStore() {
      return useUserStore()
    }
  },
  
  watch: {
    tagsInput(newValue) {
      this.formData.tags = newValue
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    }
  },
  
  mounted() {
    this.initializeForm()
    document.addEventListener('keydown', this.handleEscapeKey)
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscapeKey)
  },
  
  methods: {
    initializeForm() {
      console.log('🔄 [NewsModal] Initializing form...', {
        mode: this.mode,
        hasNews: !!this.news,
        newsData: this.news
      })
      
      if (this.mode === 'edit' && this.news) {
        // Edit mode: populate form with existing data
        this.formData = {
          title: this.news.title || '',
          category: this.news.category || '',
          summary: this.news.summary || '',
          
          publishDate: this.formatDateForInput(this.news.publishDate),
          date: this.formatDateForInput(this.news.date),
          time: this.news.time || '',
          location: this.news.location || '',
          
          priority: this.news.priority || 3,
          showInAnnouncement: this.news.showInAnnouncement || false,
          isEvent: this.news.isEvent || false,
          
          thumbnails: {
            cardMobile: this.news.thumbnails?.cardMobile || '',
            cardDesktop: this.news.thumbnails?.cardDesktop || '',
            detailMobile: this.news.thumbnails?.detailMobile || '',
            detailDesktop: this.news.thumbnails?.detailDesktop || ''
          },
          
          author: this.news.author || '',
          source: this.news.source || 'Admin',
          tags: this.news.tags || [],
          attachLinks: this.news.attachLinks || []
        }
        
        this.tagsInput = this.formData.tags.join(', ')
        
        console.log('✅ [NewsModal] Form data initialized for edit:', {
          title: this.formData.title,
          category: this.formData.category,
          summary: this.formData.summary,
          publishDate: this.formData.publishDate,
          thumbnails: this.formData.thumbnails
        })
        
      } else {
        // Add mode: set defaults
        const now = new Date()
        this.formData.publishDate = this.formatDateForInput(now)
        
        if (this.userStore.user?.nama) {
          this.formData.author = this.userStore.user.nama
        }
        
        console.log('✅ [NewsModal] Form data initialized for add mode')
      }
      
      // ✅ Debug form validation setelah initialize
      this.$nextTick(() => {
        console.log('🔍 [NewsModal] Form validation after initialize:', {
          isFormValid: this.isFormValid,
          title: !!this.formData.title.trim(),
          category: !!this.formData.category.trim(),
          summary: !!this.formData.summary.trim(),
          publishDate: !!this.formData.publishDate,
          mode: this.mode
        })
      })
    },
    
    formatDateForInput(date) {
      if (!date) return ''
      
      try {
        let dateObj
        if (date.toDate) {
          dateObj = date.toDate()
        } else if (date instanceof Date) {
          dateObj = date
        } else {
          dateObj = new Date(date)
        }
        
        return dateObj.toISOString().split('T')[0]
      } catch (error) {
        return ''
      }
    },
    
    // ===== IMAGE UPLOAD HANDLERS =====
    
    async handleRequiredUpload(event, type) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        console.log(`🔄 [NewsModal] Uploading ${type}:`, file.name)
        
        // Show loading state for this thumbnail type
        this.uploadStates[type] = { loading: true, error: null }
        
        // Upload to Cloudinary
        const cloudinaryUrl = await this.uploadToCloudinary(file, type)
        
        // Save Cloudinary URL to form data
        this.formData.thumbnails[type] = cloudinaryUrl
        
        // Update upload state
        this.uploadStates[type] = { loading: false, error: null }
        
        console.log(`✅ [NewsModal] ${type} uploaded successfully:`, cloudinaryUrl)
        
      } catch (error) {
        console.error(`❌ [NewsModal] Upload failed for ${type}:`, error)
        this.uploadStates[type] = { loading: false, error: error.message }
        alert(`Gagal upload ${type}: ${error.message}`)
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
      
      console.log(`🔄 [NewsModal] Uploading ${type}:`, {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type
      })

      const formData = new FormData()
      formData.append('file', file)
      
      // ⭐ Try multiple upload strategies
      const uploadStrategies = [
        // Strategy 1: Use myrajawali_preset (unsigned)
        () => {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('upload_preset', 'myrajawali_preset')
          fd.append('folder', `myrajawali/thumbnails/news/${type}`)
          return fd
        },
        // Strategy 2: Use ml_default preset  
        () => {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('upload_preset', 'ml_default')
          fd.append('folder', `myrajawali/thumbnails/news/${type}`)
          return fd
        },
        // Strategy 3: Direct upload without preset (if enabled)
        () => {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('folder', `myrajawali/thumbnails/news/${type}`)
          return fd
        }
      ]
      
      let lastError = null
      
      for (let i = 0; i < uploadStrategies.length; i++) {
        const strategy = uploadStrategies[i]
        const strategyName = ['myrajawali_preset', 'ml_default', 'no-preset'][i]
        
        console.log(`📡 [NewsModal] Trying strategy ${i + 1}: ${strategyName}`)
        
        try {
          const uploadData = strategy()
          
          const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: 'POST',
            body: uploadData
          })
          
          console.log(`📡 [NewsModal] Strategy ${strategyName} - Status: ${response.status}`)
          
          if (response.ok) {
            const result = await response.json()
            console.log(`✅ [NewsModal] Upload successful with ${strategyName}:`, result.secure_url)
            return result.secure_url
          } else {
            const errorText = await response.text()
            console.log(`❌ [NewsModal] Strategy ${strategyName} failed:`, errorText)
            lastError = `${strategyName}: ${response.status} - ${errorText}`
          }
        } catch (error) {
          console.log(`❌ [NewsModal] Strategy ${strategyName} network error:`, error)
          lastError = `${strategyName}: ${error.message}`
        }
      }
      
      // If all strategies failed
      throw new Error(`All upload strategies failed. Last error: ${lastError}`)
    },
    
    removeThumbnail(type) {
      this.formData.thumbnails[type] = ''
      
      // Reset upload state
      this.uploadStates[type] = { loading: false, error: null }
      
      // Clear the file input
      const inputId = type === 'cardMobile' ? 'cardMobile' : 
                     type === 'cardDesktop' ? 'cardDesktop' :
                     type === 'detailMobile' ? 'detailMobile' : 'detailDesktop'
      document.getElementById(inputId).value = ''
    },
    
    // ===== LINK HANDLERS =====
    
    addLink() {
      this.formData.attachLinks.push({
        url: '',
        description: ''
      })
    },
    
    removeLink(index) {
      this.formData.attachLinks.splice(index, 1)
    },
    
    // ===== FORM HANDLERS =====
    
    async saveNews() {
      if (!this.isFormValid) return
      
      try {
        this.saving = true
        
        const newsData = {
          // ⭐ BASIC FIELDS - Yang wajib
          title: this.formData.title.trim(),
          category: this.formData.category.trim(),
          summary: this.formData.summary.trim(),
          
          // ⭐ CONTENT - Auto-generate dari summary
          content: this.formData.summary.trim(),
          
          // ⭐ DATE FIELDS
          publishDate: this.formData.publishDate ? new Date(this.formData.publishDate) : new Date(),
          date: this.formData.date ? new Date(this.formData.date) : null,
          time: this.formData.time?.trim() || null,
          location: this.formData.location?.trim() || null,
          
          // ⭐ DISPLAY SETTINGS
          priority: this.formData.priority || 3,
          showInAnnouncement: this.formData.showInAnnouncement || false,
          isEvent: this.formData.isEvent || false,
          
          // ⭐ THUMBNAILS - Yang wajib
          thumbnails: {
            cardMobile: this.formData.thumbnails.cardMobile,
            cardDesktop: this.formData.thumbnails.cardDesktop,
            detailMobile: this.formData.thumbnails.detailMobile,
            detailDesktop: this.formData.thumbnails.detailDesktop
          },
          
          // Set thumbnail utama dari cardDesktop sebagai fallback
          thumbnail: this.formData.thumbnails.cardDesktop,
          
          // ⭐ ADDITIONAL INFO
          author: this.formData.author?.trim() || 'Tim Redaksi',
          source: this.formData.source?.trim() || 'Admin',
          tags: Array.isArray(this.formData.tags) ? this.formData.tags : [],
          
          // ⭐ LINKS - Clean up empty links (URL wajib, description optional)
          attachLinks: this.formData.attachLinks.filter(link => {
            // URL adalah wajib
            const hasValidUrl = link.url && link.url.trim()
            
            if (!hasValidUrl) return false
            
            // Jika ada description, harus tidak kosong
            if (link.description && !link.description.trim()) {
              // Remove empty description
              delete link.description
            }
            
            return true
          })
        }
        
        console.log('💾 [NewsModal] Sending news data:', newsData)
        
        this.$emit('save', newsData)
        
      } catch (error) {
        console.error('Error preparing news data:', error)
        alert('Terjadi kesalahan saat menyimpan berita: ' + error.message)
      } finally {
        this.saving = false
      }
    },
    
    closeModal() {
      this.$emit('close')
    },
    
    handleEscapeKey(event) {
      if (event.key === 'Escape') {
        this.closeModal()
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
  width: 100%;
  max-width: 900px;
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
.news-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

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

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
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

.form-help {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

/* Form Inputs */
.form-input,
.form-select,
.form-textarea {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 640px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

/* Toggle Styles */
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 0;
}

.toggle-checkbox {
  display: none;
}

.toggle-slider {
  width: 44px;
  height: 24px;
  background: #d1d5db;
  border-radius: 12px;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s;
}

.toggle-checkbox:checked + .toggle-slider {
  background: #10b981;
}

.toggle-checkbox:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

/* Required Thumbnails Grid */
.required-thumbnails-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 16px;
}

.thumbnail-upload-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.thumbnail-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: center;
}

.size-hint {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  font-style: italic;
}

@media (max-width: 640px) {
  .required-thumbnails-grid {
    grid-template-columns: 1fr;
  }
}

/* File Upload Styles */
.file-upload-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.file-upload-label:hover {
  border-color: #10b981;
  background: #f0fdf4;
  color: #10b981;
}

.file-upload-label.uploading {
  border-color: #6366f1;
  background: #f1f5f9;
  color: #6366f1;
  cursor: not-allowed;
}

.upload-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
}

.file-upload-label.small {
  padding: 20px 12px;
  font-size: 12px;
}

.upload-icon {
  width: 20px;
  height: 20px;
}

.upload-icon.small {
  width: 16px;
  height: 16px;
}

.file-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.preview-image.small {
  width: 80px;
  height: 60px;
}

.remove-preview {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-preview.small {
  width: 20px;
  height: 20px;
  top: -6px;
  right: -6px;
}

.remove-preview:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.remove-icon {
  width: 12px;
  height: 12px;
}

/* Additional Images */
.additional-images {
  margin-top: 12px;
}

.image-upload-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.image-upload-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-upload-item label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
}

/* Links Container */
.links-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.link-inputs {
  display: flex;
  gap: 12px;
  flex: 1;
}

.link-inputs .form-input {
  margin-bottom: 0;
}

.remove-link-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-link-btn:hover {
  background: #fecaca;
}

.add-link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  color: #0369a1;
  border: 1px dashed #0ea5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
}

.add-link-btn:hover {
  background: #e0f2fe;
}

.add-icon {
  width: 16px;
  height: 16px;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-button {
  padding: 12px 24px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #e5e7eb;
}

.save-button {
  padding: 12px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-button:hover:not(:disabled) {
  background: #059669;
}

.save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.button-icon {
  width: 16px;
  height: 16px;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body {
    padding: 20px;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-button,
  .save-button {
    width: 100%;
    justify-content: center;
  }
  
  .link-inputs {
    flex-direction: column;
  }
  
  .image-upload-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .image-upload-grid {
    grid-template-columns: 1fr;
  }
  
  .link-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .remove-link-btn {
    align-self: flex-end;
  }
}
</style>