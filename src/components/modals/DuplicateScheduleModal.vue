<template>
  <div v-if="show" class="modal-overlay" @click="handleBackdropClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div class="header-icon">
          <AlertTriangle class="warning-icon" />
        </div>
        <h2 class="modal-title">Konflik Jadwal Ditemukan</h2>
        <button @click="close" class="close-btn">
          <X class="close-icon" />
        </button>
      </div>
      
      <div class="modal-body">
        <div class="warning-message">
          <p class="main-message">
            Pelayan yang Anda pilih sudah memiliki jadwal pada waktu yang sama:
          </p>
          
          <div class="conflicts-list">
            <div 
              v-for="(conflict, index) in conflicts" 
              :key="index" 
              class="conflict-item"
            >
              <div class="conflict-header">
                <span class="conflict-number">{{ index + 1 }}.</span>
                <div class="conflict-info">
                  <h4 class="conflict-title">{{ conflict.categoryLabel }}</h4>
                  <p class="conflict-date">{{ conflict.tanggal }} {{ conflict.jam ? `• ${conflict.jam}` : '' }}</p>
                </div>
              </div>
              
              <div class="duplicate-users">
                <div 
                  v-for="user in conflict.duplicateUsers" 
                  :key="user.normalizedName"
                  class="duplicate-user"
                >
                  <User class="user-icon" />
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-status">sudah bertugas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="solution-suggestions">
          <h4 class="suggestions-title">💡 Saran Solusi:</h4>
          <ul class="suggestions-list">
            <li>Pilih pelayan lain untuk posisi yang sama</li>
            <li>Ubah tanggal atau jam jadwal</li>
            <li>Periksa kembali jadwal yang sudah ada</li>
          </ul>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="close" class="btn-primary">
          <Check class="btn-icon" />
          Mengerti
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { AlertTriangle, X, User, Check } from 'lucide-vue-next'

export default {
  name: 'DuplicateScheduleModal',
  
  components: {
    AlertTriangle,
    X,
    User,
    Check
  },
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    conflicts: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['close'],
  
  methods: {
    close() {
      this.$emit('close')
    },
    
    handleBackdropClick() {
      this.close()
    }
  }
}
</script>

<style scoped>
/* ========================================
   MODAL OVERLAY & CONTAINER
========================================= */
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
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ========================================
   MODAL HEADER
========================================= */
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 0 24px;
  position: relative;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fef3c7;
  border-radius: 12px;
  flex-shrink: 0;
}

.warning-icon {
  width: 24px;
  height: 24px;
  color: #f59e0b;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 24px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-icon {
  width: 18px;
  height: 18px;
}

/* ========================================
   MODAL BODY
========================================= */
.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.warning-message {
  margin-bottom: 24px;
}

.main-message {
  font-size: 16px;
  color: #374151;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

/* ========================================
   CONFLICTS LIST
========================================= */
.conflict-item {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.conflict-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.conflict-number {
  font-weight: 600;
  color: #f59e0b;
  font-size: 16px;
  flex-shrink: 0;
}

.conflict-info {
  flex: 1;
}

.conflict-title {
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 4px 0;
}

.conflict-date {
  font-size: 14px;
  color: #92400e;
  margin: 0;
  opacity: 0.8;
}

.duplicate-user {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #fbbf24;
  margin-bottom: 8px;
}

.user-icon {
  width: 16px;
  height: 16px;
  color: #f59e0b;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #92400e;
  flex: 1;
}

.user-status {
  font-size: 12px;
  color: #b45309;
  background: #fcd34d;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

/* ========================================
   SOLUTION SUGGESTIONS
========================================= */
.solution-suggestions {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 16px;
}

.suggestions-title {
  font-size: 14px;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 12px 0;
}

.suggestions-list {
  margin: 0;
  padding-left: 16px;
  color: #0c4a6e;
}

.suggestions-list li {
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 1.4;
}

/* ========================================
   MODAL FOOTER
========================================= */
.modal-footer {
  padding: 16px 24px 24px 24px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* ========================================
   RESPONSIVE
========================================= */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-container {
    max-height: 95vh;
    border-radius: 12px;
  }
  
  .modal-header {
    padding: 20px 20px 0 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 12px 20px 20px 20px;
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .conflict-item {
    padding: 12px;
  }
  
  .solution-suggestions {
    padding: 12px;
  }
}
</style>
