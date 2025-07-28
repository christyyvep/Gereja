<template>
  <!-- Loading State -->
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Memuat detail jadwal...</p>
  </div>
  
  <!-- Error State -->
  <div v-else-if="error" class="error-container">
    <HeaderWithBack 
      title="Detail Jadwal" 
      :customBackAction="handleBackNavigation"
    />
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h3>Terjadi Kesalahan</h3>
      <p class="error-text">{{ error }}</p>
      <ButtonPrimary @click="fetchScheduleDetail">Coba Lagi</ButtonPrimary>
    </div>
  </div>
  
  <!-- Main Content -->
  <DetailLayout
    v-else-if="schedule"
    header-title="Detail Jadwal"
    :title="schedule.title || 'Jadwal Tanpa Judul'"
    :description="getScheduleDescription(schedule)"
    :thumbnail="schedule.thumbnail"
    :category="schedule.category"
    content-type="schedule"
    :closing="getClosingMessage()"
    :custom-back-action="handleBackNavigation"
    :breadcrumb-items="breadcrumbItems"
    :hide-back-button="true"
    :hide-content-badge="true"
  >
    <template #additional-info>
      <div class="schedule-meta-section">
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">📅 Jadwal:</span>
            <span class="meta-value">{{ formatScheduleDay(schedule) }}</span>
          </div>
          
          <div v-if="schedule.time || schedule.defaultTime || schedule.staticInfo?.defaultTime" class="meta-item">
            <span class="meta-label">🕐 Waktu:</span>
            <span class="meta-value">{{ schedule.time || schedule.defaultTime || schedule.staticInfo?.defaultTime }} WIB</span>
          </div>
          
          <div v-if="schedule.location || schedule.staticInfo?.location" class="meta-item">
            <span class="meta-label">📍 Lokasi:</span>
            <span class="meta-value">{{ schedule.location || schedule.staticInfo?.location }}</span>
          </div>
          
          <div v-if="schedule.theme" class="meta-item">
            <span class="meta-label">🎯 Tema:</span>
            <span class="meta-value">{{ schedule.theme }}</span>
          </div>

          <div v-if="schedule.speaker || (schedule.speakers && schedule.speakers.length > 0)" class="meta-item">
            <span class="meta-label">👨‍🏫 Pembicara:</span>
            <span class="meta-value">{{ schedule.speaker || (schedule.speakers && schedule.speakers.join(', ')) || 'Belum ditentukan' }}</span>
          </div>
        </div>
      </div>

      <div v-if="schedule.announcements && schedule.announcements.length > 0" class="announcements-section">
        <h3>Pengumuman</h3>
        <div class="announcements-list">
          <div 
            v-for="(announcement, index) in schedule.announcements" 
            :key="index"
            class="announcement-item"
          >
            {{ announcement }}
          </div>
        </div>
      </div>

      <!-- Hapus section "Catatan Khusus" karena sudah ditampilkan sebagai deskripsi -->
    </template>

    <template #related-content>
      <div v-if="relatedSchedules.length > 0" class="related-schedules">
        <h3>Jadwal Terkait</h3>
        <div class="related-list">
          <div 
            v-for="related in relatedSchedules" 
            :key="related.id"
            class="related-item"
            @click="navigateToSchedule(related.id)"
          >
            <div class="related-thumbnail" v-if="related.thumbnail">
              <img :src="related.thumbnail" :alt="related.title" />
            </div>
            <div class="related-content">
              <h4>{{ related.title }}</h4>
              <p>{{ formatDate(related.date) }}</p>
              <p class="related-summary">{{ truncateText(related.description, 60) }}</p>
            </div>
            <div class="related-arrow">→</div>
          </div>
        </div>
      </div>
    </template>
  </DetailLayout>
</template>

<script>
import DetailLayout from '@/components/layout/DetailLayout.vue'
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import { getSchedulesByCategory, getWorshipSchedule } from '@/services/schedules'

export default {
  name: 'DetailJadwal',
  
  components: {
    DetailLayout,
    HeaderWithBack,
    ButtonPrimary
  },
  
  data() {
    return {
      schedule: null,
      loading: true,
      error: null,
      relatedSchedules: []
    }
  },
  
  computed: {
    scheduleId() {
      return this.$route.params.id
    },
    
    navigationSource() {
      return this.$route.query.from || 'direct'
    },
    
    breadcrumbItems() {
      if (!this.schedule || !this.schedule.title) {
        return [
          { text: 'Jadwal', to: '/jadwal' },
          { text: 'Loading...' }
        ]
      }
      
      return [
        { text: 'Jadwal', to: '/jadwal' },
        { text: this.schedule.title }
      ]
    }
  },
  
  async created() {
    console.log(`📄 [DetailJadwal] Component created for ID: ${this.scheduleId}`)
    console.log(`🧭 [DetailJadwal] Navigation source: ${this.navigationSource}`)
    await this.fetchScheduleDetail()
  },
  
  methods: {
    
    async fetchScheduleDetail() {
      try {
        this.loading = true
        this.error = null
        
        const scheduleId = this.scheduleId
        
        if (!scheduleId) {
          throw new Error('ID template tidak ditemukan')
        }
        
        console.log(`📄 [DetailJadwal] Loading schedule: ${scheduleId}`)
        
        let templateId, date
        
        const parts = scheduleId.split('_')
        
        if (parts.length >= 3 && parts[parts.length - 1].match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = parts.pop()
          templateId = parts.join('_')
        } else {
          templateId = scheduleId
          date = new Date().toISOString().split('T')[0]
        }
        
        console.log(`📄 [DetailJadwal] Parsed - Template: ${templateId}, Date: ${date}`)
        
        const scheduleData = await getWorshipSchedule(templateId, date)
        
        this.schedule = {
          ...scheduleData,
          id: scheduleId
        }
        
        console.log(`✅ [DetailJadwal] Schedule loaded:`, scheduleData)
        
        if (scheduleData.category) {
          await this.fetchRelatedSchedules(scheduleData.category, scheduleId)
        }
        
      } catch (error) {
        console.error('❌ [DetailJadwal] Error loading schedule:', error)
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },

    async fetchRelatedSchedules(category, excludeId) {
      try {
        console.log(`🔗 [DetailJadwal] Fetching related schedules for category: ${category}`)
        
        const related = await getSchedulesByCategory(category)
        
        this.relatedSchedules = related
          .filter(s => s.id !== excludeId)
          .slice(0, 3)
        
        console.log(`✅ [DetailJadwal] Found ${this.relatedSchedules.length} related schedules`)
        
      } catch (err) {
        console.error('❌ [DetailJadwal] Error fetching related schedules:', err)
        this.relatedSchedules = []
      }
    },

    
    handleError(error) {
      if (error.message.includes('tidak ditemukan')) {
        this.error = 'Jadwal yang Anda cari tidak ditemukan. Mungkin sudah dihapus atau ID tidak valid.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        this.error = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
      } else {
        this.error = 'Gagal memuat detail jadwal. Pastikan koneksi internet Anda stabil.'
      }
    },

    
    handleBackNavigation() {
      const source = this.navigationSource
      
      switch (source) {
        case 'announcement':
        case 'homepage': {
          this.$router.push('/home')
          break
        }
        case 'calendar':
        case 'jadwal': {
          this.$router.push('/calendar')
          break
        }
        default: {
          if (window.history.length > 1) {
            this.$router.back()
          } else {
            this.$router.push('/home')
          }
          break
        }
      }
    },

    navigateToSchedule(id) {
      this.$router.push({
        path: `/jadwal/${id}`,
        query: { from: 'related' }
      })
    },

    formatScheduleDay(schedule) {
      const dayOfWeek = schedule.dayOfWeek
      
      // Simple mapping: 0=Minggu, 1=Senin, dst
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      
      if (dayOfWeek === 'daily') {
        return 'Setiap Hari'
      }
      
      if (dayOfWeek >= 0 && dayOfWeek <= 6) {
        return dayNames[dayOfWeek]
      }
      
      return 'Hari Tidak Diketahui'
    },

    formatCategory(category) {
      if (!category) return 'Umum'
      
      const categoryMap = {
        'doa-fajar': 'Doa Fajar',
        'ibadah-minggu': 'Ibadah Minggu',
        'pemahaman-alkitab': 'Pemahaman Alkitab',
        'doa-puasa': 'Doa & Puasa',
        'pelprip': 'PELPRIP',
        'pelwap': 'PELWAP',
        'ibadah-umum': 'Ibadah Umum'
      }
      
      return categoryMap[category.toLowerCase()] || category
    },

    getScheduleDescription(schedule) {
      // Prioritas 1: Jika ada deskripsi/specialNotes dari admin, gunakan itu
      if (schedule.description && schedule.description.trim()) {
        return schedule.description.trim()
      }
      
      if (schedule.specialNotes && schedule.specialNotes.trim()) {
        return schedule.specialNotes.trim()
      }
      
      // Prioritas 2: Jika tidak ada deskripsi, buat deskripsi otomatis berdasarkan kategori
      const category = schedule.category?.toLowerCase()
      
      switch (category) {
        case 'doa-fajar':
          return 'Mari memulai hari dengan doa bersama dalam hadirat Tuhan untuk mempersiapkan hati dan pikiran kita.'
        case 'ibadah-minggu':
        case 'ibadah-umum':
          return 'Datanglah bersama-sama untuk memuji dan menyembah Tuhan dalam kasih-Nya yang sempurna.'
        case 'pemahaman-alkitab':
        case 'pendalaman-alkitab':
          return 'Mempelajari Firman Tuhan bersama untuk pertumbuhan rohani dan pemahaman iman yang lebih dalam.'
        case 'doa-puasa':
        case 'doa puasa':
          return 'Waktu berdoa dan puasa bersama untuk mencari kehendak Tuhan dan memperdalam hubungan dengan-Nya.'
        case 'pelprip':
          return 'Persekutuan khusus untuk pertumbuhan iman dan pelayanan dalam kasih Kristus.'
        case 'pelwap':
          return 'Persekutuan untuk membangun satu sama lain dalam kasih Kristus dan saling menguatkan.'
        case 'pelnap':
          return 'Waktu khusus untuk penyembahan dan doa bersama dalam atmosfer yang penuh berkat.'
        case 'pelprap':
          return 'Persekutuan dan pendalaman untuk memperkuat iman dan mempersiapkan diri dalam pelayanan.'
        case 'raya':
          return 'Perayaan istimewa dalam kalender gereja yang penuh sukacita dan ucapan syukur.'
        case 'sektor-anugerah':
          return 'Persekutuan sektor untuk saling membangun dan bertumbuh dalam anugerah Tuhan.'
        case 'sektor-tesalonika':
          return 'Persekutuan sektor untuk memperkuat persaudaraan dan iman dalam kasih Kristus.'
        default: {
          // Fallback dengan menggunakan categoryLabel jika ada
          const categoryLabel = schedule.categoryLabel || 'ibadah'
          return `Kegiatan ${categoryLabel.toLowerCase()} yang memberkati untuk pertumbuhan rohani jemaat.`
        }
      }
    },

    getClosingMessage() {
      if (!this.schedule) return ''
      
      if (this.schedule.closing) {
        return this.schedule.closing
      }
      
      switch (this.schedule.category?.toLowerCase()) {
        case 'doa-fajar':
          return 'Mari memulai hari dengan doa bersama. Tuhan Yesus memberkati!'
        case 'ibadah-minggu':
          return 'Mari bersama-sama memuji dan menyembah Tuhan. Tuhan Yesus memberkati!'
        case 'pemahaman-alkitab':
          return 'Semoga firman Tuhan menguatkan iman kita. Tuhan Yesus memberkati!'
        case 'doa-puasa':
          return 'Mari berdoa bersama dengan tekun. Tuhan Yesus memberkati!'
        case 'pelprip':
        case 'pelwap':
          return 'Terima kasih atas persekutuan yang diberkati. Tuhan Yesus memberkati!'
        default:
          return 'Sampai jumpa di kegiatan ini. Tuhan Yesus memberkati!'
      }
    },

    formatDate(dateValue) {
      if (!dateValue) return ''
      
      const dateObj = new Date(dateValue.seconds ? dateValue.seconds * 1000 : dateValue)
      
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(dateObj)
    },

    truncateText(text, maxLength) {
      if (!text) return ''
      
      if (text.length <= maxLength) return text
      
      return text.substring(0, maxLength).trim() + '...'
    }
  }
}
</script>

<style scoped>
/* ========================================
   LOADING & ERROR STATES
========================================= */

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #fcfcf7;
  font-family: 'Inter';
  color: #666;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #41442A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  margin: 0;
  font-size: 14px;
}

/* Error state */
.error-container {
  background: #fcfcf7;
  min-height: 100vh;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 16px;
  text-align: center;
  max-width: 360px;
  margin: 0 auto;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.error-content h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.error-text {
  color: #d32f2f;
  font-family: 'Inter';
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}

.schedule-meta-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.meta-grid {
  display: grid;
  gap: 8px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.meta-item:last-child {
  border-bottom: none;
}

.meta-label {
  color: #6b7280;
  font-weight: 500;
  font-size: 16px;
}

.meta-value {
  color: #374151;
  font-weight: 600;
  font-size: 16px;
  text-align: right;
}

@media (max-width: 768px) {
  .meta-label {
    font-size: 14px;
  }
  
  .meta-value {
    font-size: 14px;
  }
}

/* ========================================
   ANNOUNCEMENTS
========================================= */

.announcements-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.announcements-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.announcement-item {
  background: #f8f9fa;
  color: #374151;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  border-left: 4px solid #41442A;
}

/* ========================================
   RELATED SCHEDULES
========================================= */

.related-schedules {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.related-schedules h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-item:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.related-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.related-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-content {
  flex: 1;
  min-width: 0;
}

.related-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.related-content p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.3;
}

.related-summary {
  margin-top: 4px !important;
  color: #9ca3af !important;
}

.related-arrow {
  color: #9ca3af;
  font-weight: bold;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.related-item:hover .related-arrow {
  transform: translateX(4px);
  color: #3b82f6;
}

/* ========================================
   RESPONSIVE
========================================= */

@media (max-width: 640px) {
  .schedule-meta-section,
  .announcements-section,
  .related-schedules {
    padding: 16px;
  }
  
  .related-item {
    gap: 8px;
    padding: 8px;
  }
  
  .related-thumbnail {
    width: 50px;
    height: 50px;
  }
  
  .error-content {
    padding: 24px 12px;
  }
  
  .error-icon {
    font-size: 40px;
  }
  
  .error-content h3 {
    font-size: 16px;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }
}

/* ========================================
   ACCESSIBILITY
========================================= */

@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
    border: 4px solid #41442A;
  }
  
  .related-item:hover .related-arrow {
    transform: none;
  }
}
</style>