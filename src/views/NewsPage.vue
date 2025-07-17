<template>
  <div class="news-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <!-- ✅ GUNAKAN COMPONENT - GANTI SELURUH NAVBAR -->
      <DesktopNavbar />

      <!-- Desktop Content -->
      <main class="desktop-content">
        <!-- ✅ TAMBAH BREADCRUMB -->
        <BreadcrumbDesktop :items="breadcrumbItems" />
        
        <div class="page-header">
          <h1 class="page-title">Berita & Pengumuman</h1>
          <button @click="fetchNews" class="refresh-button" :disabled="loading">
            <RefreshCw :class="{ 'rotating': loading }" />
            <span>Refresh</span>
          </button>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="loading-container desktop-loading">
          <div class="loading-spinner"></div>
          <p>Memuat berita terbaru...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container desktop-error">
          <div class="error-card">
            <AlertCircle class="error-icon" />
            <h3>Terjadi Kesalahan</h3>
            <p class="error-text">{{ error }}</p>
            <button @click="fetchNews" class="retry-button">
              <RefreshCw /> Coba Lagi
            </button>
          </div>
        </div>

        <!-- News Grid -->
        <div v-else-if="news.length > 0" class="news-grid">
          
          <ContentCard
            v-for="newsItem in news" 
            :key="newsItem.id"
            :item="newsItem"
            :content-type="'news'"
            :layout="'desktop-grid'"
            :size="'card-desktop'"
            @click="navigateToDetail"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="empty-container desktop-empty">
          <div class="empty-card">
            <Newspaper class="empty-icon" />
            <h3>Belum Ada Berita</h3>
            <p>Saat ini belum ada berita atau pengumuman yang tersedia.</p>
            <button @click="fetchNews" class="refresh-button-primary">
              <RefreshCw /> Refresh
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Layout (existing) -->
    <div class="mobile-layout">
      <div class="news-wrapper">
        <!-- Header dengan tombol back -->
        <HeaderWithBack title="News" />

        <!-- Loading state -->
        <div v-if="loading" class="loading-container">
          <p>Memuat berita terbaru...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-container">
          <p class="error-text">{{ error }}</p>
          <ButtonPrimary @click="fetchNews">Coba Lagi</ButtonPrimary>
        </div>

        <!-- Content ketika ada data -->
        <div v-else-if="news.length > 0" class="news-content">
          
          <!-- ✅ GANTI KE CONTENTCARD -->
          <div class="news-list">
            <ContentCard
              v-for="newsItem in news" 
              :key="newsItem.id"
              :item="newsItem"
              :content-type="'news'"
              :layout="'mobile-list'"
              :size="'card-mobile'"
              @click="navigateToDetail"
            />
          </div>
        </div>

        <!-- Empty state ketika tidak ada data -->
        <div v-else class="empty-container">
          <div class="empty-content">
            <Newspaper class="empty-icon" />
            <h3>Belum Ada Berita</h3>
            <p>Saat ini belum ada berita atau pengumuman yang tersedia.</p>
            <ButtonPrimary @click="fetchNews">Refresh</ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
// ✅ TAMBAH IMPORT COMPONENT
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import ContentCard from '@/components/common/ContentCard.vue'
import { 
  Newspaper,
  RefreshCw, 
  AlertCircle, 
} from 'lucide-vue-next'
import { getNews } from '@/services/news' 

export default {
  name: 'NewsPage',
  components: {
    HeaderWithBack,
    ButtonPrimary,
    DesktopNavbar, // ✅ DAFTAR COMPONENT
    BreadcrumbDesktop, // ✅ BREADCRUMB COMPONENT
    ContentCard, // ✅ NEW UNIVERSAL CARD
    Newspaper,
    RefreshCw,
    AlertCircle
  },
  data() {
    return {
      news: [],
      loading: true,
      error: null,
      windowWidth: window.innerWidth, // ✅ DEBUG: Track window width
      // ✅ BREADCRUMB DATA
      breadcrumbItems: [
        {
          text: 'Berita & Pengumuman'
        }
      ]
    }
  },
  async created() {
    await this.fetchNews()
  },
  methods: {
    async fetchNews() {
      try {
        this.loading = true
        this.error = null
        
        console.log('🔍 [NewsPage] Starting fetchNews...')
        console.log('🔍 [NewsPage] getNews function:', typeof getNews)
        
        const newsData = await getNews(20)
        
        console.log('✅ [NewsPage] News loaded:', newsData)
        console.log('✅ [NewsPage] News count:', newsData?.length)
        
        if (newsData && Array.isArray(newsData)) {
          this.news = newsData
          console.log('✅ [NewsPage] News data set successfully')
        } else {
          console.warn('⚠️ [NewsPage] Invalid news data format:', newsData)
          this.news = []
        }
        
      } catch (error) {
        console.error('❌ [NewsPage] Error loading news:', error)
        console.error('❌ [NewsPage] Error stack:', error.stack)
        this.error = 'Gagal memuat berita. Pastikan koneksi internet Anda stabil.'
        this.news = []
      } finally {
        this.loading = false
        console.log('🏁 [NewsPage] fetchNews completed, final state:', {
          loading: this.loading,
          error: this.error,
          newsCount: this.news.length
        })
      }
    },

    // ✅ SIMPLIFIED NAVIGATION METHOD
    async navigateToDetail(newsItem) {
      console.log('📰 [NewsPage] Navigation triggered for:', newsItem?.title)
      
      // Simple validation
      if (!newsItem?.id) {
        console.warn('⚠️ [NewsPage] Cannot navigate: missing news ID')
        return
      }
      
      // Simple navigation
      try {
        await this.$router.push(`/news/${newsItem.id}`)
        console.log('✅ [NewsPage] Navigation completed')
      } catch (error) {
        // Ignore NavigationDuplicated errors (when user clicks multiple times)
        if (error.name !== 'NavigationDuplicated') {
          console.error('❌ [NewsPage] Navigation error:', error.message)
        }
      }
    }
  }
}
</script>

<style scoped>
/* Container */
.news-container {
  background: #fcfcf7;
  min-height: 100vh;
}

/* Default: Show mobile, hide desktop */
.desktop-layout {
  display: none;
}

.mobile-layout {
  display: block;
}

/* ========================================
   DESKTOP LAYOUT (≥769px) - NAVBAR CSS DIHAPUS
========================================= */

@media (min-width: 769px) {
  /* === DESKTOP LAYOUT BASE === */
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

  .refresh-button svg {
    width: 16px;
    height: 16px;
  }

  .rotating {
    animation: rotate 1s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* === NEWS GRID === */
  .news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
  }

  /* === LOADING STATE === */
  .desktop-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 16px;
  }

  .desktop-loading p {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #f0f0f0;
    border-top-color: #8B7355;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* === ERROR STATE === */
  .desktop-error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .error-card {
    background: white;
    padding: 48px;
    border-radius: 12px;
    text-align: center;
    max-width: 400px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }

  .error-icon {
    width: 64px;
    height: 64px;
    color: #f44336;
    margin-bottom: 16px;
  }

  .error-card h3 {
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .error-card .error-text {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #666;
    margin: 0 0 24px 0;
  }

  .retry-button {
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

  .retry-button:hover {
    background: #6d5a44;
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

    .news-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
  }

  /* === SMALL DESKTOP (769px - 950px) === */
  @media (max-width: 950px) and (min-width: 769px) {
    .page-title {
      font-size: 20px;
    }
  }
}

/* ========================================
   MOBILE LAYOUT STYLES (≤768px) - TETAP SAMA
========================================= */
@media (max-width: 768px) {
  .news-wrapper {
    padding: 16px;
    max-width: 360px;
    margin: 0 auto;
    padding-bottom: 80px;
  }

  /* Loading state */
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    font-family: 'Inter';
    color: #666;
    font-size: 14px;
  }

  /* Error state */
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

  /* Content area */
  .news-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .news-list {
    display: flex;
    flex-direction: column;
  }

  /* Empty state */
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
    .news-wrapper {
      padding: 12px;
    }
  }
}
</style>