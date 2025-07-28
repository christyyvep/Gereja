<!-- AdminButton.vue - Reusable Button Component for Admin -->
<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    :type="type"
  >
    <!-- Loading spinner -->
    <div v-if="loading" class="loading-spinner"></div>
    
    <!-- Icon (left) -->
    <component 
      v-if="icon && !loading" 
      :is="icon" 
      class="button-icon"
      :class="{ 'icon-left': $slots.default }"
    />
    
    <!-- Button text/content -->
    <span v-if="$slots.default && !loading" class="button-text">
      <slot />
    </span>
    
    <!-- Icon (right) -->
    <component 
      v-if="iconRight && !loading" 
      :is="iconRight" 
      class="button-icon icon-right"
    />
  </button>
</template>

<script>
export default {
  name: 'AdminButton',
  
  props: {
    // Button variants
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => [
        'primary', 'secondary', 'success', 'danger', 
        'warning', 'info', 'outline', 'ghost'
      ].includes(value)
    },
    
    // Button sizes
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    
    // Button type
    type: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    
    // States
    disabled: {
      type: Boolean,
      default: false
    },
    
    loading: {
      type: Boolean,
      default: false
    },
    
    // Icons
    icon: {
      type: [Object, String],
      default: null
    },
    
    iconRight: {
      type: [Object, String],
      default: null
    },
    
    // Full width
    block: {
      type: Boolean,
      default: false
    },
    
    // Rounded
    rounded: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    buttonClasses() {
      return [
        'admin-button',
        `admin-button--${this.variant}`,
        `admin-button--${this.size}`,
        {
          'admin-button--disabled': this.disabled,
          'admin-button--loading': this.loading,
          'admin-button--block': this.block,
          'admin-button--rounded': this.rounded,
          'admin-button--icon-only': !this.$slots.default && (this.icon || this.iconRight)
        }
      ]
    }
  },
  
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
/* ========================================
   BASE BUTTON STYLES
========================================= */
.admin-button {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  text-decoration: none;
  box-sizing: border-box;
  outline: none;
  user-select: none;
}

.admin-button:focus {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* ========================================
   BUTTON SIZES
========================================= */
.admin-button--xs {
  padding: 6px 12px;
  font-size: 12px;
  min-height: 28px;
}

.admin-button--sm {
  padding: 8px 16px;
  font-size: 13px;
  min-height: 32px;
}

.admin-button--md {
  padding: 12px 24px;
  font-size: 14px;
  min-height: 40px;
}

.admin-button--lg {
  padding: 14px 28px;
  font-size: 15px;
  min-height: 44px;
}

.admin-button--xl {
  padding: 16px 32px;
  font-size: 16px;
  min-height: 48px;
}

/* ========================================
   BUTTON VARIANTS
========================================= */

/* Primary Button (Main Green) */
.admin-button--primary {
  background: #10b981;
  color: white;
}

.admin-button--primary:hover:not(.admin-button--disabled):not(.admin-button--loading) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.admin-button--primary:active {
  transform: translateY(0);
  background: #047857;
}

/* Secondary Button */
.admin-button--secondary {
  background: #6b7280;
  color: white;
}

.admin-button--secondary:hover:not(.admin-button--disabled):not(.admin-button--loading) {
  background: #4b5563;
  transform: translateY(-1px);
}

/* Success Button */
.admin-button--success {
  background: #22c55e;
  color: white;
}

.admin-button--success:hover:not(.admin-button--disabled):not(.admin-button--loading) {
  background: #16a34a;
  transform: translateY(-1px);
}

/* Danger Button */
.admin-button--danger {
  background: #ef4444;
  color: white;
}

.admin-button--danger:hover:not(.admin-button--disabled):not(.admin-button--loading) {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Warning Button */
.admin-button--warning {
  background: #f59e0b;
  color: white;
}

.admin-button--warning:hover:not(.admin-button--disabled):not(.admin-button--loading) {
  background: #d97706;
  transform: translateY(-1px);
}

/* Info Button */
.admin-button--info {
  background: #3b82f6;
  color: white;
}

.admin-button--info:hover:not(.admin-button--disabled):not(.admin-button--loading) {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Outline Button */
.admin-button--outline {
  background: transparent;
  color: #10b981;
  border: 2px solid #10b981;
}

.admin-button--outline:hover:not(.admin-button--disabled):not(.admin-button--loading) {
  background: #10b981;
  color: white;
}

/* Ghost Button */
.admin-button--ghost {
  background: transparent;
  color: #6b7280;
}

.admin-button--ghost:hover:not(.admin-button--disabled):not(.admin-button--loading) {
  background: #f3f4f6;
  color: #374151;
}

/* ========================================
   BUTTON STATES
========================================= */

/* Disabled State */
.admin-button--disabled {
  background: #d1d5db !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

.admin-button--outline.admin-button--disabled {
  background: transparent !important;
  border-color: #d1d5db !important;
  color: #9ca3af !important;
}

/* Loading State */
.admin-button--loading {
  cursor: wait;
  pointer-events: none;
}

/* ========================================
   BUTTON MODIFIERS
========================================= */

/* Block (Full Width) */
.admin-button--block {
  width: 100%;
}

/* Rounded */
.admin-button--rounded {
  border-radius: 50px;
}

/* Icon Only */
.admin-button--icon-only {
  padding: 12px;
  aspect-ratio: 1;
}

.admin-button--icon-only.admin-button--xs {
  padding: 6px;
}

.admin-button--icon-only.admin-button--sm {
  padding: 8px;
}

.admin-button--icon-only.admin-button--lg {
  padding: 14px;
}

.admin-button--icon-only.admin-button--xl {
  padding: 16px;
}

/* ========================================
   BUTTON CONTENT
========================================= */

/* Button Text */
.button-text {
  white-space: nowrap;
}

/* Button Icons */
.button-icon {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.admin-button--xs .button-icon {
  width: 14px;
  height: 14px;
}

.admin-button--sm .button-icon {
  width: 16px;
  height: 16px;
}

.admin-button--md .button-icon {
  width: 18px;
  height: 18px;
}

.admin-button--lg .button-icon {
  width: 20px;
  height: 20px;
}

.admin-button--xl .button-icon {
  width: 22px;
  height: 22px;
}

/* Loading Spinner */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ========================================
   RESPONSIVE
========================================= */
@media (max-width: 768px) {
  .admin-button--md {
    padding: 10px 20px;
    font-size: 13px;
    min-height: 36px;
  }
  
  .admin-button--lg {
    padding: 12px 24px;
    font-size: 14px;
    min-height: 40px;
  }
}

/* ========================================
   ACCESSIBILITY
========================================= */
@media (prefers-reduced-motion: reduce) {
  .admin-button {
    transition: none;
  }
  
  .admin-button:hover {
    transform: none;
  }
  
  .loading-spinner {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .admin-button {
    border: 2px solid currentColor;
  }
  
  .admin-button--outline {
    border-width: 3px;
  }
}
</style>