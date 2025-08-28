<template>
  <div class="troubleshoot-panel">
    <div class="card">
      <div class="card-header">
        <h3>🔧 Troubleshoot Admin Issues</h3>
        <p class="text-muted">Panel untuk debug masalah admin dan tambah berita</p>
      </div>
      
      <div class="card-body">
        <!-- Admin Info Section -->
        <div class="section mb-4">
          <h4>👤 Admin Info Status</h4>
          <div class="info-display">
            <pre>{{ JSON.stringify(adminStatus, null, 2) }}</pre>
          </div>
          
          <div class="btn-group">
            <button @click="debugAdminInfo" class="btn btn-info btn-sm">
              🔍 Debug Admin Info
            </button>
            <button @click="setTestAdmin" class="btn btn-success btn-sm">
              ✅ Set Test Admin
            </button>
            <button @click="clearAuth" class="btn btn-warning btn-sm">
              🧹 Clear Auth
            </button>
          </div>
        </div>
        
        <!-- Test News Creation -->
        <div class="section mb-4">
          <h4>📰 Test News Creation</h4>
          <div class="form-group mb-3">
            <label>Test News Title:</label>
            <input 
              v-model="testNews.title" 
              type="text" 
              class="form-control"
              placeholder="Test News Title"
            >
          </div>
          
          <div class="form-group mb-3">
            <label>Content:</label>
            <textarea 
              v-model="testNews.content" 
              class="form-control" 
              rows="3"
              placeholder="Test news content..."
            ></textarea>
          </div>
          
          <button @click="testCreateNews" :disabled="isLoading" class="btn btn-primary">
            <span v-if="isLoading">⏳ Testing...</span>
            <span v-else>🧪 Test Create News</span>
          </button>
          
          <div v-if="newsTestResult" class="result-display mt-3">
            <h5>Result:</h5>
            <pre>{{ JSON.stringify(newsTestResult, null, 2) }}</pre>
          </div>
        </div>
        
        <!-- Firebase Connection Test -->
        <div class="section mb-4">
          <h4>🔥 Firebase Connection</h4>
          <button @click="testFirebaseConnection" class="btn btn-secondary">
            🔗 Test Firebase Connection
          </button>
          
          <div v-if="firebaseStatus" class="result-display mt-3">
            <div :class="['alert', firebaseStatus.connected ? 'alert-success' : 'alert-danger']">
              <strong>Status:</strong> {{ firebaseStatus.connected ? 'Connected ✅' : 'Failed ❌' }}
              <div v-if="firebaseStatus.newsCount !== undefined">
                News Count: {{ firebaseStatus.newsCount }}
              </div>
              <div v-if="firebaseStatus.error">
                Error: {{ firebaseStatus.error }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="section">
          <h4>⚡ Quick Actions</h4>
          <div class="btn-group-vertical">
            <button @click="completeTroubleshooting" class="btn btn-danger">
              🚀 Complete Troubleshooting
            </button>
            <button @click="forceAdminRole" class="btn btn-warning">
              💪 Force Admin Role
            </button>
            <button @click="resetAll" class="btn btn-dark">
              🔄 Reset Everything
            </button>
          </div>
        </div>
        
        <!-- Log Display -->
        <div class="section mt-4" v-if="logs.length > 0">
          <h4>📜 Activity Logs</h4>
          <div class="log-display">
            <div v-for="(log, index) in logs" :key="index" :class="['log-entry', log.type]">
              <span class="timestamp">{{ log.timestamp }}</span>
              <span class="message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'TroubleshootPanel',
  setup() {
    const adminStatus = ref({})
    const testNews = ref({
      title: 'Test Berita - ' + new Date().toLocaleString(),
      content: 'Ini adalah test berita untuk troubleshooting error tambah berita admin.'
    })
    const newsTestResult = ref(null)
    const firebaseStatus = ref(null)
    const isLoading = ref(false)
    const logs = ref([])
    
    // Logging function
    const addLog = (message, type = 'info') => {
      logs.value.unshift({
        timestamp: new Date().toLocaleTimeString(),
        message,
        type
      })
      
      // Keep only last 10 logs
      if (logs.value.length > 10) {
        logs.value = logs.value.slice(0, 10)
      }
    }
    
    // Debug admin info
    const debugAdminInfo = () => {
      try {
        const currentAdmin = localStorage.getItem('currentAdmin')
        const authStore = localStorage.getItem('authStore')
        
        adminStatus.value = {
          currentAdmin: currentAdmin ? JSON.parse(currentAdmin) : null,
          authStore: authStore ? JSON.parse(authStore) : null,
          timestamp: new Date().toISOString()
        }
        
        addLog('Admin info debugged successfully', 'success')
      } catch (error) {
        addLog(`Error debugging admin info: ${error.message}`, 'error')
      }
    }
    
    // Set test admin
    const setTestAdmin = () => {
      try {
        const adminInfo = {
          id: 'admin-test-' + Date.now(),
          name: 'Test Administrator',
          email: 'admin@myrajawali.com',
          role: 'admin'
        }
        
        localStorage.setItem('currentAdmin', JSON.stringify(adminInfo))
        localStorage.setItem('authStore', JSON.stringify({
          user: adminInfo,
          isAuthenticated: true,
          role: 'admin'
        }))
        
        adminStatus.value.currentAdmin = adminInfo
        addLog('Test admin set successfully', 'success')
      } catch (error) {
        addLog(`Error setting test admin: ${error.message}`, 'error')
      }
    }
    
    // Clear auth
    const clearAuth = () => {
      try {
        localStorage.removeItem('currentAdmin')
        localStorage.removeItem('authStore')
        localStorage.removeItem('userSession')
        
        adminStatus.value = {}
        addLog('Auth data cleared', 'warning')
      } catch (error) {
        addLog(`Error clearing auth: ${error.message}`, 'error')
      }
    }
    
    // Test create news
    const testCreateNews = async () => {
      isLoading.value = true
      newsTestResult.value = null
      
      try {
        // Import news service dynamically
        const { createNews } = await import('@/services/news.js')
        
        const newsData = {
          title: testNews.value.title,
          content: testNews.value.content,
          summary: 'Test berita troubleshooting',
          category: 'news',
          createdBy: 'admin-test'
        }
        
        addLog('Testing news creation...', 'info')
        const result = await createNews(newsData)
        
        newsTestResult.value = {
          success: true,
          result
        }
        
        addLog('News created successfully!', 'success')
      } catch (error) {
        newsTestResult.value = {
          success: false,
          error: error.message,
          stack: error.stack
        }
        
        addLog(`News creation failed: ${error.message}`, 'error')
      } finally {
        isLoading.value = false
      }
    }
    
    // Test Firebase connection
    const testFirebaseConnection = async () => {
      try {
        const { db } = await import('@/services/firebase.js')
        const { collection, getDocs } = await import('firebase/firestore')
        
        const testQuery = await getDocs(collection(db, 'news'))
        
        firebaseStatus.value = {
          connected: true,
          newsCount: testQuery.size
        }
        
        addLog(`Firebase connected. News count: ${testQuery.size}`, 'success')
      } catch (error) {
        firebaseStatus.value = {
          connected: false,
          error: error.message
        }
        
        addLog(`Firebase connection failed: ${error.message}`, 'error')
      }
    }
    
    // Complete troubleshooting
    const completeTroubleshooting = async () => {
      addLog('Starting complete troubleshooting...', 'info')
      
      clearAuth()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTestAdmin()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      debugAdminInfo()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await testFirebaseConnection()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await testCreateNews()
      
      addLog('Complete troubleshooting finished!', 'success')
    }
    
    // Force admin role
    const forceAdminRole = () => {
      try {
        const adminData = {
          id: 'admin-force',
          name: 'Forced Administrator',
          email: 'admin@myrajawali.com',
          role: 'admin',
          permissions: ['news_create', 'news_edit', 'news_delete', 'altar_schedule'],
          isActive: true,
          createdAt: new Date().toISOString()
        }
        
        localStorage.setItem('currentAdmin', JSON.stringify(adminData))
        localStorage.setItem('authStore', JSON.stringify({
          user: adminData,
          isAuthenticated: true,
          role: 'admin'
        }))
        
        adminStatus.value.currentAdmin = adminData
        addLog('Admin role forced successfully', 'success')
      } catch (error) {
        addLog(`Error forcing admin role: ${error.message}`, 'error')
      }
    }
    
    // Reset all
    const resetAll = () => {
      clearAuth()
      adminStatus.value = {}
      testNews.value = {
        title: 'Test Berita - ' + new Date().toLocaleString(),
        content: 'Ini adalah test berita untuk troubleshooting error tambah berita admin.'
      }
      newsTestResult.value = null
      firebaseStatus.value = null
      logs.value = []
      
      addLog('Everything reset', 'warning')
    }
    
    // Initialize on mount
    onMounted(() => {
      debugAdminInfo()
      addLog('Troubleshoot panel initialized', 'info')
    })
    
    return {
      adminStatus,
      testNews,
      newsTestResult,
      firebaseStatus,
      isLoading,
      logs,
      debugAdminInfo,
      setTestAdmin,
      clearAuth,
      testCreateNews,
      testFirebaseConnection,
      completeTroubleshooting,
      forceAdminRole,
      resetAll
    }
  }
}
</script>

<style scoped>
.troubleshoot-panel {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  background: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.card-header h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.card-body {
  padding: 20px;
}

.section {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.section:last-child {
  border-bottom: none;
}

.section h4 {
  margin-bottom: 15px;
  color: #555;
}

.info-display,
.result-display {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin: 10px 0;
}

.info-display pre,
.result-display pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
}

.btn-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary { background: #007bff; color: white; }
.btn-success { background: #28a745; color: white; }
.btn-info { background: #17a2b8; color: white; }
.btn-warning { background: #ffc107; color: black; }
.btn-danger { background: #dc3545; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-dark { background: #343a40; color: white; }

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  border: 1px solid transparent;
}

.alert-success {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.alert-danger {
  background: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.log-display {
  max-height: 300px;
  overflow-y: auto;
  background: #000;
  color: #fff;
  padding: 15px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-entry {
  display: block;
  margin-bottom: 5px;
  padding: 2px 0;
}

.log-entry.success { color: #28a745; }
.log-entry.error { color: #dc3545; }
.log-entry.warning { color: #ffc107; }
.log-entry.info { color: #17a2b8; }

.log-entry .timestamp {
  color: #6c757d;
  margin-right: 10px;
}

.text-muted {
  color: #6c757d;
}
</style>
