<!-- src/components/common/ContentCard.vue -->
<!-- Universal Card Component untuk News, Jadwal, Renungan, dll -->
<template>
    <article 
      :class="['content-card', layoutClass, `type-${contentType}`]" 
      @click="handleClick"
    >
      <!-- Thumbnail Section -->
      <div :class="['card-thumbnail', sizeClass]">
        <OptimizedImage
          :src="thumbnailUrl"
          :alt="(item && (item.title || item.name)) || 'Image'"
          :size="computedThumbnailSize"
          :use-lazy-loading="true"
          :use-blur-placeholder="true"
          :show-loading-spinner="false"
          class="thumbnail-img"
          @error="handleImageError"
        />
        
        <!-- Category Badge (kalau ada) - ONLY FOR DESKTOP -->
        <span 
          v-if="categoryLabel && layout === 'desktop-grid' && !hideCategory" 
          :class="['category-badge', `category-${(item && item.category) || 'default'}`]"
        >
          {{ categoryLabel }}
        </span>
      </div>
  
      <!-- Content Section -->
      <div class="card-content">
        <!-- Title -->
        <h3 class="card-title">{{ (item && (item.title || item.name)) || 'Untitled' }}</h3>
        
        <!-- Subtitle/Description - ONLY FOR DESKTOP -->
        <p v-if="subtitle && layout === 'desktop-grid'" class="card-subtitle">{{ subtitle }}</p>
        
        <!-- Meta Info untuk Mobile/List -->
        <div v-if="layout !== 'desktop-grid'" class="card-meta">
          <span v-if="formattedDate" class="meta-date">
            <Calendar class="meta-icon" />
            {{ formattedDate }}
          </span>
          <span v-if="item && item.time" class="meta-time">
            <Clock class="meta-icon" />
            {{ item.time }}
          </span>
        </div>
        
        <!-- Action Button untuk Desktop Grid -->
        <div 
          v-if="layout === 'desktop-grid'" 
          class="desktop-footer"
        >
          <!-- Date -->
          <span v-if="formattedDate && !hideDate" class="footer-date">
            <Calendar class="date-icon" />
            {{ formattedDate }}
          </span>
          
          <!-- Action Button -->
          <button 
            class="action-button"
            @click.stop="handleClick"
          >
            {{ actionText }} <ArrowRight class="action-icon" />
          </button>
        </div>
      </div>
  
      <!-- Arrow untuk Mobile/List Layout -->
      <div v-if="layout !== 'desktop-grid'" class="card-arrow">
        <ChevronRight class="arrow-icon" />
      </div>
    </article>
  </template>
  
  <script>
  import { Calendar, Clock, ArrowRight, ChevronRight } from 'lucide-vue-next'
  import { getNewsThumbnail, getScheduleThumbnail, getDevotionalThumbnail } from '@/utils/imageUtils'
  import OptimizedImage from '@/components/common/OptimizedImage.vue'
  
  export default {
    name: 'ContentCard',
    
    components: {
      Calendar,
      Clock, 
      ArrowRight,
      ChevronRight,
      OptimizedImage
    },
    
    props: {
      // Main data object
      item: {
        type: Object,
        required: true
      },
      
      // Content type untuk styling dan behavior yang berbeda
      contentType: {
        type: String,
        default: 'news',
        validator: value => ['news', 'schedule', 'devotional', 'announcement'].includes(value)
      },
      
      // Layout mode
      layout: {
        type: String,
        default: 'mobile-list',
        validator: value => ['mobile-list', 'desktop-grid', 'desktop-list'].includes(value)
      },
      
      // Thumbnail size
      size: {
        type: String,
        default: 'small',
        validator: value => ['small', 'large'].includes(value)
      },
      
      // Custom click handler
      onClick: {
        type: Function,
        default: null
      },

      // New props for hiding elements
      hideCategory: {
        type: Boolean,
        default: false
      },
      
      hideDate: {
        type: Boolean,
        default: false
      }
    },
    
    computed: {
      layoutClass() {
        return `layout-${this.layout}`
      },
      
      sizeClass() {
        return `size-${this.size}`
      },
      
      // 🎯 RESPONSIVE THUMBNAIL SIZE COMPUTATION
      computedThumbnailSize() {
        // ✅ RESPONSIF: Gunakan window width untuk menentukan size yang tepat
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
          console.log('📱 [ContentCard] Mobile detected, using card-mobile')
          return 'card-mobile' // 80x80 untuk mobile
        } else {
          console.log('🖥️ [ContentCard] Desktop detected, using card-desktop')
          return 'card-desktop' // 400x250 untuk desktop
        }
      },
      
      thumbnailUrl() {
        // Check if item exists
        if (!this.item) {
          console.warn('⚠️ [ContentCard] No item provided for thumbnail')
          return this.getFallbackImage()
        }
        
        console.log(`🖼️ [ContentCard] Getting thumbnail for "${this.item?.title}" with computed size: ${this.computedThumbnailSize}`)
        
        // 🎯 MENGGUNAKAN LOGIC YANG SAMA DENGAN DETAILLAYOUT - SUPPORT ALL CONTENT TYPES
        if (this.item && (this.item.images || this.item.thumbnails)) {
          const images = this.item.images || this.item.thumbnails
          let selectedImage = null
          
          console.log('📦 [ContentCard] Available images from item:', images)
          console.log('📦 [ContentCard] Field used:', this.item.images ? 'images' : 'thumbnails')
          console.log('🏷️ [ContentCard] Content type:', this.contentType)
          
          // ✅ SELECTION berdasarkan computed size
          if (this.computedThumbnailSize === 'card-desktop') {
            selectedImage = images.cardDesktop || images.detailDesktop 
            console.log('�️ [ContentCard] Desktop - using:', selectedImage)
          } else {
            selectedImage = images.cardMobile || images.detailMobile
            console.log('📱 [ContentCard] Mobile - using:', selectedImage)
          }
          
          if (selectedImage) {
            console.log('✅ [ContentCard] Using direct image selection:', selectedImage)
            // Smart cache - tidak perlu force refresh untuk performa
            return selectedImage
          }
          
          console.log('❌ [ContentCard] No image found for', this.computedThumbnailSize, '- available images:', Object.keys(images))
        }
        
        // ✅ FALLBACK: Gunakan function getNewsThumbnail seperti sebelumnya
        let result
        switch (this.contentType) {
          case 'news':
          case 'announcement':
            result = getNewsThumbnail(this.item, this.computedThumbnailSize)
            break
          case 'schedule':
            result = getScheduleThumbnail(this.item, this.computedThumbnailSize)
            break
          case 'devotional':
            result = getDevotionalThumbnail(this.item, this.computedThumbnailSize)
            break
          default:
            result = getNewsThumbnail(this.item, this.computedThumbnailSize)
        }
        
        console.log(`✅ [ContentCard] Final thumbnail URL:`, result)
        return result
      },
      
      categoryLabel() {
        if (!this.item || !this.item.category) return null
        
        // 🚫 TIDAK MENAMPILKAN KATEGORI UNTUK DEVOTIONAL/RENUNGAN
        if (this.contentType === 'devotional') {
          return null
        }
        
        // Category labels berdasarkan content type
        const labels = {
          news: {
            // === KATEGORI NEWS (sama dengan AnnouncementCard) ===
            'undangan': 'Undangan',
            'birthday': 'Ulang Tahun', 
            'event': 'Event',
            'pengumuman': 'Pengumuman',
            'kegiatan': 'Kegiatan',
            'ibadah': 'Ibadah',
            
            // === LEGACY/FALLBACK ===
            'general': 'Umum',
            'info': 'Info',
            'acara': 'Acara',
            'penting': 'Penting'
          },
          schedule: {
            // === KATEGORI JADWAL (sama dengan AnnouncementCard) ===
            'minggu raya': 'Minggu Raya',
            'pelprap': 'PELPRAP',
            'sektor tesalonika': 'Sektor Tesalonika',
            'sektor anugerah': 'Sektor Anugerah', 
            'pelnap': 'PELNAP',
            'pendalaman alkitab': 'Pendalaman Alkitab',
            'doa dan puasa': 'Doa dan Puasa',
            'pelwap': 'PELWAP',
            'pelprip': 'PELPRIP',
            'doa membangunkan fajar': 'Doa Membangunkan Fajar',
            
            // === LEGACY ===
            'ibadah': 'Ibadah',
            'doa': 'Doa',
            'fellowship': 'Fellowship',
            'event': 'Acara'
          }
        }
        
        const typeLabels = labels[this.contentType] || labels.news
        return typeLabels[this.item?.category?.toLowerCase()] || this.item?.category
      },
      
      subtitle() {
        if (!this.item) return null
        
        // Generate subtitle berdasarkan content type
        switch (this.contentType) {
          case 'news':
          case 'announcement':
            return this.getPreviewText(this.item.content || this.item.desc)
          case 'schedule':
            return this.item.description || this.item.location
          case 'devotional':
            return this.item.verse || this.item.subtitle
          default:
            return this.item.description || this.item.content
        }
      },
      
      formattedDate() {
        if (!this.item) return null
        
        const dateValue = this.item.createdAt || this.item.date || this.item.updatedAt
        if (!dateValue) return null
        
        return this.formatDate(dateValue)
      },
      
      actionText() {
        const texts = {
          news: 'Baca Selengkapnya',
          schedule: 'Lihat Detail',
          devotional: 'Baca Renungan',
          announcement: 'Lihat Pengumuman'
        }
        return texts[this.contentType] || 'Lihat Detail'
      }
    },
    
    methods: {
      handleClick() {
        if (this.onClick) {
          this.onClick(this.item)
        } else {
          // Default navigation berdasarkan content type
          const routes = {
            news: `/news/${this.item.id}`,
            schedule: `/jadwal/${this.item.id}`, 
            devotional: `/renungan/${this.item.id}`,
            announcement: `/news/${this.item.id}`
          }
          
          const route = routes[this.contentType]
          if (route) {
            this.$router.push(route)
          }
        }
      },
      
      handleImageError(e) {
        console.warn('🖼️ [ContentCard] Image load error for:', e.target?.src)
        
        // Smart retry - hanya retry sekali dengan delay
        if (!e.target?.dataset?.retried) {
          e.target.dataset.retried = 'true'
          setTimeout(() => {
            const cacheBuster = `&retry=${Date.now()}`
            const originalSrc = e.target.src
            if (originalSrc && !originalSrc.includes('&retry=')) {
              e.target.src = originalSrc + cacheBuster
              console.log('🔄 [ContentCard] Retrying with cache bust:', e.target.src)
            }
          }, 1000)
          return
        }
        
        // Fallback berdasarkan content type
        switch (this.contentType) {
          case 'news':
          case 'announcement':
            e.target.src = getNewsThumbnail()
            break
          case 'schedule':
            e.target.src = getScheduleThumbnail()
            break
          case 'devotional':
            e.target.src = getDevotionalThumbnail()
            break
        }
      },
      
      getPreviewText(content) {
        if (!content) return 'Klik untuk membaca selengkapnya...'
        const plainText = content.replace(/<[^>]*>/g, '')
        const maxLength = this.layout === 'desktop-grid' ? 120 : 80
        return plainText.length > maxLength 
          ? plainText.substring(0, maxLength) + '...' 
          : plainText
      },
        formatDate(dateValue) {
        if (!dateValue) return 'Tanggal tidak tersedia'
        
        try {
          let date
          
          // Handle Firebase Timestamp
          if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
            date = new Date(dateValue.seconds * 1000)
          } 
          // Handle ISO string or regular date string
          else if (typeof dateValue === 'string') {
            date = new Date(dateValue)
          }
          // Handle Date object
          else if (dateValue instanceof Date) {
            date = dateValue
          }
          else {
            return 'Tanggal tidak tersedia'
          }

          // Check if date is valid
          if (isNaN(date.getTime())) {
            return 'Tanggal tidak tersedia'
          }

          const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
            'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
          ]
          
          return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
        } catch (error) {
          console.error('Error formatting date:', error)
          return 'Tanggal tidak tersedia'
        }
      },
      
      // 🎯 FALLBACK IMAGE GENERATOR
      getFallbackImage() {
        const isSmall = this.computedThumbnailSize === 'card-mobile'
        const width = isSmall ? 80 : 400
        const height = isSmall ? 80 : 250
        
        // Generate simple SVG erar
        const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${width}" height="${height}" fill="#f5f5f5"/>
          <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dominant-baseline="middle">📰 News</text>
        </svg>`
        
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      }
    }
  }
  </script>
  
  <style scoped>
  /* ========================================
     BASE CARD STYLES - HORIZONTAL LAYOUT
  ========================================= */
  .content-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    /* ✅ LAYOUT HORIZONTAL: Thumbnail di kiri, content di kanan */
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }
  
  .content-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  /* ========================================
     THUMBNAIL STYLES - KOTAK DI KIRI
  ========================================= */
  .card-thumbnail {
    position: relative;
    overflow: hidden;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    /* ✅ THUMBNAIL FIXED SIZE - KOTAK DI KIRI */
    flex-shrink: 0;
  }
  
  .thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .content-card:hover .thumbnail-img {
    transform: scale(1.05);
  }
  
  /* Size variants - RESPONSIVE HORIZONTAL LAYOUT */
  .size-small {
    width: 80px;
    min-width: 80px;
    height: 80px;
  }
  
  .size-large {
    width: 100px;
    min-width: 100px;
    height: 100px;
  }
  
  /* ✅ RESPONSIVE: Desktop bisa lebih besar */
  @media (min-width: 768px) {
    .size-large {
      width: 120px;
      min-width: 120px;
      height: 150px;
    }
  }
  
  /* ========================================
     CATEGORY & DATE BADGES
  ========================================= */
  .category-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(65, 68, 42, 0.9);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  /* Category colors - SINKRON DENGAN ANNOUNCEMENTCARD */
  /* Kategori Jadwal */
  .category-minggu-raya { background: rgba(76, 81, 191, 0.9); }          /* Deep blue-purple */
  .category-pelprap { background: rgba(229, 62, 62, 0.9); }              /* Deep red-pink */
  .category-sektor-tesalonika { background: rgba(43, 108, 176, 0.9); }   /* Deep blue */
  .category-sektor-anugerah { background: rgba(4, 120, 87, 0.9); }       /* Deep green */
  .category-pelnap { background: rgba(220, 38, 38, 0.9); }               /* Deep red-orange */
  .category-pendalaman-alkitab { background: rgba(124, 58, 237, 0.9); }  /* Deep purple */
  .category-doa-dan-puasa { background: rgba(8, 145, 178, 0.9); }        /* Deep cyan */
  .category-pelwap { background: rgba(190, 24, 93, 0.9); }               /* Deep pink-red */
  .category-pelprip { background: rgba(146, 64, 14, 0.9); }              /* Deep brown-yellow */
  .category-doa-membangunkan-fajar { background: rgba(124, 45, 18, 0.9); } /* Deep orange-red */
  
  /* Kategori News - HIGH CONTRAST */
  .category-undangan { background: rgba(76, 81, 191, 0.9); }             /* Deep blue-purple */
  .category-birthday { background: rgba(220, 38, 38, 0.9); }             /* Deep red-orange */
  .category-event { background: rgba(219, 39, 119, 0.9); }               /* Deep pink */
  .category-pengumuman { background: rgba(8, 145, 178, 0.9); }           /* Deep cyan */
  .category-kegiatan { background: rgba(5, 150, 105, 0.9); }             /* Deep green */
  .category-ibadah { background: rgba(124, 58, 237, 0.9); }              /* Deep purple */
  
  /* Legacy/Fallback categories */
  .category-general { background: rgba(33, 150, 243, 0.9); }             /* Blue */
  .category-info { background: rgba(33, 150, 243, 0.9); }                /* Blue */
  .category-acara { background: rgba(219, 39, 119, 0.9); }               /* Deep pink (sama dengan event) */
  .category-penting { background: rgba(244, 67, 54, 0.9); }              /* Red */
  
  /* Default fallback */
  .category-default { background: rgba(76, 81, 191, 0.9); }              /* Deep blue-purple */
  
  /* ========================================
     CONTENT STYLES - HORIZONTAL LAYOUT
  ========================================= */
  .card-content {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 8px;
    min-height: 80px; /* Match dengan thumbnail small */
  }
  
  /* ✅ RESPONSIVE: Desktop content height */
  @media (min-width: 768px) {
    .card-content {
      min-height: 120px; /* Match dengan thumbnail large desktop */
    }
  }
  
  .card-title {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.3;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .card-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: #666;
    line-height: 1.4;
    margin: 0;
    /* Batasi ke 1 baris saja */
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* ========================================
     META STYLES
  ========================================= */
  .card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
  }
  
  .meta-date,
  .meta-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;
    font-family: 'Inter', sans-serif;
  }
  
  .meta-icon {
    width: 12px;
    height: 12px;
  }
  
  /* ========================================
     DESKTOP FOOTER (DATE + ACTION)
  ========================================= */
  .desktop-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px; /* Diperkecil dari 16px */
    padding-top: 8px; /* Diperkecil dari 16px */
    border-top: 1px solid #f0f0f0;
  }
  
  .footer-date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;
    font-family: 'Inter', sans-serif;
  }
  
  .footer-date .date-icon {
    width: 12px;
    height: 12px;
  }
  
  /* ========================================
     ACTION BUTTON
  ========================================= */
  .action-button {
    background: none;
    border: none;
    color: #41442A;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
    transition: all 0.2s ease;
  }
  
  .action-button:hover {
    color: #5a5e3d;
    transform: translateX(2px);
  }
  
  .action-icon {
    width: 14px;
    height: 14px;
  }
  
  /* ========================================
     ARROW STYLES
  ========================================= */
  .card-arrow {
    padding: 16px;
    display: flex;
    align-items: center;
    align-self: stretch;
  }
  
  .arrow-icon {
    width: 16px;
    height: 16px;
    color: #999;
    transition: color 0.2s ease;
  }
  
  .content-card:hover .arrow-icon {
    color: #41442A;
  }
  
  /* ========================================
     LAYOUT VARIANTS
  ========================================= */
  
  /* Mobile List Layout (horizontal - thumbnail mengisi tinggi card, content di kanan) */
  .layout-mobile-list {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    height: 80px; /* Fixed height untuk card */
    margin-bottom: 8px;
  }
  
  .layout-mobile-list .card-thumbnail {
    width: 80px;
    min-width: 80px;
    height: 100%; /* Mengisi tinggi penuh card */
    flex-shrink: 0;
  }
  
  .layout-mobile-list .card-content {
    height: 100%; /* Mengisi tinggi penuh card */
    justify-content: center;
    padding: 0px 12px; /* Kurangi padding untuk lebih banyak space */
    flex: 1;
    overflow: hidden; /* Prevent content overflow */
    display: flex;
    flex-direction: column;
  }
  
  /* Mobile title styling - lebih kecil dan line-clamp ketat */
  .layout-mobile-list .card-title {
    font-size: 13px;
    line-height: 1.1;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    max-height: 2.2em; /* 2 lines with line-height 1.1 */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    margin: 0;
  }
  
  /* Hide subtitle dan meta untuk mobile */
  .layout-mobile-list .card-subtitle,
  .layout-mobile-list .card-meta {
    display: none;
  }
  
  /* Desktop Grid Layout (compact seperti gambar 1) */
  .layout-desktop-grid {
    display: flex;
    flex-direction: column;
    height: auto;
    min-height: 360px; /* Diperkecil dari 500px */
    max-height: 400px; /* Diperkecil dari 560px */
  }
  
  .layout-desktop-grid .card-thumbnail {
    height: 226px; /* Tinggi thumbnail sesuai permintaan 403x226 */
    width: 100%;
    max-width: 403px; /* Lebar maksimal sesuai permintaan */
  }
  
  .layout-desktop-grid .card-content {
    flex: 1;
    padding: 12px; /* Diperkecil dari 16px */
    display: flex;
    flex-direction: column;
    gap: 6px; /* Diperkecil dari 8px */
    min-height: 100px; /* Ditambahkan untuk membatasi tinggi content */
  }
  
  .layout-desktop-grid .card-title {
    font-size: 15px; /* Lebih kecil dari 16px */
    line-height: 1.3;
    margin-bottom: 4px; /* Diperkecil dari 8px */
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .layout-desktop-grid .card-subtitle {
    font-size: 13px; 
    line-height: 1.4;
    margin-bottom: 8px; /* Diperkecil dari 12px */
    color: #666;
    /* Batasi ke 1 baris saja untuk desktop grid */
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Desktop List Layout (alternative) */
  .layout-desktop-list {
    display: flex;
    align-items: center;
    height: 120px;
    margin-bottom: 16px;
  }
  
  .layout-desktop-list .size-large {
    width: 120px;
    min-width: 120px;
    height: 120px;
  }
  
  .layout-desktop-list .card-content {
    padding: 20px;
    min-height: 120px;
  }
  
  /* ========================================
     CONTENT TYPE VARIANTS
  ========================================= */
  /* Schedule specific styles */
  .type-schedule .card-title {
    color: #1a1a1a;
  }
  
  /* Devotional specific styles */
  .type-devotional .card-title {
    color: #1a1a1a;
  }
  
  .type-devotional .category-badge {
    background: rgba(139, 115, 85, 0.9);
  }
  
  /* ========================================
     RESPONSIVE DESIGN
  ========================================= */
  @media (max-width: 360px) {
    .layout-mobile-list {
      margin-bottom: 6px;
      height: 70px; /* Fixed height untuk card kecil */
    }
    
    .layout-mobile-list .card-thumbnail {
      width: 70px;
      min-width: 70px;
      height: 100%; /* Mengisi tinggi penuh card */
    }
    
    .layout-mobile-list .card-content {
      padding: 6px 10px; /* Padding lebih kecil lagi */
      height: 100%; /* Mengisi tinggi penuh card */
      overflow: hidden; /* Prevent content overflow */
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .layout-mobile-list .card-title {
      font-size: 12px;
      line-height: 1.05;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      max-height: 2.1em; /* 2 lines with smaller line-height */
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-word;
      margin: 0;
    }
    
    .card-subtitle {
      font-size: 12px;
    }
  }
  
  /* Desktop responsive - untuk layar medium */
  @media (max-width: 950px) and (min-width: 769px) {
    .layout-desktop-grid {
      min-height: 320px; /* Diperkecil dari 460px */
      max-height: 360px; /* Diperkecil dari 520px */
    }
    
    .layout-desktop-grid .card-thumbnail {
      height: 200px; /* Thumbnail diproporsikan untuk layar medium */
      max-width: 356px; /* Proporsional dengan 403x226 */
    }
    
    .layout-desktop-grid .card-content {
      padding: 10px; /* Diperkecil dari 14px */
    }
    
    .layout-desktop-grid .card-title {
      font-size: 14px; /* Font lebih kecil */
      margin-bottom: 6px;
    }
    
    .layout-desktop-grid .card-subtitle {
      font-size: 12px; /* Font lebih kecil */
      margin-bottom: 10px;
    }
    
    .category-badge {
      font-size: 10px;
    }
  }
  
  /* ========================================
     ACCESSIBILITY
  ========================================= */
  @media (prefers-reduced-motion: reduce) {
    .content-card,
    .thumbnail-img,
    .action-button,
    .arrow-icon {
      transition: none;
    }
    
    .content-card:hover {
      transform: none;
    }
    
    .content-card:hover .thumbnail-img {
      transform: none;
    }
  }
  
  @media (prefers-contrast: high) {
    .content-card {
      border: 2px solid #41442A;
    }
    
    .card-title {
      color: #000;
    }
    
    .category-badge {
      border: 1px solid #fff;
    }
  }
  </style>