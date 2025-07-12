<template>
  <div class="jadwal-peltar-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />

      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- Desktop Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <!-- Header dengan judul dan tombol refresh -->
        <div class="page-header">
          <h1 class="page-title">Jadwal Pelayan Altar</h1>
          <button @click="fetchSchedules" class="refresh-button" :disabled="loading">
            <RefreshCw :class="{ 'rotating': loading }" class="refresh-icon" />
            {{ loading ? 'Memuat...' : 'Refresh' }}
          </button>
        </div>

        <!-- Loading state desktop -->
        <div v-if="loading" class="loading-container desktop-loading">
          <div class="loading-spinner"></div>
          <p>Memuat jadwal pelayan altar...</p>
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

        <!-- Schedules Grid desktop -->
        <div v-else-if="schedules.length > 0" class="schedules-grid">
          <AltarServantsCard
            v-for="schedule in schedules"
            :key="schedule.id"
            :schedule="schedule"
          />
        </div>

        <!-- Empty state desktop -->
        <div v-else class="desktop-empty">
          <div class="empty-card">
            <CalendarDays class="empty-icon" />
            <h3>Belum Ada Jadwal Pelayan Altar</h3>
            <p>Jadwal pelayan altar akan muncul di sini ketika admin sudah menambahkannya.</p>
            <button @click="fetchSchedules" class="refresh-button-primary">
              <RefreshCw class="refresh-icon" />
              Refresh
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <div class="jadwal-peltar-wrapper">
        <HeaderWithBack title="Jadwal Pelayan Altar" />
        
        <!-- Loading state mobile -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Memuat jadwal pelayan altar...</p>
        </div>

        <!-- Error state mobile -->
        <div v-else-if="error" class="error-container">
          <div class="error-content">
            <AlertCircle class="error-icon" />
            <h3>Terjadi Kesalahan</h3>
            <p>{{ error }}</p>
            <button @click="fetchSchedules" class="retry-button">
              <RefreshCw class="retry-icon" />
              Coba Lagi
            </button>
          </div>
        </div>

        <!-- Schedules list mobile -->
        <div v-else-if="schedules.length > 0" class="schedules-list">
          <AltarServantsCard
            v-for="schedule in schedules"
            :key="schedule.id"
            :schedule="schedule"
          />
        </div>

        <!-- Empty state mobile -->
        <div v-else class="empty-container">
          <div class="empty-content">
            <CalendarDays class="empty-icon" />
            <h3>Belum Ada Jadwal</h3>
            <p>Jadwal pelayan altar akan muncul di sini ketika admin sudah menambahkannya.</p>
            <button @click="fetchSchedules" class="refresh-button">
              <RefreshCw class="refresh-icon" />
              Refresh
            </button>
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
import AltarServantsCard from '@/components/AltarServantsCard.vue'
import { 
  CalendarDays,
  RefreshCw, 
  AlertCircle, 
} from 'lucide-vue-next'
import { getAltarServantsSchedules } from '@/services/altarServantsSchedules'

export default {
  name: 'JadwalPeltarPage',
  
  components: {
    HeaderWithBack,
    DesktopNavbar,        
    BreadcrumbDesktop,    
    AltarServantsCard,         
    CalendarDays,
    RefreshCw,
    AlertCircle
  },
  
  data() {
    return {
      schedules: [],          // Array untuk menyimpan jadwal pelayan altar
      loading: true,          // Status loading
      error: null,           // Pesan error jika ada
      
      breadcrumbItems: [
        { text: 'Jadwal Pelayan Altar', to: '/jadwal-peltar' }
      ]
    }
  },
  
  async created() {
    await this.fetchSchedules()
  },
  
  methods: {
    /**
     * Mengambil data jadwal pelayan altar dari service
     */
    async fetchSchedules() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [JadwalPeltarPage] Mengambil jadwal pelayan altar...')
        
        // Ambil semua jadwal pelayan altar
        const schedulesData = await getAltarServantsSchedules()
        
        console.log('✅ [JadwalPeltarPage] Jadwal berhasil dimuat:', schedulesData.length)
        if (schedulesData.length > 0) {
          console.log('🔍 [JadwalPeltarPage] Raw data sample:', schedulesData[0])
        }
        
        // Gunakan data langsung dari service (sudah clean)
        this.schedules = schedulesData
          .filter(schedule => schedule && schedule.id) // Filter out null/invalid items
        
        if (this.schedules.length > 0) {
          console.log('✅ [JadwalPeltarPage] Processed schedules count:', this.schedules.length)
          console.log('🔍 [JadwalPeltarPage] Schedule IDs:', this.schedules.map(s => s.id))
          console.log('🔍 [JadwalPeltarPage] Sample schedule:', this.schedules[0])
        }
        
        console.log('🔍 [JadwalPeltarPage] Processed schedules:', this.schedules.length)
      } catch (error) {
        console.error('❌ [JadwalPeltarPage] Error memuat jadwal:', error)
        this.error = 'Gagal memuat jadwal pelayan altar. Pastikan koneksi internet Anda stabil.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* ========================================
   CONTAINER UTAMA
========================================= */
.jadwal-peltar-container {
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

  /* === PAGE HEADER === */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .page-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #41442A;
    margin: 0;
  }

  .refresh-button {
    background: #8B7355;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .refresh-button:hover:not(:disabled) {
    background: #6d5a44;
    transform: translateY(-1px);
  }

  .refresh-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .refresh-icon {
    width: 16px;
    height: 16px;
  }

  /* Animasi putar untuk loading */
  .rotating {
    animation: rotate 1s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* === SCHEDULES GRID === */
  .schedules-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 40px;
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
    border-top: 4px solid #8B7355;
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
    color: #ddd;
    margin-bottom: 24px;
  }

  .empty-card h3 {
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #41442A;
    margin: 0 0 8px 0;
  }

  .empty-card p {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #666;
    margin: 0 0 24px 0;
  }

  .refresh-button-primary {
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

  .refresh-button-primary:hover {
    background: #6d5a44;
    transform: translateY(-1px);
  }

  /* === RESPONSIVE ADJUSTMENTS === */
  @media (max-width: 1024px) and (min-width: 769px) {
    .desktop-content {
      padding: 24px;
    }

    .page-title {
      font-size: 22px;
    }

    .schedules-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
  }

  @media (max-width: 950px) and (min-width: 769px) {
    .page-title {
      font-size: 20px;
    }

    .schedules-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }

  @media (max-width: 850px) and (min-width: 769px) {
    .desktop-content {
      padding: 20px;
    }

    .schedules-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }
}

/* ========================================
   MOBILE LAYOUT STYLES
========================================= */

.jadwal-peltar-wrapper {
  padding: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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

.error-content .retry-icon {
  width: 16px;
  height: 16px;
}

/* Schedules list mobile */
.schedules-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 100%;
}

/* Empty state mobile */
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 32px 16px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 280px;
}

.empty-content .empty-icon {
  width: 64px;
  height: 64px;
  color: #ddd;
}

.empty-content h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.empty-content p {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.empty-content .refresh-button {
  background: #8B7355;
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

.empty-content .refresh-button:hover {
  background: #6d5a44;
}

.empty-content .refresh-icon {
  width: 16px;
  height: 16px;
}

/* === ACCESSIBILITY === */
@media (prefers-reduced-motion: reduce) {
  .refresh-button,
  .retry-button,
  .refresh-button-primary {
    transition: none;
  }

  .refresh-button:hover,
  .retry-button:hover,
  .refresh-button-primary:hover {
    transform: none;
  }

  .loading-spinner {
    animation: none;
  }

  .rotating {
    animation: none;
  }
}

/* Responsive untuk HP kecil */
@media (max-width: 360px) {
  .jadwal-peltar-wrapper {
    padding: 12px;
  }
}
</style>
