<template>
  <div class="admin-telegram-container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Kelola Registrasi Telegram</h1>
      <div class="header-actions">
        <AdminButton 
          @click="refreshData" 
          :icon="RefreshCw"
          variant="secondary"
          size="sm"
          :loading="loading"
        >
          Refresh
        </AdminButton>
        <AdminButton 
          @click="showTestModal" 
          :icon="Send"
          variant="info"
          size="sm"
        >
          Test Broadcast
        </AdminButton>
      </div>
    </div>

    <!-- Simple Bot Control -->
    <AdminCard class="bot-control-card" v-if="!loading">
      <div class="bot-control-content">
        <div class="bot-info">
          <h3>🤖 Telegram Bot</h3>
          <p class="bot-description">Auto-receive user registrations</p>
        </div>
        
        <div class="bot-toggle-section">
          <div class="bot-status">
            <span :class="['status-dot', pollingStatus.isPolling ? 'active' : 'inactive']"></span>
            <span class="status-text">{{ pollingStatus.isPolling ? 'AKTIF' : 'MATI' }}</span>
          </div>
          
          <div class="toggle-switch" @click="togglePolling" :class="{ active: pollingStatus.isPolling, loading: pollingLoading }">
            <div class="toggle-slider">
              <div class="toggle-button"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Optional: Compact stats when active -->
      <div v-if="pollingStatus.isPolling" class="bot-stats">
        <small>⏱️ {{ pollingUptime }}</small>
        <small>🔄 {{ lastPollingCheck }}</small>
      </div>
    </AdminCard>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <AdminCard class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">Pending Approval</div>
          <Clock class="stat-icon pending-icon" />
        </div>
      </AdminCard>
      
      <AdminCard class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ approvedCount }}</div>
          <div class="stat-label">Approved</div>
          <CheckCircle class="stat-icon approved-icon" />
        </div>
      </AdminCard>
      
      <AdminCard class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ totalCount }}</div>
          <div class="stat-label">Total Registrasi</div>
          <Users class="stat-icon total-icon" />
        </div>
      </AdminCard>
    </div>

    <!-- Maintenance Actions -->
    <AdminCard class="maintenance-card">
      <div class="maintenance-header">
        <h3>🛠️ Maintenance Actions</h3>
        <p class="text-sm text-gray-600">Tools untuk membersihkan dan memperbaiki data registrasi</p>
      </div>
      
      <div class="maintenance-actions">
        <AdminButton 
          @click="cleanupDuplicates" 
          variant="warning"
          size="sm"
          :loading="cleaningUp"
          :icon="Trash2"
        >
          🧹 Clean Duplicates
        </AdminButton>
        
        <AdminButton 
          @click="forceRefreshData" 
          variant="primary"
          size="sm"
          :loading="loading"
          :icon="RefreshCw"
        >
          🔄 Refresh Data
        </AdminButton>
      </div>
    </AdminCard>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Memuat data registrasi...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <AdminAlert type="error" :message="error" />
    </div>

    <!-- Main Content -->
    <div v-else class="content-section">
      
      <!-- Pending Registrations -->
      <AdminCard v-if="pendingRegistrations.length > 0" class="section-card">
        <template #header>
          <h2 class="section-title">
            <Clock class="section-icon" />
            Menunggu Approval ({{ pendingRegistrations.length }})
          </h2>
        </template>
        
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Telegram ID</th>
                <th>Tanggal Daftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="registration in pendingRegistrations" :key="registration.id">
                <td>
                  <div class="user-info">
                    <strong>{{ registration.telegramFirstName }}</strong>
                    <span v-if="registration.telegramLastName">{{ registration.telegramLastName }}</span>
                  </div>
                </td>
                <td>
                  <span v-if="registration.telegramUsername" class="username">
                    @{{ registration.telegramUsername }}
                  </span>
                  <span v-else class="no-username">Tidak ada</span>
                </td>
                <td class="telegram-id">{{ registration.telegramUserId }}</td>
                <td class="date">{{ formatDate(registration.registeredAt) }}</td>
                <td class="actions">
                  <AdminButton 
                    @click="approveRegistration(registration)" 
                    :icon="Check"
                    variant="success"
                    size="sm"
                    :loading="processingIds.includes(registration.id)"
                  >
                    Approve
                  </AdminButton>
                  <AdminButton 
                    @click="rejectRegistration(registration)" 
                    :icon="X"
                    variant="danger"
                    size="sm"
                    :loading="processingIds.includes(registration.id)"
                  >
                    Reject
                  </AdminButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AdminCard>

      <!-- No Pending Message -->
      <AdminCard v-else class="section-card">
        <div class="empty-state">
          <CheckCircle class="empty-icon" />
          <h3>Tidak Ada Registrasi Pending</h3>
          <p>Semua registrasi sudah diproses atau belum ada yang mendaftar.</p>
        </div>
      </AdminCard>

      <!-- Approved Registrations -->
      <AdminCard class="section-card">
        <template #header>
          <h2 class="section-title">
            <CheckCircle class="section-icon" />
            Jemaat Telegram Approved ({{ approvedRegistrations.length }})
          </h2>
        </template>
        
        <div v-if="approvedRegistrations.length > 0" class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Telegram ID</th>
                <th>Disetujui</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="registration in approvedRegistrations" :key="registration.id">
                <td>
                  <div class="user-info">
                    <strong>{{ registration.telegramFirstName }}</strong>
                    <span v-if="registration.telegramLastName">{{ registration.telegramLastName }}</span>
                  </div>
                </td>
                <td>
                  <span v-if="registration.telegramUsername" class="username">
                    @{{ registration.telegramUsername }}
                  </span>
                  <span v-else class="no-username">Tidak ada</span>
                </td>
                <td class="telegram-id">{{ registration.telegramUserId }}</td>
                <td class="date">{{ formatDate(registration.approvedAt) }}</td>
                <td>
                  <span class="status-badge approved">
                    <CheckCircle class="status-icon" />
                    Aktif
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="empty-state">
          <Users class="empty-icon" />
          <h3>Belum Ada Jemaat Approved</h3>
          <p>Setelah ada registrasi yang di-approve, mereka akan muncul di sini.</p>
        </div>
      </AdminCard>
    </div>

    <!-- Test Broadcast Modal -->
    <div v-if="showTestBroadcast" class="modal-overlay" @click="closeTestModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Test Broadcast Telegram</h3>
          <button @click="closeTestModal" class="close-btn">
            <X />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Pesan Test:</label>
            <textarea 
              v-model="testMessage" 
              placeholder="Masukkan pesan test untuk dikirim ke semua jemaat yang approved..."
              rows="4"
              class="form-textarea"
            ></textarea>
          </div>
          
          <div class="warning-notice">
            <AlertTriangle class="warning-icon" />
            <div>
              <p><strong>Perhatian:</strong></p>
              <p>Pesan ini akan dikirim ke <strong>{{ approvedCount }} jemaat</strong> yang sudah di-approve.</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <AdminButton 
            @click="closeTestModal" 
            variant="secondary"
            size="sm"
          >
            Batal
          </AdminButton>
          <AdminButton 
            @click="sendTestBroadcast" 
            :icon="Send"
            variant="primary"
            size="sm"
            :loading="sendingTest"
            :disabled="!testMessage.trim()"
          >
            Kirim Test
          </AdminButton>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="toast success-toast">
      <CheckCircle class="toast-icon" />
      <span>{{ successMessage }}</span>
    </div>
    
    <div v-if="errorMessage" class="toast error-toast">
      <AlertCircle class="toast-icon" />
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { 
  RefreshCw, Clock, CheckCircle, Users, Check, X, 
  Send, AlertTriangle, AlertCircle, Trash2
} from 'lucide-vue-next'

// Components
import AdminButton from '@/components/admin/AdminButton.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import AdminAlert from '@/components/admin/AdminAlert.vue'

// Services
import simpleTelegramRegistration from '@/services/simpleTelegramRegistration'
import telegramService from '@/services/telegramService'
import { safeTimeout, safeInterval, safeClearInterval } from '@/utils/domSafeGuard'

export default {
  name: 'AdminTelegram',
  components: {
    AdminButton,
    AdminCard,
    AdminAlert,
    Clock,
    CheckCircle,
    Users,
    X,
    AlertTriangle,
    AlertCircle,
    // eslint-disable-next-line vue/no-unused-components
    Trash2
  },
  setup() {
    const userStore = useUserStore()
    
    // Reactive data
    const loading = ref(false)
    const error = ref(null)
    const pendingRegistrations = ref([])
    const approvedRegistrations = ref([])
    const processingIds = ref([])
    
    // Test broadcast
    const showTestBroadcast = ref(false)
    const testMessage = ref('')
    const sendingTest = ref(false)
    
    // Messages
    const successMessage = ref('')
    const errorMessage = ref('')
    
    // Maintenance
    const cleaningUp = ref(false)
    
    // Polling control with auto-start and keep-alive
    const pollingStatus = ref({ isPolling: false, lastUpdateId: 0 })
    const pollingLoading = ref(false)
    const pollingStartTime = ref(null)
    const pollingUptime = ref('0s')
    const lastPollingCheck = ref('Never')
    let telegramPollingService = null

    // Load polling service async
    const loadPollingService = async () => {
      try {
        const module = await import('@/services/telegramPollingService')
        telegramPollingService = module.default
        console.log('✅ Telegram polling service loaded')
      } catch (error) {
        console.warn('⚠️ Failed to load polling service:', error.message)
        // Create fallback
        telegramPollingService = {
          isPolling: false,
          getStatus: () => ({ isPolling: false, lastUpdateId: 0 }),
          startPolling: async () => { 
            console.log('⚠️ Polling service not available')
            return Promise.reject(new Error('Polling service not available'))
          },
          stopPolling: () => { console.log('⚠️ Polling service not available') }
        }
      }
    }

    // Computed properties
    const pendingCount = computed(() => pendingRegistrations.value.length)
    const approvedCount = computed(() => approvedRegistrations.value.length)
    const totalCount = computed(() => pendingCount.value + approvedCount.value)

    // Polling methods
    const updatePollingStatus = () => {
      try {
        if (telegramPollingService && typeof telegramPollingService.getStatus === 'function') {
          const status = telegramPollingService.getStatus()
          pollingStatus.value = { ...status }
        } else {
          pollingStatus.value = { isPolling: false, lastUpdateId: 0, pollingDelay: 2000 }
        }
      } catch (error) {
        console.error('Error updating polling status:', error)
        pollingStatus.value = { isPolling: false, lastUpdateId: 0, pollingDelay: 2000 }
      }
    }

    const startPolling = async () => {
      pollingLoading.value = true
      try {
        if (telegramPollingService && typeof telegramPollingService.startPolling === 'function') {
          await telegramPollingService.startPolling()
          pollingStartTime.value = new Date() // Track start time
          updatePollingStatus()
          showSuccessMessage('Bot polling berhasil diaktifkan! Sekarang bot bisa menerima pesan /start dari user baru.')
        } else {
          throw new Error('Telegram polling service not available')
        }
      } catch (error) {
        console.error('Error starting polling:', error)
        showErrorMessage('Gagal memulai polling: ' + error.message)
      } finally {
        pollingLoading.value = false
      }
    }

    const stopPolling = async () => {
      pollingLoading.value = true
      try {
        if (telegramPollingService && typeof telegramPollingService.stopPolling === 'function') {
          telegramPollingService.stopPolling()
          pollingStartTime.value = null // Reset start time
          updatePollingStatus()
          showSuccessMessage('Bot polling dihentikan.')
        } else {
          throw new Error('Telegram polling service not available')
        }
      } catch (error) {
        console.error('Error stopping polling:', error)
        showErrorMessage('Gagal menghentikan polling: ' + error.message)
      } finally {
        pollingLoading.value = false
      }
    }

    const restartPolling = async () => {
      pollingLoading.value = true
      try {
        console.log('🔄 Restarting Telegram polling...')
        
        // Stop first
        if (telegramPollingService && typeof telegramPollingService.stopPolling === 'function') {
          telegramPollingService.stopPolling()
        }
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Start again
        if (telegramPollingService && typeof telegramPollingService.startPolling === 'function') {
          await telegramPollingService.startPolling()
          pollingStartTime.value = new Date()
          updatePollingStatus()
          showSuccessMessage('🔄 Bot polling berhasil direstart!')
        } else {
          throw new Error('Telegram polling service not available')
        }
      } catch (error) {
        console.error('Error restarting polling:', error)
        showErrorMessage('Gagal restart polling: ' + error.message)
      } finally {
        pollingLoading.value = false
      }
    }

    const togglePolling = async () => {
      if (pollingLoading.value) return // Prevent double clicks
      
      if (pollingStatus.value.isPolling) {
        await stopPolling()
      } else {
        await startPolling()
      }
    }

    // Methods
    const fetchData = async () => {
      loading.value = true
      error.value = null
      
      try {
        console.log('🔄 Fetching Telegram registrations...')
        
        const [pending, approved] = await Promise.all([
          simpleTelegramRegistration.getPendingRegistrations(),
          simpleTelegramRegistration.getApprovedRegistrations()
        ])
        
        console.log('📋 Raw pending data:', pending)
        console.log('📋 Raw approved data:', approved)
        
        pendingRegistrations.value = pending
        approvedRegistrations.value = approved
        
        console.log(`✅ Loaded ${pending.length} pending, ${approved.length} approved`)
        
        // Debug specific user
        const christyInPending = pending.find(p => p.telegramUserId === '1220960394')
        const christyInApproved = approved.find(a => a.telegramUserId === '1220960394')
        
        if (christyInPending) {
          console.log('⚠️ CHRISTY FOUND IN PENDING:', christyInPending)
        }
        if (christyInApproved) {
          console.log('⚠️ CHRISTY FOUND IN APPROVED:', christyInApproved)
        }
        
      } catch (err) {
        console.error('❌ Error fetching data:', err)
        error.value = 'Gagal memuat data registrasi: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const refreshData = () => {
      fetchData()
    }

    const approveRegistration = async (registration) => {
      if (processingIds.value.includes(registration.id)) return
      
      processingIds.value.push(registration.id)
      
      try {
        console.log('✅ Approving registration:', registration.telegramFirstName)
        
        await simpleTelegramRegistration.approveRegistration(
          registration.telegramUserId, 
          userStore.user.id || userStore.user.nama || 'admin'
        )
        
        showSuccessMessage(`${registration.telegramFirstName} berhasil di-approve!`)
        
        // Refresh data
        await fetchData()
        
      } catch (err) {
        console.error('❌ Error approving registration:', err)
        showErrorMessage('Gagal approve registrasi: ' + err.message)
      } finally {
        processingIds.value = processingIds.value.filter(id => id !== registration.id)
      }
    }

    const rejectRegistration = async (registration) => {
      if (processingIds.value.includes(registration.id)) return
      
      if (!confirm(`Yakin ingin reject registrasi ${registration.telegramFirstName}?`)) {
        return
      }
      
      processingIds.value.push(registration.id)
      
      try {
        console.log('❌ Rejecting registration:', registration.telegramFirstName)
        console.log('📋 Registration data:', registration)
        console.log('👤 Admin ID:', userStore.user.id || userStore.user.nama || 'admin')
        
        const result = await simpleTelegramRegistration.rejectRegistration(
          registration.telegramUserId, 
          userStore.user.id || userStore.user.nama || 'admin'
        )
        
        console.log('📤 Reject result:', result)
        
        showSuccessMessage(`${registration.telegramFirstName} di-reject`)
        
        // Refresh data
        console.log('🔄 Refreshing data after reject...')
        await fetchData()
        
      } catch (err) {
        console.error('❌ Error rejecting registration:', err)
        showErrorMessage('Gagal reject registrasi: ' + err.message)
      } finally {
        processingIds.value = processingIds.value.filter(id => id !== registration.id)
      }
    }

    const showTestModal = () => {
      if (approvedCount.value === 0) {
        showErrorMessage('Tidak ada jemaat yang approved untuk test broadcast')
        return
      }
      testMessage.value = '🧪 Test broadcast dari admin MyRajawali.\n\nJika Anda menerima pesan ini, berarti sistem Telegram berfungsi dengan baik! 🙏'
      showTestBroadcast.value = true
    }

    const closeTestModal = () => {
      showTestBroadcast.value = false
      testMessage.value = ''
    }

    const sendTestBroadcast = async () => {
      if (!testMessage.value.trim()) return
      
      sendingTest.value = true
      
      try {
        console.log('📤 Sending test broadcast...')
        
        const result = await telegramService.sendBroadcastToAllJemaat(testMessage.value)
        
        if (result.success) {
          showSuccessMessage(`Test broadcast berhasil! ${result.results.success}/${result.results.total} terkirim`)
        } else {
          showErrorMessage('Test broadcast gagal')
        }
        
        closeTestModal()
        
      } catch (err) {
        console.error('❌ Error sending test broadcast:', err)
        showErrorMessage('Gagal kirim test broadcast: ' + err.message)
      } finally {
        sendingTest.value = false
      }
    }

    // Maintenance methods
    const cleanupDuplicates = async () => {
      if (!confirm('Yakin ingin membersihkan data duplikat? Ini akan menghapus registrasi yang duplikat secara permanen.')) {
        return
      }
      
      cleaningUp.value = true
      
      try {
        console.log('🧹 Starting duplicate cleanup...')
        
        const result = await simpleTelegramRegistration.cleanupDuplicateRegistrations()
        
        if (result.success) {
          showSuccessMessage(`✅ Berhasil membersihkan ${result.deletedCount} data duplikat!`)
          
          // Show details if any
          if (result.deletedDocs.length > 0) {
            console.log('🗑️ Deleted documents:', result.deletedDocs)
          }
          
          // Refresh data
          await fetchData()
        } else {
          showErrorMessage('Gagal membersihkan data duplikat')
        }
        
      } catch (err) {
        console.error('❌ Error cleaning duplicates:', err)
        showErrorMessage('Gagal membersihkan data duplikat: ' + err.message)
      } finally {
        cleaningUp.value = false
      }
    }

    const forceRefreshData = async () => {
      console.log('🔄 Manual data refresh triggered')
      await fetchData()
      showSuccessMessage('Data berhasil di-refresh!')
    }

    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const showSuccessMessage = (message) => {
      successMessage.value = message
      safeTimeout(() => {
        if (successMessage.value === message) {
          successMessage.value = ''
        }
      }, 5000)
    }

    const showErrorMessage = (message) => {
      errorMessage.value = message
      safeTimeout(() => {
        if (errorMessage.value === message) {
          errorMessage.value = ''
        }
      }, 5000)
    }

    // Lifecycle
    onMounted(async () => {
      try {
        await fetchData()
      } catch (error) {
        console.error('Error fetching initial data:', error)
      }
      
      // Load polling service first
      try {
        await loadPollingService()
      } catch (error) {
        console.error('Error loading polling service:', error)
      }
      
      // Initialize polling status safely
      safeTimeout(() => {
        try {
          updatePollingStatus()
        } catch (error) {
          console.error('Error initializing polling status:', error)
        }
      }, 1000)
      
      // Auto-start polling after 3 seconds
      safeTimeout(async () => {
        try {
          console.log('🚀 Auto-starting Telegram polling...')
          if (!pollingStatus.value.isPolling) {
            await startPolling()
            console.log('✅ Auto-start polling completed')
          }
        } catch (error) {
          console.error('❌ Auto-start polling failed:', error)
        }
      }, 3000)
      
      // Update polling status every 5 seconds
      const intervalId = safeInterval(() => {
        try {
          updatePollingStatus()
        } catch (error) {
          console.error('Error in polling status interval:', error)
        }
      }, 5000)
      
      // Cleanup interval on unmount
      return () => {
        safeClearInterval(intervalId)
      }
    })

    return {
      // Data
      loading,
      error,
      pendingRegistrations,
      approvedRegistrations,
      processingIds,
      showTestBroadcast,
      testMessage,
      sendingTest,
      successMessage,
      errorMessage,
      pollingStatus,
      pollingLoading,
      pollingUptime,
      lastPollingCheck,
      cleaningUp,
      
      // Computed
      pendingCount,
      approvedCount,
      totalCount,
      
      // Methods
      refreshData,
      approveRegistration,
      rejectRegistration,
      showTestModal,
      closeTestModal,
      sendTestBroadcast,
      formatDate,
      startPolling,
      stopPolling,
      togglePolling,
      restartPolling,
      cleanupDuplicates,
      forceRefreshData,
      
      // Icons for AdminButton props
      RefreshCw,
      Check,
      Send,
      Trash2
    }
  }
}
</script>

<style scoped>
.admin-telegram-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  opacity: 0.8;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.section-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.user-info strong {
  display: block;
  color: #111827;
  font-weight: 600;
}

.user-info span {
  color: #6b7280;
  font-size: 0.875rem;
}

.username {
  color: #3b82f6;
  font-weight: 500;
}

.no-username {
  color: #9ca3af;
  font-style: italic;
}

.telegram-id {
  font-family: 'Courier New', monospace;
  color: #6b7280;
  font-size: 0.875rem;
}

.date {
  color: #6b7280;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.approved {
  background: #dcfce7;
  color: #166534;
}

.status-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #9ca3af;
  margin: 0 auto 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

/* Polling Control Styles */
.polling-control-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  margin-bottom: 2rem;
}

.polling-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.polling-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.polling-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-indicator.active {
  background: #10b981;
}

.status-indicator.inactive {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.polling-description {
  margin: 0 0 1rem;
  opacity: 0.9;
  line-height: 1.5;
}

.polling-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.polling-info {
  color: rgba(255, 255, 255, 0.8);
}

/* Modal Styles */
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.warning-notice {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  margin-top: 1rem;
}

.warning-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #d97706;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.warning-notice p {
  margin: 0;
  font-size: 0.875rem;
  color: #92400e;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Toast Styles */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1100;
  font-weight: 500;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.success-toast {
  background: #10b981;
  color: white;
}

.error-toast {
  background: #ef4444;
  color: white;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 768px) {
  .admin-telegram-container {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}

/* Simple Bot Control Styles */
.bot-control-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.bot-control-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.bot-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  color: white;
}

.bot-description {
  margin: 0;
  opacity: 0.9;
  font-size: 0.875rem;
}

.bot-toggle-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bot-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.active {
  background-color: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.status-dot.inactive {
  background-color: #ef4444;
  animation: none;
}

.status-text {
  font-weight: 600;
  font-size: 0.875rem;
}

.toggle-switch {
  width: 50px;
  height: 26px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.toggle-switch:hover {
  background-color: rgba(255, 255, 255, 0.4);
}

.toggle-switch.active {
  background-color: #10b981;
}

.toggle-switch.loading {
  cursor: not-allowed;
  opacity: 0.7;
}

.toggle-slider {
  width: 100%;
  height: 100%;
  position: relative;
}

.toggle-button {
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-button {
  transform: translateX(24px);
}

.bot-stats {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  margin-top: 1rem;
  border-radius: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.bot-stats small {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75rem;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Legacy styles cleanup - remove old polling styles */
.polling-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(16, 185, 129, 0.1);
  border-radius: 6px;
  border-left: 3px solid #10b981;
}

.polling-stats small {
  color: #059669;
  font-weight: 500;
}

.polling-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 1rem;
}

.polling-info {
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  font-size: 0.75rem;
  color: #1d4ed8;
}
</style>
