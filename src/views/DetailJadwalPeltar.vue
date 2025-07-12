<template>
  <div class="jadwal-peltar-detail-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />

      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- Desktop Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <!-- Loading state desktop -->
        <div v-if="loading" class="loading-container desktop-loading">
          <div class="loading-spinner"></div>
          <p>Memuat detail jadwal...</p>
        </div>

        <!-- Error state desktop -->
        <div v-else-if="error" class="error-container desktop-error">
          <div class="error-card">
            <AlertCircle class="error-icon" />
            <h3>Oops! Terjadi Kesalahan</h3>
            <p class="error-text">{{ error }}</p>
            <div class="error-actions">
              <button @click="fetchScheduleDetail" class="retry-button">
                <RefreshCw class="retry-icon" />
                Coba Lagi
              </button>
              <button @click="goBackToList" class="back-button">
                <ArrowLeft class="back-icon" />
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>

        <!-- Schedule Detail desktop -->
        <div v-else-if="schedule" class="desktop-schedule-detail">
          <!-- Header Card -->
          <div class="detail-header-card">
            <div class="header-content">
              <h1 class="schedule-title">{{ schedule.categoryLabel }}</h1>
              <p class="schedule-date">{{ schedule.displayDate }}</p>
            </div>
            <div class="header-icon">
              <CalendarDays class="calendar-icon" />
            </div>
          </div>

          <!-- Detail Content Grid -->
          <div class="detail-content-grid">
            <!-- Tim Pelayanan Card (Gabungan) -->
            <div class="info-card full-width">
              <h3 class="card-title">
                <Users class="title-icon" />
                Tim Pelayanan
              </h3>
              <div class="info-grid">
                <InfoItem 
                  label="Pengkhotbah" 
                  :value="schedule.pelayananInfo.pengkhotbah" 
                  icon="mic"
                />
                <InfoItem 
                  label="Worship Leader" 
                  :value="schedule.pelayananInfo.worshipLeader" 
                  icon="music"
                />
                <InfoItem 
                  label="Singers" 
                  :value="schedule.pelayananInfo.singers" 
                  icon="users"
                />
                <InfoItem 
                  label="Music" 
                  :value="schedule.pelayananInfo.music" 
                  icon="music"
                />
                <InfoItem 
                  label="Tambourine" 
                  :value="schedule.pelayananInfo.tambourine" 
                  icon="circle"
                />
                <InfoItem 
                  label="Banners" 
                  :value="schedule.pelayananInfo.banners" 
                  icon="flag"
                />
                <InfoItem 
                  label="Multimedia" 
                  :value="schedule.pelayananInfo.multimedia" 
                  icon="monitor"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <div class="jadwal-peltar-detail-wrapper">
        <HeaderWithBack :title="schedule ? schedule.categoryLabel : 'Detail Jadwal'" />
        
        <!-- Loading state mobile -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Memuat detail jadwal...</p>
        </div>

        <!-- Error state mobile -->
        <div v-else-if="error" class="error-container">
          <div class="error-content">
            <AlertCircle class="error-icon" />
            <h3>Terjadi Kesalahan</h3>
            <p>{{ error }}</p>
            <div class="error-actions">
              <button @click="fetchScheduleDetail" class="retry-button">
                <RefreshCw class="retry-icon" />
                Coba Lagi
              </button>
              <button @click="goBackToList" class="back-button">
                <ArrowLeft class="back-icon" />
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>

        <!-- Schedule Detail mobile -->
        <div v-else-if="schedule" class="mobile-schedule-detail">
          <!-- Header Info -->
          <div class="detail-header">
            <div class="header-icon">
              <CalendarDays class="calendar-icon" />
            </div>
            <div class="header-info">
              <h1 class="schedule-title">{{ schedule.categoryLabel }}</h1>
              <p class="schedule-date">{{ schedule.displayDate }}</p>
            </div>
          </div>

          <!-- Detail Sections -->
          <div class="detail-sections">
            <!-- Tim Pelayanan (Gabungan) -->
            <div class="detail-section">
              <h3 class="section-title">
                <Users class="section-icon" />
                Tim Pelayanan
              </h3>
              <div class="section-content">
                <InfoItem 
                  label="Pengkhotbah" 
                  :value="schedule.pelayananInfo.pengkhotbah" 
                  icon="mic"
                />
                <InfoItem 
                  label="Worship Leader" 
                  :value="schedule.pelayananInfo.worshipLeader" 
                  icon="music"
                />
                <InfoItem 
                  label="Singers" 
                  :value="schedule.pelayananInfo.singers" 
                  icon="users"
                />
                <InfoItem 
                  label="Music" 
                  :value="schedule.pelayananInfo.music" 
                  icon="music"
                />
                <InfoItem 
                  label="Tambourine" 
                  :value="schedule.pelayananInfo.tambourine" 
                  icon="circle"
                />
                <InfoItem 
                  label="Banners" 
                  :value="schedule.pelayananInfo.banners" 
                  icon="flag"
                />
                <InfoItem 
                  label="Multimedia" 
                  :value="schedule.pelayananInfo.multimedia" 
                  icon="monitor"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import InfoItem from '@/components/common/InfoItem.vue'
import { 
  CalendarDays,
  RefreshCw, 
  AlertCircle,
  ArrowLeft,
  Users
} from 'lucide-vue-next'
import { getAltarServantsSchedule } from '@/services/altarServantsSchedules'

export default {
  name: 'DetailJadwalPeltar',
  
  components: {
    HeaderWithBack,
    DesktopNavbar,        
    BreadcrumbDesktop,
    InfoItem,    
    CalendarDays,
    RefreshCw,
    AlertCircle,
    ArrowLeft,
    Users
  },
  
  data() {
    return {
      schedule: null,         // Data jadwal pelayan altar
      loading: true,          // Status loading
      error: null,           // Pesan error jika ada
    }
  },
  
  computed: {
    scheduleId() {
      return this.$route.params.id
    },
    
    breadcrumbItems() {
      return [
        { text: 'Home', to: '/' },
        { text: 'Jadwal Pelayan Altar', to: '/jadwal-peltar' },
        { text: this.schedule ? this.schedule.categoryLabel : 'Detail', to: null }
      ]
    }
  },
  
  async created() {
    await this.fetchScheduleDetail()
  },
  
  watch: {
    '$route.params.id': {
      handler: 'fetchScheduleDetail',
      immediate: false
    }
  },
  
  methods: {
    /**
     * Mengambil detail jadwal pelayan altar dari service
     */
    async fetchScheduleDetail() {
      try {
        this.loading = true
        this.error = null
        
        console.log(`🔍 [DetailJadwalPeltar] Route params:`, this.$route.params)
        console.log(`🔍 [DetailJadwalPeltar] Schedule ID dari params: "${this.scheduleId}"`)
        
        if (!this.scheduleId) {
          throw new Error('ID jadwal tidak valid')
        }
        
        console.log(`🔍 [DetailJadwalPeltar] Mengambil detail jadwal: ${this.scheduleId}`)
        
        // Ambil detail jadwal
        const scheduleData = await getAltarServantsSchedule(this.scheduleId)
        
        console.log('✅ [DetailJadwalPeltar] Detail jadwal berhasil dimuat:', scheduleData)
        
        this.schedule = scheduleData
        
      } catch (error) {
        console.error('❌ [DetailJadwalPeltar] Error memuat detail jadwal:', error)
        console.error('❌ [DetailJadwalPeltar] Error details:', {
          message: error.message,
          code: error.code,
          scheduleId: this.scheduleId
        })
        
        if (error.message.includes('tidak ditemukan')) {
          this.error = 'Jadwal tidak ditemukan. Mungkin sudah dihapus atau ID tidak valid.'
        } else if (error.code === 'unavailable') {
          this.error = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
        } else if (error.code === 'permission-denied') {
          this.error = 'Anda tidak memiliki izin untuk mengakses data ini.'
        } else {
          this.error = 'Gagal memuat detail jadwal. Pastikan koneksi internet Anda stabil.'
        }
      } finally {
        this.loading = false
      }
    },
    
    /**
     * Navigasi kembali ke halaman list jadwal pelayan altar
     */
    goBackToList() {
      this.$router.push('/jadwal-peltar')
    }
  }
}
</script>

<style scoped>
/* ========================================
   CONTAINER UTAMA
========================================= */
.jadwal-peltar-detail-container {
  background: #fcfcf7;
  min-height: 100vh;
}

/* ========================================
   LAYOUT RESPONSIVENESS
========================================= */

/* Default: Tampilkan mobile, sembunyikan desktop */
.desktop-layout {
  display: none;
}

.mobile-layout {
  display: block;
}

/* ========================================
   DESKTOP LAYOUT (≥769px)
========================================= */

@media (min-width: 769px) {
  /* Switch ke desktop */
  .desktop-layout {
    display: block;
    min-height: 100vh;
    background: #fcfcf7;
  }
  
  .mobile-layout {
    display: none;
  }

  /* === DESKTOP CONTENT === */
  .desktop-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
  }

  /* === LOADING & ERROR STATES === */
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
    border-top: 4px solid #8B7355;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

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
    line-height: 1.5;
  }

  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
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

  .back-button {
    background: #8B7355;
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

  .back-button:hover {
    background: #736147;
    transform: translateY(-1px);
  }

  .retry-icon,
  .back-icon {
    width: 16px;
    height: 16px;
  }

  /* === SCHEDULE DETAIL === */
  .desktop-schedule-detail {
    max-width: 900px;
    margin: 0 auto;
  }

  .detail-header-card {
    background: linear-gradient(135deg, #41442A 0%, #5a5e3d 100%);
    border-radius: 20px;
    padding: 40px;
    margin-bottom: 32px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 8px 32px rgba(65, 68, 42, 0.2);
  }

  .header-content {
    flex: 1;
  }

  .schedule-title {
    font-family: 'Inter', sans-serif;
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .schedule-date {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: rgba(255,255,255,0.8);
    margin: 0;
  }

  .header-icon {
    margin-left: 32px;
  }

  .calendar-icon {
    width: 80px;
    height: 80px;
    color: rgba(255,255,255,0.5);
  }

  .detail-content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .info-card {
    background: white;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    border: 1px solid #f0f0f0;
  }

  .info-card.full-width {
    grid-column: 1 / -1;
  }

  .card-title {
    font-family: 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #41442A;
    margin: 0 0 24px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-icon {
    width: 24px;
    height: 24px;
    color: #8B7355;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  /* === RESPONSIVE ADJUSTMENTS === */
  @media (max-width: 1024px) and (min-width: 769px) {
    .desktop-content {
      padding: 24px;
    }

    .detail-header-card {
      padding: 32px 24px;
    }

    .schedule-title {
      font-size: 28px;
    }

    .detail-content-grid {
      gap: 24px;
    }

    .info-card {
      padding: 24px;
    }
  }

  @media (max-width: 950px) and (min-width: 769px) {
    .detail-content-grid {
      grid-template-columns: 1fr;
    }

    .calendar-icon {
      width: 60px;
      height: 60px;
    }

    .header-icon {
      margin-left: 20px;
    }
  }
}

/* ========================================
   MOBILE LAYOUT STYLES
========================================= */

.jadwal-peltar-detail-wrapper {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
}

/* Loading state mobile */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-family: 'Inter';
  color: #666;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8B7355;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Error state mobile */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 16px;
  text-align: center;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 280px;
}

.error-content .error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
}

.error-content h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.error-content p {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.error-content .retry-button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.error-content .retry-button:hover {
  background: #dc2626;
}

/* Schedule detail mobile */
.mobile-schedule-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  background: linear-gradient(135deg, #41442A 0%, #5a5e3d 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-header .header-icon {
  flex-shrink: 0;
}

.detail-header .calendar-icon {
  width: 48px;
  height: 48px;
  color: rgba(255,255,255,0.7);
}

.header-info {
  flex: 1;
}

.detail-header .schedule-title {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.detail-header .schedule-date {
  font-family: 'Inter';
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  margin: 0;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
}

.section-title {
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 18px;
  height: 18px;
  color: #8B7355;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* === ACCESSIBILITY === */
@media (prefers-reduced-motion: reduce) {
  .retry-button:hover {
    transform: none;
  }

  .loading-spinner {
    animation: none;
  }
}

/* Responsive untuk HP kecil */
@media (max-width: 360px) {
  .jadwal-peltar-detail-wrapper {
    padding: 12px;
  }

  .detail-header {
    padding: 20px;
  }

  .detail-section {
    padding: 16px;
  }

  .detail-header .schedule-title {
    font-size: 18px;
  }

  .section-title {
    font-size: 15px;
  }
}
</style>
