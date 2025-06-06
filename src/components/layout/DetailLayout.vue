<template>
  <div class="detail-container">
    <div class="detail-wrapper">
      <!-- Header dengan tombol back -->
      <HeaderWithBack :title="headerTitle" />

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

        <!-- Info details (tanggal, waktu, tempat) - hanya untuk jadwal -->
        <div v-if="showScheduleInfo" class="detail-info">
          <div class="info-row">
            <span class="info-label">Tanggal</span>
            <span class="info-value">{{ formattedDate }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Pukul</span>
            <span class="info-value">{{ time }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Tempat</span>
            <span class="info-value">{{ location }}</span>
          </div>
        </div>

        <!-- Additional content dari parent (jika ada) -->
        <div class="detail-extra">
          <slot name="extra-content"></slot>
        </div>

        <!-- Closing -->
        <div v-if="closing" class="detail-closing">
          <p>{{ closing }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderWithBack from '@/components/layout/HeaderWithBack.vue'
import { getNewsThumbnail, getScheduleThumbnail, getDevotionalThumbnail } from '@/utils/imageUtils'

export default {
  name: 'DetailLayout',
  components: {
    HeaderWithBack
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
      validator: (value) => ['', 'news', 'schedule', 'devotional', 'jadwal', 'renungan'].includes(value)
    },
    
    // Schedule-specific props
    showScheduleInfo: {
      type: Boolean,
      default: false
    },
    date: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    closing: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      imageError: false
    }
  },
  computed: {
    thumbnailSrc() {
      let detectedType = this.contentType
      
      // Auto-detect dari headerTitle jika contentType kosong
      if (!detectedType && this.headerTitle) {
        if (this.headerTitle.toLowerCase().includes('news')) {
          detectedType = 'news'
        } else if (this.headerTitle.toLowerCase().includes('jadwal')) {
          detectedType = 'schedule'
        } else if (this.headerTitle.toLowerCase().includes('renungan')) {
          detectedType = 'devotional'
        }
      }
      
      // Auto-detect dari route
      if (!detectedType && this.$route) {
        const currentPath = this.$route.path
        if (currentPath.includes('/news')) {
          detectedType = 'news'
        } else if (currentPath.includes('/jadwal')) {
          detectedType = 'schedule'
        } else if (currentPath.includes('/renungan')) {
          detectedType = 'devotional'
        }
      }
      
      const item = {
        thumbnail: this.thumbnail,
        category: this.category,
        title: this.title
      }
      
      try {
        if (detectedType === 'news') {
          return getNewsThumbnail(item, 'large')
        } else if (detectedType === 'schedule' || detectedType === 'jadwal') {
          return getScheduleThumbnail(item, 'large')
        } else if (detectedType === 'devotional' || detectedType === 'renungan') {
          return getDevotionalThumbnail(item, 'large')
        } else {
          return getScheduleThumbnail(item, 'large')
        }
      } catch (error) {
        return null
      }
    },
    
    formattedDate() {
      if (!this.date) return ''
      
      try {
        const dateObj = new Date(this.date)
        const options = { 
          weekday: 'long',
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }
        return dateObj.toLocaleDateString('id-ID', options)
      } catch (error) {
        return this.date
      }
    }
  },
  methods: {
    onImageError() {
      this.imageError = true
    }
  }
}
</script>

<style scoped>
.detail-container {
  background: #fcfcf7;
  min-height: 100vh;
}

.detail-wrapper {
  padding: 16px;
  max-width: 360px;
  margin: 0 auto;
}

/* Thumbnail besar */
.detail-thumbnail {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #41442A, #5a5e3d);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 48px;
}

/* Content area */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #41442A;
  margin: 0;
  font-family: 'Inter';
  line-height: 1.3;
}

.detail-description {
  font-family: 'Inter';
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.detail-description p {
  margin: 0 0 12px 0;
}

/* Info details untuk jadwal */
.detail-info {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-family: 'Inter';
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.info-value {
  font-family: 'Inter';
  font-size: 14px;
  color: #333;
  text-align: right;
}

/* Closing message */
.detail-closing {
  font-family: 'Inter';
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.detail-closing p {
  margin: 0;
}

/* Responsive */
@media (max-width: 360px) {
  .detail-wrapper {
    padding: 12px;
  }
  
  .detail-thumbnail {
    height: 180px;
  }
  
  .detail-title {
    font-size: 20px;
  }
  
  .detail-info {
    padding: 12px;
  }
}
</style>