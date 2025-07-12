import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentJemaat } from '../services/auth'

// Import components
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


const routes = [
  // Public routes
  { 
    path: '/', 
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage
  },
  {
    path: '/success-register',
    name: 'SuccessRegister',
    component: SuccessRegister
  },
  
  // Protected routes
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/account',
    name: 'AccountPage',
    component: AccountPage,
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
  
  // Jadwal routes
  {
    path: '/jadwal',
    name: 'JadwalPage',
    component: JadwalPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/jadwal/:id',
    name: 'DetailJadwal',
    component: DetailJadwal,
    meta: { requiresAuth: true }
  },
  
  // Jadwal Pelayan Altar routes
  {
    path: '/jadwal-peltar',
    name: 'JadwalPeltarPage',
    component: JadwalPeltarPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/jadwal-peltar/:id',
    name: 'DetailJadwalPeltar',
    component: DetailJadwalPeltar,
    meta: { requiresAuth: true }
  },
  
  // News routes
  {
    path: '/news',
    name: 'NewsPage',
    component: NewsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/news/:id',
    name: 'DetailNews',
    component: DetailNews,
    meta: { requiresAuth: true }
  },
  
  // Renungan routes
  {
    path: '/renungan',
    name: 'RenunganPage',
    component: RenunganPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/renungan/bookmarks',
    name: 'BookmarksPage',
    component: BookmarksPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/renungan/:id',
    name: 'DetailRenungan',
    component: DetailRenungan,
    meta: { requiresAuth: true }
  },

  // Prayer Detail Route
  {
    path: '/prayer-request',
    name: 'PrayerRequest',
    component: PrayerRequest,
    meta: { requiresAuth: true }
  },
  {
    path: '/prayer-request/add',
    name: 'AddPrayerReq', 
    component: AddPrayerReq,
    meta: { requiresAuth: true }
  },
  {
    path: '/prayer-request/:id',
    name: 'PrayerDetail',
    component: PrayerDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/giving',
    name: 'GivingPage',
    component: GivingPage,
    meta: { requiresAuth: true }
  },

  // Other routes
  {
    path: '/notifikasi',
    name: 'NotifikasiPage',
    component: () => import('../views/NotifikasiPage.vue'),
    meta: { requiresAuth: true }
  },
  {
  path: '/detail-profile',
  name: 'DetailProfile',
  component: DetailProfile,
  meta: { requiresAuth: true }
  },
  {
    path: '/tentang-gereja',
    name: 'TentangGereja',
    component: TentangGereja,
    meta: { requiresAuth: true }
  },
  {
    path: '/update-structure',
    name: 'UpdateStructure', 
    component: () => import('@/views/UpdateStructurePage.vue')
  },
  {
    path: '/admin/altar-schedules',
    name: 'AdminAltarSchedules',
    component: AdminAltarSchedules,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard
router.beforeEach(async (to, from, next) => {
  const currentUser = getCurrentJemaat()
  
  // Clear user data when going to login
  if (to.path === '/') {
    await clearUserDataFromMemory()
  }
  
  // Check authentication
  if (to.meta.requiresAuth && !currentUser) {
    next('/')
    return
  }
  
  // Check pengurus permission - RESTRICTED TO ADMIN ONLY (pengurus role hidden)
  if (to.meta.requiresPengurus) {
    if (!currentUser) {
      next('/home')
      return
    }
    
    const userRole = currentUser.role || 'jemaat'
    // Only admin can access pengurus features now
    const isAdmin = userRole === 'admin'
    
    if (!isAdmin) {
      // Development bypass for admin only
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
            // Silent fail in production
          }
        }
      }
      
      alert('❌ Akses ditolak! Hanya admin yang dapat mengakses fitur ini.')
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