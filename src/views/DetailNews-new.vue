<template>
  <div class="detail-news-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Memuat berita...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Gagal Memuat Berita</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-button" @click="loadNews">
          <span>Coba Lagi</span>
        </button>
      </div>
    </div>
    
    <!-- News Content using DetailLayout -->
    <DetailLayout
      v-else-if="news"
      :headerTitle="'Detail Berita'"
      :title="news.title"
      :description="getNewsDescription"
      :thumbnail="getNewsThumbnailUrl"
      :category="news.category"
      :contentType="'news'"
      :newsData="news"
    >
      <!-- Additional News Info Slot -->
      <template #additional-info>
        <div class="news-meta-info">
          <!-- Date and Category -->
          <div class="news-meta">
            <div class="meta-item">
              <span class="meta-label">Tanggal:</span>
              <span class="meta-value">{{ formatDate(news.date || news.createdAt) }}</span>
            </div>
            <div v-if="news.category" class="meta-item">
              <span class="meta-label">Kategori:</span>
              <span class="meta-value">{{ news.category }}</span>
            </div>
            <div v-if="news.author" class="meta-item">
              <span class="meta-label">Penulis:</span>
              <span class="meta-value">{{ news.author }}</span>
            </div>
          </div>
          
          <!-- Rich Content -->
          <div v-if="news.content" class="news-rich-content">
            <h3 class="content-title">Detail Berita</h3>
            <div class="content-body" v-html="news.content"></div>
          </div>
          
          <!-- Additional Images Gallery -->
          <div v-if="hasGalleryImages" class="news-gallery">
            <h3 class="gallery-title">Galeri Foto</h3>
            <div class="gallery-grid">
              <div 
                v-for="(image, index) in getGalleryImages" 
                :key="index"
                class="gallery-item"
                @click="openImageModal(image)"
              >
                <img :src="image.url" :alt="image.caption || `Gambar ${index + 1}`" />
                <div v-if="image.caption" class="gallery-caption">{{ image.caption }}</div>
              </div>
            </div>
          </div>
          
          <!-- Tags -->
          <div v-if="news.tags && news.tags.length > 0" class="news-tags">
            <h4 class="tags-title">Tag Berita:</h4>
            <div class="tags-list">
              <span v-for="tag in news.tags" :key="tag" class="tag-item">{{ tag }}</span>
            </div>
          </div>
        </div>
      </template>
    </DetailLayout>
    
    <!-- Image Modal for Gallery -->
    <div v-if="selectedImage" class="image-modal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeImageModal">&times;</button>
        <img :src="selectedImage.url" :alt="selectedImage.caption" />
        <div v-if="selectedImage.caption" class="modal-caption">
          {{ selectedImage.caption }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DetailLayout from '@/components/layout/DetailLayout.vue'
import { getNewsThumbnail } from '@/utils/imageUtils'
import { getNewsById } from '@/services/news'

export default {
  name: 'DetailNews',
  components: {
    DetailLayout
  },
  
  data() {
    return {
      news: null,
      loading: true,
      error: null,
      selectedImage: null
    }
  },
  
  computed: {
    // Get news description with fallback
    getNewsDescription() {
      if (!this.news) return ''
      
      // Use summary first, then description
      return this.news.summary || this.news.description || 'Deskripsi tidak tersedia'
    },
    
    // Get the appropriate thumbnail for DetailLayout
    getNewsThumbnailUrl() {
      if (!this.news) return ''
      
      try {
        // DetectLayout will handle device-specific thumbnails automatically
        // We'll pass the news object and let the layout component decide
        console.log('🖼️ [DetailNews] Getting thumbnail for DetailLayout')
        
        // For detail view, prefer detail thumbnails
        const isMobile = window.innerWidth < 768
        const thumbnailType = isMobile ? 'detail-mobile' : 'detail-desktop'
        
        return getNewsThumbnail(this.news, thumbnailType)
      } catch (error) {
        console.error('❌ [DetailNews] Error getting thumbnail:', error)
        return ''
      }
    },
    
    // Check if news has gallery images (excluding main thumbnails)
    hasGalleryImages() {
      if (!this.news) return false
      
      // Check both old format (images) and new format (thumbnails)
      const images = this.news.images || {}
      const thumbnails = this.news.thumbnails || {}
      
      // Look for any additional images beyond the main 4 thumbnails
      const imageKeys = Object.keys(images).filter(key => 
        !['cardDesktop', 'cardMobile', 'detailDesktop', 'detailMobile'].includes(key)
      )
      
      const thumbnailKeys = Object.keys(thumbnails).filter(key => 
        !['cardDesktop', 'cardMobile', 'detailDesktop', 'detailMobile'].includes(key)
      )
      
      return imageKeys.length > 0 || thumbnailKeys.length > 0
    },
    
    // Get gallery images for display
    getGalleryImages() {
      if (!this.hasGalleryImages) return []
      
      const galleryImages = []
      
      // Add from legacy images field
      if (this.news.images) {
        Object.keys(this.news.images).forEach(key => {
          if (!['cardDesktop', 'cardMobile', 'detailDesktop', 'detailMobile'].includes(key)) {
            galleryImages.push({
              url: this.news.images[key],
              caption: `Gambar ${key}`,
              key: key
            })
          }
        })
      }
      
      // Add from new thumbnails field
      if (this.news.thumbnails) {
        Object.keys(this.news.thumbnails).forEach(key => {
          if (!['cardDesktop', 'cardMobile', 'detailDesktop', 'detailMobile'].includes(key)) {
            galleryImages.push({
              url: this.news.thumbnails[key],
              caption: `Gambar ${key}`,
              key: key
            })
          }
        })
      }
      
      return galleryImages
    }
  },
  
  async mounted() {
    await this.loadNews()
  },
  
  methods: {
    async loadNews() {
      this.loading = true
      this.error = null
      
      try {
        const newsId = this.$route.params.id
        
        if (!newsId) {
          throw new Error('ID berita tidak ditemukan')
        }
        
        console.log('🔄 [DetailNews] Loading news with ID:', newsId)
        
        // Use real news service
        this.news = await getNewsById(newsId)
        
        console.log('✅ [DetailNews] News loaded successfully:', this.news.title)
        
      } catch (error) {
        console.error('❌ [DetailNews] Error loading news:', error)
        this.error = error.message || 'Gagal memuat berita'
      } finally {
        this.loading = false
      }
    },
    
    openImageModal(image) {
      this.selectedImage = image
      console.log('🖼️ [DetailNews] Opening image modal:', image.key)
    },
    
    closeImageModal() {
      this.selectedImage = null
    },
    
    formatDate(dateValue) {
      if (!dateValue) return 'Tanggal tidak tersedia'
      
      try {
        let date
        
        // Handle different date formats
        if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
          // Firestore timestamp
          date = new Date(dateValue.seconds * 1000)
        } else if (typeof dateValue === 'string') {
          date = new Date(dateValue)
        } else if (dateValue instanceof Date) {
          date = dateValue
        } else {
          return 'Tanggal tidak tersedia'
        }

        if (isNaN(date.getTime())) {
          return 'Tanggal tidak tersedia'
        }

        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
        
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
      } catch (error) {
        console.error('❌ [DetailNews] Error formatting date:', error)
        return 'Tanggal tidak tersedia'
      }
    }
  }
}
</script>

<style scoped>
/* ========================================
   DETAIL NEWS SPECIFIC STYLES
========================================= */

.detail-news-container {
  background: #fcfcf7;
  min-height: 100vh;
}

/* ========================================
   LOADING & ERROR STATES
========================================= */

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6366F1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 1rem;
  color: #666;
  font-size: 1rem;
}

.error-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  color: #ef4444;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.error-message {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.retry-button {
  background: #6366F1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #4F46E5;
}

/* ========================================
   NEWS META INFO STYLES
========================================= */

.news-meta-info {
  margin-top: 1.5rem;
}

.news-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-label {
  font-weight: 600;
  color: #4a5568;
  min-width: 80px;
}

.meta-value {
  color: #2d3748;
}

/* ========================================
   NEWS CONTENT STYLES
========================================= */

.news-rich-content {
  margin-bottom: 2rem;
}

.content-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.content-body {
  line-height: 1.6;
  color: #4a5568;
}

.content-body p {
  margin-bottom: 1rem;
}

.content-body h1, .content-body h2, .content-body h3 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #2d3748;
}

.content-body ul, .content-body ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

/* ========================================
   GALLERY STYLES
========================================= */

.news-gallery {
  margin-bottom: 2rem;
}

.gallery-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.gallery-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.gallery-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.gallery-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.gallery-caption {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #4a5568;
  background: white;
}

/* ========================================
   TAGS STYLES
========================================= */

.news-tags {
  margin-bottom: 2rem;
}

.tags-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: #e2e8f0;
  color: #4a5568;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* ========================================
   IMAGE MODAL STYLES
========================================= */

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.modal-content img {
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 24px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-caption {
  padding: 1rem;
  background: white;
  color: #2d3748;
  font-size: 0.875rem;
  border-top: 1px solid #e2e8f0;
}

/* ========================================
   RESPONSIVE DESIGN
========================================= */

@media (max-width: 768px) {
  .news-meta {
    padding: 0.75rem;
  }
  
  .meta-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .meta-label {
    min-width: auto;
    font-size: 0.875rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }
  
  .gallery-item img {
    height: 120px;
  }
  
  .tags-list {
    gap: 0.375rem;
  }
  
  .tag-item {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
