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
            class="nav-link"
            :exact="item.exact"
          >
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'DesktopNavbar',
    
    props: {
      // Allow customization of active page if needed
      activePage: {
        type: String,
        default: null
      }
    },
    
    computed: {
      // ⭐ Main navigation menu items only
      menuItems() {
        return [
          { path: '/home', label: 'Home', exact: false }, // ✅ UBAH ke false biar jadwal juga active
          // { path: '/calendar', label: 'Kalender', exact: false }, // ✅ HIDDEN TEMPORARILY
          // { path: '/notifikasi', label: 'Notifikasi', exact: false }, // ✅ HIDDEN TEMPORARILY
          { path: '/account', label: 'Profile', exact: false }
        ]
      }
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
  
  /* === PRINT STYLES === */
  @media print {
    .desktop-navbar {
      display: none;
    }
  }
  </style>