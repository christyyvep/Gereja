<template>
  <div class="simple-admin-dashboard">
    <div class="admin-header">
      <h1>🎛️ Admin Dashboard</h1>
      <p>Selamat datang di panel administrasi MyRajawali</p>
    </div>

    <div class="admin-stats">
      <div class="stat-card">
        <h3>👥 Total Jemaat</h3>
        <p class="stat-number">{{ stats.totalUsers || 0 }}</p>
      </div>
      <div class="stat-card">
        <h3>📰 Total Berita</h3>
        <p class="stat-number">{{ stats.totalNews || 0 }}</p>
      </div>
      <div class="stat-card">
        <h3>📖 Total Renungan</h3>
        <p class="stat-number">{{ stats.totalRenungan || 0 }}</p>
      </div>
      <div class="stat-card">
        <h3>🙏 Prayer Requests</h3>
        <p class="stat-number">{{ stats.totalPrayers || 0 }}</p>
      </div>
    </div>

    <div class="admin-actions">
      <h2>⚡ Quick Actions</h2>
      <div class="action-grid">
        <router-link to="/admin/kelola-jemaat" class="action-card">
          <div class="action-icon">👥</div>
          <h3>Kelola Data Jemaat</h3>
          <p>Tambah, edit, hapus data anggota jemaat</p>
        </router-link>
        
        <router-link to="/admin/news" class="action-card">
          <div class="action-icon">📰</div>
          <h3>Kelola Berita</h3>
          <p>Publikasi dan manage berita gereja</p>
        </router-link>
        
        <router-link to="/admin/renungan" class="action-card">
          <div class="action-icon">📖</div>
          <h3>Kelola Renungan</h3>
          <p>Tambah dan edit renungan harian</p>
        </router-link>
        
        <router-link to="/admin/schedules" class="action-card">
          <div class="action-icon">📅</div>
          <h3>Kelola Jadwal</h3>
          <p>Atur jadwal ibadah dan kegiatan</p>
        </router-link>
      </div>
    </div>

    <div class="debug-info" v-if="showDebug">
      <h3>🔍 Debug Info</h3>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { getCurrentUser } from '@/services/auth-hybrid'

export default {
  name: 'SimpleAdminDashboard',
  setup() {
    const stats = reactive({
      totalUsers: 0,
      totalNews: 0,
      totalRenungan: 0,
      totalPrayers: 0
    })

    const showDebug = ref(false)
    const debugInfo = ref({})

    const loadStats = async () => {
      try {
        // Basic stats loading - simplified version
        stats.totalUsers = Math.floor(Math.random() * 100) + 50 // Mock data
        stats.totalNews = Math.floor(Math.random() * 50) + 10
        stats.totalRenungan = Math.floor(Math.random() * 30) + 5
        stats.totalPrayers = Math.floor(Math.random() * 20) + 1
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    const loadDebugInfo = () => {
      const currentUser = getCurrentUser()
      debugInfo.value = {
        user: currentUser,
        timestamp: new Date().toISOString(),
        location: window.location.href,
        localStorage: {
          hasUser: !!localStorage.getItem('myrajawali_user'),
          hasSession: !!localStorage.getItem('myrajawali_session')
        }
      }
    }

    onMounted(() => {
      loadStats()
      loadDebugInfo()
      
      // Show debug on double-click
      const handleDoubleClick = () => {
        showDebug.value = !showDebug.value
      }
      
      document.addEventListener('dblclick', handleDoubleClick)
    })

    return {
      stats,
      showDebug,
      debugInfo
    }
  }
}
</script>

<style scoped>
.simple-admin-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.admin-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5rem;
}

.admin-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  color: #667eea;
}

.admin-actions {
  margin-bottom: 40px;
}

.admin-actions h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.action-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.action-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.debug-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.debug-info h3 {
  margin-top: 0;
  color: #2c3e50;
}

.debug-info pre {
  background: white;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9rem;
  border: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .simple-admin-dashboard {
    padding: 15px;
  }
  
  .admin-header h1 {
    font-size: 2rem;
  }
  
  .admin-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}
</style>
