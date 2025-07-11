<!-- src/components/common/ContentCard.vue -->
<!-- Universal Card Component untuk News, Jadwal, Renungan, dll -->
<template>
    <article 
      :class="['content-card', layoutClass, `type-${contentType}`]" 
      @click="handleClick"
    >
      <!-- Thumbnail Section -->
      <div :class="['card-thumbnail', sizeClass]">
        <img 
          :src="thumbnailUrl" 
          :alt="item.title || item.name"
          @error="handleImageError"
          class="thumbnail-img"
        />
        
        <!-- Category Badge (kalau ada) - ONLY FOR DESKTOP -->
        <span 
          v-if="categoryLabel && layout === 'desktop-grid' && !hideCategory" 
          :class="['category-badge', `category-${item.category || 'default'}`]"
        >
          {{ categoryLabel }}
        </span>
      </div>
  
      <!-- Content Section -->
      <div class="card-content">
        <!-- Title -->
        <h3 class="card-title">{{ item.title || item.name }}</h3>
        
        <!-- Subtitle/Description - ONLY FOR DESKTOP -->
        <p v-if="subtitle && layout === 'desktop-grid'" class="card-subtitle">{{ subtitle }}</p>
        
        <!-- Meta Info untuk Mobile/List -->
        <div v-if="layout !== 'desktop-grid'" class="card-meta">
          <span v-if="formattedDate" class="meta-date">
            <Calendar class="meta-icon" />
            {{ formattedDate }}
          </span>
          <span v-if="item.time" class="meta-time">
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
  
  export default {
    name: 'ContentCard',
    
    components: {
      Calendar,
      Clock, 
      ArrowRight,
      ChevronRight
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
      
      thumbnailUrl() {
        // Pilih function thumbnail berdasarkan content type
        switch (this.contentType) {
          case 'news':
          case 'announcement':
            return getNewsThumbnail(this.item, this.size)
          case 'schedule':
            return getScheduleThumbnail(this.item, this.size)
          case 'devotional':
            return getDevotionalThumbnail(this.item, this.size)
          default:
            return getNewsThumbnail(this.item, this.size)
        }
      },
      
      categoryLabel() {
        if (!this.item.category) return null
        
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
          },
          devotional: {
            'kasih': 'Kasih',
            'pengharapan': 'Pengharapan', 
            'iman': 'Iman',
            'doa': 'Doa'
          }
        }
        
        const typeLabels = labels[this.contentType] || labels.news
        return typeLabels[this.item.category?.toLowerCase()] || this.item.category
      },
      
      subtitle() {
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
      }
    }
  }
  </script>
  
  <style scoped>
  /* ========================================
     BASE CARD STYLES
  ========================================= */
  .content-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .content-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  /* ========================================
     THUMBNAIL STYLES
  ========================================= */
  .card-thumbnail {
    position: relative;
    overflow: hidden;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
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
  
  /* Size variants */
  .size-small {
    width: 80px;
    min-width: 80px;
    height: 80px;
  }
  
  .size-large {
    width: 100%;
    height: 200px;
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
     CONTENT STYLES
  ========================================= */
  .card-content {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
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
    display: -webkit-box;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
    margin-top: auto;
    padding-top: 16px;
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
  
  /* Mobile List Layout (simplified - thumbnail + title only) */
  .layout-mobile-list {
    display: flex;
    align-items: center;
    height: 80px;
    margin-bottom: 8px;
  }
  
  .layout-mobile-list .card-content {
    min-height: 80px;
    justify-content: center;
    padding: 16px;
  }
  
  /* Hide subtitle and meta for mobile */
  .layout-mobile-list .card-subtitle,
  .layout-mobile-list .card-meta {
    display: none;
  }
  
  /* Desktop Grid Layout (new for NewsPage desktop) */
  .layout-desktop-grid {
    display: flex;
    flex-direction: column;
    height: auto;
    min-height: 350px;
  }
  
  .layout-desktop-grid .card-content {
    flex: 1;
    padding: 20px;
  }
  
  .layout-desktop-grid .card-title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .layout-desktop-grid .card-subtitle {
    font-size: 14px;
    line-clamp: 3;
    margin-bottom: 16px;
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
      height: 70px;
    }
    
    .layout-mobile-list .size-small {
      width: 70px;
      min-width: 70px;
      height: 70px;
    }
    
    .layout-mobile-list .card-content {
      padding: 12px;
      min-height: 70px;
    }
    
    .card-title {
      font-size: 14px;
    }
    
    .card-subtitle {
      font-size: 12px;
    }
  }
  
  /* Desktop responsive */
  @media (max-width: 950px) and (min-width: 769px) {
    .layout-desktop-grid {
      min-height: 320px;
    }
    
    .layout-desktop-grid .card-title {
      font-size: 15px;
    }
    
    .layout-desktop-grid .card-subtitle {
      font-size: 13px;
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