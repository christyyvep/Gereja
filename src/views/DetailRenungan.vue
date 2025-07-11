<template>
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Memuat detail renungan...</p>
  </div>
  
  <div v-else-if="error" class="error-container">
    <HeaderWithBack title="Detail Renungan" />
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h3>Terjadi Kesalahan</h3>
      <p class="error-text">{{ error }}</p>
      <ButtonPrimary @click="fetchDevotionalDetail">Coba Lagi</ButtonPrimary>
    </div>
  </div>
  
  <DetailLayout
    v-else-if="devotional"
    header-title="Detail Renungan"
    :title="devotional.title || 'Renungan Tanpa Judul'"
    :description="devotional.content || 'Tidak ada konten'"
    :thumbnail="thumbnailSrc"
    :category="devotional.category"
    content-type="devotional"
    :breadcrumb-items="breadcrumbItems"
    :hide-back-button="false"
    :hide-content-badge="true"
  >
    <!-- Mobile-specific Title Section (tanpa bookmark button) -->
    <template #mobile-title-section>
      <div class="mobile-title-section">
        <h1 class="detail-title">{{ devotional.title }}</h1>
      </div>
    </template>

    <!-- Bacaan Alkitab dan Button Save -->
    <template #additional-info>
      <!-- Bible Reading Section -->
      <div class="bible-reading-section">
        <p class="bible-reading-title">BACAAN ALKITAB HARI INI</p>
        <p class="bible-verse">{{ devotional.verse || 'Yohanes 3:16' }}</p>
      </div>

      <!-- Button Save - Centered -->
      <div class="save-button-section">
        <ButtonPrimary @click="toggleBookmark" :class="{ 'bookmarked': isBookmarked }">
          <Bookmark class="bookmark-icon" :fill="isBookmarked ? 'white' : 'none'" />
          {{ isBookmarked ? 'Tersimpan' : 'Simpan' }}
        </ButtonPrimary>
      </div>
    </template>
  </DetailLayout>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import DetailLayout from '@/components/layout/DetailLayout.vue'
import ButtonPrimary from '@/components/common/ButtonPrimary.vue'
import { Bookmark } from 'lucide-vue-next'
import { getDevotional } from '@/services/devotionals'
import { getDevotionalThumbnail } from '@/utils/imageUtils'

export default {
  name: 'DetailRenungan',
  components: {
    HeaderWithBack,
    DetailLayout,
    ButtonPrimary,
    Bookmark
  },
  data() {
    return {
      devotional: null,
      loading: true,
      error: null,
      imageError: false,
      isBookmarked: false,
      breadcrumbItems: [
        {
          text: 'Renungan Harian',
          to: '/renungan'
        },
        {
          text: this.devotional?.title || 'Detail Renungan'
        }
      ]
    }
  },
  computed: {
    thumbnailSrc() {
      if (!this.devotional) return null
      return getDevotionalThumbnail(this.devotional)
    }
  },
  async created() {
    await this.fetchDevotionalDetail()
    this.checkBookmarkStatus()
  },
  methods: {
    async fetchDevotionalDetail() {
      try {
        this.loading = true
        this.error = null
        
        // Ambil ID dari route params
        const devotionalId = this.$route.params.id
        
        if (!devotionalId) {
          throw new Error('ID renungan tidak ditemukan')
        }
        
        console.log('🔍 [DetailRenungan] Fetching devotional ID:', devotionalId)
        
        // Ambil data detail dari Firebase
        const devotionalData = await getDevotional(devotionalId)
        
        console.log('✅ [DetailRenungan] Devotional loaded:', devotionalData.title)
        
        this.devotional = devotionalData
      } catch (error) {
        console.error('❌ [DetailRenungan] Error loading devotional:', error)
        this.error = 'Gagal memuat detail renungan. Pastikan koneksi internet Anda stabil.'
      } finally {
        this.loading = false
      }
    },
    
    onImageError() {
      console.log('🖼️ Image failed to load, showing placeholder')
      this.imageError = true
    },

    // ⭐ FITUR BOOKMARK BARU
    toggleBookmark() {
      const devotionalId = this.devotional.id
      let bookmarks = JSON.parse(localStorage.getItem('bookmarkedDevotionals')) || []
      
      if (this.isBookmarked) {
        // Remove bookmark
        bookmarks = bookmarks.filter(id => id !== devotionalId)
        this.isBookmarked = false
        console.log('❌ [DetailRenungan] Bookmark removed')
      } else {
        // Add bookmark
        bookmarks.push(devotionalId)
        this.isBookmarked = true
        console.log('✅ [DetailRenungan] Bookmark added')
      }
      
      localStorage.setItem('bookmarkedDevotionals', JSON.stringify(bookmarks))
    },

    checkBookmarkStatus() {
      if (!this.devotional) return
      
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedDevotionals')) || []
      this.isBookmarked = bookmarks.includes(this.devotional.id)
      
      console.log('🔍 [DetailRenungan] Bookmark status:', this.isBookmarked)
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
  color: #333;
  margin: 0;
}

.error-text {
  color: #d32f2f;
  font-family: 'Inter';
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

/* ===== MOBILE SPECIFIC STYLES ===== */

/* Mobile Title Section (simple, no bookmark) */
.mobile-title-section {
  margin-bottom: 16px;
}

.mobile-title-section .detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
  font-family: 'Inter';
  line-height: 1.3;
}

/* ===== SHARED STYLES (Mobile & Desktop) ===== */

/* Bible Reading Section */
.bible-reading-section {
  background: transparent;
  padding: 0;
  margin: 24px 0;
  border: none;
  box-shadow: none;
}

.bible-reading-title {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px 0;
  text-align: center;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.bible-verse {
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 500;
  color: #41442A;
  line-height: 1.5;
  margin: 0 0 24px 0;
  text-align: center;
  font-style: italic;
}

/* Save Button Section - Centered */
.save-button-section {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.save-button-section .bookmark-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

/* ButtonPrimary when bookmarked */
.save-button-section .bookmarked {
  background-color: #41442A !important;
  border-color: #41442A !important;
}

/* ===== RESPONSIVE BREAKPOINTS ===== */

/* Mobile adjustments */
@media (max-width: 768px) {
  .mobile-title-section .detail-title {
    font-size: 20px;
  }

  .bible-reading-title {
    font-size: 12px;
  }

  .bible-verse {
    font-size: 14px;
  }

  .save-button-section {
    margin: 20px 0;
  }
}

@media (max-width: 360px) {
  .mobile-title-section .detail-title {
    font-size: 18px;
  }

  .bible-reading-title {
    font-size: 11px;
  }

  .bible-verse {
    font-size: 13px;
  }
}

/* Desktop adjustments */
@media (min-width: 769px) {
  .bible-reading-section {
    margin: 32px 0;
  }

  .bible-reading-title {
    font-size: 16px;
  }

  .bible-verse {
    font-size: 18px;
    margin-bottom: 32px;
  }

  .save-button-section {
    margin: 32px 0;
  }
}
</style>