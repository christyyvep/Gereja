<template>
  <div class="content-card" @click="handleClick">
    <div class="card-image">
      <img 
        :src="currentImageUrl"
        :alt="title"
        @load="onImageLoad"
        @error="onImageError"
        class="main-image"
        :class="{ 'loading': isLoading, 'error': hasError }"
      />
      <div v-if="isLoading" class="image-loading">
        <div class="spinner"></div>
      </div>
      <div v-if="hasError" class="image-error">
        <span>📷</span>
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-subtitle">{{ subtitle }}</p>
      <p v-if="date" class="card-date">{{ formatDate(date) }}</p>
    </div>
  </div>
</template>

<script>
import { getNewsImageUrl, getJadwalImageUrl, getRenunganImageUrl } from '@/utils/cloudinary-simple'

export default {
  name: 'ContentCard',
  props: {
    title: { type: String, required: true },
    subtitle: String,
    date: String,
    imageUrl: String,
    type: { type: String, default: 'news' }, // news, jadwal, renungan
    clickable: { type: Boolean, default: true }
  },
  data() {
    return {
      isLoading: true,
      hasError: false,
      retryCount: 0,
      maxRetries: 2,
      currentImageUrl: ''
    }
  },
  mounted() {
    this.setupImage()
  },
  watch: {
    imageUrl() {
      this.setupImage()
    }
  },
  methods: {
    setupImage() {
      this.isLoading = true
      this.hasError = false
      this.retryCount = 0
      
      // Detect mobile
      const isMobile = window.innerWidth <= 768
      
      // Get appropriate image URL based on type
      let imageUrl
      switch (this.type) {
        case 'jadwal':
          imageUrl = getJadwalImageUrl(this.imageUrl, isMobile)
          break
        case 'renungan':
          imageUrl = getRenunganImageUrl(this.imageUrl, isMobile)
          break
        default:
          imageUrl = getNewsImageUrl(this.imageUrl, isMobile)
      }
      
      this.currentImageUrl = imageUrl
      console.log(`📸 ContentCard loading: ${imageUrl}`)
    },
    
    onImageLoad() {
      console.log('✅ Image loaded successfully')
      this.isLoading = false
      this.hasError = false
    },
    
    onImageError() {
      console.log(`❌ Image error, retry ${this.retryCount + 1}/${this.maxRetries}`)
      this.isLoading = false
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        // Try with sample image
        setTimeout(() => {
          this.currentImageUrl = `https://res.cloudinary.com/df74ywsgg/image/upload/w_${window.innerWidth <= 768 ? '80,h_80' : '400,h_250'},c_fill/sample`
        }, 1000)
      } else {
        this.hasError = true
        // Final fallback to placeholder
        this.currentImageUrl = window.innerWidth <= 768 
          ? 'https://via.placeholder.com/80x80/CCCCCC/666666?text=No+Image'
          : 'https://via.placeholder.com/400x250/CCCCCC/666666?text=No+Image'
      }
    },
    
    handleClick() {
      if (this.clickable) {
        this.$emit('click')
      }
    },
    
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.main-image.loading {
  opacity: 0.5;
}

.main-image.error {
  opacity: 0.3;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.8);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-top: 2px solid #4A90E2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.1);
  font-size: 2rem;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
  line-height: 1.4;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.card-date {
  font-size: 0.8rem;
  color: #999;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .card-image {
    height: 160px;
  }
  
  .card-content {
    padding: 12px;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-subtitle {
    font-size: 0.85rem;
  }
}
</style>
