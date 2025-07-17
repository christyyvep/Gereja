<template>
  <div class="feature-box" @click="goToPage" :class="{ 'loading': isLoading }">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-placeholder">
      <div class="loading-icon"></div>
    </div>
    
    <!-- Normal state -->
    <div v-else class="icon-placeholder" :class="{ 'error': iconError }">
      <img 
        v-if="iconUrl && !iconError" 
        :src="iconUrl" 
        :alt="name" 
        class="feature-icon" 
        @error="onImageError" 
        @load="onImageLoad"
      />
      <span v-else class="fallback-letter">{{ firstLetter }}</span>
    </div>
    
    <p class="label">{{ name }}</p>
  </div>
</template>

<script>
import { getFeatureIconUrl } from '@/utils/imageUtils'

export default {
  name: 'FeatureBox',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      iconError: false,
      isLoading: true
    }
  },
  computed: {
    firstLetter() {
      return this.name.charAt(0).toUpperCase()
    },
    
    iconUrl() {
      if (this.iconError) return null
      
      try {
        const iconFilename = getFeatureIconUrl(this.name)
        // Use require to load asset properly
        return require(`@/assets/icons/features/${iconFilename}`)
      } catch (err) {
        console.warn(`Failed to load icon for ${this.name}:`, err)
        return null
      }
    }
  },
  mounted() {
    // Simulasi loading singkat untuk UX yang lebih baik
    setTimeout(() => {
      this.isLoading = false
    }, 100)
  },
  methods: {
    goToPage() {
      if (this.isLoading) return
      
      const path = this.getRoutePath()
      
      if (this.isValidRoute(path)) {
        this.$router.push(path)
      } else {
        console.warn(`Route ${path} not found, staying on home`)
        this.$router.push('/home')
      }
    },

    getRoutePath() {
      const routeMap = {
        'Renungan': '/renungan',
        'Jadwal': '/jadwal',
        'News': '/news',
        'Giving': '/giving',
        'Tentang Gereja': '/tentang-gereja',
        'Prayer Request': '/prayer-request'
      }
      
      return routeMap[this.name] || this.createSlugPath()
    },

    createSlugPath() {
      return '/' + this.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
    },

    isValidRoute(path) {
      const route = this.$router.resolve(path)
      return route.name !== 'not-found' && route.matched.length > 0
    },

    onImageError(event) {
      this.iconError = true
      this.isLoading = false
      
      // Prevent infinite error loop
      event.target.onerror = null
    },
    
    onImageLoad() {
      this.iconError = false
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
.feature-box {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease;
  padding: 8px;
}

.feature-box:hover:not(.loading) {
  transform: scale(1.05);
}

.feature-box:active:not(.loading) {
  transform: scale(0.95);
}

.feature-box.loading {
  pointer-events: none;
  opacity: 0.7;
}

/* Loading state */
.loading-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-icon {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #41442A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Icon container */
.icon-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(65, 68, 42, 0.1);
  transition: all 0.2s ease;
}

.icon-placeholder.error {
  background: rgba(220, 38, 38, 0.1);
  border: 1px dashed #ef4444;
}

.feature-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.feature-box:hover .feature-icon {
  transform: scale(1.1);
}

.fallback-letter {
  font-size: 24px;
  font-weight: bold;
  color: #41442A;
  font-family: 'Inter', sans-serif;
}

.icon-placeholder.error .fallback-letter {
  color: #dc2626;
}

/* Label */
.label {
  font-size: 14px;
  margin-top: 8px;
  font-family: 'Inter';
  text-align: center;
  font-weight: 500;
  color: #333;
  line-height: 1.2;
  max-width: 80px;
  word-wrap: break-word;
}

/* Responsive design */
@media (max-width: 360px) {
  .feature-box {
    padding: 6px;
  }
  
  .icon-placeholder,
  .loading-placeholder {
    width: 56px;
    height: 56px;
  }
  
  .feature-icon {
    width: 32px;
    height: 32px;
  }
  
  .fallback-letter {
    font-size: 20px;
  }
  
  .label {
    font-size: 12px;
    max-width: 70px;
  }
  
  .loading-icon {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }
}

/* Accessibility - untuk user yang tidak suka animasi */
@media (prefers-reduced-motion: reduce) {
  .feature-box,
  .feature-icon,
  .loading-icon {
    animation: none;
    transition: none;
  }
  
  .feature-box:hover {
    transform: none;
  }
}
</style>