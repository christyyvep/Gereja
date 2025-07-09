<template>
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Memuat detail jadwal...</p>
  </div>
  
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
  
  <DetailLayout
    v-else-if="schedule"
    header-title="Detail Jadwal"
    :title="schedule.title"
    :description="schedule.description"
    :thumbnail="schedule.thumbnail"
    :category="schedule.category"
    :content-type="'schedule'"
    :show-schedule-info="true"
    :date="schedule.date"
    :time="schedule.time"
    :location="schedule.location"
    :closing="getClosingMessage()"
    :customBackAction="handleBackNavigation"
    :isRecurring="schedule.isRecurring || schedule.source === 'recurring'"
    :recurrencePattern="schedule.recurrencePattern"
    :source="schedule.source"
  >
    <!-- Additional Slots for Schedule-specific content -->
    <template #additional-info>
      <!-- Recurring Info -->
      <div v-if="schedule.isRecurring || schedule.source === 'recurring'" class="recurring-info-section">
        <h3>Jadwal Berulang</h3>
        <div class="recurring-details">
          <div v-if="schedule.recurrencePattern" class="recurrence-pattern">
            <p><strong>Pola:</strong> {{ formatRecurrencePattern(schedule.recurrencePattern) }}</p>
            <p v-if="schedule.recurrencePattern.startDate">
              <strong>Dimulai:</strong> {{ formatDate(schedule.recurrencePattern.startDate) }}
            </p>
            <p v-if="schedule.recurrencePattern.endDate">
              <strong>Berakhir:</strong> {{ formatDate(schedule.recurrencePattern.endDate) }}
            </p>
            <p v-else>
              <strong>Berakhir:</strong> Tidak terbatas
            </p>
          </div>
          
          <div v-if="schedule.source === 'recurring'" class="generated-info">
            <p class="info-note">
              🔄 Ini adalah jadwal yang dihasilkan dari template berulang.
            </p>
          </div>
        </div>
      </div>

      <!-- Additional Info untuk generated schedules -->
      <div v-if="schedule.additionalInfo" class="additional-info-section">
        <h3>Informasi Tambahan</h3>
        <div class="additional-content" v-html="formatDescription(schedule.additionalInfo)"></div>
      </div>
    </template>

    <!-- Action Buttons Slot -->
    <template #action-buttons>
      <div class="schedule-actions">
        <ButtonPrimary @click="addToCalendar" class="calendar-btn">
          📅 Tambah ke Kalender
        </ButtonPrimary>
        
        <ButtonPrimary @click="shareSchedule" class="share-btn secondary">
          📤 Bagikan
        </ButtonPrimary>
      </div>
    </template>

    <!-- Related Content Slot -->
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
            <div class="related-content">
              <h4>{{ related.title }}</h4>
              <p>{{ formatDate(related.date) }} • {{ related.time }}</p>
            </div>
            <div class="related-arrow">→</div>
          </div>
        </div>
      </div>
    </template>
  </DetailLayout>

  <!-- Debug info (development only) -->
  <div v-if="isDevelopment && navigationSource" class="debug-info">
    <p><strong>Navigated from:</strong> {{ navigationSource }}</p>
    <p><strong>Schedule ID:</strong> {{ scheduleId }}</p>
    <p><strong>Source:</strong> {{ schedule?.source }}</p>
  </div>
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
    // ButtonSecondary // Commented out - tidak ada
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
    isDevelopment() {
      return process.env.NODE_ENV === 'development'
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
          throw new Error('ID jadwal tidak ditemukan')
        }
        
        // Parse schedule ID format: templateId_date
        const [templateId, date] = scheduleId.split('_')
        
        console.log(`📄 [DetailJadwal] Fetching schedule: template=${templateId}, date=${date}`)
        
        const scheduleData = await getWorshipSchedule(templateId, date)
        this.schedule = {
          ...scheduleData,
          id: scheduleId // Preserve the combined ID
        }
        
        console.log(`✅ [DetailJadwal] Schedule loaded:`, scheduleData)
        
        // Fetch related schedules
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
        
        const related = await getSchedulesByCategory(category, 7) // 7 hari ke depan
        
        // Exclude current schedule dan limit 3
        this.relatedSchedules = related
          .filter(s => s.id !== excludeId)
          .slice(0, 3)
        
        console.log(`✅ [DetailJadwal] Found ${this.relatedSchedules.length} related schedules`)
        
      } catch (err) {
        console.error('❌ [DetailJadwal] Error fetching related schedules:', err)
        // Tidak error, just empty related
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

    /**
     * ⭐ Handle smart back navigation
     */
     handleBackNavigation() {
      const source = this.navigationSource
      
      console.log(`🔙 [DetailJadwal] Back navigation from: ${source}`)
      
      // Smart back navigation berdasarkan source
      switch (source) {
        case 'announcement':
        case 'homepage': {
          this.$router.push('/home')  // ← FIX: ke /home
          break
        }
        case 'jadwal':
        case 'schedules': {
          this.$router.push('/jadwal')
          break
        }
        default: {
          // Fallback: check if can go back in history
          if (window.history.length > 1) {
            this.$router.back()
          } else {
            this.$router.push('/home')  // ← FIX: ke /home
          }
          break
        }
      }
    },

    /**
     * Navigate to another schedule
     */
    navigateToSchedule(id) {
      this.$router.push({
        path: `/jadwal/${id}`,
        query: { from: 'related' }
      })
    },

    /**
     * ⭐ Add to calendar
     */
    addToCalendar() {
      if (!this.schedule) return
      
      try {
        // Generate Google Calendar URL
        const startDate = new Date(`${this.schedule.date}T${this.schedule.time || '08:00'}`)
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // +2 hours
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(this.schedule.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(this.schedule.description || '')}&location=${encodeURIComponent(this.schedule.location || '')}`
        
        window.open(calendarUrl, '_blank')
        
        console.log('📅 [DetailJadwal] Calendar event created')
        
      } catch (err) {
        console.error('❌ [DetailJadwal] Error creating calendar event:', err)
        alert('Gagal menambahkan ke kalender')
      }
    },

    /**
     * ⭐ Share schedule
     */
    shareSchedule() {
      if (!this.schedule) return
      
      try {
        const shareText = `${this.schedule.title}\n📅 ${this.formatDate(this.schedule.date)} ${this.schedule.time || ''}\n📍 ${this.schedule.location || ''}\n\n${this.schedule.description || ''}`
        
        if (navigator.share) {
          // Native sharing (mobile)
          navigator.share({
            title: this.schedule.title,
            text: shareText,
            url: window.location.href
          })
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(shareText).then(() => {
            alert('Jadwal berhasil disalin ke clipboard!')
          })
        }
        
        console.log('📤 [DetailJadwal] Schedule shared')
        
      } catch (err) {
        console.error('❌ [DetailJadwal] Error sharing schedule:', err)
        alert('Gagal membagikan jadwal')
      }
    },

    getClosingMessage() {
      if (!this.schedule) return ''
      
      // Jika ada closing message dari data, gunakan itu
      if (this.schedule.closing) {
        return this.schedule.closing
      }
      
      // Fallback: pesan berdasarkan kategori jadwal
      switch (this.schedule.category?.toLowerCase()) {
        case 'ibadah':
        case 'worship': {
          return 'Mari bersama-sama memuji dan menyembah Tuhan. Tuhan Yesus memberkati!'
        }
        case 'pelatar':
        case 'training': {
          return 'Semoga pelatihan ini memberkati dan menguatkan iman kita. Tuhan Yesus memberkati!'
        }
        case 'pelprap': {
          return 'Mari berdoa bersama untuk kemajuan pelayanan gereja. Tuhan Yesus memberkati!'
        }
        case 'event':
        case 'acara': {
          return 'Terima kasih atas partisipasi Anda. Tuhan Yesus memberkati!'
        }
        default: {
          return 'Sampai jumpa di acara ini. Tuhan Yesus memberkati!'
        }
      }
    },

    // ===== UTILITY FUNCTIONS =====

    /**
     * Format date untuk display
     */
    formatDate(date) {
      if (!date) return ''
      
      const dateObj = new Date(date.seconds ? date.seconds * 1000 : date)
      
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(dateObj)
    },

    /**
     * Format description dengan line breaks
     */
    formatDescription(description) {
      if (!description) return ''
      
      return description
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
    },

    /**
     * Format recurrence pattern untuk display
     */
    formatRecurrencePattern(pattern) {
      if (!pattern) return ''
      
      const { type, interval, dayOfWeek } = pattern
      
      switch (type) {
        case 'daily': {
          return interval === 1 ? 'Setiap hari' : `Setiap ${interval} hari`
        }
        case 'weekly': {
          const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
          const dayName = days[parseInt(dayOfWeek)] || 'Minggu'
          return interval === 1 ? `Setiap ${dayName}` : `Setiap ${interval} minggu (${dayName})`
        }
        case 'monthly': {
          return interval === 1 ? 'Setiap bulan' : `Setiap ${interval} bulan`
        }
        default: {
          return 'Pola berulang'
        }
      }
    }
  }
}
</script>

<style scoped>
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

/* ===== SCHEDULE-SPECIFIC STYLES ===== */
.recurring-info-section,
.additional-info-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.recurring-info-section h3,
.additional-info-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.recurring-details {
  font-size: 14px;
  color: #374151;
}

.recurrence-pattern p {
  margin: 0 0 8px 0;
}

.generated-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.info-note {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
  margin: 0;
}

.additional-content {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

/* ===== ACTION BUTTONS ===== */
.schedule-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.calendar-btn,
.share-btn {
  flex: 1;
  min-width: 140px;
}

/* Secondary button style */
.share-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.share-btn.secondary:hover {
  background: #e5e7eb;
  color: #111827;
}

/* ===== RELATED SCHEDULES ===== */
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
  gap: 8px;
}

.related-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.related-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.related-content p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.related-arrow {
  color: #9ca3af;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.related-item:hover .related-arrow {
  transform: translateX(4px);
  color: #3b82f6;
}

/* ===== DEBUG INFO ===== */
.debug-info {
  background: #1f2937;
  color: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin: 16px;
  font-size: 12px;
  font-family: monospace;
}

.debug-info p {
  margin: 0 0 4px 0;
}

/* Responsive */
@media (max-width: 640px) {
  .schedule-actions {
    flex-direction: column;
  }
  
  .calendar-btn,
  .share-btn {
    flex: none;
  }
  
  .recurring-info-section,
  .additional-info-section,
  .related-schedules {
    padding: 16px;
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

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
    border: 4px solid #41442A;
  }
  
  .related-item:hover .related-arrow {
    transform: none;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .recurring-info-section,
  .additional-info-section,
  .related-schedules {
    background: #1f2937;
    border-color: #374151;
  }
  
  .recurring-info-section h3,
  .additional-info-section h3,
  .related-schedules h3 {
    color: #f9fafb;
  }
  
  .recurring-details,
  .additional-content {
    color: #e5e7eb;
  }
  
  .related-item {
    border-color: #374151;
  }
  
  .related-item:hover {
    background: #374151;
    border-color: #60a5fa;
  }
  
  .related-content h4 {
    color: #f9fafb;
  }
  
  .related-content p {
    color: #d1d5db;
  }
  
  .related-arrow {
    color: #6b7280;
  }
  
  .related-item:hover .related-arrow {
    color: #60a5fa;
  }
}
</style>