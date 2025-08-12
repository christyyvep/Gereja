// COMPREHENSIVE AUTHENTICATION TESTING SCRIPT
// Run this in browser console to test various auth scenarios

console.log('🧪 Starting Authentication Testing Suite...')

// Test Scenarios
const testScenarios = {
  
  // Test 1: Check current session state
  async checkCurrentSession() {
    console.log('\n📋 Test 1: Current Session State')
    console.log('localStorage keys:', Object.keys(localStorage).filter(k => k.includes('myrajawali') || k.includes('user') || k.includes('session')))
    console.log('sessionStorage keys:', Object.keys(sessionStorage).filter(k => k.includes('myrajawali') || k.includes('user') || k.includes('session')))
    
    const session = localStorage.getItem('myrajawali_session')
    const user = localStorage.getItem('myrajawali_user')
    
    console.log('Session exists:', !!session)
    console.log('User data exists:', !!user)
    
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        console.log('Session data:', sessionData)
      } catch (e) {
        console.log('Session data invalid:', session)
      }
    }
    
    if (user) {
      try {
        const userData = JSON.parse(user)
        console.log('User data:', userData)
      } catch (e) {
        console.log('User data invalid:', user)
      }
    }
  },
  
  // Test 2: Test login redirect prevention
  async testLoginRedirect() {
    console.log('\n🔐 Test 2: Login Redirect Prevention')
    
    const hasSession = !!localStorage.getItem('myrajawali_session')
    console.log('Has active session:', hasSession)
    
    if (hasSession) {
      console.log('✅ User is logged in - should NOT be able to access /login')
      console.log('Current route:', window.location.pathname)
      
      if (window.location.pathname === '/login') {
        console.log('❌ FAILED: User with session is on login page!')
      } else {
        console.log('✅ PASSED: User correctly redirected away from login page')
      }
    } else {
      console.log('ℹ️  No session - can access login page')
    }
  },
  
  // Test 3: Test session validation
  async testSessionValidation() {
    console.log('\n🔍 Test 3: Session Validation')
    
    const sessionStr = localStorage.getItem('myrajawali_session')
    if (!sessionStr) {
      console.log('ℹ️  No session to validate')
      return
    }
    
    try {
      const session = JSON.parse(sessionStr)
      const now = Date.now()
      const createdAt = session.createdAt || 0
      const expiresAt = session.expiresAt || 0
      
      console.log('Session created:', new Date(createdAt).toLocaleString())
      console.log('Session expires:', new Date(expiresAt).toLocaleString())
      console.log('Current time:', new Date(now).toLocaleString())
      console.log('Time until expiry:', Math.floor((expiresAt - now) / 1000 / 60), 'minutes')
      
      if (now > expiresAt) {
        console.log('❌ Session expired!')
      } else {
        console.log('✅ Session valid')
      }
      
      if (session.token && session.userId) {
        console.log('✅ Session has required fields')
      } else {
        console.log('❌ Session missing required fields')
      }
      
    } catch (error) {
      console.log('❌ Invalid session format:', error)
    }
  },
  
  // Test 4: Test recent login flag
  async testRecentLoginFlag() {
    console.log('\n🏃 Test 4: Recent Login Flag')
    
    const recentLogin = sessionStorage.getItem('recentLogin')
    console.log('Recent login flag:', recentLogin)
    
    if (recentLogin) {
      const timestamp = parseInt(recentLogin)
      const elapsed = Date.now() - timestamp
      console.log('Login occurred:', Math.floor(elapsed / 1000), 'seconds ago')
      
      if (elapsed < 5000) { // 5 seconds
        console.log('✅ Recent login flag is fresh')
      } else {
        console.log('ℹ️  Login flag is older than 5 seconds')
      }
    } else {
      console.log('ℹ️  No recent login flag')
    }
  },
  
  // Test 5: Test route guards
  async testRouteGuards() {
    console.log('\n🛡️  Test 5: Route Guards')
    
    const hasSession = !!localStorage.getItem('myrajawali_session')
    const currentRoute = window.location.pathname
    
    console.log('Current route:', currentRoute)
    console.log('Has session:', hasSession)
    
    // Define protected routes
    const protectedRoutes = ['/admin', '/kelola-jemaat', '/account']
    const guestOnlyRoutes = ['/login', '/register']
    
    const isProtectedRoute = protectedRoutes.some(route => currentRoute.startsWith(route))
    const isGuestOnlyRoute = guestOnlyRoutes.some(route => currentRoute.startsWith(route))
    
    if (isProtectedRoute) {
      if (hasSession) {
        console.log('✅ Protected route accessed with valid session')
      } else {
        console.log('❌ Protected route accessed without session - should redirect to login')
      }
    }
    
    if (isGuestOnlyRoute) {
      if (!hasSession) {
        console.log('✅ Guest-only route accessed without session')
      } else {
        console.log('❌ Guest-only route accessed with session - should redirect away')
      }
    }
    
    if (!isProtectedRoute && !isGuestOnlyRoute) {
      console.log('ℹ️  Public route - access allowed regardless of session')
    }
  },
  
  // Test 6: Test logout functionality
  async testLogout() {
    console.log('\n🚪 Test 6: Logout Test (will clear session)')
    
    const hasSessionBefore = !!localStorage.getItem('myrajawali_session')
    console.log('Has session before logout:', hasSessionBefore)
    
    if (!hasSessionBefore) {
      console.log('ℹ️  No session to logout from')
      return
    }
    
    // Call logout function if available
    if (window.authHybrid && window.authHybrid.logout) {
      try {
        await window.authHybrid.logout()
        console.log('✅ Logout function called')
      } catch (error) {
        console.log('❌ Logout function error:', error)
      }
    } else {
      console.log('ℹ️  No logout function available in global scope')
    }
    
    const hasSessionAfter = !!localStorage.getItem('myrajawali_session')
    console.log('Has session after logout:', hasSessionAfter)
    
    if (!hasSessionAfter) {
      console.log('✅ Session successfully cleared')
    } else {
      console.log('❌ Session not cleared after logout')
    }
  },
  
  // Test 7: Test admin access
  async testAdminAccess() {
    console.log('\n👑 Test 7: Admin Access Test')
    
    const userStr = localStorage.getItem('myrajawali_user')
    if (!userStr) {
      console.log('ℹ️  No user data - cannot test admin access')
      return
    }
    
    try {
      const user = JSON.parse(userStr)
      console.log('User role:', user.role)
      console.log('Is admin:', user.role === 'admin')
      
      if (user.role === 'admin') {
        console.log('✅ User has admin privileges')
        console.log('Should be able to access: /admin, /kelola-jemaat')
      } else {
        console.log('ℹ️  User does not have admin privileges')
        console.log('Should NOT be able to access admin routes')
      }
      
    } catch (error) {
      console.log('❌ Invalid user data format:', error)
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running all authentication tests...\n')
  
  try {
    await testScenarios.checkCurrentSession()
    await testScenarios.testLoginRedirect()
    await testScenarios.testSessionValidation()
    await testScenarios.testRecentLoginFlag()
    await testScenarios.testRouteGuards()
    await testScenarios.testAdminAccess()
    
    console.log('\n✅ All tests completed!')
    console.log('\nTo test logout, run: testScenarios.testLogout()')
    
  } catch (error) {
    console.log('\n❌ Test suite error:', error)
  }
}

// Make functions available globally
window.authTests = testScenarios
window.runAuthTests = runAllTests

// Auto-run tests
runAllTests()
