<!-- Quick Auth Test Component untuk debugging -->
<template>
  <div class="auth-test-panel" v-if="isDevelopment">
    <h3>🧪 Hybrid Auth Test Panel</h3>
    
    <div class="test-status">
      <div class="status-item">
        <span class="label">Firebase:</span>
        <span :class="['status', firebaseStatus]">{{ firebaseStatus }}</span>
      </div>
      
      <div class="status-item">
        <span class="label">Auth Service:</span>
        <span :class="['status', authServiceStatus]">{{ authServiceStatus }}</span>
      </div>
      
      <div class="status-item">
        <span class="label">Current User:</span>
        <span class="value">{{ currentUser ? currentUser.nama : 'Not logged in' }}</span>
      </div>
      
      <div class="status-item">
        <span class="label">Session:</span>
        <span class="value">{{ hasSession ? 'Active' : 'Inactive' }}</span>
      </div>
    </div>
    
    <div class="test-actions">
      <button @click="testFirebase" class="test-btn">Test Firebase</button>
      <button @click="testAuthService" class="test-btn">Test Auth Service</button>
      <button @click="clearStorage" class="test-btn">Clear Storage</button>
      <button @click="showConsoleInfo" class="test-btn">Console Info</button>
    </div>
    
    <div class="test-logs" v-if="logs.length">
      <h4>Recent Logs:</h4>
      <div class="log-entries">
        <div v-for="(log, index) in logs" :key="index" :class="['log-entry', log.type]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getCurrentUser, isLoggedIn } from '../services/auth-hybrid'

export default {
  name: 'AuthTestPanel',
  setup() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const firebaseStatus = ref('checking')
    const authServiceStatus = ref('checking')
    const currentUser = ref(null)
    const hasSession = ref(false)
    const logs = ref([])
    
    const addLog = (message, type = 'info') => {
      logs.value.unshift({
        time: new Date().toLocaleTimeString(),
        message,
        type
      })
      if (logs.value.length > 10) logs.value.pop()
    }
    
    const testFirebase = async () => {
      try {
        addLog('Testing Firebase connection...', 'info')
        const { db } = await import('../services/firebase-security')
        if (db) {
          firebaseStatus.value = 'connected'
          addLog('✅ Firebase connected successfully', 'success')
        }
      } catch (error) {
        firebaseStatus.value = 'error'
        addLog(`❌ Firebase error: ${error.message}`, 'error')
      }
    }
    
    const testAuthService = async () => {
      try {
        addLog('Testing Auth Service...', 'info')
        
        // Test getCurrentUser
        const user = getCurrentUser()
        const loggedIn = isLoggedIn()
        
        currentUser.value = user
        hasSession.value = loggedIn
        
        authServiceStatus.value = 'ready'
        addLog(`✅ Auth Service ready. Logged in: ${loggedIn}`, 'success')
        
        if (user) {
          addLog(`✅ Current user: ${user.nama} (${user.role})`, 'success')
        }
        
      } catch (error) {
        authServiceStatus.value = 'error'
        addLog(`❌ Auth Service error: ${error.message}`, 'error')
      }
    }
    
    const clearStorage = () => {
      localStorage.clear()
      sessionStorage.clear()
      addLog('🧹 Storage cleared', 'info')
      
      currentUser.value = null
      hasSession.value = false
    }
    
    const showConsoleInfo = () => {
      console.group('🧪 MyRajawali Hybrid Auth Debug Info')
      console.log('Current User:', getCurrentUser())
      console.log('Is Logged In:', isLoggedIn())
      console.log('LocalStorage Keys:', Object.keys(localStorage))
      console.log('SessionStorage Keys:', Object.keys(sessionStorage))
      console.log('Current URL:', window.location.href)
      console.groupEnd()
      
      addLog('📋 Debug info logged to console', 'info')
    }
    
    onMounted(async () => {
      if (!isDevelopment) return
      
      addLog('🚀 Auth Test Panel initialized', 'info')
      
      // Auto-test on mount
      await testFirebase()
      await testAuthService()
    })
    
    return {
      isDevelopment,
      firebaseStatus,
      authServiceStatus,
      currentUser,
      hasSession,
      logs,
      testFirebase,
      testAuthService,
      clearStorage,
      showConsoleInfo
    }
  }
}
</script>

<style scoped>
.auth-test-panel {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  max-width: 300px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.auth-test-panel h3 {
  margin: 0 0 1rem 0;
  font-size: 14px;
  color: #4ade80;
}

.test-status {
  margin-bottom: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  color: #94a3b8;
}

.status.connected,
.status.ready {
  color: #4ade80;
}

.status.checking {
  color: #fbbf24;
}

.status.error {
  color: #f87171;
}

.value {
  color: #e2e8f0;
}

.test-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.test-btn {
  padding: 4px 8px;
  background: #374151;
  color: white;
  border: 1px solid #4b5563;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
}

.test-btn:hover {
  background: #4b5563;
}

.test-logs {
  max-height: 200px;
  overflow-y: auto;
}

.test-logs h4 {
  margin: 0 0 0.5rem 0;
  font-size: 12px;
  color: #94a3b8;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-entry {
  display: flex;
  gap: 0.5rem;
  font-size: 10px;
}

.log-time {
  color: #6b7280;
  min-width: 60px;
}

.log-message {
  flex: 1;
}

.log-entry.success .log-message {
  color: #4ade80;
}

.log-entry.error .log-message {
  color: #f87171;
}

.log-entry.info .log-message {
  color: #60a5fa;
}
</style>
