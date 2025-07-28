<template>
  <Teleport to="body">
    <Transition name="toast" appear>
      <div 
        v-if="visible" 
        :class="[
          'toast',
          `toast-${type}`,
          position
        ]"
      >
        <div class="toast-content">
          <!-- Icon berdasarkan type -->
          <div class="toast-icon">
            <CheckCircle v-if="type === 'success'" class="icon" />
            <AlertCircle v-else-if="type === 'error'" class="icon" />
            <Info v-else-if="type === 'info'" class="icon" />
            <AlertTriangle v-else-if="type === 'warning'" class="icon" />
          </div>
          
          <!-- Message -->
          <div class="toast-message">
            {{ message }}
          </div>
          
          <!-- Close button (optional) -->
          <button 
            v-if="closable" 
            @click="close" 
            class="toast-close"
            aria-label="Tutup notifikasi"
          >
            <X class="close-icon" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'

export default {
  name: 'ToastNotification',
  components: {
    CheckCircle,
    AlertCircle,
    Info,
    AlertTriangle,
    X
  },
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    },
    position: {
      type: String,
      default: 'toast-top',
      validator: (value) => ['toast-top', 'toast-bottom', 'toast-center'].includes(value)
    },
    closable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      timer: null
    }
  },
  mounted() {
    this.show()
  },
  beforeUnmount() {
    this.clearTimer()
  },
  methods: {
    show() {
      this.visible = true
      
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          this.close()
        }, this.duration)
      }
    },
    
    close() {
      this.visible = false
      this.clearTimer()
      this.$emit('close')
      
      // Remove component setelah transition selesai
      setTimeout(() => {
        this.$emit('destroy')
      }, 300)
    },
    
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    }
  }
}
</script>

<style scoped>
/* ===== BASE TOAST STYLES ===== */
.toast {
  position: fixed;
  z-index: 9999;
  max-width: 400px;
  min-width: 300px;
  margin: 16px;
  pointer-events: auto;
}

/* ===== POSITIONING ===== */
.toast-top {
  top: 20px;
  right: 20px;
}

.toast-bottom {
  bottom: 20px;
  right: 20px;
}

.toast-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

/* ===== TOAST CONTENT ===== */
.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 15px rgba(0, 0, 0, 0.1),
    0 20px 25px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
}

/* ===== TOAST TYPES ===== */
.toast-success .toast-content {
  border-left-color: #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-content {
  border-left-color: #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-content {
  border-left-color: #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-content {
  border-left-color: #3b82f6;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

/* ===== TOAST ELEMENTS ===== */
.toast-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-icon .icon {
  width: 20px;
  height: 20px;
}

.toast-message {
  flex: 1;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
  margin-top: 1px;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toast-close:hover {
  color: #6b7280;
  background: #f3f4f6;
}

.toast-close .close-icon {
  width: 16px;
  height: 16px;
}

/* ===== TRANSITIONS ===== */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 480px) {
  .toast {
    max-width: calc(100vw - 32px);
    min-width: auto;
    margin: 16px;
  }
  
  .toast-top {
    top: 16px;
    right: 16px;
    left: 16px;
  }
  
  .toast-bottom {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }
  
  .toast-content {
    padding: 14px;
  }
  
  .toast-message {
    font-size: 13px;
  }
}

/* ===== ACCESSIBILITY ===== */
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}

/* ===== DARK MODE SUPPORT (opsional) ===== */
@media (prefers-color-scheme: dark) {
  .toast-content {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .toast-message {
    color: #f9fafb;
  }
  
  .toast-close {
    color: #9ca3af;
  }
  
  .toast-close:hover {
    color: #d1d5db;
    background: #374151;
  }
}
</style>
