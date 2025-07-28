import { createRouter, createWebHistory } from 'vue-router'
// UPDATED: Import hybrid auth  
import { getCurrentUser } from '../services/auth-hybrid'
// Enhanced Security Guards
import {
  requireAuth,
  requireAdmin,
  requireModerator,
  requireGuest,
  requireRole,
  setupGlobalGuards,
  startSecurityMonitoring
} from '../middleware/authGuard'

import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import HomePage from '../views/HomePage.vue'
import SuccessRegister from '../views/SuccessRegister.vue'
import JadwalPage from '../views/JadwalPage.vue'
import DetailJadwal from '../views/DetailJadwal.vue'
import JadwalPeltarPage from '../views/JadwalPeltarPage.vue'
import DetailJadwalPeltar from '../views/DetailJadwalPeltar.vue'
import AdminAltarSchedules from '../views/admin/AdminAltarSchedules.vue'
import NewsPage from '../views/NewsPage.vue'
import DetailNews from '../views/DetailNews.vue'
import RenunganPage from '../views/RenunganPage.vue'
import DetailRenungan from '../views/DetailRenungan.vue'
import BookmarksPage from '../views/BookmarksPage.vue'
import AccountPage from '../views/AccountPage.vue'
// import PengurusMode from '../views/PengurusMode.vue'
import DetailProfile from '../views/DetailProfile.vue'
import TentangGereja from '../views/TentangGereja.vue'
import PrayerRequest from '../views/PrayerRequest.vue'
import AddPrayerReq from '../views/AddPrayerReq.vue'
import PrayerDetail from '../views/PrayerDetail.vue'
import GivingPage from '@/views/GivingPage.vue'

// ===== NEW ADMIN IMPORTS =====
import AdminLayout from '@/layouts/AdminLayout.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminNews from '@/views/admin/AdminNews.vue'
import AdminRenungan from '@/views/admin/AdminRenungan.vue'
import AdminLaporanJemaat from '@/views/admin/AdminLaporanJemaat.vue'
import LaporanJemaat from '@/views/LaporanJemaat.vue'

const routes = [
  // Public routes (guest only)
  { 
    path: '/', 
    name: 'LoginPage',
    component: LoginPage,
    beforeEnter: requireGuest
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage,
    beforeEnter: requireGuest
  },
  {
    path: '/success-register',
    name: 'SuccessRegister',
    component: SuccessRegister,
    beforeEnter: requireGuest
  },
  
  // Protected routes (require authentication)
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/account',
    name: 'AccountPage',
    component: AccountPage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  
  // Pengurus routes - RESTRICTED TO ADMIN ONLY (pengurus role hidden)
  // {
  //   path: '/pengurus/mode',
  //   name: 'PengurusMode',
  //   component: PengurusMode,
  //   meta: { 
  //     requiresAuth: true,
  //     requiresPengurus: true 
  //   }
  // },
  
  // Jadwal routes (require authentication)
  {
    path: '/jadwal',
    name: 'JadwalPage',
    component: JadwalPage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/jadwal/:id',
    name: 'DetailJadwal',
    component: DetailJadwal,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  
  // Jadwal Pelayan Altar routes (require authentication)
  {
    path: '/jadwal-peltar',
    name: 'JadwalPeltarPage',
    component: JadwalPeltarPage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/jadwal-peltar/:id',
    name: 'DetailJadwalPeltar',
    component: DetailJadwalPeltar,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  
  // News routes (require authentication)
  {
    path: '/news',
    name: 'NewsPage',
    component: NewsPage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/news/:id',
    name: 'DetailNews',
    component: DetailNews,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  
  // Renungan routes (require authentication)
  {
    path: '/renungan',
    name: 'RenunganPage',
    component: RenunganPage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/renungan/bookmarks',
    name: 'BookmarksPage',
    component: BookmarksPage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/renungan/:id',
    name: 'DetailRenungan',
    component: DetailRenungan,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },

  // Prayer routes (require authentication)
  {
    path: '/prayer-request',
    name: 'PrayerRequest',
    component: PrayerRequest,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/prayer-request/add',
    name: 'AddPrayerReq', 
    component: AddPrayerReq,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/prayer-request/:id',
    name: 'PrayerDetail',
    component: PrayerDetail,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/giving',
    name: 'GivingPage',
    component: GivingPage,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },

  // Profile routes (require authentication)
  {
    path: '/detail-profile',
    name: 'DetailProfile',
    component: DetailProfile,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/tentang-gereja',
    name: 'TentangGereja',
    component: TentangGereja,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan-jemaat',
    name: 'LaporanJemaat',
    component: LaporanJemaat,
    beforeEnter: requireAuth,
    meta: { requiresAuth: true }
  },

  // Special utility routes
  {
    path: '/update-structure',
    name: 'UpdateStructure', 
    component: () => import('@/views/UpdateStructurePage.vue'),
    beforeEnter: requireRole(['admin', 'super_admin']),
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  // ===== ADMIN ROUTES (require admin role) =====
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: requireAdmin,
    meta: { 
      requiresAuth: true, 
      requiresAdmin: true,
      title: 'Admin Panel'
    },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { 
          title: 'Dashboard',
          breadcrumb: 'Dashboard'
        }
      },
      // {
      //   path: 'users',
      //   name: 'AdminUsers',
      //   component: () => import('@/views/admin/AdminUsers.vue'),
      //   meta: { 
      //     title: 'Kelola Jemaat',
      //     breadcrumb: 'Kelola Jemaat'
      //   }
      // },
      {
        path: 'news',
        name: 'AdminNews', 
        component: AdminNews,
        beforeEnter: requireModerator,
        meta: { 
          requiresAuth: true,
          requiresModerator: true,
          title: 'Kelola Berita'
        }
      },
      {
        path: 'renungan',
        name: 'AdminRenungan', 
        component: AdminRenungan,
        beforeEnter: requireModerator,
        meta: { 
          requiresAuth: true,
          requiresModerator: true,
          title: 'Kelola Renungan',
          breadcrumb: 'Kelola Renungan'
        }
      },
      {
        path: 'schedules',
        name: 'AdminSchedules',
        component: () => import('@/views/admin/AdminSchedules.vue'),
        beforeEnter: requireModerator,
        meta: { 
          requiresAuth: true,
          requiresModerator: true,
          title: 'Kelola Jadwal',
          breadcrumb: 'Kelola Jadwal'
        }
      },
      {
        path: 'altar-schedules',
        name: 'AdminAltarSchedules',
        component: AdminAltarSchedules,
        beforeEnter: requireModerator,
        meta: { 
          requiresAuth: true,
          requiresModerator: true,
          title: 'Kelola Jadwal Pelayan Altar',
          breadcrumb: 'Jadwal Peltar'
        }
      },
      {
        path: 'prayer-requests',
        name: 'AdminPrayerRequests',
        component: () => import('@/views/admin/AdminPrayerRequests.vue'),
        beforeEnter: requireModerator,
        meta: { 
          requiresAuth: true,
          requiresModerator: true,
          title: 'Kelola Prayer Requests',
          breadcrumb: 'Prayer Requests'
        }
      },
      {
        path: 'laporan-jemaat',
        name: 'AdminLaporanJemaat',
        component: AdminLaporanJemaat,
        beforeEnter: requireAdmin,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true,
          title: 'Laporan Jemaat',
          breadcrumb: 'Laporan Jemaat'
        }
      },
      // Admin-only routes
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/AdminUsers.vue'),
        beforeEnter: requireAdmin,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true,
          title: 'Kelola Jemaat',
          breadcrumb: 'Kelola Jemaat'
        }
      },
      {
        path: 'security',
        name: 'AdminSecurity',
        component: () => import('@/views/admin/AdminSecurity.vue'),
        beforeEnter: requireAdmin,
        meta: { 
          requiresAuth: true,
          requiresAdmin: true,
          title: 'Security Monitoring',
          breadcrumb: 'Security'
        }
      }
      // {
      //   path: 'announcements',
      //   name: 'AdminAnnouncements',
      //   component: () => import('@/views/admin/AdminAnnouncements.vue'),
      //   meta: { 
      //     title: 'Kelola Pengumuman',
      //     breadcrumb: 'Kelola Pengumuman'
      //   }
      // }
    ]
  },

  // ===== CATCH ALL ROUTE =====
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Setup enhanced security guards
setupGlobalGuards(router)

// Start security monitoring
startSecurityMonitoring()

// Legacy route guard (keeping for backward compatibility)
router.beforeEach(async (to, from, next) => {
  // Skip if enhanced guards already handled the route
  if (to.meta.handledByEnhancedGuard) {
    next()
    return
  }

  const currentUser = getCurrentUser()
  
  // Clear user data when going to login
  if (to.path === '/') {
    await clearUserDataFromMemory()
  }
  
  // Legacy auth check (fallback)
  if (to.meta.requiresAuth && !currentUser) {
    next('/')
    return
  }
  
  // Legacy admin check (fallback)
  if (to.meta.requiresAdmin && currentUser) {
    const userRole = currentUser.role || 'jemaat'
    const isAdmin = userRole === 'admin'
    
    if (!isAdmin) {
      // Development bypass
      if (process.env.NODE_ENV === 'development') {
        const localUser = localStorage.getItem('user')
        if (localUser) {
          try {
            const parsedUser = JSON.parse(localUser)
            const localRole = parsedUser.role
            if (localRole === 'admin') {
              next()
              return
            }
          } catch (error) {
            // Silent fail
          }
        }
      }
      
      alert('❌ Akses ditolak! Hanya admin yang dapat mengakses panel admin.')
      next('/home')
      return
    }
  }
  
  next()
})

// Helper function
async function clearUserDataFromMemory() {
  try {
    const { useUserStore } = await import('@/stores/userStore')
    const userStore = useUserStore()
    userStore.clearUserData()
  } catch (error) {
    console.error('Error clearing user data:', error)
  }
}

export default router