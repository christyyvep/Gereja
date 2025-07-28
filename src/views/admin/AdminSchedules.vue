<!-- AdminSchedules.vue - Halaman Admin untuk Kelola 10 Jadwal Ibadah Tetap -->
<template>
  <div class="admin-schedules-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Kelola Jadwal Ibadah Sepekan</h1>
      </div>
      
      <div class="header-actions">
        <!-- Week Navigation -->
        <div class="week-navigation">
          <AdminButton 
            @click="previousWeek" 
            :disabled="loading"
            :icon="ChevronLeft"
            variant="ghost"
            size="sm"
          >
            Minggu Lalu
          </AdminButton>
          <AdminButton 
            @click="currentWeek" 
            :disabled="loading"
            variant="secondary"
            size="sm"
          >
            Minggu Ini
          </AdminButton>
          <AdminButton 
            @click="nextWeek" 
            :disabled="loading"
            :icon-right="ChevronRight"
            variant="ghost"
            size="sm"
          >
            Minggu Depan
          </AdminButton>
        </div>
        
        <!-- Save Button -->
        <AdminButton 
          @click="saveAllChanges"
          :disabled="!hasChanges || saving"
          :loading="saving"
          :icon="saving ? Loader2 : Save"
          variant="primary"
          size="md"
        >
          {{ saving ? 'Menyimpan...' : 'Simpan Semua' }}
        </AdminButton>
      </div>
    </div>

    <!-- Weekly Overview Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <CalendarDays />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ schedulesCount }}</div>
          <div class="stat-label">Total Jadwal</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon active">
          <Clock />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ filledSchedulesCount }}</div>
          <div class="stat-label">Sudah Diisi</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon published">
          <CheckCircle />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ publishedSchedulesCount }}</div>
          <div class="stat-label">Sudah Publish</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon changes" :class="{ active: hasChanges }">
          <Edit />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ changesCount }}</div>
          <div class="stat-label">Perubahan</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="desktop-loading">
      <div class="loading-spinner"></div>
      <p>Memuat jadwal minggu ini...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="desktop-error">
      <div class="error-card">
        <AlertCircle class="error-icon" />
        <h3>Gagal Memuat Jadwal</h3>
        <p>{{ error }}</p>
        <AdminButton 
          @click="loadWeeklySchedules" 
          :icon="RefreshCw"
          variant="danger"
          size="sm"
        >
          Coba Lagi
        </AdminButton>
      </div>
    </div>

    <!-- Weekly Schedule Editor -->
    <div v-else class="weekly-schedule-editor">
      <div class="editor-header">
        <h2>Jadwal Minggu {{ currentWeekRange }}</h2>
        <div class="editor-actions">
          <!-- Tombol ini hanya muncul jika belum ada data permanen di Firebase -->
          <AdminButton 
            v-if="!hasPermanentSchedules"
            @click="initializePermanentSchedules"
            :disabled="saving"
            :icon="CalendarDays"
            variant="info"
            size="sm"
          >
            Inisialisasi Jadwal Tetap
          </AdminButton>
          <AdminButton 
            @click="resetAllChanges" 
            :disabled="!hasChanges || saving"
            :icon="RotateCcw"
            variant="secondary"
            size="sm"
          >
            Reset
          </AdminButton>
          <AdminButton 
            @click="publishAllSchedules" 
            :disabled="saving || !allSchedulesFilled"
            :icon="Eye"
            variant="success"
            size="sm"
          >
            Publish Semua
          </AdminButton>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="weeklySchedules.length === 0" class="empty-state">
        <CalendarDays class="empty-icon" />
        <h3>Jadwal Belum Diinisialisasi</h3>
        <p>Database belum memiliki 10 jadwal tetap. Klik tombol "Inisialisasi Jadwal Tetap" untuk membuat 10 jadwal permanen yang nantinya hanya akan diupdate, tidak dibuat baru setiap minggu.</p>
        <p><strong>Catatan:</strong> Setelah inisialisasi, Anda hanya perlu mengedit dan menyimpan perubahan. Tidak ada pembuatan jadwal baru lagi.</p>
        <AdminButton 
          @click="initializePermanentSchedules" 
          :disabled="saving"
          :icon="CalendarDays"
          variant="primary"
          size="lg"
        >
          Inisialisasi Jadwal Tetap
        </AdminButton>
      </div>

      <!-- Schedule Cards Grid -->
      <div v-else class="schedule-cards-grid">
        <div 
          v-for="schedule in weeklySchedules" 
          :key="schedule.id"
          class="schedule-card"
          :class="{ 
            'has-changes': schedule.hasChanges,
            'published': schedule.isPublished,
            'filled': isScheduleFilled(schedule)
          }"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="schedule-type">
              <div class="type-badge" :class="schedule.category">
                {{ getCategoryLabel(schedule.category) }}
              </div>
              <div class="day-time">
                {{ getDayLabel(schedule.dayOfWeek) }}, {{ schedule.time || 'Belum diatur' }}
              </div>
            </div>
            <div class="card-status">
              <span v-if="schedule.hasChanges" class="status-indicator changes">
                <Edit2 />
              </span>
              <span v-if="schedule.isPublished" class="status-indicator published">
                <Eye />
              </span>
            </div>
          </div>

          <!-- Card Form -->
          <div class="card-form">
            <!-- Hari -->
            <div class="form-group">
              <label>Hari</label>
              <select 
                v-model="schedule.dayOfWeek"
                @change="markAsChanged(schedule)"
                class="form-select"
              >
                <option value="daily">Setiap Hari</option>
                <option value="0">Minggu</option>
                <option value="1">Senin</option>
                <option value="2">Selasa</option>
                <option value="3">Rabu</option>
                <option value="4">Kamis</option>
                <option value="5">Jumat</option>
                <option value="6">Sabtu</option>
              </select>
            </div>

            <!-- Waktu -->
            <div class="form-group">
              <label>Waktu</label>
              <input 
                v-model="schedule.time"
                @input="markAsChanged(schedule)"
                type="time" 
                class="form-input"
              />
            </div>

            <!-- Tema/Judul -->
            <div class="form-group">
              <label>Tema / Judul</label>
              <input 
                v-model="schedule.theme"
                @input="markAsChanged(schedule)"
                type="text" 
                placeholder="Masukkan tema ibadah..."
                class="form-input"
              />
            </div>


            <!-- Deskripsi / Catatan -->
            <div class="form-group">
              <label>Deskripsi / Catatan</label>
              <textarea 
                v-model="schedule.description"
                @input="markAsChanged(schedule)"
                placeholder="Deskripsi singkat atau catatan khusus..."
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <!-- Lokasi -->
            <div class="form-group">
              <label>Lokasi</label>
              <input 
                v-model="schedule.location"
                @input="markAsChanged(schedule)"
                type="text" 
                placeholder="Gedung utama, Aula, dll..."
                class="form-input"
              />
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions">
            <AdminButton 
              @click="saveSchedule(schedule)"
              :disabled="!schedule.hasChanges || saving"
              :icon="Save"
              variant="success"
              size="xs"
            >
              Simpan
            </AdminButton>
            <AdminButton 
              @click="resetSchedule(schedule)"
              :disabled="!schedule.hasChanges || saving"
              :icon="RotateCcw"
              variant="secondary"
              size="xs"
            >
              Reset
            </AdminButton>
            <AdminButton 
              @click="togglePublish(schedule)"
              :disabled="saving || !isScheduleFilled(schedule)"
              :icon="schedule.isPublished ? Eye : EyeOff"
              :variant="schedule.isPublished ? 'info' : 'outline'"
              size="xs"
            >
              {{ schedule.isPublished ? 'Published' : 'Publish' }}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>

    <!-- SUCCESS NOTIFICATION -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      <CheckCircle v-if="notificationType === 'success'" />
      <AlertCircle v-else />
      <span>{{ notificationMessage }}</span>
    </div>

  </div>
</template>

<script>
import AdminButton from '@/components/admin/AdminButton.vue'

// Icons
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  Edit,
  Edit2,
  Eye,
  EyeOff,
  RotateCcw,
  RefreshCw,
  Loader2
} from 'lucide-vue-next'

// Services
import { 
  getWorshipSchedules,
  updateWorshipSchedule,
  createWorshipSchedule,
  WORSHIP_CATEGORIES
} from '@/services/schedules'

export default {
  name: 'AdminSchedules',
  
  components: {
    AdminButton,
    CalendarDays,
    Clock,
    CheckCircle,
    AlertCircle,
    Edit,
    Edit2,
    Eye
  },
  
  data() {
    return {
      // Icon components for AdminButton props
      Save,
      Loader2,
      ChevronLeft,
      ChevronRight,
      RefreshCw,
      CalendarDays,
      RotateCcw,
      Eye,
      EyeOff,
      
      // Data
      weeklySchedules: [],
      originalSchedules: [], // Backup untuk reset
      loading: true,
      saving: false,
      error: null,
      
      // Week Management
      currentDate: new Date(),
      selectedWeekStart: null,
      
      // Notification
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      
      // Categories
      categories: WORSHIP_CATEGORIES,
      
      // Days mapping
      dayLabels: {
        0: 'Minggu',
        1: 'Senin', 
        2: 'Selasa',
        3: 'Rabu',
        4: 'Kamis',
        5: 'Jumat',
        6: 'Sabtu',
        'daily': 'Setiap Hari'
      }
    }
  },
  
  computed: {
    currentWeekRange() {
      if (!this.selectedWeekStart) return ''
      
      const weekEnd = new Date(this.selectedWeekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const startStr = this.selectedWeekStart.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      })
      const endStr = weekEnd.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
      
      return `${startStr} - ${endStr}`
    },
    
    schedulesCount() {
      return this.weeklySchedules.length
    },
    
    filledSchedulesCount() {
      return this.weeklySchedules.filter(s => this.isScheduleFilled(s)).length
    },
    
    publishedSchedulesCount() {
      return this.weeklySchedules.filter(s => s.isPublished).length
    },
    
    hasChanges() {
      return this.weeklySchedules.some(s => s.hasChanges)
    },
    
    changesCount() {
      return this.weeklySchedules.filter(s => s.hasChanges).length
    },
    
    allSchedulesFilled() {
      return this.weeklySchedules.every(s => this.isScheduleFilled(s))
    },

    hasPermanentSchedules() {
      // True jika sudah ada data di Firebase (bukan local template)
      return this.weeklySchedules.length > 0 && this.weeklySchedules.some(s => s.id && !s.id.startsWith('new_'))
    }
  },
  
  async created() {
    console.log('🚀 [AdminSchedules] Component created, initializing...')
    this.initializeCurrentWeek()
    console.log('📅 [AdminSchedules] Week initialized:', this.currentWeekRange)
    await this.loadWeeklySchedules()
  },
  
  methods: {
    // ===================================
    // 📅 WEEK MANAGEMENT
    // ===================================
    
    initializeCurrentWeek() {
      const today = new Date()
      const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - dayOfWeek) // Go to Sunday
      startOfWeek.setHours(0, 0, 0, 0)
      
      this.selectedWeekStart = startOfWeek
      this.currentDate = today
    },
    
    previousWeek() {
      const prevWeek = new Date(this.selectedWeekStart)
      prevWeek.setDate(prevWeek.getDate() - 7)
      this.selectedWeekStart = prevWeek
      this.loadWeeklySchedules()
    },
    
    nextWeek() {
      const nextWeek = new Date(this.selectedWeekStart)
      nextWeek.setDate(nextWeek.getDate() + 7)
      this.selectedWeekStart = nextWeek
      this.loadWeeklySchedules()
    },
    
    currentWeek() {
      this.initializeCurrentWeek()
      this.loadWeeklySchedules()
    },
    
    // ===================================
    // 📊 DATA LOADING
    // ===================================
    
    async loadWeeklySchedules() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [AdminSchedules] Loading weekly schedules for:', this.currentWeekRange)
        
        // Get all schedules from Firebase
        const allSchedules = await getWorshipSchedules(true) // Include unpublished for admin
        
        console.log('📊 [DEBUG] Raw schedules from Firebase:', allSchedules)
        console.log('📊 [DEBUG] Number of schedules received:', allSchedules?.length || 0)
        
        if (allSchedules && allSchedules.length > 0) {
          console.log('📋 [DEBUG] First schedule sample:', allSchedules[0])
        }
        
        // Transform Firebase data to match our component structure
        this.weeklySchedules = this.transformFirebaseData(allSchedules)
        this.originalSchedules = JSON.parse(JSON.stringify(this.weeklySchedules))
        
        console.log('✅ [DEBUG] Final weekly schedules loaded:', this.weeklySchedules.length)
        console.log('📋 [DEBUG] Transformed schedules list:', this.weeklySchedules.map(s => ({
          id: s.id,
          category: s.category,
          dayOfWeek: s.dayOfWeek,
          theme: s.theme
        })))
        
      } catch (error) {
        console.error('❌ [AdminSchedules] Error loading schedules:', error)
        this.error = 'Gagal memuat jadwal. Pastikan koneksi internet stabil.'
      } finally {
        this.loading = false
      }
    },
    
    // ===================================
    // ✏️ EDIT OPERATIONS
    // ===================================
    
    markAsChanged(schedule) {
      schedule.hasChanges = true
      schedule.updatedAt = new Date().toISOString()
    },
    
    async saveSchedule(schedule) {
      try {
        this.saving = true
        
        console.log('💾 [AdminSchedules] Saving schedule:', schedule.id)
        console.log('🔍 [DEBUG] Schedule ID type check:', {
          id: schedule.id,
          isNew: schedule.id.startsWith('new_'),
          shouldUpdate: !schedule.id.startsWith('new_'),
          hasPermanentSchedules: this.hasPermanentSchedules
        })

        // SAFETY CHECK: Jika sudah ada data permanen, JANGAN buat baru
        if (this.hasPermanentSchedules && schedule.id.startsWith('new_')) {
          console.error('🚨 [SAFETY] BLOCKED: Trying to create new data when permanent data exists!')
          this.showNotificationMessage('Error: Sistem mencoba membuat data baru padahal sudah ada data permanen!', 'error')
          return
        }
        
        // Prepare data according to schedules.js service structure
        const scheduleData = {
          title: schedule.theme || '',
          category: schedule.category,
          dayOfWeek: schedule.dayOfWeek === 'daily' ? 'daily' : parseInt(schedule.dayOfWeek), // Handle 'daily' string
          time: schedule.time,
          location: schedule.location || 'Gedung Gereja Utama',
          theme: schedule.theme || '',
          speaker: schedule.speaker || '',
          specialNotes: schedule.description || '',
          announcements: schedule.announcements || [],
          status: 'active',
          isPublished: schedule.isPublished,
          isSpecialEvent: false,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'admin', // You might want to get this from auth context
          version: (schedule.version || 0) + 1
        }
        
        if (schedule.id.startsWith('new_')) {
          // Create new schedule - only for initial setup or emergency cases
          console.log('🆕 [DEBUG] Creating NEW schedule (should only happen during initialization)')
          scheduleData.createdAt = new Date().toISOString()
          scheduleData.createdBy = 'admin'
          scheduleData.version = 1
          
          const newSchedule = await this.createNewSchedule(scheduleData)
          schedule.id = newSchedule.id
          console.log('✅ [AdminSchedules] New schedule created:', newSchedule.id)
        } else {
          // Update existing schedule - this is the normal operation
          console.log('📝 [DEBUG] Updating EXISTING schedule (normal operation)')
          console.log('🔒 [DEBUG] NO NEW DATA CREATION - Only updating existing document')
          console.log('🆔 [DEBUG] Firebase Document ID:', schedule.id)
          await updateWorshipSchedule(schedule.id, scheduleData)
          console.log('✅ [AdminSchedules] Schedule updated - SAME document ID:', schedule.id)
        }
        
        // Update local schedule data
        schedule.hasChanges = false
        schedule.updatedAt = scheduleData.lastUpdated
        schedule.version = scheduleData.version
        
        this.showNotificationMessage('Jadwal berhasil disimpan!', 'success')
        
      } catch (error) {
        console.error('❌ [AdminSchedules] Error saving schedule:', error)
        this.showNotificationMessage('Gagal menyimpan jadwal: ' + (error.message || 'Unknown error'), 'error')
      } finally {
        this.saving = false
      }
    },
    
    async saveAllChanges() {
      try {
        this.saving = true
        
        const changedSchedules = this.weeklySchedules.filter(s => s.hasChanges)
        console.log('💾 [AdminSchedules] Saving all changes:', changedSchedules.length)
        
        if (changedSchedules.length === 0) {
          this.showNotificationMessage('Tidak ada perubahan untuk disimpan.', 'info')
          return
        }
        
        let successCount = 0
        let errorCount = 0
        
        for (const schedule of changedSchedules) {
          try {
            await this.saveSchedule(schedule)
            successCount++
          } catch (error) {
            console.error('❌ [AdminSchedules] Error saving individual schedule:', error)
            errorCount++
          }
        }
        
        if (errorCount === 0) {
          this.showNotificationMessage(`${successCount} jadwal berhasil disimpan!`, 'success')
        } else {
          this.showNotificationMessage(`${successCount} berhasil, ${errorCount} gagal disimpan.`, 'warning')
        }
        
        // Reload schedules to ensure data consistency
        await this.loadWeeklySchedules()
        
      } catch (error) {
        console.error('❌ [AdminSchedules] Error saving all changes:', error)
        this.showNotificationMessage('Gagal menyimpan jadwal!', 'error')
      } finally {
        this.saving = false
      }
    },
    
    resetSchedule(schedule) {
      const original = this.originalSchedules.find(s => s.id === schedule.id)
      if (original) {
        Object.assign(schedule, {
          ...original,
          hasChanges: false,
          expanded: schedule.expanded
        })
      }
    },
    
    resetAllChanges() {
      this.weeklySchedules.forEach(schedule => {
        this.resetSchedule(schedule)
      })
    },
    
    async togglePublish(schedule) {
      console.log('🔄 [DEBUG] togglePublish called for:', schedule.id)
      console.log('📋 [DEBUG] Schedule data:', {
        theme: schedule.theme,
        isScheduleFilled: this.isScheduleFilled(schedule),
        currentPublishStatus: schedule.isPublished
      })
      
      if (!this.isScheduleFilled(schedule)) {
        console.warn('⚠️ [DEBUG] Schedule not filled, blocking publish')
        this.showNotificationMessage('Lengkapi data jadwal terlebih dahulu!', 'error')
        return
      }
      
      try {
        this.saving = true
        
        const previousState = schedule.isPublished
        schedule.isPublished = !schedule.isPublished
        this.markAsChanged(schedule)
        
        console.log('🔄 [AdminSchedules] Toggling publish status:', {
          id: schedule.id,
          from: previousState,
          to: schedule.isPublished
        })
        
        await this.saveSchedule(schedule)
        
        const status = schedule.isPublished ? 'dipublish' : 'disembunyikan'
        this.showNotificationMessage(`Jadwal berhasil ${status}!`, 'success')
        
      } catch (error) {
        // Revert the state if save failed
        schedule.isPublished = !schedule.isPublished
        console.error('❌ [AdminSchedules] Error toggling publish:', error)
        this.showNotificationMessage('Gagal mengubah status publish!', 'error')
      } finally {
        this.saving = false
      }
    },
    
    async publishAllSchedules() {
      try {
        this.saving = true
        
        const unpublishedSchedules = this.weeklySchedules.filter(s => 
          !s.isPublished && this.isScheduleFilled(s)
        )
        
        for (const schedule of unpublishedSchedules) {
          schedule.isPublished = true
          this.markAsChanged(schedule)
          await this.saveSchedule(schedule)
        }
        
        this.showNotificationMessage(`${unpublishedSchedules.length} jadwal berhasil dipublish!`, 'success')
        
      } catch (error) {
        console.error('❌ [AdminSchedules] Error publishing all:', error)
        this.showNotificationMessage('Gagal publish beberapa jadwal!', 'error')
      } finally {
        this.saving = false
      }
    },
    
    // ===================================
    // 🎨 UTILITY FUNCTIONS
    // ===================================
    
    getCategoryLabel(category) {
      const cat = this.categories.find(c => c.value === category)
      return cat ? cat.label : 'Tidak diketahui'
    },
    
    getDayLabel(dayOfWeek) {
      // Handle both number and string values
      if (dayOfWeek === 'daily') {
        return this.dayLabels['daily']
      }
      const day = typeof dayOfWeek === 'number' ? dayOfWeek : parseInt(dayOfWeek)
      return this.dayLabels[day] || 'Tidak diketahui'
    },
    
    isScheduleFilled(schedule) {
      // Validasi yang lebih fleksibel - hanya perlu tema/judul
      return !!(schedule.theme && schedule.theme.trim().length > 0)
    },
    
    async createNewSchedule(scheduleData) {
      // Create a new schedule in Firebase
      console.log('🆕 [AdminSchedules] Creating new schedule with data:', scheduleData)
      
      try {
        const newSchedule = await createWorshipSchedule(scheduleData)
        console.log('✅ [AdminSchedules] New schedule created successfully:', newSchedule)
        return newSchedule
      } catch (error) {
        console.error('❌ [AdminSchedules] Error creating schedule:', error)
        throw error
      }
    },

    async createDefaultTemplates() {
      // Jika sudah ada data permanen, tidak perlu buat template lagi
      if (this.hasPermanentSchedules) {
        this.showNotificationMessage('Jadwal permanen sudah ada di database. Tidak perlu membuat template baru.', 'info')
        return
      }

      try {
        this.saving = true
        console.log('🏗️ [AdminSchedules] Creating default templates (local only)')
        
        this.weeklySchedules = this.createDefaultSchedules()
        this.originalSchedules = JSON.parse(JSON.stringify(this.weeklySchedules))
        
        this.showNotificationMessage('Template jadwal lokal berhasil dibuat! Lengkapi data dan simpan untuk menyimpan ke database.', 'success')
        
      } catch (error) {
        console.error('❌ [AdminSchedules] Error creating templates:', error)
        this.showNotificationMessage('Gagal membuat template jadwal!', 'error')
      } finally {
        this.saving = false
      }
    },

    // Method baru untuk inisialisasi jadwal permanen
    async initializePermanentSchedules() {
      try {
        this.saving = true
        console.log('🏗️ [AdminSchedules] Initializing permanent schedules to Firebase')
        
        const defaultSchedules = [
          { category: 'doa-fajar', dayOfWeek: 'daily', time: '05:00', title: 'Doa Fajar' },
          { category: 'doa-puasa', dayOfWeek: 5, time: '18:00', title: 'Doa Puasa' },
          { category: 'pelnap', dayOfWeek: 2, time: '19:00', title: 'Pelnap' },
          { category: 'pelprap', dayOfWeek: 3, time: '19:00', title: 'Pelprap' },
          { category: 'pelwap', dayOfWeek: 4, time: '19:00', title: 'Pelwap' },
          { category: 'pelprip', dayOfWeek: 6, time: '19:00', title: 'Pelprip' },
          { category: 'pendalaman-alkitab', dayOfWeek: 3, time: '20:00', title: 'Pendalaman Alkitab' },
          { category: 'raya', dayOfWeek: 0, time: '08:00', title: 'Raya' },
          { category: 'sektor-anugerah', dayOfWeek: 0, time: '10:00', title: 'Sektor Anugerah' },
          { category: 'sektor-tesalonika', dayOfWeek: 0, time: '16:00', title: 'Sektor Tesalonika' }
        ]

        console.log('📋 [DEBUG] Saving', defaultSchedules.length, 'permanent schedules to Firebase')

        // Save setiap jadwal ke Firebase untuk mendapatkan ID permanen
        for (const template of defaultSchedules) {
          const scheduleData = {
            title: template.title,
            category: template.category,
            dayOfWeek: template.dayOfWeek,
            time: template.time,
            location: 'Gedung Gereja Utama',
            theme: template.title,
            speaker: '',
            specialNotes: '',
            announcements: [],
            status: 'active',
            isPublished: false,
            isSpecialEvent: false,
            createdAt: new Date().toISOString(),
            createdBy: 'admin',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin',
            version: 1
          }

          console.log('💾 [DEBUG] Creating permanent schedule:', template.category)
          await this.createNewSchedule(scheduleData)
        }

        this.showNotificationMessage('✅ 10 jadwal permanen berhasil dibuat di database! Sekarang Anda bisa mengedit jadwal tersebut. Data akan selalu menggunakan 10 jadwal ini, tidak akan membuat data baru lagi.', 'success')
        
        // Reload untuk menampilkan jadwal yang baru dibuat
        setTimeout(() => {
          this.loadWeeklySchedules()
        }, 1000)
        
      } catch (error) {
        console.error('❌ [AdminSchedules] Error initializing permanent schedules:', error)
        this.showNotificationMessage('Gagal membuat jadwal permanen!', 'error')
      } finally {
        this.saving = false
      }
    },
    
    // ===================================
    // 🔄 DATA TRANSFORMATION
    // ===================================
    
    transformFirebaseData(firebaseSchedules) {
      console.log('🔄 [DEBUG] transformFirebaseData called with:', firebaseSchedules)
      console.log('🔄 [DEBUG] Is array?', Array.isArray(firebaseSchedules))
      console.log('🔄 [DEBUG] Length:', firebaseSchedules?.length)
      
      if (!firebaseSchedules || !Array.isArray(firebaseSchedules)) {
        console.warn('⚠️ [DEBUG] Invalid Firebase schedules data, need to initialize')
        return []
      }
      
      if (firebaseSchedules.length === 0) {
        console.log('📝 [DEBUG] No schedules found in Firebase, need to initialize')
        return []
      }
      
      console.log('📊 [DEBUG] Processing', firebaseSchedules.length, 'existing schedules from Firebase')
      console.log('🔄 [DEBUG] Will use EXISTING data, no new data creation needed')
      
      const transformedSchedules = firebaseSchedules.map((schedule, index) => {
        console.log(`🔄 [DEBUG] Transforming schedule ${index}:`, {
          id: schedule.id,
          category: schedule.category,
          dayOfWeek: schedule.dayOfWeek,
          theme: schedule.theme || schedule.title
        })
        
        // Transform Firebase structure to component structure
        const transformed = {
          id: schedule.id || `schedule_${index}`,
          category: schedule.category || 'doa-fajar',
          dayOfWeek: schedule.dayOfWeek === 'daily' ? 'daily' : (typeof schedule.dayOfWeek === 'number' ? schedule.dayOfWeek : parseInt(this.parseDayOfWeek(schedule.dayOfWeek))),
          time: schedule.time || '08:00',
          theme: schedule.theme || schedule.title || '',
          speaker: schedule.speaker || '',
          scripture: schedule.scripture || '',
          description: schedule.specialNotes || schedule.description || '',
          location: schedule.location || 'Gedung Utama',
          isPublished: schedule.isPublished !== false,
          isActive: schedule.status === 'active',
          announcements: schedule.announcements || [],
          createdAt: schedule.createdAt || new Date().toISOString(),
          updatedAt: schedule.lastUpdated || schedule.createdAt || new Date().toISOString(),
          createdBy: schedule.createdBy || 'system',
          updatedBy: schedule.updatedBy || 'system',
          version: schedule.version || 1,
          hasChanges: false,
          expanded: false,
          order: index + 1
        }
        
        console.log(`📋 [DEBUG] Transformed result ${index}:`, {
          id: transformed.id,
          category: transformed.category,
          dayOfWeek: transformed.dayOfWeek,
          theme: transformed.theme
        })
        
        return transformed
      })
      
      const sortedSchedules = transformedSchedules.sort((a, b) => {
        // Sort by day of week, then by time
        // 'daily' should come first
        const aDaySort = a.dayOfWeek === 'daily' ? -1 : (typeof a.dayOfWeek === 'number' ? a.dayOfWeek : parseInt(a.dayOfWeek))
        const bDaySort = b.dayOfWeek === 'daily' ? -1 : (typeof b.dayOfWeek === 'number' ? b.dayOfWeek : parseInt(b.dayOfWeek))
        
        if (aDaySort !== bDaySort) {
          return aDaySort - bDaySort
        }
        return a.time.localeCompare(b.time)
      })
      
      console.log('✅ [DEBUG] Final sorted schedules:', sortedSchedules.length)
      return sortedSchedules
    },
    
    createDefaultSchedules() {
      console.log('🏗️ [AdminSchedules] Creating default schedule templates')
      
      const defaultSchedules = [
        { category: 'doa-fajar', dayOfWeek: 'daily', time: '05:00', title: 'Doa Fajar' },
        { category: 'doa-puasa', dayOfWeek: 5, time: '18:00', title: 'Doa Puasa' },
        { category: 'pelnap', dayOfWeek: 2, time: '19:00', title: 'Pelnap' },
        { category: 'pelprap', dayOfWeek: 3, time: '19:00', title: 'Pelprap' },
        { category: 'pelwap', dayOfWeek: 4, time: '19:00', title: 'Pelwap' },
        { category: 'pelprip', dayOfWeek: 6, time: '19:00', title: 'Pelprip' },
        { category: 'pendalaman-alkitab', dayOfWeek: 3, time: '20:00', title: 'Pendalaman Alkitab' },
        { category: 'raya', dayOfWeek: 0, time: '08:00', title: 'Raya' },
        { category: 'sektor-anugerah', dayOfWeek: 0, time: '10:00', title: 'Sektor Anugerah' },
        { category: 'sektor-tesalonika', dayOfWeek: 0, time: '16:00', title: 'Sektor Tesalonika' }
      ]
      
      console.log('📋 [DEBUG] Default templates array:', defaultSchedules)
      console.log('📊 [DEBUG] Number of templates:', defaultSchedules.length)
      
      const createdSchedules = defaultSchedules.map((template, index) => {
        const schedule = {
          id: `new_${template.category}_${template.dayOfWeek}_${template.time}_${Date.now()}_${index}`,
          category: template.category,
          dayOfWeek: template.dayOfWeek, // Jangan parseInt untuk 'daily'
          time: template.time,
          theme: template.title,
          speaker: '',
          scripture: '',
          description: '',
          location: 'Gedung Gereja Utama',
          isPublished: false,
          isActive: true,
          announcements: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system',
          updatedBy: 'system',
          version: 1,
          hasChanges: true, // Mark as changed so they can be saved
          expanded: false,
          order: index + 1
        }
        
        console.log(`📝 [DEBUG] Created schedule ${index + 1}:`, {
          id: schedule.id,
          category: schedule.category,
          dayOfWeek: schedule.dayOfWeek,
          time: schedule.time,
          theme: schedule.theme
        })
        
        return schedule
      })
      
      console.log('✅ [DEBUG] Total created schedules:', createdSchedules.length)
      return createdSchedules
    },
    
    parseDayOfWeek(dayOfWeek) {
      // Handle different day formats from Firebase
      if (typeof dayOfWeek === 'number') {
        return dayOfWeek
      }
      if (typeof dayOfWeek === 'string') {
        const dayMap = {
          'minggu': 0, 'sunday': 0,
          'senin': 1, 'monday': 1,
          'selasa': 2, 'tuesday': 2,
          'rabu': 3, 'wednesday': 3,
          'kamis': 4, 'thursday': 4,
          'jumat': 5, 'friday': 5,
          'sabtu': 6, 'saturday': 6
        }
        return dayMap[dayOfWeek.toLowerCase()] || 0
      }
      return 0 // Default to Sunday
    },
    
    // ===================================
    // 📢 NOTIFICATIONS
    // ===================================
    
    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message
      this.notificationType = type
      this.showNotification = true
      
      setTimeout(() => {
        this.showNotification = false
      }, 3000)
    }
  }
}
</script>

<style scoped>
.admin-schedules-container {
  background: #f8f9fc;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 24px;
}

.page-title {
  font-family: 'Inter';
  font-size: 28px;
  font-weight: 700;
  color: #41442A;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.week-navigation {
  display: flex;
  gap: 8px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #e5e5e5;
}

/* Week Navigation - styles now handled by AdminButton */
.week-navigation {
  display: flex;
  gap: 8px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #e5e5e5;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #6b7280;
  transition: all 0.3s;
}

.stat-icon.active {
  background: #dbeafe;
  color: #2563eb;
}

.stat-icon.published {
  background: #dcfce7;
  color: #16a34a;
}

.stat-icon.changes {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon.changes.active {
  background: #fbbf24;
  color: #92400e;
}

.stat-number {
  font-family: 'Inter';
  font-size: 24px;
  font-weight: 700;
  color: #41442A;
  margin: 0 0 4px 0;
}

.stat-label {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Loading States */
.desktop-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e5e5;
  border-top: 4px solid #41442A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.desktop-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.error-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
}

/* Weekly Schedule Editor */
.weekly-schedule-editor {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.editor-header h2 {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.editor-actions {
  display: flex;
  gap: 12px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  max-width: 400px;
  line-height: 1.5;
}

/* Schedule Cards Grid */
.schedule-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  padding: 24px;
}

.schedule-card {
  background: white;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.schedule-card.has-changes {
  border-color: #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15);
}

.schedule-card.published {
  border-color: #16a34a;
}

.schedule-card.filled {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.schedule-type {
  flex: 1;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.type-badge.doa-fajar { background: #fef3c7; color: #92400e; }
.type-badge.doa-puasa { background: #fce7f3; color: #be185d; }
.type-badge.pelnap { background: #dbeafe; color: #1e40af; }
.type-badge.pelprap { background: #e0e7ff; color: #3730a3; }
.type-badge.pelwap { background: #fecaca; color: #dc2626; }
.type-badge.pelprip { background: #fed7d7; color: #c53030; }
.type-badge.pendalaman-alkitab { background: #e0e7ff; color: #3730a3; }
.type-badge.raya { background: #fbbf24; color: #92400e; }
.type-badge.sektor-anugerah { background: #d1fae5; color: #065f46; }
.type-badge.sektor-tesalonika { background: #cffafe; color: #0f766e; }

.day-time {
  font-size: 14px;
  font-weight: 600;
  color: #41442A;
}

.card-status {
  display: flex;
  gap: 8px;
}

.status-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.status-indicator.changes {
  background: #fbbf24;
  color: white;
}

.status-indicator.published {
  background: #16a34a;
  color: white;
}

/* Form Styles */
.card-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #41442A;
  margin-bottom: 6px;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: 'Inter';
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #41442A;
  box-shadow: 0 0 0 3px rgba(65, 68, 42, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

/* Card Actions - now using AdminButton */
.card-actions {
  display: flex;
  gap: 8px;
}

/* Notification */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  border-left: 4px solid #16a34a;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  color: #41442A;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
}

.notification.error {
  border-left-color: #dc2626;
}

.notification.warning {
  border-left-color: #f59e0b;
}

.notification.info {
  border-left-color: #3b82f6;
}

.notification svg {
  width: 20px;
  height: 20px;
  color: #16a34a;
}

.notification.error svg {
  color: #dc2626;
}

.notification.warning svg {
  color: #f59e0b;
}

.notification.info svg {
  color: #3b82f6;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
