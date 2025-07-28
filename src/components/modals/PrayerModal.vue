<!-- src/components/modals/PrayerModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h3>Detail Prayer Request</h3>
        <button @click="closeModal" class="close-button">×</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <div v-if="prayer" class="prayer-detail">
          <!-- User Info -->
          <div class="user-info">
            <strong>Dari:</strong> {{ prayer.isAnonymous ? 'Pengguna Anonim' : getUserDisplayName(prayer) }}
          </div>
          
          <!-- Date -->
          <div class="date-info">
            <strong>Tanggal:</strong> {{ formatDateSimple(prayer.createdAt) }}
          </div>
          
          <!-- Category & Status Badges -->
          <div class="badges">
            <span class="category-badge">{{ getCategoryLabel(prayer.category) }}</span>
            <span v-if="prayer.isUrgent" class="urgent-badge">Mendesak</span>
            <span class="status-badge" :class="{ 'prayed': prayer.isPrayed || prayer.isPrayedByAdmin }">
              {{ (prayer.isPrayed || prayer.isPrayedByAdmin) ? 'Sudah Didoakan' : 'Belum Didoakan' }}
            </span>
          </div>
          
          <!-- Prayer Content -->
          <div class="prayer-content">
            <h4>{{ prayer.title }}</h4>
            <p>{{ prayer.description }}</p>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button @click="closeModal" class="btn btn-secondary">
          Tutup
        </button>
        
        <button 
          v-if="!prayer.isPrayed && !prayer.isPrayedByAdmin && showAdminActions" 
          @click="$emit('mark-as-prayed', prayer)"
          class="btn btn-primary"
          :disabled="processing"
        >
          {{ processing ? 'Memproses...' : 'Tandai Sudah Didoakan' }}
        </button>
        
        <button 
          v-if="showAdminActions"
          @click="$emit('delete-prayer', prayer)"
          class="btn btn-danger"
          :disabled="processing"
        >
          Hapus
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrayerModal',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    prayer: {
      type: Object,
      default: null
    },
    showAdminActions: {
      type: Boolean,
      default: false
    },
    processing: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close', 'mark-as-prayed', 'delete-prayer'],
  
  methods: {
    closeModal() {
      this.$emit('close')
    },
    
    getUserDisplayName(prayer) {
      if (prayer.userName && prayer.userName.trim() && prayer.userName !== 'User') {
        return prayer.userName
      }
      if (prayer.nama && prayer.nama.trim() && prayer.nama !== 'User') {
        return prayer.nama
      }
      if (prayer.userId && prayer.userId !== 'demo-user' && prayer.userId !== 'User' && 
          !prayer.userId.startsWith('unknown_user_')) {
        return prayer.userId
      }
      return 'User Tidak Dikenal'
    },
    
    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Invalid Date'
      }
    },
    
    formatDateSimple(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Invalid Date'
      }
    },
    
    getCategoryLabel(category) {
      const labels = {
        'health': 'Kesehatan',
        'work': 'Pekerjaan',
        'family': 'Keluarga',
        'finances': 'Keuangan',
        'education': 'Pendidikan',
        'spiritual': 'Spiritual',
        'relationship': 'Hubungan',
        'guidance': 'Bimbingan',
        'other': 'Lainnya'
      }
      return labels[category] || 'Lainnya'
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Modal Header */
.modal-header {
  background: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-button:hover {
  background: #e9ecef;
  color: #495057;
}

/* Modal Body */
.modal-body {
  padding: 20px;
  max-height: 50vh;
  overflow-y: auto;
}

.prayer-detail {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-info, .date-info {
  font-size: 14px;
  color: #495057;
}

.user-info strong, .date-info strong {
  color: #2c3e50;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-badge, .urgent-badge, .status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.category-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.urgent-badge {
  background: #ffebee;
  color: #d32f2f;
}

.status-badge {
  background: #fff3e0;
  color: #ef6c00;
}

.status-badge.prayed {
  background: #e8f5e8;
  color: #2e7d32;
}

.prayer-content {
  border-top: 1px solid #e9ecef;
  padding-top: 15px;
}

.prayer-content h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.prayer-content p {
  margin: 0;
  color: #495057;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* Modal Footer */
.modal-footer {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .modal-header {
    padding: 15px;
  }
  
  .modal-body {
    padding: 15px;
  }
  
  .modal-footer {
    padding: 15px;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
