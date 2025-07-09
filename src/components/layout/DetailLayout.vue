<template>
  <div class="detail-container">
    <!-- Desktop Layout -->
    <div class="desktop-layout" v-show="isDesktop">
      <!-- Desktop Navbar -->
      <DesktopNavbar />

      <!-- Desktop Main Content -->
      <main class="desktop-main">
        <!-- Breadcrumb Navigation -->
        <BreadcrumbDesktop :items="computedBreadcrumbItems" />
        
        <!-- Desktop Detail Content -->
        <div class="desktop-detail-wrapper">
          <!-- Desktop Content Card -->
          <div class="desktop-detail-card">
            <!-- Desktop Image Section -->
            <div class="desktop-image-section">
              <img 
                v-if="thumbnailSrc && !imageError" 
                :src="thumbnailSrc" 
                :alt="title"
                class="desktop-detail-image"
                @error="onImageError"
                @load="onImageLoad"
              />
              <div v-else class="desktop-image-placeholder">
                <component :is="contentIcon" class="placeholder-icon" />
                <span class="placeholder-text">{{ title.charAt(0) }}</span>
              </div>
            </div>

            <!-- Desktop Content Section -->
            <div class="desktop-content-section">
              <!-- Title moved here -->
              <div class="content-block">
                <h1 class="desktop-detail-title">{{ title }}</h1>
              </div>
              
              <!-- Main Description -->
              <div class="content-block">
                <div class="content-text">
                  <p>{{ description }}</p>
                </div>
              </div>

              <!-- Extra Content Slot -->
              <div v-if="hasExtraContent" class="content-block">
                <slot name="additional-info"></slot>
              </div>

              <!-- Closing Message -->
              <div v-if="closing" class="content-block">
                <p class="simple-closing-text">{{ closing }}</p>
              </div>
            </div>

            <!-- Desktop Action Buttons -->
            <div v-if="$slots['action-buttons']" class="desktop-action-section">
              <slot name="action-buttons"></slot>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Layout -->
    <div class="mobile-layout" v-show="isMobile">
      <!-- Header dengan tombol back -->
      <HeaderWithBack 
        :title="headerTitle" 
        :customBackAction="customBackAction"
      />

      <!-- Thumbnail besar -->
      <div class="detail-thumbnail">
        <img 
          v-if="thumbnailSrc && !imageError" 
          :src="thumbnailSrc" 
          :alt="title"
          class="thumbnail-img"
          @error="onImageError"
        />
        <!-- Fallback jika gambar tidak ada -->
        <div v-else class="thumbnail-placeholder">
          <span>{{ title.charAt(0) }}</span>
        </div>
      </div>

      <!-- Content area -->
      <div class="detail-content">
        <!-- Title -->
        <h1 class="detail-title">{{ title }}</h1>

        <!-- Description -->
        <div class="detail-description">
          <p>{{ description }}</p>
        </div>

        <!-- Additional content dari parent (jika ada) -->
        <div class="detail-extra">
          <slot name="additional-info"></slot>
        </div>

        <!-- Action buttons slot -->
        <div class="detail-actions">
          <slot name="action-buttons"></slot>
        </div>

        <!-- Related content slot -->
        <div class="detail-related">
          <slot name="related-content"></slot>
        </div>

        <!-- Closing -->
        <div v-if="closing" class="detail-closing">
          <p class="simple-closing-text">{{ closing }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import DesktopNavbar from '@/components/layout/DesktopNavbar.vue'
import BreadcrumbDesktop from '@/components/common/BreadcrumbDesktop.vue'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Download, 
  Share2,
  Newspaper,
  CalendarDays,
  BookOpen,
  Heart
} from 'lucide-vue-next'
import { getNewsThumbnail, getScheduleThumbnail, getDevotionalThumbnail, getGivingThumbnail } from '@/utils/imageUtils'

export default {
  name: 'DetailLayout',
  components: {
    HeaderWithBack,
    DesktopNavbar,
    BreadcrumbDesktop,
    ArrowLeft,
    Calendar,
    User,
    Download,
    Share2,
    Newspaper,
    CalendarDays,
    BookOpen,
    Heart
  },
  props: {
    // Basic props
    headerTitle: {
      type: String,
      default: 'Detail'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    },
    contentType: {
      type: String,
      default: '',
      validator: (value) => ['', 'news', 'schedule', 'devotional', 'jadwal', 'renungan', 'giving'].includes(value)
    },
    closing: {
      type: String,
      default: ''
    },

    // UI Control props
    hideBackButton: {
      type: Boolean,
      default: false
    },
    hideContentBadge: {
      type: Boolean,
      default: false
    },

    // News/Devotional specific props
    publishDate: {
      type: String,
      default: ''
    },
    author: {
      type: String,
      default: ''
    },

    // Breadcrumb props
    breadcrumbItems: {
      type: Array,
      default: () => []
    },

    // Custom back action
    customBackAction: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      imageError: false,
      screenWidth: window.innerWidth
    }
  },
  computed: {
    isDesktop() {
      return this.screenWidth >= 768
    },
    
    isMobile() {
      return this.screenWidth < 768
    },

    thumbnailSrc() {
      let detectedType = this.contentType
      
      console.log('🔍 DetailLayout thumbnailSrc:', {
        contentType: this.contentType,
        detectedType,
        thumbnail: this.thumbnail,
        category: this.category
      })
      
      // Auto-detect dari headerTitle jika contentType kosong
      if (!detectedType && this.headerTitle) {
        if (this.headerTitle.toLowerCase().includes('news') || this.headerTitle.toLowerCase().includes('berita')) {
          detectedType = 'news'
        } else if (this.headerTitle.toLowerCase().includes('jadwal') || this.headerTitle.toLowerCase().includes('schedule')) {
          detectedType = 'schedule'
        } else if (this.headerTitle.toLowerCase().includes('renungan') || this.headerTitle.toLowerCase().includes('devotional')) {
          detectedType = 'devotional'
        } else if (this.headerTitle.toLowerCase().includes('giving') || this.headerTitle.toLowerCase().includes('persembahan')) {
          detectedType = 'giving'
        }
      }
      
      console.log('🎯 Final detectedType:', detectedType)
      
      // Check if thumbnail is already a valid URL
      if (this.thumbnail) {
        if (this.thumbnail.startsWith('http') || 
            this.thumbnail.startsWith('data:') || 
            this.thumbnail.startsWith('blob:') ||
            this.thumbnail.includes('/')) {
          console.log('📸 Using direct URL:', this.thumbnail)
          return this.thumbnail
        }
      }
      
      // Create object for imageUtils
      const itemObject = {
        thumbnail: this.thumbnail,
        category: this.category,
        title: this.title
      }
      
      console.log('📦 ItemObject for imageUtils:', itemObject)
      
      // Use imageUtils for proper file resolution
      switch (detectedType) {
        case 'news': {
          console.log('📰 Using getNewsThumbnail')
          return getNewsThumbnail(itemObject)
        }
        case 'schedule':
        case 'jadwal': {
          console.log('📅 Using getScheduleThumbnail')
          return getScheduleThumbnail(itemObject)
        }
        case 'devotional':
        case 'renungan': {
          console.log('🙏 Using getDevotionalThumbnail')
          return getDevotionalThumbnail(itemObject)
        }
        case 'giving': {
          console.log('💝 Using getGivingThumbnail')
          return getGivingThumbnail(itemObject)
        }
        default: {
          console.log('📰 Using default getNewsThumbnail')
          return getNewsThumbnail(itemObject)
        }
      }
    },

    // Detect content type for desktop display
    detectedContentType() {
      if (this.contentType) return this.contentType
      
      if (this.headerTitle) {
        if (this.headerTitle.toLowerCase().includes('berita') || this.headerTitle.toLowerCase().includes('news')) {
          return 'news'
        } else if (this.headerTitle.toLowerCase().includes('jadwal') || this.headerTitle.toLowerCase().includes('schedule')) {
          return 'schedule'
        } else if (this.headerTitle.toLowerCase().includes('renungan') || this.headerTitle.toLowerCase().includes('devotional')) {
          return 'devotional'
        } else if (this.headerTitle.toLowerCase().includes('giving') || this.headerTitle.toLowerCase().includes('persembahan')) {
          return 'giving'
        }
      }
      return 'content'
    },

    contentTypeLabel() {
      switch (this.detectedContentType) {
        case 'news': return 'Berita & Pengumuman'
        case 'schedule': case 'jadwal': return 'Jadwal Kegiatan'
        case 'devotional': case 'renungan': return 'Renungan Harian'
        case 'giving': return 'Persembahan & Persepuluhan'
        default: return 'Konten'
      }
    },

    contentIcon() {
      switch (this.detectedContentType) {
        case 'news': return 'Newspaper'
        case 'schedule': case 'jadwal': return 'CalendarDays'
        case 'devotional': case 'renungan': return 'BookOpen'
        case 'giving': return 'Heart'
        default: return 'Newspaper'
      }
    },

    contentSectionTitle() {
      switch (this.detectedContentType) {
        case 'news': return 'Isi Berita'
        case 'schedule': case 'jadwal': return 'Deskripsi Kegiatan'
        case 'devotional': case 'renungan': return 'Renungan'
        default: return 'Deskripsi'
      }
    },

    downloadButtonText() {
      switch (this.detectedContentType) {
        case 'news': return 'Unduh PDF'
        case 'schedule': case 'jadwal': return 'Tambah ke Kalender'
        case 'devotional': case 'renungan': return 'Simpan Renungan'
        default: return 'Unduh'
      }
    },

    backButtonText() {
      switch (this.detectedContentType) {
        case 'news': return 'Kembali ke Berita'
        case 'schedule': case 'jadwal': return 'Kembali ke Jadwal'
        case 'devotional': case 'renungan': return 'Kembali ke Renungan'
        default: return 'Kembali'
      }
    },

    computedBreadcrumbItems() {
      // If parent provides breadcrumb items, use those
      if (this.breadcrumbItems && this.breadcrumbItems.length > 0) {
        return this.breadcrumbItems
      }

      // Auto-generate breadcrumb based on content type
      const breadcrumbs = []
      
      switch (this.detectedContentType) {
        case 'news':
          breadcrumbs.push({ text: 'Berita', to: '/news' })
          break
        case 'schedule':
        case 'jadwal':
          breadcrumbs.push({ text: 'Jadwal', to: '/home' })
          break
        case 'devotional':
        case 'renungan':
          breadcrumbs.push({ text: 'Renungan', to: '/home' })
          break
        default:
          breadcrumbs.push({ text: 'Konten' })
      }
      
      // Add current page
      breadcrumbs.push({ text: this.title })
      
      return breadcrumbs
    },

    hasExtraContent() {
      return !!this.$slots['additional-info']
    },

    hasRelatedContent() {
      return !!this.$slots['related-content']
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  
  methods: {
    handleResize() {
      this.screenWidth = window.innerWidth
    },

    onImageError() {
      this.imageError = true
    },

    onImageLoad() {
      // Image loaded successfully
    },

    handleBackNavigation() {
      if (this.customBackAction) {
        this.customBackAction()
      } else {
        // Default back navigation
        if (this.$route.query.from) {
          this.$router.push(this.$route.query.from)
        } else {
          // Navigate based on content type
          switch (this.detectedContentType) {
            case 'news':
              this.$router.push('/news')
              break
            case 'schedule':
            case 'jadwal':
              this.$router.push('/home')
              break
            case 'devotional':
            case 'renungan':
              this.$router.push('/home')
              break
            default:
              this.$router.go(-1)
          }
        }
      }
    }
  }
}
</script>

<style scoped>
/* Base container */
.detail-container {
  background: #fcfcf7;
  min-height: 100vh;
  width: 100%;
}

/* ========================================
   DESKTOP LAYOUT
========================================= */
.desktop-layout {
  display: none;
  width: 100%;
  min-height: 100vh;
  background: #fcfcf7;
}

@media screen and (min-width: 768px) {
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none;
  }
}

/* Desktop main content */
.desktop-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  background: #fcfcf7;
  width: 100%;
  box-sizing: border-box;
}

/* Desktop detail wrapper */
.desktop-detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

/* Desktop detail card */
.desktop-detail-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
}

/* Desktop image section */
.desktop-image-section {
  width: 100%;
  height: 400px;
  overflow: hidden;
  position: relative;
}

.desktop-detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.desktop-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  color: #666;
}

.placeholder-text {
  font-family: 'Inter', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #41442A;
}

/* Desktop content section */
.desktop-content-section {
  padding: 32px 32px 32px 32px;
}

.content-block {
  margin-bottom: 24px;
}

.content-block:last-child {
  margin-bottom: 0;
}

.content-block h2 {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0 0 16px 0;
}

.desktop-detail-title {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #2d2d2d;
  line-height: 1.2;
  margin: 0 0 16px 0;
}

.content-text p {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #4a4a4a;
  margin: 0;
}

/* Simple closing text */
.simple-closing-text {
  font-family: 'Inter';
  font-size: 16px;
  font-weight: 500;
  color: #4a4a4a;
  margin: 0;
  text-align: center;
}

/* Desktop action section */
.desktop-action-section {
  padding: 32px;
  background: #fafafa;
}

/* ========================================
   MOBILE LAYOUT
========================================= */
.mobile-layout {
  display: block;
  width: 100%;
  background: #fcfcf7;
  padding-top: 16px; /* Tambah padding atas untuk header */
}

@media screen and (min-width: 768px) {
  .mobile-layout {
    display: none;
  }
}

/* Mobile thumbnail - UBAH DARI 250px JADI 200px */
.detail-thumbnail {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: #41442A;
}

/* Mobile content */
.detail-content {
  background: white;
  margin: -20px 16px 16px 16px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}

.detail-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #2d2d2d;
  line-height: 1.3;
  margin: 0 0 16px 0;
}

.detail-description p {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #4a4a4a;
  margin: 0 0 20px 0;
}

.detail-extra,
.detail-actions,
.detail-related {
  margin-top: 20px;
}

.detail-closing {
  margin-top: 24px;
  padding: 16px;
  text-align: center;
}

.detail-closing .simple-closing-text {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 500;
  color: #4a4a4a;
  margin: 0;
}

/* ========================================
   TABLET RESPONSIVE (768px - 1024px)
========================================= */
@media (max-width: 1024px) and (min-width: 768px) {
  .desktop-main {
    padding: 24px 20px;
  }
  
  .desktop-detail-title {
    font-size: 24px;
  }
  
  .desktop-image-section {
    height: 320px;
  }
  
  .desktop-action-section {
    padding: 28px;
  }
  
  .content-block h2 {
    font-size: 20px;
  }
  
  .content-text p {
    font-size: 15px;
  }
}
</style>