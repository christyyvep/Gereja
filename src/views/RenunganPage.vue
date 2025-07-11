<template>
  <div class="renungan-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- Desktop Navbar -->
      <DesktopNavbar />

      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- Breadcrumb -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <div class="page-header">
          <h1 class="page-title">Renungan Harian</h1>
          <div class="header-actions">
            <ButtonPrimary @click="goToBookmarks" class="bookmark-button-small">
              <Bookmark class="bookmark-icon" />
              Bookmark
            </ButtonPrimary>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="loading-container desktop-loading">
          <div class="loading-spinner"></div>
          <p>Memuat renungan harian...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container desktop-error">
          <div class="error-card">
            <AlertCircle class="error-icon" />
            <h3>Terjadi Kesalahan</h3>
            <p class="error-text">{{ error }}</p>
            <button @click="fetchDevotionals" class="retry-button">
              <RefreshCw /> Coba Lagi
            </button>
          </div>
        </div>

        <!-- Devotionals Grid -->
        <div v-else-if="devotionals.length > 0" class="devotionals-grid">
          <ContentCard
            v-for="devotional in devotionals" 
            :key="devotional.id"
            :item="devotional"
            content-type="devotional"
            layout="desktop-grid"
            size="large"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="empty-container desktop-empty">
          <div class="empty-card">
            <BookOpen class="empty-icon" />
            <h3>Belum Ada Renungan</h3>
            <p>Saat ini belum ada renungan harian yang tersedia.</p>
            <ButtonPrimary @click="fetchDevotionals">
              <RefreshCw /> Refresh
            </ButtonPrimary>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <div class="renungan-wrapper">
        <!-- Header dengan tombol back dan bookmark -->
        <div class="custom-header">
          <HeaderWithBack title="Renungan" />
          <button class="bookmark-nav-btn" @click="goToBookmarks" aria-label="Lihat Bookmark">
            <Bookmark class="bookmark-nav-icon" />
          </button>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <p>Memuat renungan harian...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <p class="error-text">{{ error }}</p>
          <ButtonPrimary @click="fetchDevotionals">Coba Lagi</ButtonPrimary>
        </div>

        <!-- Content ketika ada data -->
        <div v-else-if="devotionals.length > 0" class="devotionals-content">  
          <!-- Daftar renungan menggunakan ContentCard -->
          <div class="devotionals-list">
            <ContentCard
              v-for="devotional in devotionals" 
              :key="devotional.id"
              :item="devotional"
              content-type="devotional"
              layout="mobile-list"
              size="small"
            />
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-container">
          <div class="empty-content">
            <BookOpen class="empty-icon" />
            <h3>Belum Ada Renungan</h3>
            <p>Saat ini belum ada renungan harian yang tersedia.</p>
            <ButtonPrimary @click="fetchDevotionals">Refresh</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
// Desktop Layout Components
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import ContentCard from '@/components/common/ContentCard.vue'
import { 
  BookOpen, 
  Bookmark, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-vue-next'
import { getDevotionals } from '@/services/devotionals'

export default {
  name: 'RenunganPage',
  components: {
    HeaderWithBack,
    ButtonPrimary,
    DesktopNavbar,
    BreadcrumbDesktop,
    ContentCard,
    BookOpen,
    Bookmark,
    RefreshCw,
    AlertCircle
  },

  data() {
    return {
      devotionals: [],
      loading: true,
      error: null,
      // Breadcrumb data
      breadcrumbItems: [
        {
          text: 'Renungan Harian'
        }
      ]
    }
  },
  async created() {
    // Load data renungan ketika komponen dibuat
    await this.fetchDevotionals()
  },
  methods: {
    async fetchDevotionals() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [RenunganPage] Fetching devotionals...')
        
        // Ambil data dari Firebase (sudah terurut dari terbaru)
        const devotionalsData = await getDevotionals(20) // Ambil maksimal 20 renungan
        
        console.log('✅ [RenunganPage] Devotionals loaded:', devotionalsData.length)
        console.log('📅 [RenunganPage] Data already sorted by newest first from database')
        
        this.devotionals = devotionalsData
      } catch (error) {
        console.error('❌ [RenunganPage] Error loading devotionals:', error)
        this.error = 'Gagal memuat renungan. Pastikan koneksi internet Anda stabil.'
      } finally {
        this.loading = false
      }
    },

    goToBookmarks() {
      this.$router.push('/renungan/bookmarks')
    }
  }
}
</script>

<style scoped>
.renungan-container {
  background: #fcfcf7;
  min-height: 100vh;
}

/* =================
   DESKTOP LAYOUT 
   ================= */
.desktop-layout {
  display: none;
}

@media (min-width: 768px) {
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none;
  }
}

.desktop-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  padding-top: 40px; /* Space for fixed navbar - sama dengan NewsPage */
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

.page-title {
  font-family: 'Inter';
  font-size: 32px;
  font-weight: 700;
  color: #41442A;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Custom styling untuk ButtonPrimary kecil */
.bookmark-button-small {
  padding: 8px 16px !important;
  font-size: 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  height: auto !important;
  min-height: 36px !important;
  line-height: 1 !important;
}

.bookmark-button-small span {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  line-height: 1 !important;
}

.bookmark-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Desktop Loading */
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Desktop Error */
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
  color: #d32f2f;
}

.error-card h3 {
  font-family: 'Inter';
  font-size: 20px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #41442A;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #2d2f1c;
}

/* Desktop Devotionals Grid */
.devotionals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

/* Desktop Empty State */
.desktop-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.empty-card .empty-icon {
  width: 64px;
  height: 64px;
  color: #ccc;
}

.empty-card h3 {
  font-family: 'Inter';
  font-size: 24px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
}

.empty-card p {
  font-family: 'Inter';
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* =================
   MOBILE LAYOUT 
   ================= */
.mobile-layout {
  display: block;
}

@media (min-width: 768px) {
  .mobile-layout {
    display: none;
  }
}

.renungan-wrapper {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
}

/* Custom Header dengan Bookmark Nav */
.custom-header {
  position: relative;
  margin-bottom: 18px;
}

.bookmark-nav-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bookmark-nav-btn:hover {
  transform: scale(1.1);
}

.bookmark-nav-btn:active {
  transform: scale(0.9);
}

.bookmark-nav-icon {
  width: 20px;
  height: 20px;
  color: #41442A;
}

/* Mobile Loading state */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-family: 'Inter';
  color: #666;
}

/* Mobile Error state */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 16px;
  text-align: center;
}

.error-text {
  color: #d32f2f;
  font-family: 'Inter';
  font-size: 14px;
  margin: 0;
}

/* Mobile Content area */
.devotionals-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.devotionals-list {
  display: flex;
  flex-direction: column;
}

/* Mobile Empty state */
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

.empty-icon {
  width: 64px;
  height: 64px;
  color: #ccc;
  margin-bottom: 8px;
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

/* Responsive */
@media (max-width: 360px) {
  .renungan-wrapper {
    padding: 12px;
  }
}
</style>