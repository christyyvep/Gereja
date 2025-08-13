<!-- src/components/common/OptimizedImage.vue -->
<!-- High-Performance Image Component with Lazy Loading -->
<template>
  <div 
    :class="[
      'optimized-image-container',
      {
        'loading': isLoading,
        'loaded': isLoaded,
        'error': hasError,
        'lazy': useLazyLoading
      }
    ]"
    :style="containerStyle"
  >
    <!-- Blur Placeholder -->
    <img
      v-if="blurPlaceholder && !isLoaded"
      :src="blurPlaceholder"
      :alt="alt"
      class="blur-placeholder"
      aria-hidden="true"
    />
    
    <!-- Main Image -->
    <img
      ref="mainImage"
      :data-src="useLazyLoading ? optimizedSrc : undefined"
      :src="useLazyLoading ? undefined : optimizedSrc"
      :srcset="responsiveSrcSet"
      :sizes="sizes"
      :alt="alt"
      :class="['main-image', imageClass]"
      :loading="nativeLazyLoading ? 'lazy' : 'eager'"
      @load="onImageLoad"
      @error="onImageError"
    />
    
    <!-- Loading Spinner -->
    <div v-if="isLoading && showLoadingSpinner" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    
    <!-- Error Fallback -->
    <div v-if="hasError" class="error-fallback">
      <div class="error-icon">🖼️</div>
      <p class="error-text">{{ errorText || 'Gagal memuat gambar' }}</p>
    </div>
  </div>
</template>

<script>
import { lazyLoader, generateResponsiveSrcSet, generateBlurPlaceholder, getOptimizedImageUrl, addSmartCacheBuster } from '@/utils/imageOptimization'

export default {
  name: 'OptimizedImage',
  
  props: {
    // Image source
    src: {
      type: String,
      required: true
    },
    
    // Alt text
    alt: {
      type: String,
      default: 'Image'
    },
    
    // Image size preset
    size: {
      type: String,
      default: 'card-desktop',
      validator: value => ['card-mobile', 'card-desktop', 'detail-mobile', 'detail-desktop'].includes(value)
    },
    
    // Custom width/height
    width: {
      type: Number,
      default: null
    },
    
    height: {
      type: Number,
      default: null
    },
    
    // Lazy loading options
    useLazyLoading: {
      type: Boolean,
      default: true
    },
    
    // Native lazy loading
    nativeLazyLoading: {
      type: Boolean,
      default: true
    },
    
    // Show blur placeholder
    useBlurPlaceholder: {
      type: Boolean,
      default: true
    },
    
    // Show loading spinner
    showLoadingSpinner: {
      type: Boolean,
      default: true
    },
    
    // Force refresh (untuk development)
    forceRefresh: {
      type: Boolean,
      default: false
    },
    
    // Custom CSS class
    imageClass: {
      type: String,
      default: ''
    },
    
    // Error text
    errorText: {
      type: String,
      default: null
    },
    
    // Custom sizes attribute for responsive images
    sizes: {
      type: String,
      default: '(max-width: 768px) 100vw, 50vw'
    }
  },
  
  data() {
    return {
      isLoading: true,
      isLoaded: false,
      hasError: false,
      retryCount: 0,
      maxRetries: 2
    }
  },
  
  computed: {
    optimizedSrc() {
      if (!this.src) return ''
      
      const options = {
        width: this.width || this.sizeConfig.width,
        height: this.height || this.sizeConfig.height,
        quality: 'auto',
        format: 'auto',
        crop: 'fit'
      }
      
      const optimized = getOptimizedImageUrl(this.src, options)
      return addSmartCacheBuster(optimized, this.forceRefresh)
    },
    
    responsiveSrcSet() {
      if (!this.src) return ''
      return generateResponsiveSrcSet(this.src, this.size)
    },
    
    blurPlaceholder() {
      if (!this.useBlurPlaceholder || !this.src) return null
      return generateBlurPlaceholder(this.src)
    },
    
    sizeConfig() {
      const configs = {
        'card-mobile': { width: 80, height: 80 },
        'card-desktop': { width: 400, height: 250 },
        'detail-mobile': { width: 400, height: 250 },
        'detail-desktop': { width: 800, height: 450 }
      }
      return configs[this.size] || configs['card-desktop']
    },
    
    containerStyle() {
      return {
        width: `${this.sizeConfig.width}px`,
        height: `${this.sizeConfig.height}px`,
        aspectRatio: `${this.sizeConfig.width} / ${this.sizeConfig.height}`
      }
    }
  },
  
  mounted() {
    if (this.useLazyLoading && !this.nativeLazyLoading) {
      // Use custom intersection observer
      lazyLoader.observeImage(this.$refs.mainImage)
    }
    
    // Preload critical images if this is above the fold
    if (!this.useLazyLoading) {
      this.loadImage()
    }
  },
  
  methods: {
    loadImage() {
      this.isLoading = true
      this.hasError = false
    },
    
    onImageLoad() {
      this.isLoading = false
      this.isLoaded = true
      this.hasError = false
      this.retryCount = 0
      
      this.$emit('load')
      console.log('✅ [OptimizedImage] Loaded:', this.src)
    },
    
    onImageError() {
      this.isLoading = false
      this.hasError = true
      
      console.warn('❌ [OptimizedImage] Error loading:', this.src)
      
      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        console.log(`🔄 [OptimizedImage] Retrying (${this.retryCount}/${this.maxRetries}):`, this.src)
        
        setTimeout(() => {
          this.hasError = false
          this.isLoading = true
          this.$refs.mainImage.src = this.optimizedSrc + `&retry=${this.retryCount}`
        }, 1000 * this.retryCount) // Exponential backoff
      } else {
        this.$emit('error')
      }
    }
  }
}
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Blur placeholder */
.blur-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(5px);
  transform: scale(1.1);
  z-index: 1;
}

/* Main image */
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  z-index: 2;
  position: relative;
}

/* Loading state */
.loading .main-image {
  opacity: 0;
}

.loaded .main-image {
  opacity: 1;
}

.loaded .blur-placeholder {
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Loading spinner */
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e5e5;
  border-top: 2px solid #41442A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error .main-image {
  display: none;
}

.error-fallback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 3;
}

.error-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.error-text {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* Performance optimizations */
.optimized-image-container {
  will-change: auto;
}

.main-image {
  will-change: opacity;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .main-image,
  .blur-placeholder {
    transition: none;
  }
  
  .spinner {
    animation: none;
    border: 2px solid #41442A;
  }
}
</style>
