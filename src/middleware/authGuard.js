// Enhanced Route Guard dengan Security Features
// TEMPORARY: Use minimal auth for debugging
import { getCurrentUser } from '../services/auth-hybrid-minimal'
import { logSecurityEvent, updateSessionActivity } from '../services/firebase-security'

// Security config
const securityConfig = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  adminRoles: ['admin', 'super_admin', 'gembala'], // Full admin access
  operatorRoles: ['operator'], // Limited admin access
  managementRoles: ['admin', 'super_admin', 'gembala', 'operator'], // Can access admin panel
  moderatorRoles: ['admin', 'super_admin', 'gembala', 'moderator', 'operator'] // Can moderate content
}

/**
 * Route guard untuk autentikasi
 */
export function requireAuth(to, from, next) {
  try {
    const currentUser = getCurrentUser()
    
    if (!currentUser) {
      logSecurityEvent('unauthorized_access_attempt', { 
        route: to.path,
        from: from.path 
      })
      
      // Redirect ke login dengan return URL
      next({
        name: 'Login',
        query: { 
          redirect: to.fullPath,
          reason: 'auth_required'
        }
      })
      return
    }

    // Update session activity
    updateSessionActivity()
    
    // Log authorized access
    logSecurityEvent('authorized_access', { 
      route: to.path,
      userId: currentUser.userId,
      role: currentUser.role 
    })
    
    next()
  } catch (error) {
    console.error('Auth guard error:', error)
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        reason: 'auth_error'
      }
    })
  }
}

/**
 * Route guard untuk admin
 */
export function requireAdmin(to, from, next) {
  try {
    const currentUser = getCurrentUser()
    
    if (!currentUser) {
      logSecurityEvent('unauthorized_admin_access_attempt', { 
        route: to.path,
        from: from.path,
        reason: 'not_logged_in'
      })
      
      next({
        name: 'Login',
        query: { 
          redirect: to.fullPath,
          reason: 'admin_auth_required'
        }
      })
      return
    }

    if (!securityConfig.adminRoles.includes(currentUser.role)) {
      logSecurityEvent('unauthorized_admin_access_attempt', { 
        route: to.path,
        userId: currentUser.userId,
        role: currentUser.role,
        reason: 'insufficient_privileges'
      })
      
      // Redirect ke home dengan error message
      next({
        name: 'HomePage',
        query: { 
          error: 'insufficient_privileges'
        }
      })
      return
    }

    // Update session activity
    updateSessionActivity()
    
    // Log admin access
    logSecurityEvent('admin_access', { 
      route: to.path,
      userId: currentUser.userId,
      role: currentUser.role 
    })
    
    next()
  } catch (error) {
    console.error('Admin guard error:', error)
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        reason: 'admin_auth_error'
      }
    })
  }
}

/**
 * Route guard untuk moderator
 */
export function requireModerator(to, from, next) {
  try {
    const currentUser = getCurrentUser()
    
    if (!currentUser) {
      logSecurityEvent('unauthorized_moderator_access_attempt', { 
        route: to.path,
        from: from.path,
        reason: 'not_logged_in'
      })
      
      next({
        name: 'Login',
        query: { 
          redirect: to.fullPath,
          reason: 'moderator_auth_required'
        }
      })
      return
    }

    if (!securityConfig.moderatorRoles.includes(currentUser.role)) {
      logSecurityEvent('unauthorized_moderator_access_attempt', { 
        route: to.path,
        userId: currentUser.userId,
        role: currentUser.role,
        reason: 'insufficient_privileges'
      })
      
      next({
        name: 'HomePage',
        query: { 
          error: 'insufficient_privileges'
        }
      })
      return
    }

    // Update session activity
    updateSessionActivity()
    
    // Log moderator access
    logSecurityEvent('moderator_access', { 
      route: to.path,
      userId: currentUser.userId,
      role: currentUser.role 
    })
    
    next()
  } catch (error) {
    console.error('Moderator guard error:', error)
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        reason: 'moderator_auth_error'
      }
    })
  }
}

/**
 * Route guard untuk guest (belum login)
 */
export function requireGuest(to, from, next) {
  try {
    const currentUser = getCurrentUser()
    
    if (currentUser) {
      // User sudah login, redirect ke home
      logSecurityEvent('guest_route_access_while_authenticated', { 
        route: to.path,
        userId: currentUser.userId,
        role: currentUser.role 
      })
      
      next({ name: 'HomePage' })
      return
    }
    
    next()
  } catch (error) {
    console.error('Guest guard error:', error)
    next()
  }
}

/**
 * Route guard untuk validasi role spesifik
 */
export function requireRole(allowedRoles) {
  return function(to, from, next) {
    try {
      const currentUser = getCurrentUser()
      
      if (!currentUser) {
        logSecurityEvent('unauthorized_role_access_attempt', { 
          route: to.path,
          allowedRoles,
          reason: 'not_logged_in'
        })
        
        next({
          name: 'Login',
          query: { 
            redirect: to.fullPath,
            reason: 'role_auth_required'
          }
        })
        return
      }

      if (!allowedRoles.includes(currentUser.role)) {
        logSecurityEvent('unauthorized_role_access_attempt', { 
          route: to.path,
          userId: currentUser.userId,
          userRole: currentUser.role,
          allowedRoles,
          reason: 'insufficient_role'
        })
        
        next({
          name: 'HomePage',
          query: { 
            error: 'insufficient_role'
          }
        })
        return
      }

      // Update session activity
      updateSessionActivity()
      
      // Log role-based access
      logSecurityEvent('role_based_access', { 
        route: to.path,
        userId: currentUser.userId,
        role: currentUser.role,
        allowedRoles
      })
      
      next()
    } catch (error) {
      console.error('Role guard error:', error)
      next({
        name: 'Login',
        query: { 
          redirect: to.fullPath,
          reason: 'role_auth_error'
        }
      })
    }
  }
}

/**
 * Global navigation guard untuk session monitoring
 */
export function setupGlobalGuards(router) {
  // Before each route
  router.beforeEach((to, from, next) => {
    try {
      // Update session activity untuk authenticated routes
      const currentUser = getCurrentUser()
      if (currentUser) {
        updateSessionActivity()
      }
      
      // Log navigation untuk audit trail
      logSecurityEvent('navigation', {
        to: to.path,
        from: from.path,
        userId: currentUser?.userId,
        role: currentUser?.role
      })
      
      next()
    } catch (error) {
      console.error('Global guard error:', error)
      next()
    }
  })

  // After each route
  router.afterEach((to) => {
    try {
      // Log successful navigation
      const currentUser = getCurrentUser()
      logSecurityEvent('navigation_success', {
        route: to.path,
        userId: currentUser?.userId,
        role: currentUser?.role
      })
    } catch (error) {
      console.error('After navigation error:', error)
    }
  })
}

/**
 * Check dan enforce security policies
 */
export function checkSecurityPolicies() {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Check session expiry
    const now = Date.now()
    if (now > currentUser.expiresAt) {
      logSecurityEvent('session_expired', { 
        userId: currentUser.userId 
      })
      
      // Clear session dan redirect ke login
      localStorage.removeItem('myrajawali_session')
      window.location.href = '/login?reason=session_expired'
      return
    }

    // Check untuk warning auto logout
    const timeToExpire = currentUser.expiresAt - now
    const warningTime = securityConfig.autoLogoutWarning

    if (timeToExpire <= warningTime && timeToExpire > 0) {
      // Trigger warning event
      const event = new CustomEvent('sessionWarning', {
        detail: { timeToExpire }
      })
      window.dispatchEvent(event)
    }

  } catch (error) {
    console.error('Security policy check error:', error)
  }
}

// Setup interval untuk security checks
let securityCheckInterval = null

export function startSecurityMonitoring() {
  if (securityCheckInterval) {
    clearInterval(securityCheckInterval)
  }
  
  // Check setiap 30 detik
  securityCheckInterval = setInterval(checkSecurityPolicies, 30000)
}

export function stopSecurityMonitoring() {
  if (securityCheckInterval) {
    clearInterval(securityCheckInterval)
    securityCheckInterval = null
  }
}

// Utility untuk mengecek permission
export function hasPermission(requiredRole) {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) return false
    
    const roleHierarchy = {
      'jemaat': 1,
      'moderator': 2,
      'admin': 3,
      'super_admin': 4
    }
    
    const userLevel = roleHierarchy[currentUser.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 999
    
    return userLevel >= requiredLevel
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

export function canAccessAdminFeatures() {
  return hasPermission('admin')
}

export function canAccessModeratorFeatures() {
  return hasPermission('moderator')
}

export function isSuperAdmin() {
  try {
    const currentUser = getCurrentUser()
    return currentUser?.role === 'super_admin'
  } catch (error) {
    return false
  }
}

/**
 * Route guard untuk management access (admin, gembala, operator)
 */
export function requireManagement(to, from, next) {
  try {
    const currentUser = getCurrentUser()
    
    if (!currentUser) {
      logSecurityEvent('unauthorized_management_access_attempt', { 
        route: to.path,
        from: from.path,
        reason: 'not_logged_in'
      })
      
      next({
        name: 'Login',
        query: { 
          redirect: to.fullPath,
          reason: 'management_auth_required'
        }
      })
      return
    }

    if (!securityConfig.managementRoles.includes(currentUser.role)) {
      logSecurityEvent('unauthorized_management_access_attempt', { 
        route: to.path,
        userId: currentUser.userId,
        role: currentUser.role,
        reason: 'insufficient_privileges'
      })
      
      next({
        name: 'HomePage',
        query: { 
          error: 'insufficient_privileges'
        }
      })
      return
    }

    // Update session activity
    updateSessionActivity()
    
    // Log management access
    logSecurityEvent('management_access', { 
      route: to.path,
      userId: currentUser.userId,
      role: currentUser.role 
    })
    
    next()
  } catch (error) {
    console.error('Management guard error:', error)
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        reason: 'management_auth_error'
      }
    })
  }
}

/**
 * Route guard untuk operator access (limited admin features)
 */
export function requireOperator(to, from, next) {
  try {
    const currentUser = getCurrentUser()
    
    if (!currentUser) {
      logSecurityEvent('unauthorized_operator_access_attempt', { 
        route: to.path,
        from: from.path,
        reason: 'not_logged_in'
      })
      
      next({
        name: 'Login',
        query: { 
          redirect: to.fullPath,
          reason: 'operator_auth_required'
        }
      })
      return
    }

    // Operator can only access specific routes
    if (!securityConfig.operatorRoles.includes(currentUser.role) && 
        !securityConfig.adminRoles.includes(currentUser.role)) {
      logSecurityEvent('unauthorized_operator_access_attempt', { 
        route: to.path,
        userId: currentUser.userId,
        role: currentUser.role,
        reason: 'insufficient_privileges'
      })
      
      next({
        name: 'HomePage',
        query: { 
          error: 'insufficient_privileges'
        }
      })
      return
    }

    // Update session activity
    updateSessionActivity()
    
    // Log operator access
    logSecurityEvent('operator_access', { 
      route: to.path,
      userId: currentUser.userId,
      role: currentUser.role 
    })
    
    next()
  } catch (error) {
    console.error('Operator guard error:', error)
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        reason: 'operator_auth_error'
      }
    })
  }
}
