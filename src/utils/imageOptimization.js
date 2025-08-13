// src/utils/imageOptimization.js
// Advanced Image Optimization for MyRajawali

/**
 * ⚡ LAZY LOADING UTILITY
 */
export class LazyImageLoader {
  constructor() {
    this.observer = null
    this.imageCache = new Map()
    this.preloadQueue = []
    this.setupIntersectionObserver()
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target)
            this.observer.unobserve(entry.target)
          }
        })
      }, {
        rootMargin: '50px', // Start loading 50px before image is visible
        threshold: 0.1
      })
    }
  }

  observeImage(imgElement) {
    if (this.observer && imgElement) {
      this.observer.observe(imgElement)
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(imgElement)
    }
  }

  loadImage(imgElement) {
    const src = imgElement.dataset.src
    if (src && !imgElement.src) {
      // Check cache first
      if (this.imageCache.has(src)) {
        imgElement.src = src
        imgElement.classList.add('loaded')
        return
      }

      // Create new image for preloading
      const newImg = new Image()
      newImg.onload = () => {
        imgElement.src = src
        imgElement.classList.add('loaded')
        this.imageCache.set(src, true)
      }
      newImg.onerror = () => {
        imgElement.classList.add('error')
        console.warn('🖼️ Failed to load image:', src)
      }
      newImg.src = src
    }
  }

  preloadImage(src) {
    if (this.imageCache.has(src)) return Promise.resolve()
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.imageCache.set(src, true)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  preloadCriticalImages(urls) {
    const promises = urls.map(url => this.preloadImage(url))
    return Promise.allSettled(promises)
  }
}

/**
 * ⚡ SMART CACHE MANAGEMENT
 */
export class SmartImageCache {
  constructor(maxAge = 30 * 60 * 1000) { // 30 minutes default
    this.cache = new Map()
    this.maxAge = maxAge
    this.cleanup()
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }
    
    return item.url
  }

  set(key, url) {
    this.cache.set(key, {
      url,
      timestamp: Date.now()
    })
  }

  cleanup() {
    setInterval(() => {
      const now = Date.now()
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > this.maxAge) {
          this.cache.delete(key)
        }
      }
    }, 5 * 60 * 1000) // Cleanup every 5 minutes
  }
}

/**
 * ⚡ OPTIMIZED CLOUDINARY URL GENERATOR
 */
export function getOptimizedImageUrl(baseUrl, options = {}) {
  const {
    width = 400,
    height = 250,
    quality = 'auto',
    format = 'auto',
    crop = 'fit',
    useWebP = true,
    blur = false,
    progressive = true
  } = options

  // Build transform string
  const transforms = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `f_${format}`,
    `q_${quality}`
  ]

  // Add WebP format for supported browsers
  if (useWebP && supportsWebP()) {
    transforms.push('f_webp')
  }

  // Add progressive loading
  if (progressive) {
    transforms.push('fl_progressive')
  }

  // Add blur for placeholder
  if (blur) {
    transforms.push(`e_blur:${blur}`)
  }

  const transformString = transforms.join(',')
  
  // Insert transform into Cloudinary URL
  if (baseUrl.includes('cloudinary.com')) {
    return baseUrl.replace('/upload/', `/upload/${transformString}/`)
  }
  
  return baseUrl
}

/**
 * ⚡ WEBP SUPPORT DETECTION
 */
let webpSupport = null
export function supportsWebP() {
  if (webpSupport !== null) return webpSupport

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp')
  
  return webpSupport
}

/**
 * ⚡ RESPONSIVE IMAGE SIZES
 */
export const RESPONSIVE_SIZES = {
  'card-mobile': {
    width: 80,
    height: 80,
    srcset: [
      { width: 80, density: '1x' },
      { width: 160, density: '2x' }
    ]
  },
  'card-desktop': {
    width: 400,
    height: 250,
    srcset: [
      { width: 400, density: '1x' },
      { width: 800, density: '2x' }
    ]
  },
  'detail-mobile': {
    width: 400,
    height: 250,
    srcset: [
      { width: 400, density: '1x' },
      { width: 800, density: '2x' }
    ]
  },
  'detail-desktop': {
    width: 800,
    height: 450,
    srcset: [
      { width: 800, density: '1x' },
      { width: 1600, density: '2x' }
    ]
  }
}

/**
 * ⚡ GENERATE RESPONSIVE SRCSET
 */
export function generateResponsiveSrcSet(baseUrl, size = 'card-desktop') {
  const config = RESPONSIVE_SIZES[size]
  if (!config) return ''

  return config.srcset.map(item => {
    const optimizedUrl = getOptimizedImageUrl(baseUrl, {
      width: item.width,
      height: Math.round(item.width * (config.height / config.width))
    })
    return `${optimizedUrl} ${item.density}`
  }).join(', ')
}

/**
 * ⚡ BLUR PLACEHOLDER GENERATOR
 */
export function generateBlurPlaceholder(baseUrl, options = {}) {
  return getOptimizedImageUrl(baseUrl, {
    width: 40,
    height: 25,
    quality: 30,
    blur: 15,
    ...options
  })
}

/**
 * ⚡ GLOBAL INSTANCES
 */
export const lazyLoader = new LazyImageLoader()
export const imageCache = new SmartImageCache()

/**
 * ⚡ PRELOAD CRITICAL IMAGES
 */
export function preloadCriticalImages() {
  const criticalImages = [
    // Homepage hero images
    'https://res.cloudinary.com/df74ywsgg/image/upload/w_400,h_250,c_fit,f_auto,q_auto/myrajawali/daily-verse/ayat1',
    // Common feature icons
    'https://res.cloudinary.com/df74ywsgg/image/upload/w_48,h_48,c_fit,f_auto,q_auto/myrajawali/icons/features/news',
    'https://res.cloudinary.com/df74ywsgg/image/upload/w_48,h_48,c_fit,f_auto,q_auto/myrajawali/icons/features/schedule'
  ]

  return lazyLoader.preloadCriticalImages(criticalImages)
}

/**
 * ⚡ CACHE-AWARE URL GENERATOR
 */
export function getCachedImageUrl(key, generator) {
  // Check cache first
  const cached = imageCache.get(key)
  if (cached) return cached

  // Generate new URL
  const url = generator()
  
  // Cache the result (without excessive cache busting)
  imageCache.set(key, url)
  
  return url
}

/**
 * ⚡ SMART CACHE BUSTING (only when needed)
 */
export function addSmartCacheBuster(url, forceRefresh = false) {
  if (!forceRefresh) return url
  
  const separator = url.includes('?') ? '&' : '?'
  const timestamp = Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute cache
  
  return `${url}${separator}v=${timestamp}`
}
