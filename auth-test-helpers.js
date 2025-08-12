// AUTHENTICATION HELPER FUNCTIONS
// Copy and paste these functions in browser console for testing

// Helper to simulate login
window.simulateLogin = async function(nama, password) {
  console.log(`🔐 Simulating login for: ${nama}`)
  
  try {
    // This would typically call the auth service
    const result = await window.authHybrid.login(nama, password)
    console.log('Login result:', result)
    return result
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: error.message }
  }
}

// Helper to force logout
window.forceLogout = async function() {
  console.log('🚪 Force logout initiated...')
  
  try {
    // Clear all storage
    localStorage.removeItem('myrajawali_session')
    localStorage.removeItem('myrajawali_user')
    sessionStorage.removeItem('recentLogin')
    
    // Call logout function if available
    if (window.authHybrid && window.authHybrid.logout) {
      await window.authHybrid.logout()
    }
    
    console.log('✅ Force logout completed')
    
    // Redirect to home
    window.location.href = '/'
    
  } catch (error) {
    console.error('❌ Force logout error:', error)
  }
}

// Helper to create test session
window.createTestSession = function(userId = 'test-user', role = 'user') {
  console.log(`🧪 Creating test session for ${userId} with role ${role}`)
  
  const now = Date.now()
  const session = {
    token: 'test-session-token-' + now,
    userId: userId,
    createdAt: now,
    expiresAt: now + (30 * 60 * 1000), // 30 minutes
    lastActivity: now
  }
  
  const user = {
    id: userId,
    nama: 'Test User',
    role: role,
    loginCount: 1,
    lastLogin: now
  }
  
  localStorage.setItem('myrajawali_session', JSON.stringify(session))
  localStorage.setItem('myrajawali_user', JSON.stringify(user))
  sessionStorage.setItem('recentLogin', now.toString())
  
  console.log('✅ Test session created:', session)
  console.log('✅ Test user created:', user)
}

// Helper to check auth state
window.checkAuthState = function() {
  console.log('📊 Current Authentication State:')
  
  const session = localStorage.getItem('myrajawali_session')
  const user = localStorage.getItem('myrajawali_user')
  const recentLogin = sessionStorage.getItem('recentLogin')
  
  console.log('Session:', session ? JSON.parse(session) : null)
  console.log('User:', user ? JSON.parse(user) : null)
  console.log('Recent login:', recentLogin ? new Date(parseInt(recentLogin)).toLocaleString() : null)
  
  return {
    hasSession: !!session,
    hasUser: !!user,
    hasRecentLogin: !!recentLogin,
    session: session ? JSON.parse(session) : null,
    user: user ? JSON.parse(user) : null
  }
}

// Helper to navigate and test route guards
window.testRoute = function(path) {
  console.log(`🧭 Testing route: ${path}`)
  
  const authState = window.checkAuthState()
  console.log('Auth state before navigation:', authState)
  
  // Navigate to route
  if (window.router) {
    window.router.push(path)
  } else {
    window.location.href = path
  }
}

// Quick test commands
console.log(`
🧪 AUTHENTICATION TESTING HELPERS LOADED

Available commands:
- checkAuthState()           - Check current auth state
- createTestSession()        - Create test session (default: user role)
- createTestSession('admin-user', 'admin') - Create admin test session
- forceLogout()             - Force complete logout
- testRoute('/login')       - Test route navigation
- testRoute('/admin')       - Test admin route
- runAuthTests()            - Run comprehensive test suite

Example workflow:
1. checkAuthState()         - See current state
2. createTestSession()      - Create test session
3. testRoute('/login')      - Should redirect away from login
4. testRoute('/admin')      - Should allow access if admin
5. forceLogout()           - Clean logout
6. testRoute('/admin')      - Should redirect to login
`)

// Auto-check current state
window.checkAuthState()
