<template>
  <div class="verse-popup-overlay" 
       v-if="isOpen"
       @click="handleOverlayClick"
       role="dialog"
       aria-modal="true"
       :aria-labelledby="'verse-popup-title-' + popupId">
    <div class="verse-popup-container">
      <!-- Header -->
      <div class="verse-popup-header">
        <h3 :id="'verse-popup-title-' + popupId" class="verse-popup-title">
          📖 {{ reference }}
        </h3>
        <button 
          class="verse-popup-close"
          @click="$emit('close')"
          type="button"
          aria-label="Tutup popup"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="verse-popup-content">
        <!-- Loading State -->
        <div v-if="loading" class="verse-popup-loading">
          <div class="loading-spinner"></div>
          <p>Memuat ayat...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="verse-popup-error">
          <div class="error-icon">⚠️</div>
          <p class="error-message">{{ error }}</p>
          <button 
            @click="fetchVerse" 
            class="retry-button"
            type="button"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Success State -->
        <div v-else-if="verseData && verseData.success" class="verse-popup-verse">
          <div class="verse-text">
            <p class="verse-content" v-html="cleanHtml(verseData.text)"></p>
          </div>
          
          <div class="verse-footer">
            <div class="verse-info">
              <span class="verse-book">{{ verseData.book }}</span>
              <span class="verse-chapter">
                {{ verseData.chapter }}:{{ verseData.startVerse }}
                <span v-if="verseData.endVerse !== verseData.startVerse">
                  -{{ verseData.endVerse }}
                </span>
              </span>
            </div>
            <div class="verse-source">
              <small>Alkitab Bahasa Indonesia • API.Bible</small>
            </div>
          </div>
        </div>

        <!-- Fallback State -->
        <div v-else-if="verseData && !verseData.success" class="verse-popup-fallback">
          <div class="fallback-icon">📖</div>
          <p class="fallback-text">{{ verseData.fallbackText }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="verse-popup-actions">
        <button 
          @click="$emit('close')"
          class="close-button"
          type="button"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getVerse } from '../services/bibleApi'

export default {
  name: 'VersePopup',
  props: {
    reference: {
      type: String,
      required: true
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  data() {
    return {
      verseData: null,
      loading: false,
      error: null,
      popupId: Math.random().toString(36).substr(2, 9)
    }
  },
  watch: {
    isOpen: {
      handler(newVal) {
        if (newVal && this.reference) {
          this.fetchVerse()
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = 'unset'
        }
      },
      immediate: true
    },
    reference: {
      handler() {
        if (this.isOpen && this.reference) {
          this.fetchVerse()
        }
      }
    }
  },
  mounted() {
    if (this.isOpen) {
      document.addEventListener('keydown', this.handleEscKey)
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscKey)
    document.body.style.overflow = 'unset'
  },
  methods: {
    async fetchVerse() {
      this.loading = true
      this.error = null
      
      try {
        console.log('🔍 [VersePopup] Fetching verse:', this.reference)
        const data = await getVerse(this.reference)
        this.verseData = data
        
        if (!data.success) {
          this.error = data.error || 'Gagal mengambil ayat'
        }
        
      } catch (err) {
        console.error('❌ [VersePopup] Error fetching verse:', err)
        this.error = err.message || 'Terjadi kesalahan saat mengambil ayat'
      } finally {
        this.loading = false
      }
    },

    handleOverlayClick(e) {
      if (e.target === e.currentTarget) {
        this.$emit('close')
      }
    },

    handleEscKey(e) {
      if (e.key === 'Escape' && this.isOpen) {
        this.$emit('close')
      }
    },

    cleanHtml(html) {
      if (!html) return ''
      // Strip HTML tags but keep basic formatting
      return html.replace(/<[^>]*>/g, '').trim()
    }
  }
}
</script>

<style scoped>
.verse-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-out;
}

.verse-popup-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  position: relative;
}

.verse-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.verse-popup-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.verse-popup-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verse-popup-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.verse-popup-close:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.verse-popup-content {
  padding: 24px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.verse-popup-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.verse-popup-loading p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.verse-popup-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 20px;
}

.error-icon {
  font-size: 2rem;
}

.error-message {
  margin: 0;
  color: #dc2626;
  font-size: 0.875rem;
  line-height: 1.5;
}

.retry-button {
  background-color: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background-color: #5a67d8;
  transform: translateY(-1px);
}

.verse-popup-verse {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.verse-text {
  background: #f8fafc;
  border-left: 4px solid #667eea;
  padding: 20px;
  border-radius: 0 8px 8px 0;
  margin: 0;
}

.verse-content {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: #1f2937;
  font-family: 'Georgia', serif;
  text-align: justify;
}

.verse-footer {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
}

.verse-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
}

.verse-book {
  background-color: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.verse-chapter {
  font-size: 0.875rem;
  color: #6b7280;
}

.verse-source {
  text-align: right;
}

.verse-source small {
  color: #9ca3af;
  font-size: 0.75rem;
  font-style: italic;
}

.verse-popup-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 20px;
}

.fallback-icon {
  font-size: 2rem;
  opacity: 0.6;
}

.fallback-text {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.verse-popup-actions {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  display: flex;
  justify-content: flex-end;
}

.close-button {
  background-color: #374151;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #1f2937;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .verse-popup-overlay {
    padding: 16px;
  }

  .verse-popup-container {
    max-height: 90vh;
  }

  .verse-popup-header {
    padding: 16px 20px;
  }

  .verse-popup-title {
    font-size: 1rem;
  }

  .verse-popup-content {
    padding: 20px;
  }

  .verse-text {
    padding: 16px;
  }

  .verse-content {
    font-size: 0.9rem;
  }

  .verse-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .verse-source {
    text-align: left;
  }

  .verse-popup-actions {
    padding: 12px 20px;
  }
}
</style>
