// Debug Authentication Script
// Jalankan di browser console untuk debug masalah admin access

console.log('🔍 Starting authentication debug...')

// 1. Check localStorage
const session = localStorage.getItem('myrajawali_session')
const user = localStorage.getItem('myrajawali_user')

console.log('📋 Session Data:', session ? JSON.parse(session) : 'No session found')
console.log('👤 User Data:', user ? JSON.parse(user) : 'No user found')

// 2. Check session validity
if (session) {
  const sessionData = JSON.parse(session)
  const now = Date.now()
  const isExpired = now > sessionData.expiresAt
  
  console.log('⏰ Session Status:')
  console.log('  - Created:', new Date(sessionData.createdAt))
  console.log('  - Expires:', new Date(sessionData.expiresAt))
  console.log('  - Current:', new Date(now))
  console.log('  - Is Expired:', isExpired)
  console.log('  - Time Left:', Math.round((sessionData.expiresAt - now) / 1000 / 60), 'minutes')
}

// 3. Check user role
if (user) {
  const userData = JSON.parse(user)
  console.log('🔐 Role Check:')
  console.log('  - User Role:', userData.role)
  console.log('  - Is Admin:', userData.role === 'admin')
  console.log('  - Admin Roles:', ['admin', 'super_admin'])
  console.log('  - Has Admin Access:', ['admin', 'super_admin'].includes(userData.role))
}

// 4. Test getCurrentUser function
try {
  // Import getCurrentUser if available
  if (window.getCurrentUser) {
    const currentUser = window.getCurrentUser()
    console.log('📡 getCurrentUser() result:', currentUser)
  } else {
    console.log('⚠️ getCurrentUser function not available in window')
  }
} catch (error) {
  console.error('❌ Error testing getCurrentUser:', error)
}

// 5. Check route guards
console.log('🛡️ Route Guard Check:')
console.log('  - Current URL:', window.location.href)
console.log('  - Admin routes pattern:', '/admin/*')

// 6. Manual session validation
function manualValidateSession() {
  try {
    const sessionData = localStorage.getItem('myrajawali_session')
    if (!sessionData) return null
    
    const session = JSON.parse(sessionData)
    const now = Date.now()
    
    if (now > session.expiresAt) {
      return { valid: false, reason: 'expired' }
    }
    
    return { valid: true, session }
  } catch (error) {
    return { valid: false, reason: 'parse_error', error }
  }
}

const manualValidation = manualValidateSession()
console.log('🔍 Manual Session Validation:', manualValidation)

// 7. Check admin guard requirements
function checkAdminAccess() {
  const userData = localStorage.getItem('myrajawali_user')
  const sessionData = localStorage.getItem('myrajawali_session')
  
  if (!userData || !sessionData) {
    return { access: false, reason: 'not_logged_in' }
  }
  
  try {
    const user = JSON.parse(userData)
    const session = JSON.parse(sessionData)
    const now = Date.now()
    
    if (now > session.expiresAt) {
      return { access: false, reason: 'session_expired' }
    }
    
    const adminRoles = ['admin', 'super_admin']
    const hasAdminRole = adminRoles.includes(user.role)
    
    return {
      access: hasAdminRole,
      reason: hasAdminRole ? 'authorized' : 'insufficient_role',
      userRole: user.role,
      requiredRoles: adminRoles
    }
  } catch (error) {
    return { access: false, reason: 'data_corruption', error }
  }
}

const adminAccess = checkAdminAccess()
console.log('🔐 Admin Access Check:', adminAccess)

// 8. Recommendations
console.log('💡 Recommendations:')

if (!session || !user) {
  console.log('  - Please login first')
} else {
  const sessionData = JSON.parse(session)
  const userData = JSON.parse(user)
  const now = Date.now()
  
  if (now > sessionData.expiresAt) {
    console.log('  - Session expired, please login again')
  } else if (userData.role !== 'admin') {
    console.log('  - Current role is not admin:', userData.role)
    console.log('  - You need admin role to access admin panel')
  } else {
    console.log('  - Authentication looks good!')
    console.log('  - Try navigating to /admin/dashboard')
  }
}

console.log('🔍 Authentication debug completed')
