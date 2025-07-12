<template>
  <nav class="bottom-navbar">
    <!-- Home -->
    <router-link to="/home" class="nav-item" exact aria-label="Beranda">
      <House :class="iconClasses('/home')" />
      <span :class="textClasses('/home')">Home</span>
    </router-link>
    
    <!-- Kalender/Jadwal - HIDDEN TEMPORARILY -->
    <!-- 
    <router-link to="/calendar" class="nav-item" aria-label="Kalender">
      <Calendar :class="iconClasses('/calendar')" />
      <span :class="textClasses('/calendar')">Kalender</span>
    </router-link>
    -->
    
    <!-- Notifikasi - HIDDEN TEMPORARILY -->
    <!-- 
    <router-link to="/notifikasi" class="nav-item" aria-label="Notifikasi">
      <Bell :class="iconClasses('/notifikasi')" />
      <span :class="textClasses('/notifikasi')">Notifikasi</span>
    </router-link>
    -->
    
    <!-- Profile/Account -->
    <router-link to="/account" class="nav-item" aria-label="Profile">
      <User :class="iconClasses('/account')" />
      <span :class="textClasses('/account')">Profile</span>
    </router-link>
  </nav>
</template>

<script>
import { 
  House, 
  // Calendar, 
  // Bell, 
  User } from 'lucide-vue-next'

export default {
  name: 'BottomNavbar',
  
  components: {
    House,
    // Calendar,
    // Bell,
    User
  },
  
  props: {
    forceActiveRoute: {
      type: String,
      default: null
    }
  },
  
  computed: {
    // ⭐ Current active route
    currentRoute() {
      return this.forceActiveRoute || this.$route.path
    }
  },
  
  methods: {
    // ⭐ Check if route is active
    isActiveRoute(path) {
      return this.currentRoute === path
    },
    
    // ⭐ Get icon classes
    iconClasses(path) {
      return [
        'icon',
        { 'icon-active': this.isActiveRoute(path) }
      ]
    },
    
    // ⭐ Get text classes
    textClasses(path) {
      return {
        'text-active': this.isActiveRoute(path)
      }
    }
  }
}
</script>

<style scoped>
/* ⭐ NAVBAR CONTAINER */
.bottom-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: #fcfcf7;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 999;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

/* ⭐ NAVIGATION ITEMS */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%; /* ✅ Changed from 25% to 50% since we now have 2 items instead of 4 */
  height: 64px;
  text-align: center;
  font-size: 12px;
  color: #777;
  font-family: 'Inter', sans-serif;
  text-decoration: none;
  gap: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 8px;
  margin: 0 2px;
}

.nav-item:hover {
  background-color: rgba(65, 68, 42, 0.05);
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-item.router-link-active {
  background-color: rgba(127, 132, 88, 0.1);
}

/* ⭐ ICONS */
.icon {
  width: 20px;
  height: 20px;
  color: #777;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.icon-active {
  color: #41442A;
  transform: scale(1.2);
}

/* ⭐ TEXT LABELS */
.nav-item span {
  font-size: 12px;
  line-height: 1;
  margin-top: 2px;
}

.text-active {
  color: #41442A;
  font-weight: 600;
}

/* ⭐ RESPONSIVE DESIGN */
@media (max-width: 360px) {
  .bottom-navbar {
    height: 56px;
  }
  
  .nav-item {
    height: 56px;
    font-size: 11px;
    gap: 2px;
  }
  
  .icon {
    width: 18px;
    height: 18px;
  }
  
  .nav-item span {
    font-size: 10px;
  }
}

/* ⭐ ACCESSIBILITY - High contrast mode */
@media (prefers-contrast: high) {
  .bottom-navbar {
    border-top-width: 2px;
    border-top-color: #000;
  }
  
  .nav-item {
    border: 1px solid transparent;
  }
  
  .nav-item:focus {
    border-color: #41442A;
    outline: 2px solid #41442A;
  }
  
  .icon-active {
    color: #000;
  }
  
  .text-active {
    color: #000;
  }
}

/* ⭐ ACCESSIBILITY - Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .icon {
    transition: none;
  }
  
  .nav-item:active {
    transform: none;
  }
  
  .icon-active {
    transform: none;
  }
}
</style>