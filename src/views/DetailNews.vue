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
      :description="''"
      :thumbnail="''"
      :category="news.category"
      :contentType="'news'"
      :newsData="news"
    >
      <!-- Additional News Info Slot -->
      <template #additional-info>
        <div class="news-meta-info">
          <!-- Isi Berita (tanpa title) -->
          <div v-if="news.content" class="news-rich-content">
            <div class="content-body" v-html="formatContentWithParagraphs(news.content)"></div>
          </div>
          
          <!-- Meta Data: Tanggal, Waktu, Lokasi -->
          <div class="news-meta">
            <div class="meta-item">
              <span class="meta-label">Tanggal:</span>
              <span class="meta-value">{{ formatDate(news.date || news.createdAt) }}</span>
            </div>
            <div v-if="news.time" class="meta-item">
              <span class="meta-label">Waktu:</span>
              <span class="meta-value">{{ news.time }}</span>
            </div>
            <div v-if="news.location" class="meta-item">
              <span class="meta-label">Lokasi:</span>
              <span class="meta-value">{{ news.location }}</span>
            </div>
          </div>
          
          <!-- Additional Links - IMPROVED LOGIC -->
          <div v-if="hasValidLinks" class="news-links">
            <h4 class="links-title">Link Tambahan:</h4>
            <div class="links-list">
              <a 
                v-for="(link, index) in validLinks" 
                :key="index"
                :href="getLinkUrl(link)"
                target="_blank"
                rel="noopener noreferrer"
                class="link-item"
              >
                {{ getLinkText(link, index) }}
              </a>
            </div>
          </div>
          
          <!-- Debug Links (temporary) - DISABLED -->
          <div v-if="false && news.attachLinks" class="debug-links" style="background: #f0f0f0; padding: 10px; margin: 10px 0; font-size: 12px;">
            <strong>DEBUG - Links Data:</strong><br>
            Length: {{ news.attachLinks.length }}<br>
            Data: {{ JSON.stringify(news.attachLinks, null, 2) }}
          </div>
        </div>
      </template>
    </DetailLayout>
    
    <!-- Image Modal for Gallery (Tidak diperlukan lagi) -->
    <!-- Modal dihapus karena galeri tidak digunakan -->
  </div>
</template>

<script>
import DetailLayout from '@/components/layout/DetailLayout.vue'
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
      error: null
    }
  },
  
  async mounted() {
    await this.loadNews()
  },
  
  computed: {
    // ⭐ COMPUTED: Check if there are valid links
    hasValidLinks() {
      return this.validLinks.length > 0
    },
    
    // ⭐ COMPUTED: Filter out invalid/empty links
    validLinks() {
      if (!this.news?.attachLinks || !Array.isArray(this.news.attachLinks)) {
        return []
      }
      
      return this.news.attachLinks.filter(link => {
        if (!link) return false
        
        // If it's a string, it should be a valid URL
        if (typeof link === 'string') {
          return link.trim().length > 0 && this.isValidUrl(link.trim())
        }
        
        // If it's an object, it should have url property or be a valid URL string
        if (typeof link === 'object') {
          const url = link.url || link.link || link.href
          return url && typeof url === 'string' && url.trim().length > 0 && this.isValidUrl(url.trim())
        }
        
        return false
      })
    }
  },
  
  methods: {
    async loadNews() {
      this.loading = true
      this.error = null
      
      try {
        const newsId = this.$route.params.id
        
        console.log('🔄 [DetailNews] Route params:', this.$route.params)
        console.log('🔄 [DetailNews] Full route:', this.$route)
        
        if (!newsId) {
          throw new Error('ID berita tidak ditemukan dalam route')
        }
        
        console.log('🔄 [DetailNews] Loading news with ID:', newsId)
        
        // Use real news service
        this.news = await getNewsById(newsId)
        
        if (!this.news) {
          throw new Error(`Berita dengan ID "${newsId}" tidak ditemukan`)
        }
        
        console.log('✅ [DetailNews] News loaded successfully:', {
          id: this.news.id,
          title: this.news.title,
          category: this.news.category,
          hasImages: !!this.news.images,
          hasThumbnails: !!this.news.thumbnails,
          images: this.news.images,
          thumbnails: this.news.thumbnails
        })
        
        // ⭐ PERBAIKAN: Map thumbnails ke images jika images tidak ada
        if (!this.news.images && this.news.thumbnails) {
          console.log('🔄 [DetailNews] Mapping thumbnails to images field')
          this.news.images = this.news.thumbnails
        }
        
        // Debug: Check links data
        console.log('🔗 [DetailNews] Links data:', {
          attachLinks: this.news.attachLinks,
          attachLinksLength: this.news.attachLinks?.length,
          allFields: Object.keys(this.news)
        })
        
        // Debug: Check specific image URLs
        if (this.news.images) {
          console.log('🖼️ [DetailNews] Image URLs:')
          console.log('- cardDesktop:', this.news.images.cardDesktop)
          console.log('- cardMobile:', this.news.images.cardMobile) 
          console.log('- detailDesktop:', this.news.images.detailDesktop)
          console.log('- detailMobile:', this.news.images.detailMobile)
        } else {
          console.log('❌ [DetailNews] No images object found in news data')
        }
        
      } catch (error) {
        console.error('❌ [DetailNews] Error loading news:', error)
        this.error = error.message || 'Gagal memuat berita'
      } finally {
        this.loading = false
      }
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
    },
    
    // ⭐ METHOD: Get URL from link (supports both string and object)
    getLinkUrl(link) {
      if (typeof link === 'string') {
        return link.trim()
      }
      
      if (typeof link === 'object') {
        return link.url || link.link || link.href || ''
      }
      
      return ''
    },
    
    // ⭐ METHOD: Get display text for link
    getLinkText(link, index) {
      if (typeof link === 'string') {
        // For string URLs, use a friendly display name
        return `Link ${index + 1}`
      }
      
      if (typeof link === 'object') {
        // Try various description fields
        const text = link.description || link.title || link.name || link.label || link.text
        if (text && text.trim()) {
          return text.trim()
        }
        
        // Fallback to URL or generic name
        const url = link.url || link.link || link.href
        if (url) {
          // Try to extract domain name for display
          try {
            const domain = new URL(url).hostname.replace('www.', '')
            return domain || `Link ${index + 1}`
          } catch {
            return `Link ${index + 1}`
          }
        }
      }
      
      return `Link ${index + 1}`
    },
    
    // ⭐ METHOD: Validate URL
    isValidUrl(string) {
      try {
        new URL(string)
        return true
      } catch {
        // Check if it's a relative URL or missing protocol
        if (string.includes('.') && !string.includes(' ')) {
          return true
        }
        return false
      }
    },

    // ⭐ METHOD: Format content with proper paragraph spacing
    formatContentWithParagraphs(content) {
      if (!content) return ''
      
      // If content already contains HTML tags, return as is
      if (content.includes('<p>') || content.includes('<div>') || content.includes('<br>')) {
        return content
      }
      
      // Convert plain text with line breaks to HTML paragraphs
      const paragraphs = content
        .split(/\n\s*\n/) // Split on double line breaks (paragraph breaks)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => {
          // Convert single line breaks within paragraphs to <br>
          const formattedParagraph = paragraph.replace(/\n/g, '<br>')
          return `<p>${formattedParagraph}</p>`
        })
      
      return paragraphs.join('')
    },
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

.content-body {
  line-height: 1.7;
  color: #4a5568;
  font-size: 1rem;
}

.content-body p {
  margin-bottom: 1.2rem;
  line-height: 1.7;
}

.content-body p:last-child {
  margin-bottom: 0;
}

.content-body br {
  line-height: 2;
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
   GALLERY STYLES (TIDAK DIGUNAKAN)
========================================= */

/* Galeri foto dihapus karena admin tidak upload galeri */

/* ========================================
   NEWS LINKS STYLES
========================================= */

.news-links {
  margin-bottom: 2rem;
}

.links-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-item {
  color: #6366F1;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: background-color 0.2s, border-color 0.2s;
  font-size: 0.875rem;
}

.link-item:hover {
  background-color: #f7fafc;
  border-color: #6366F1;
  text-decoration: underline;
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
  
  .links-list {
    gap: 0.375rem;
  }
  
  .link-item {
    font-size: 0.8rem;
    padding: 0.375rem 0.5rem;
  }
}
</style>
