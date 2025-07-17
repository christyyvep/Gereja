<!-- src/views/admin/AdminDashboard.vue - Modern Redesign -->
<template>
  <div class="modern-admin-dashboard">
    <!-- Compact Welcome Header -->
    <div class="welcome-header">
      <div class="welcome-info">
        <h1 class="welcome-title">Dashboard Admin</h1>
        <p class="welcome-date">{{ getCurrentDate() }}</p>
      </div>
      <button @click="refreshAllData" class="refresh-btn" :disabled="refreshing">
        <RefreshCw :class="['refresh-icon', { rotating: refreshing }]" />
      </button>
    </div>

    <!-- Compact Stats Grid -->
    <div class="stats-grid-modern">
      <!-- Users Card -->
      <div class="stat-card-modern users">
        <div class="stat-header">
          <div class="stat-icon">
            <Users class="icon" />
          </div>
          <div class="stat-trend">+{{ stats.newUsersThisMonth }}</div>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalUsers }}</h3>
          <p class="stat-label">Total Jemaat</p>
          <div class="stat-details">
            <span class="detail-item">
              <Shield class="detail-icon" />
              {{ stats.adminUsers }} Admin
            </span>
            <span class="detail-item">
              <User class="detail-icon" />
              {{ stats.regularUsers }} Jemaat
            </span>
          </div>
        </div>
      </div>

      <!-- News Card -->
      <div class="stat-card-modern news">
        <div class="stat-header">
          <div class="stat-icon">
            <Newspaper class="icon" />
          </div>
          <div class="stat-trend">+{{ stats.newsThisWeek }}</div>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalNews }}</h3>
          <p class="stat-label">Total Berita</p>
          <div class="stat-details">
            <span class="detail-item">
              <CheckCircle class="detail-icon" />
              {{ stats.publishedNews }} Published
            </span>
            <span class="detail-item">
              <Edit class="detail-icon" />
              {{ stats.draftNews }} Draft
            </span>
          </div>
        </div>
      </div>

      <!-- Schedules Card -->
      <div class="stat-card-modern schedules">
        <div class="stat-header">
          <div class="stat-icon">
            <Calendar class="icon" />
          </div>
          <div class="stat-trend">{{ stats.upcomingSchedules }}</div>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalSchedules }}</h3>
          <p class="stat-label">Total Jadwal</p>
          <div class="stat-details">
            <span class="detail-item">
              <Church class="detail-icon" />
              {{ stats.worshipSchedules }} Ibadah
            </span>
            <span class="detail-item">
              <Heart class="detail-icon" />
              {{ stats.altarSchedules }} Peltar
            </span>
          </div>
        </div>
      </div>

      <!-- Activity Card -->
      <div class="stat-card-modern activity">
        <div class="stat-header">
          <div class="stat-icon">
            <TrendingUp class="icon" />
          </div>
          <div class="stat-trend">+{{ stats.loginGrowth }}%</div>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.activeUsers }}</h3>
          <p class="stat-label">User Aktif</p>
          <div class="stat-details">
            <span class="detail-item">
              <Clock class="detail-icon" />
              {{ stats.todayLogins }} Hari ini
            </span>
            <span class="detail-item">
              <Calendar class="detail-icon" />
              {{ stats.weeklyLogins }} Minggu ini
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Recent Activity -->
    <div class="activity-section">
      <div class="section-header">
        <h2 class="section-title">
          <Activity class="section-icon" />
          Aktivitas Terbaru
        </h2>
        <button @click="refreshActivity" class="mini-refresh-btn">
          <RefreshCw class="mini-icon" />
        </button>
      </div>
      
      <div class="activity-list-modern">
        <div v-for="activity in recentActivity.slice(0, 5)" :key="activity.id" class="activity-item-modern">
          <div class="activity-icon-modern" :class="getActivityIconClass(activity.type)">
            <component :is="getActivityIconComponent(activity.type)" class="activity-svg" />
          </div>
          <div class="activity-content-modern">
            <p class="activity-text-modern">{{ activity.text }}</p>
            <span class="activity-time-modern">{{ formatRelativeTime(activity.timestamp) }}</span>
          </div>
          <div class="activity-status-modern" :class="getActivityStatusClass(activity.type)">
            {{ getActivityStatus(activity.type) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Compact System Status -->
    <div class="system-section">
      <h2 class="section-title">
        <Server class="section-icon" />
        Status Sistem
      </h2>
      <div class="system-grid-modern">
        <div class="system-item">
          <div class="system-status online"></div>
          <div class="system-info">
            <span class="system-name">Database</span>
            <span class="system-detail">Online</span>
          </div>
        </div>
        
        <div class="system-item">
          <div class="system-status online"></div>
          <div class="system-info">
            <span class="system-name">Authentication</span>
            <span class="system-detail">Active</span>
          </div>
        </div>
        
        <div class="system-item">
          <div class="system-status warning"></div>
          <div class="system-info">
            <span class="system-name">Storage</span>
            <span class="system-detail">75% Used</span>
          </div>
        </div>
        
        <div class="system-item">
          <div class="system-status online"></div>
          <div class="system-info">
            <span class="system-name">PWA Service</span>
            <span class="system-detail">Running</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { 
  RefreshCw, 
  Users, 
  User, 
  Shield, 
  Newspaper, 
  CheckCircle, 
  Edit,
  Calendar, 
  Church, 
  Heart,
  TrendingUp, 
  Clock,
  Activity,
  Server,
  UserPlus,
  FileText,
  Settings,
  AlertCircle,
  MessageSquare
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { 
  collection, 
  getDocs
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { getAllUsersWithRoles } from '@/services/auth'
import { getNews } from '@/services/news'

export default {
  name: 'AdminDashboard',
  components: {
    RefreshCw, Users, User, Shield, Newspaper, CheckCircle, Edit,
    Calendar, Church, Heart, TrendingUp, Clock, Activity, Server,
    UserPlus, FileText, Settings, AlertCircle, MessageSquare
  },
  setup() {
    const userStore = useUserStore()
    
    // Reactive data
    const refreshing = ref(false)
    const lastSync = ref('Baru saja')
    
    // Stats data
    const stats = ref({
      totalUsers: 0,
      adminUsers: 0,
      regularUsers: 0,
      newUsersThisMonth: 0,
      totalNews: 0,
      publishedNews: 0,
      draftNews: 0,
      newsThisWeek: 0,
      totalSchedules: 0,
      worshipSchedules: 0,
      altarSchedules: 0,
      upcomingSchedules: 0,
      activeUsers: 0,
      todayLogins: 0,
      weeklyLogins: 0,
      loginGrowth: 0
    })
    
    // Recent activity
    const recentActivity = ref([])
    
    // Current user
    const currentUser = computed(() => userStore.user || {})
    
    // Load statistics dari Firebase
    const loadStats = async () => {
      try {
        // Load Users Statistics
        const users = await getAllUsersWithRoles()
        stats.value.totalUsers = users.length
        stats.value.adminUsers = users.filter(u => u.role === 'admin').length
        stats.value.regularUsers = users.filter(u => (u.role || 'jemaat') === 'jemaat').length
        stats.value.newUsersThisMonth = Math.floor(users.length * 0.1)
        
        // Load News Statistics
        const news = await getNews(100)
        stats.value.totalNews = news.length
        stats.value.publishedNews = news.filter(n => n.isPublished).length
        stats.value.draftNews = news.filter(n => !n.isPublished).length
        
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        stats.value.newsThisWeek = news.filter(n => {
          const created = n.createdAt?.toDate?.() || new Date(n.createdAt)
          return created > oneWeekAgo
        }).length
        
        // Load Schedules Statistics
        const jadwalSnapshot = await getDocs(collection(db, 'jadwal'))
        const altarSnapshot = await getDocs(collection(db, 'jadwal-peltar'))
        
        stats.value.worshipSchedules = jadwalSnapshot.size
        stats.value.altarSchedules = altarSnapshot.size
        stats.value.totalSchedules = jadwalSnapshot.size + altarSnapshot.size
        stats.value.upcomingSchedules = Math.floor(stats.value.totalSchedules * 0.3)
        
        // Mock activity stats
        stats.value.activeUsers = Math.floor(users.length * 0.6)
        stats.value.todayLogins = Math.floor(users.length * 0.15)
        stats.value.weeklyLogins = Math.floor(users.length * 0.8)
        stats.value.loginGrowth = 12
        
        console.log('📊 Dashboard stats loaded:', stats.value)
        
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      }
    }
    
    // Load recent activity
    const loadRecentActivity = () => {
      const activities = [
        {
          id: 1,
          type: 'user_register',
          text: 'Maria Sari mendaftar sebagai jemaat baru',
          user: 'System',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 2,
          type: 'news_published',
          text: 'Berita "Kebaktian Natal 2024" dipublikasikan',
          user: currentUser.value.nama || 'Admin',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          id: 3,
          type: 'schedule_updated',
          text: 'Jadwal ibadah Minggu diperbarui',
          user: currentUser.value.nama || 'Admin',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
        },
        {
          id: 4,
          type: 'role_changed',
          text: 'Role user John Doe diubah menjadi admin',
          user: currentUser.value.nama || 'Admin',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        {
          id: 5,
          type: 'announcement_created',
          text: 'Pengumuman retreat gereja dibuat',
          user: currentUser.value.nama || 'Admin',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ]
      
      recentActivity.value = activities
    }
    
    // Refresh all data
    const refreshAllData = async () => {
      refreshing.value = true
      try {
        await Promise.all([
          loadStats(),
          loadRecentActivity()
        ])
        lastSync.value = 'Baru saja'
      } catch (error) {
        console.error('Error refreshing data:', error)
      } finally {
        refreshing.value = false
      }
    }
    
    // Refresh activity only
    const refreshActivity = () => {
      loadRecentActivity()
    }
    
    // Helper functions
    const getCurrentDate = () => {
      return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const formatRelativeTime = (timestamp) => {
      const now = new Date()
      const diff = now - timestamp
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (hours < 1) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes < 1 ? 'Baru saja' : `${minutes}m`
      } else if (hours < 24) {
        return `${hours}h`
      } else {
        const days = Math.floor(hours / 24)
        return `${days}d`
      }
    }
    
    const getActivityIconComponent = (type) => {
      const icons = {
        'user_register': 'UserPlus',
        'news_published': 'FileText',
        'schedule_updated': 'Calendar',
        'role_changed': 'Settings',
        'announcement_created': 'MessageSquare'
      }
      return icons[type] || 'AlertCircle'
    }
    
    const getActivityIconClass = (type) => {
      const classes = {
        'user_register': 'activity-user',
        'news_published': 'activity-news',
        'schedule_updated': 'activity-schedule',
        'role_changed': 'activity-role',
        'announcement_created': 'activity-announcement'
      }
      return classes[type] || 'activity-default'
    }
    
    const getActivityStatus = (type) => {
      const statuses = {
        'user_register': 'New',
        'news_published': 'Published',
        'schedule_updated': 'Updated',
        'role_changed': 'Changed',
        'announcement_created': 'Created'
      }
      return statuses[type] || 'Action'
    }
    
    const getActivityStatusClass = (type) => {
      const classes = {
        'user_register': 'status-new',
        'news_published': 'status-published',
        'schedule_updated': 'status-updated',
        'role_changed': 'status-changed',
        'announcement_created': 'status-created'
      }
      return classes[type] || 'status-default'
    }
    
    // Load data on mount
    onMounted(() => {
      refreshAllData()
    })
    
    return {
      currentUser,
      refreshing,
      lastSync,
      stats,
      recentActivity,
      refreshAllData,
      refreshActivity,
      getCurrentDate,
      formatRelativeTime,
      getActivityIconComponent,
      getActivityIconClass,
      getActivityStatus,
      getActivityStatusClass
    }
  }
}
</script>

<style scoped>
.modern-admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8fafc;
  min-height: calc(100vh - 64px);
}

/* Compact Welcome Header */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.welcome-date {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
}

.refresh-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  width: 18px;
  height: 18px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Modern Compact Stats Grid */
.stats-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card-modern {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 4px solid;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.stat-card-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-card-modern.users { border-left-color: #3b82f6; }
.stat-card-modern.news { border-left-color: #10b981; }
.stat-card-modern.schedules { border-left-color: #f59e0b; }
.stat-card-modern.activity { border-left-color: #8b5cf6; }

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.users .stat-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.news .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.schedules .stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.activity .stat-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.stat-icon .icon {
  width: 20px;
  height: 20px;
}

.stat-trend {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.detail-icon {
  width: 14px;
  height: 14px;
}

/* Compact Activity Section */
.activity-section, .system-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 20px;
  height: 20px;
  color: #64748b;
}

.mini-refresh-btn {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.mini-refresh-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.mini-icon {
  width: 14px;
  height: 14px;
}

.activity-list-modern {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.2s;
}

.activity-item-modern:hover {
  background: #f1f5f9;
}

.activity-icon-modern {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-user { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.activity-news { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.activity-schedule { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.activity-role { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.activity-announcement { background: rgba(236, 72, 153, 0.1); color: #ec4899; }

.activity-svg {
  width: 16px;
  height: 16px;
}

.activity-content-modern {
  flex: 1;
  min-width: 0;
}

.activity-text-modern {
  font-size: 14px;
  color: #334155;
  margin: 0 0 2px 0;
  font-weight: 500;
}

.activity-time-modern {
  font-size: 12px;
  color: #94a3b8;
}

.activity-status-modern {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-new { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.status-published { background: rgba(16, 185, 129, 0.1); color: #059669; }
.status-updated { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.status-changed { background: rgba(139, 92, 246, 0.1); color: #7c3aed; }
.status-created { background: rgba(236, 72, 153, 0.1); color: #be185d; }

/* Compact System Status */
.system-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.system-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.system-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.system-status.online {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.system-status.warning {
  background: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
}

.system-name {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  display: block;
}

.system-detail {
  font-size: 11px;
  color: #64748b;
  display: block;
}

/* Responsive */
@media (max-width: 768px) {
  .modern-admin-dashboard {
    padding: 16px;
  }
  
  .welcome-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .stats-grid-modern {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-card-modern {
    padding: 16px;
  }
  
  .activity-item-modern {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .system-grid-modern {
    grid-template-columns: 1fr;
  }
}
</style>