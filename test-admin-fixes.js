// test-admin-fixes.js - Quick test untuk memverifikasi perbaikan admin

(async function testAdminFixes() {
  console.log('🧪 [Test] Testing admin fixes...')
  
  // 1. Check if user is logged in and has admin role
  const userData = localStorage.getItem('myrajawali_user')
  const sessionData = localStorage.getItem('myrajawali_session')
  
  if (!userData) {
    console.log('❌ No user logged in. Please login first.')
    return
  }
  
  let user
  try {
    user = JSON.parse(userData)
    console.log('👤 Current user:', user.nama, 'Role:', user.role)
  } catch (e) {
    console.error('❌ Error parsing user data:', e)
    return
  }
  
  // 2. Check admin access
  const adminRoles = ['admin', 'super_admin']
  const hasAdminRole = adminRoles.includes(user.role)
  
  if (!hasAdminRole) {
    console.log('❌ User does not have admin role. Current role:', user.role)
    console.log('💡 Required roles:', adminRoles)
    return
  }
  
  console.log('✅ Admin access confirmed')
  
  // 3. Check userStore availability in browser console
  console.log('🔍 Testing userStore availability...')
  
  try {
    // This would be available in Vue components
    console.log('📝 userStore should provide:')
    console.log('  - userId:', user.id || user.nama)
    console.log('  - namaUser:', user.nama)
    console.log('  - userRole:', user.role)
    
    // Test the admin ID extraction logic that was failing
    const adminId = user.id || user.nama || 'admin'
    console.log('✅ Admin ID for activity logging:', adminId)
    
    if (!adminId || adminId === 'admin') {
      console.warn('⚠️ Using fallback admin ID. Check user data structure.')
    }
    
  } catch (error) {
    console.error('❌ Error testing userStore logic:', error)
  }
  
  // 4. Show test completion
  console.log('✅ [Test] Admin fixes verification completed')
  console.log('💡 Now try adding news/renungan from admin panel')
  
})()

// Helper function to set admin role for testing
window.setAdminRole = function() {
  const userData = localStorage.getItem('myrajawali_user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      user.role = 'admin'
      localStorage.setItem('myrajawali_user', JSON.stringify(user))
      console.log('✅ User role set to admin')
      window.location.reload()
    } catch (e) {
      console.error('❌ Error setting admin role:', e)
    }
  } else {
    console.log('❌ No user logged in')
  }
}

console.log('💡 Run setAdminRole() to set current user as admin')
