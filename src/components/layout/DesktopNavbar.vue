<!-- DesktopNavbar.vue - Reusable Desktop Navigation Component -->
<template>
    <nav class="desktop-navbar">
      <div class="navbar-content">
        <!-- Brand Section -->
        <div class="navbar-brand">
          <img 
            src="@/assets/logos/logo-MyRajawali.png" 
            alt="MyRajawali" 
            class="navbar-logo"
          />
          <span class="brand-text">MyRajawali</span>
        </div>
        
        <!-- Navigation Menu -->
        <div class="navbar-menu">
          <router-link 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path" 
            :class="['nav-link', item.class]"
            :exact="item.exact"
          >
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  import { computed } from 'vue'
  import { useUserStore } from '@/stores/userStore'

  export default {
    name: 'DesktopNavbar',
    
    props: {
      // Allow customization of active page if needed
      activePage: {
        type: String,
        default: null
      }
    },
    
    setup() {
      const userStore = useUserStore()
      
      // Reactive computed for admin check
      const isAdmin = computed(() => {
        const user = userStore.user
        
        // Enhanced admin check dengan debugging
        if (!user) {
          console.log('🚫 [DesktopNavbar] No user found')
          return false
        }
        
        const role = user.role || 'jemaat'
        const isAdminRole = ['admin', 'administrator', 'gembala'].includes(role.toLowerCase())
        
        console.log('🔍 [DesktopNavbar] Admin check:', {
          userName: user.nama,
          userRole: role,
          isAdmin: isAdminRole
        })
        
        return isAdminRole
      })

      // Check if user can access admin panel (admin, gembala, or operator)
      const canAccessAdminPanel = computed(() => {
        const user = userStore.user
        
        if (!user) {
          return false
        }
        
        const role = user.role || 'jemaat'
        const canAccess = ['admin', 'administrator', 'gembala', 'operator'].includes(role.toLowerCase())
        
        console.log('🔍 [DesktopNavbar] Admin panel access check:', {
          userName: user.nama,
          userRole: role,
          canAccess: canAccess
        })
        
        return canAccess
      })
      
      // Reactive computed for menu items
      const menuItems = computed(() => {
        const items = [
          { path: '/home', label: 'Home', exact: false },
          { path: '/account', label: 'Profile', exact: false }
        ]
        
        // Add admin button for admin, gembala, and operator
        if (canAccessAdminPanel.value) {
          const user = userStore.user
          const role = user?.role || 'jemaat'
          let adminLabel = '🛡️ Admin'
          
          if (role === 'operator') {
            adminLabel = '⚙️ Operator'
          }
          
          console.log('✅ [DesktopNavbar] Adding admin panel button to menu')
          items.push({ path: '/admin', label: adminLabel, class: 'admin-link' })
        } else {
          console.log('❌ [DesktopNavbar] Admin panel button NOT added - insufficient privileges')
        }
        
        console.log('📋 [DesktopNavbar] Final menu items:', items)
        return items
      })
      
      const handleNavClick = (item) => {
        console.log('🖱️ [DesktopNavbar] Navigation clicked:', {
          path: item.path,
          label: item.label,
          class: item.class,
          isAdmin: isAdmin.value,
          userRole: userStore?.user?.role
        })
        
        // Special handling for admin routes
        if (item.path.startsWith('/admin')) {
          console.log('🛡️ [DesktopNavbar] Admin route clicked - checking permissions...')
          
          if (!canAccessAdminPanel.value) {
            console.error('❌ [DesktopNavbar] Admin route clicked but user cannot access admin panel!')
            // Prevent navigation by showing alert
            alert('❌ Akses ditolak! Hanya admin atau operator yang dapat mengakses panel admin.')
            return
          }
          
          console.log('✅ [DesktopNavbar] Admin panel permissions validated - proceeding to admin panel')
        }
        
        // Allow navigation to proceed
        console.log('🚀 [DesktopNavbar] Navigation proceeding to:', item.path)
      }
      
      return {
        userStore,
        isAdmin,
        menuItems,
        handleNavClick
      }
    },
    
    mounted() {
      // Debug logging when component mounts
      console.log('🚀 [DesktopNavbar] Component mounted')
      console.log('👤 [DesktopNavbar] User store:', this.userStore?.user)
      console.log('🔐 [DesktopNavbar] Is admin:', this.isAdmin)
    }
  }
  </script>
  
  <style scoped>
  /* ========================================
     DESKTOP NAVBAR COMPONENT STYLES
     Consistent font sizes & responsive design
  ========================================= */
  
  .desktop-navbar {
    background: white;
    border-bottom: 1px solid #f0f0f0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
  }
  
  .navbar-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  
  /* === BRAND SECTION === */
  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .navbar-brand:hover {
    transform: scale(1.02);
  }
  
  .navbar-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    transition: transform 0.2s ease;
  }
  
  .brand-text {
    font-family: 'Inter', sans-serif;
    font-size: 18px; /* ✅ Consistent font size */
    font-weight: 700;
    color: #41442A;
    user-select: none;
  }
  
  /* === NAVIGATION MENU === */
  .navbar-menu {
    display: flex;
    gap: 32px;
    align-items: center;
  }
  
  .nav-link {
    font-family: 'Inter', sans-serif;
    font-size: 14px; /* ✅ Consistent font size */
    font-weight: 500;
    color: #666;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s ease;
    position: relative;
    white-space: nowrap;
  }
  
  .nav-link:hover {
    color: #41442A;
    background: rgba(65, 68, 42, 0.05);
    transform: translateY(-1px);
  }
  
  .nav-link.router-link-active {
    color: #41442A;
    background: rgba(65, 68, 42, 0.1);
    font-weight: 600;
  }
  
  /* Active indicator line */
  .nav-link.router-link-active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: #41442A;
    border-radius: 1px;
  }
  
  /* === RESPONSIVE DESIGN === */
  
  /* Tablet (769px - 1024px) */
  @media (max-width: 1024px) and (min-width: 769px) {
    .navbar-content {
      padding: 0 24px;
    }
  
    .brand-text {
      font-size: 17px;
    }
  
    .nav-link {
      font-size: 13px;
      padding: 6px 12px;
    }
  
    .navbar-menu {
      gap: 24px;
    }
  }
  
  /* Small Desktop (769px - 950px) */
  @media (max-width: 950px) and (min-width: 769px) {
    .brand-text {
      font-size: 16px;
    }
  
    .nav-link {
      font-size: 12px;
      padding: 6px 10px;
    }
  
    .navbar-menu {
      gap: 20px;
    }
  }
  
  /* Very Small Desktop (769px - 850px) */
  @media (max-width: 850px) and (min-width: 769px) {
    .navbar-content {
      padding: 0 20px;
    }
  
    .navbar-menu {
      gap: 16px;
    }
  
    .nav-link {
      padding: 6px 8px;
    }
  }
  
  /* === ACCESSIBILITY === */
  @media (prefers-reduced-motion: reduce) {
    .navbar-brand,
    .nav-link,
    .navbar-logo {
      transition: none;
    }
  
    .navbar-brand:hover {
      transform: none;
    }
  
    .nav-link:hover {
      transform: none;
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .desktop-navbar {
      border-bottom-width: 2px;
      border-bottom-color: #000;
    }
  
    .nav-link {
      border: 1px solid transparent;
    }
  
    .nav-link:focus {
      border-color: #41442A;
      outline: 2px solid #41442A;
    }
  
    .nav-link.router-link-active {
      border-color: #41442A;
      background: #41442A;
      color: white;
    }
  }

  .admin-link {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    color: white !important;
    font-weight: 600;
    border: 1px solid #dc2626;
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
  }

  .admin-link:hover {
    background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
    color: white !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
  }

  .admin-link.router-link-active {
    background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
    color: white !important;
  }
  
  /* === PRINT STYLES === */
  @media print {
    .desktop-navbar {
      display: none;
    }
  }
  </style>