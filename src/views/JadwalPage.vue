<template>
  <div class="jadwal-container">
    <!-- Desktop Layout (sama seperti NewsPage) -->
    <div class="desktop-layout">
      <!-- ✅ NAVBAR: Seperti kotak navigasi di atas -->
      <DesktopNavbar />

      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- ✅ BREADCRUMB: Seperti petunjuk jalan "Home > Kalender" -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <!-- Header dengan judul dan tombol refresh -->
        <div class="page-header">
          <h1 class="page-title">Jadwal Kegiatan</h1>
          <button @click="fetchSchedules" class="refresh-button" :disabled="loading">
            <RefreshCw :class="{ 'rotating': loading }" />
            <span>Refresh</span>
          </button>
        </div>

        <!-- Loading state: Seperti loading di game -->
        <div v-if="loading" class="loading-container desktop-loading">
          <div class="loading-spinner"></div>
          <p>Memuat jadwal kegiatan...</p>
        </div>

        <!-- Error state: Kalau ada masalah -->
        <div v-else-if="error" class="error-container desktop-error">
          <div class="error-card">
            <AlertCircle class="error-icon" />
            <h3>Terjadi Kesalahan</h3>
            <p class="error-text">{{ error }}</p>
            <button @click="fetchSchedules" class="retry-button">
              <RefreshCw /> Coba Lagi
            </button>
          </div>
        </div>

        <!-- Schedules Grid: Seperti kotak-kotak jadwal -->
        <div v-else-if="schedules.length > 0" class="schedules-grid">
          <ContentCard
            v-for="schedule in schedules" 
            :key="schedule.id"
            :item="schedule"
            content-type="schedule"
            layout="desktop-grid"
            size="large"
            :hideCategory="true"
            :hideDate="true"
          />
        </div>

        <!-- Empty state: Kalau tidak ada jadwal -->
        <div v-else class="desktop-empty">
          <div class="empty-card">
            <CalendarDays class="empty-icon" />
            <h3>Belum Ada Jadwal</h3>
            <p>Tidak ada jadwal kegiatan yang tersedia saat ini.</p>
            <button @click="fetchSchedules" class="refresh-button-primary">
              <RefreshCw />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Layout (yang sudah ada) -->
    <div class="mobile-layout">
      <div class="jadwal-wrapper">
        <HeaderWithBack title="Jadwal Kegiatan" />
        <!-- Loading state mobile -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Memuat jadwal kegiatan...</p>
        </div>

        <!-- Error state mobile -->
        <div v-else-if="error" class="error-container">
          <AlertCircle class="error-icon" />
          <p class="error-text">{{ error }}</p>
          <ButtonPrimary @click="fetchSchedules">Coba Lagi</ButtonPrimary>
        </div>

        <!-- Schedules content mobile -->
        <div v-else-if="schedules.length > 0" class="schedules-list">
          <ContentCard
            v-for="schedule in schedules" 
            :key="schedule.id"
            :item="schedule"
            content-type="schedule"
            layout="mobile-list"
            size="small"
          />
        </div>

        <!-- Empty state mobile -->
        <div v-else class="empty-container">
          <div class="empty-content">
            <CalendarDays class="empty-icon" />
            <h3>Belum Ada Jadwal</h3>
            <p>Tidak ada jadwal kegiatan yang tersedia untuk ditampilkan.</p>
            <ButtonPrimary @click="fetchSchedules">Refresh</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import ContentCard from '@/components/common/ContentCard.vue'
import { 
  CalendarDays,
  RefreshCw, 
  AlertCircle, 
} from 'lucide-vue-next'
import { getWeeklyWorshipOverview } from '@/services/schedules'

export default {
  name: 'JadwalPage',
  
  // Daftarkan komponen yang akan dipakai (seperti daftar alat)
  components: {
    HeaderWithBack,
    ButtonPrimary,
    DesktopNavbar,        
    BreadcrumbDesktop,    
    ContentCard,          
    CalendarDays,
    RefreshCw,
    AlertCircle
  },
  
  // Data yang dibutuhkan halaman ini
  data() {
    return {
      schedules: [],          // Array untuk menyimpan jadwal
      loading: true,          // Status loading
      error: null,           // Pesan error jika ada
      
      breadcrumbItems: [
        {
          text: 'Jadwal Ibadah'  // Halaman saat ini
        }
      ]
    }
  },
  
  // Dijalankan saat halaman pertama kali dimuat
  async created() {
    await this.fetchSchedules()
  },
  
  // Fungsi-fungsi yang bisa dipanggil
  methods: {
    // Fungsi untuk mengambil data jadwal (seperti mengambil data dari database)
    async fetchSchedules() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [JadwalPage] Mengambil jadwal...')
        
        // Ambil semua jadwal untuk minggu ini
        const schedulesData = await getWeeklyWorshipOverview()
        
        console.log('✅ [JadwalPage] Jadwal berhasil dimuat:', schedulesData.length)
        
        this.schedules = schedulesData
      } catch (error) {
        console.error('❌ [JadwalPage] Error memuat jadwal:', error)
        this.error = 'Gagal memuat jadwal. Pastikan koneksi internet Anda stabil.'
      } finally {
        this.loading = false
      }
    },
    
    // Fungsi untuk mendapatkan teks minggu ini
    getCurrentWeekText() {
      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
      
      return `${this.formatDateID(startOfWeek)} - ${this.formatDateID(endOfWeek)}`
    },
    
    // Helper untuk format tanggal Indonesia
    formatDateID(date) {
      const day = date.getDate()
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      const month = months[date.getMonth()]
      
      return `${day} ${month}`
    }
  }
}
</script>

<style scoped>
/* ========================================
   CONTAINER UTAMA
========================================= */
.jadwal-container {
  background: #fcfcf7;  /* Warna latar belakang yang lembut */
  min-height: 100vh;    /* Tinggi minimal full screen */
}

/* ========================================
   LAYOUT RESPONSIVENESS
   Seperti switch untuk ganti tampilan desktop/mobile
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
   Kalau layar besar, pakai tampilan desktop
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
    max-width: 1200px;     /* Lebar maksimal */
    margin: 0 auto;        /* Tengah-tengah */
    padding: 40px;         /* Jarak dari tepi */
  }

  /* === PAGE HEADER === */
  .page-header {
    display: flex;                    /* Susun horizontal */
    justify-content: space-between;   /* Judul di kiri, tombol di kanan */
    align-items: center;              /* Sejajar tengah */
    margin-bottom: 32px;              /* Jarak ke bawah */
  }

  .page-title {
    font-family: 'Inter', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #41442A;
    margin: 0;
  }

  .refresh-button {
    background: #8B7355;              /* Warna tombol */
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
    transition: all 0.2s;            /* Animasi halus */
  }

  .refresh-button:hover:not(:disabled) {
    background: #6d5a44;
    transform: translateY(-1px);     /* Efek naik sedikit */
  }

  .refresh-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .refresh-button svg {
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
    display: grid;                           /* Layout grid */
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));  /* Kolom otomatis */
    gap: 24px;                              /* Jarak antar kotak */
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

  .retry-button svg {
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

  .refresh-button-primary svg {
    width: 16px;
    height: 16px;
  }

  /* === RESPONSIVE ADJUSTMENTS === */
  /* Tablet (769px - 1024px) */
  @media (max-width: 1024px) and (min-width: 769px) {
    .desktop-content {
      padding: 24px;
    }

    .page-title {
      font-size: 22px;
    }

    .refresh-button {
      font-size: 11px;
      padding: 8px 16px;
    }

    .schedules-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
  }

  /* Small Desktop (769px - 950px) */
  @media (max-width: 950px) and (min-width: 769px) {
    .page-title {
      font-size: 20px;
    }

    .schedules-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
  }

  /* Very Small Desktop (769px - 850px) */
  @media (max-width: 850px) and (min-width: 769px) {
    .desktop-content {
      padding: 20px;
    }

    .schedules-grid {
      grid-template-columns: 1fr;  /* Satu kolom aja */
    }
  }
}

/* ========================================
   MOBILE LAYOUT STYLES
   (Yang sudah ada sebelumnya)
========================================= */

.jadwal-wrapper {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
}

/* Loading state mobile */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-family: 'Inter';
  color: #666;
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

/* Content area */
.schedules-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.week-info {
  background: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.week-info h3 {
  font-family: 'Inter';
  font-size: 18px;
  font-weight: 600;
  color: #41442A;
  margin: 0 0 8px 0;
}

.week-info p {
  font-family: 'Inter';
  font-size: 14px;
  color: #666;
  margin: 0;
}

.schedules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

/* High contrast mode */
@media (prefers-contrast: high) {
  .desktop-content {
    background: white;
  }

  .page-title {
    color: #000;
  }

  .refresh-button,
  .retry-button,
  .refresh-button-primary {
    border: 2px solid #000;
  }
}

/* Print styles */
@media print {
  .desktop-layout {
    display: block !important;
  }
  
  .mobile-layout {
    display: none !important;
  }
  
  .refresh-button,
  .retry-button,
  .refresh-button-primary {
    display: none;
  }
}

/* Responsive untuk HP kecil */
@media (max-width: 360px) {
  .jadwal-wrapper {
    padding: 12px;
  }
}
</style>