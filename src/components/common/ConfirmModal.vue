<template>
  <div class="modal-overlay" @click="cancel">
    <div class="modal-content" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-icon">
          <AlertTriangle class="warning-icon" />
        </div>
        <h3 class="modal-title">{{ title }}</h3>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <p class="modal-message">{{ message }}</p>
      </div>

      <!-- Modal Actions -->
      <div class="modal-actions">
        <button @click="cancel" class="cancel-button">
          Batal
        </button>
        <button 
          @click="confirm" 
          class="confirm-button"
          :style="{ backgroundColor: confirmColor }"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { AlertTriangle } from 'lucide-vue-next'

export default {
  name: 'ConfirmModal',
  
  components: {
    AlertTriangle
  },
  
  props: {
    title: {
      type: String,
      default: 'Konfirmasi'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Ya, Lanjutkan'
    },
    confirmColor: {
      type: String,
      default: '#ef4444'
    }
  },
  
  emits: ['confirm', 'cancel'],
  
  mounted() {
    document.addEventListener('keydown', this.handleKeyPress)
  },
  
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress)
  },
  
  methods: {
    handleKeyPress(event) {
      if (event.key === 'Escape') {
        this.cancel()
      } else if (event.key === 'Enter') {
        this.confirm()
      }
    },

    confirm() {
      this.$emit('confirm')
    },

    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* Modal Content */
.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  animation: modalSlideIn 0.3s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  overflow: hidden;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 16px;
  text-align: center;
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.warning-icon {
  width: 28px;
  height: 28px;
  color: #ef4444;
}

.modal-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* Modal Body */
.modal-body {
  padding: 0 24px 24px;
  text-align: center;
}

.modal-message {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f3f4f6;
}

.cancel-button,
.confirm-button {
  flex: 1;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cancel-button:hover {
  background: #f3f4f6;
}

.confirm-button {
  background: #ef4444;
  color: white;
}

.confirm-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 480px) {
  .modal-content {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .modal-header {
    padding: 24px 20px 12px;
  }
  
  .modal-body {
    padding: 0 20px 20px;
  }
  
  .modal-actions {
    padding: 20px;
    flex-direction: column;
  }
  
  .modal-title {
    font-size: 18px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .modal-content {
    animation: none;
  }
  
  .confirm-button:hover {
    transform: none;
  }
}
</style>
