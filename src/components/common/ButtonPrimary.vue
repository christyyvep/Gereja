<template>
  <div :class="['button-container', { 'centered': centered }]">
    <button 
      :class="buttonClasses" 
      :type="type"
      :disabled="disabled || loading"
      @click="handleClick"
      :aria-label="ariaLabel"
    >
      <!-- Loading spinner -->
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
      </div>
      
      <!-- Button content -->
      <span :class="{ 'loading-text': loading }">
        <slot></slot>
      </span>
    </button>
  </div>
</template>
  
<script>
export default {
  name: 'ButtonPrimary',
  
  props: {
    // ⭐ Button behavior
    fullWidth: {
      type: Boolean,
      default: true
    },
    centered: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    
    // ⭐ NEW: Loading state
    loading: {
      type: Boolean,
      default: false
    },
    
    // ⭐ NEW: Button variants
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
    },
    
    // ⭐ NEW: Button sizes
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    
    // ⭐ NEW: Accessibility
    ariaLabel: {
      type: String,
      default: ''
    }
  },
  
  emits: ['click'],
  
  computed: {
    // ⭐ Dynamic button classes
    buttonClasses() {
      return [
        'primary-button',
        `button-${this.variant}`,
        `button-${this.size}`,
        {
          'full-width': this.fullWidth,
          'loading': this.loading,
          'disabled': this.disabled
        }
      ]
    }
  },
  
  methods: {
    // ⭐ Handle click with loading state check
    handleClick(event) {
      if (this.loading || this.disabled) {
        event.preventDefault()
        return
      }
      
      this.$emit('click', event)
    }
  }
}
</script>
  
<style scoped>
/* ⭐ CONTAINER */
.button-container {
  width: 100%;
  display: flex;
}

.centered {
  justify-content: center;
}

/* ⭐ BASE BUTTON STYLES */
.primary-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  text-decoration: none;
  user-select: none;
}

/* ⭐ BUTTON SIZES */
.button-small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.button-medium {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 44px;
}

.button-large {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 52px;
}

/* ⭐ BUTTON VARIANTS */
.button-primary {
  background-color: #41442A;
  color: white;
}

/* 🎨 UPDATED: Hover dengan opacity 80% */
.button-primary:hover:not(:disabled):not(.loading) {
  background-color: rgba(65, 68, 42, 0.8); /* 80% opacity */
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(65, 68, 42, 0.2);
}

.button-primary:active:not(:disabled):not(.loading) {
  background-color: #3A3D26;
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(65, 68, 42, 0.2);
}

.button-secondary {
  background-color: #f8f9fa;
  color: #41442A;
  border: 2px solid #41442A;
}

/* 🎨 UPDATED: Secondary button hover juga pakai opacity 80% */
.button-secondary:hover:not(:disabled):not(.loading) {
  background-color: rgba(65, 68, 42, 0.8);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(65, 68, 42, 0.2);
}

.button-danger {
  background-color: #dc3545;
  color: white;
}

.button-danger:hover:not(:disabled):not(.loading) {
  background-color: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

/* ⭐ BUTTON STATES */
.primary-button:focus-visible {
  outline: 2px solid #41442A;
  outline-offset: 2px;
}

.primary-button:disabled,
.primary-button.loading {
  background-color: #A5A6A0 !important;
  color: #666 !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

.primary-button.loading {
  cursor: wait !important;
}

/* ⭐ FULL WIDTH */
.full-width {
  width: 100%;
  max-width: 360px;
}

/* ⭐ LOADING SPINNER */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ⭐ LOADING TEXT */
.loading-text {
  opacity: 0.7;
}

/* ⭐ RESPONSIVE DESIGN */
@media (max-width: 360px) {
  .button-small {
    padding: 6px 12px;
    font-size: 13px;
    min-height: 32px;
  }
  
  .button-medium {
    padding: 10px 20px;
    font-size: 15px;
    min-height: 40px;
  }
  
  .button-large {
    padding: 14px 28px;
    font-size: 17px;
    min-height: 48px;
  }
  
  .full-width {
    max-width: 100%;
  }
}

/* ⭐ ACCESSIBILITY - Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .primary-button {
    transition: none;
  }
  
  .primary-button:hover {
    transform: none;
  }
  
  .spinner {
    animation: none;
  }
}

/* ⭐ HIGH CONTRAST MODE */
@media (prefers-contrast: high) {
  .primary-button {
    border: 2px solid;
  }
  
  .button-primary {
    border-color: white;
  }
  
  .button-secondary {
    border-color: #41442A;
  }
  
  .button-danger {
    border-color: white;
  }
}

/* ⭐ PRINT STYLES */
@media print {
  .primary-button {
    background: transparent !important;
    color: black !important;
    border: 1px solid black !important;
    box-shadow: none !important;
  }
}
</style>