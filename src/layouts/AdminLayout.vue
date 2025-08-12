<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <img src="@/assets/logos/logo-MyRajawali.png" alt="Logo" class="logo" />
        <h2>MyRajawali Admin</h2>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item">
          <LayoutDashboard class="nav-icon" />
          Dashboard
        </router-link>
        <!-- Ganti router-link jadi button dengan @click -->
        <button @click="navigateToNews" class="nav-item nav-button">
          <Newspaper class="nav-icon" />
          Kelola Berita
        </button>
        <button @click="navigateToRenungan" class="nav-item nav-button">
          <BookOpen class="nav-icon" />
          Kelola Renungan
        </button>
        <router-link to="/admin/schedules" class="nav-item">
          <Calendar class="nav-icon" />
          Kelola Jadwal
        </router-link>
        <router-link to="/admin/altar-schedules" class="nav-item">
          <CalendarHeart class="nav-icon" />
          Jadwal Peltar
        </router-link>
        <router-link to="/admin/prayer-requests" class="nav-item">
          <Heart class="nav-icon" />
          Prayer Requests
        </router-link>
        <router-link to="/admin/laporan-jemaat" class="nav-item">
          <FileText class="nav-icon" />
          Laporan Jemaat
        </router-link>
        <router-link to="/admin/kelola-jemaat" class="nav-item">
          <Users class="nav-icon" />
          Kelola Data Jemaat
        </router-link>
        <router-link to="/home" class="nav-item back-to-app">
          <Home class="nav-icon" />
          Kembali ke App
        </router-link>
      </nav>
    </aside>
    
    <!-- Main Content tetap sama -->
    <main class="admin-main">
      <!-- Top Bar -->
      <header class="admin-header">
        <h1>{{ $route.meta.title || 'Admin Panel' }}</h1>
        <div class="header-actions">
          <span>{{ userStore.user?.nama || 'Admin' }}</span>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </header>
      
      <!-- Page Content -->
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  Newspaper, 
  BookOpen,
  Calendar, 
  CalendarHeart,
  Heart, 
  FileText, 
  Users,
  Home 
} from 'lucide-vue-next'

export default {
  name: 'AdminLayout',
  components: {
    LayoutDashboard,
    Newspaper,
    BookOpen,
    Calendar,
    CalendarHeart,
    Heart,
    FileText,
    Users,
    Home
  },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    
    const logout = () => {
      userStore.logout()
      router.push('/')
    }
    
    return { userStore, logout }
  },
  mounted() {
    // Load Cloudinary debugging tools in admin panel
    if (process.env.NODE_ENV === 'development') {
      this.loadCloudinaryDebugTools()
    }
  },
  methods: {
    navigateToNews() {
      this.$router.push('/admin/news')
    },
    navigateToRenungan() {
      this.$router.push('/admin/renungan')
    },
    loadCloudinaryDebugTools() {
      try {
        // Load debugging script if not already loaded
        if (!window.testMultiplePresets) {
          const script = document.createElement('script')
          script.src = '/test-cloudinary-browser.js'
          script.onload = () => {
            console.log('🛠️ Cloudinary debug tools loaded! Available commands:')
            console.log('- testMultiplePresets()')
            console.log('- testUploadWithPreset("ml_default")')
            console.log('- testCloudinaryConnection()')
          }
          script.onerror = () => {
            console.warn('⚠️ Could not load Cloudinary debug tools')
          }
          document.head.appendChild(script)
        }
        
        // Load thumbnail debug tools
        if (!window.runAllThumbnailTests) {
          const thumbnailScript = document.createElement('script')
          thumbnailScript.src = '/debug-thumbnail-renungan.js'
          thumbnailScript.onload = () => {
            console.log('🖼️ Thumbnail debug tools loaded! Available commands:')
            console.log('- runAllThumbnailTests()')
            console.log('- testThumbnailUrls()')
            console.log('- checkCurrentPageThumbnails()')
          }
          document.head.appendChild(thumbnailScript)
        }
      } catch (error) {
        console.warn('⚠️ Error loading debug tools:', error)
      }
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

/* Sidebar */
.admin-sidebar {
  width: 260px;
  background: #2d3748;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
}

.sidebar-brand {
  padding: 20px;
  border-bottom: 1px solid #4a5568;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 32px;
  height: 32px;
}

.sidebar-brand h2 {
  font-size: 16px;
  margin: 0;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #cbd5e0;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  font-weight: 500;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-item:hover {
  background: #4a5568;
  color: white;
}

.nav-item.router-link-active {
  background: #3182ce;
  border-left-color: #63b3ed;
  color: white;
}

.nav-item.back-to-app {
  margin-top: auto;
  border-top: 1px solid #4a5568;
  color: #9ca3af;
}

.nav-item.back-to-app:hover {
  color: #e5e7eb;
}

.nav-button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  width: 100%;
  text-align: left;
}

.nav-button:focus {
  outline: none;
}

.nav-button:focus-visible {
  outline: 2px solid #63b3ed;
  outline-offset: 2px;
}

/* Main Content */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px;
}

.admin-header {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.admin-header h1 {
  margin: 0;
  font-size: 24px;
  color: #2d3748;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions span {
  color: #4a5568;
  font-weight: 500;
}

.logout-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 500;
}

.logout-btn:hover {
  background: #c53030;
}

.admin-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f7fafc;
}

/* Responsive untuk tablet */
@media (max-width: 1024px) {
  .admin-sidebar {
    width: 220px;
  }
  
  .admin-main {
    margin-left: 220px;
  }
  
  .admin-content {
    padding: 16px;
  }
}

/* Hide admin pada mobile - karena tidak responsive */
@media (max-width: 768px) {
  .admin-layout::before {
    content: 'Admin panel hanya tersedia di desktop. Silakan buka di komputer/laptop.';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #2d3748;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    font-size: 18px;
    text-align: center;
    padding: 20px;
  }
  
  .admin-sidebar,
  .admin-main {
    display: none;
  }
}
</style>