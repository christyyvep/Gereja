<template>
  <span 
    class="verse-link"
    :class="[
      { 'verse-link-underline': underline },
      className
    ]"
    @click="handleClick"
    @keydown="handleKeyDown"
    role="button"
    tabindex="0"
    :aria-label="`Buka ayat ${reference}`"
    :title="`Klik untuk membaca ${reference}`"
  >
    <slot>{{ reference }}</slot>
  </span>

  <!-- Popup Modal -->
  <VersePopup
    v-if="showPopup"
    :reference="reference"
    :isOpen="showPopup"
    @close="handleClosePopup"
  />
</template>

<script>
import VersePopup from './VersePopup.vue'

export default {
  name: 'VerseLink',
  components: {
    VersePopup
  },
  props: {
    reference: {
      type: String,
      required: true
    },
    className: {
      type: String,
      default: ''
    },
    underline: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showPopup: false
    }
  },
  methods: {
    handleClick(e) {
      e.preventDefault()
      console.log('🔍 [VerseLink] Opening verse:', this.reference)
      this.showPopup = true
    },

    handleKeyDown(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        this.handleClick(e)
      }
    },

    handleClosePopup() {
      console.log('🔍 [VerseLink] Closing verse popup')
      this.showPopup = false
    }
  }
}
</script>

<style scoped>
.verse-link {
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
  display: inline;
}

.verse-link:hover {
  color: #5a67d8;
  text-shadow: 0 1px 2px rgba(102, 126, 234, 0.1);
}

.verse-link:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  border-radius: 2px;
}

.verse-link:active {
  color: #4c51bf;
  transform: translateY(1px);
}

.verse-link-underline {
  text-decoration: underline;
  text-decoration-color: rgba(102, 126, 234, 0.4);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.verse-link-underline:hover {
  text-decoration-color: #667eea;
  text-decoration-thickness: 2px;
}

/* Alternative styles */
.verse-link-highlight {
  background: linear-gradient(120deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
  padding: 1px 4px;
  border-radius: 3px;
  text-decoration: none;
}

.verse-link-highlight:hover {
  background: linear-gradient(120deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.08) 100%);
}

.verse-link-border {
  border: 1px solid rgba(102, 126, 234, 0.3);
  padding: 1px 6px;
  border-radius: 4px;
  text-decoration: none;
}

.verse-link-border:hover {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.05);
}

.verse-link-icon::before {
  content: "📖";
  margin-right: 4px;
  font-size: 0.8em;
}

@media (max-width: 640px) {
  .verse-link {
    font-size: 0.95em;
  }
  
  .verse-link-icon::before {
    font-size: 0.75em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .verse-link {
    transition: none;
  }
  
  .verse-link:active {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .verse-link {
    color: #0000ff;
    text-decoration: underline;
  }
  
  .verse-link:hover {
    background-color: #ffff00;
    color: #0000ff;
  }
}

@media (prefers-color-scheme: dark) {
  .verse-link {
    color: #93c5fd;
  }
  
  .verse-link:hover {
    color: #bfdbfe;
  }
  
  .verse-link-highlight {
    background: linear-gradient(120deg, rgba(147, 197, 253, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%);
  }
  
  .verse-link-highlight:hover {
    background: linear-gradient(120deg, rgba(147, 197, 253, 0.15) 0%, rgba(147, 197, 253, 0.08) 100%);
  }
  
  .verse-link-border {
    border-color: rgba(147, 197, 253, 0.3);
  }
  
  .verse-link-border:hover {
    border-color: #93c5fd;
    background-color: rgba(147, 197, 253, 0.05);
  }
}
</style>
