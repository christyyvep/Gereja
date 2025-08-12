// QUICK FINAL TEST COMMANDS
// Copy paste di browser console untuk quick testing

// 1. Quick Auth State Check
console.log('🔍 QUICK AUTH CHECK:')
console.log('Session:', !!localStorage.getItem('myrajawali_session'))
console.log('User:', !!localStorage.getItem('myrajawali_user'))
console.log('Recent Login:', !!sessionStorage.getItem('recentLogin'))
console.log('Current Route:', window.location.pathname)

// 2. Quick Test Functions
window.quickTest = {
  
  // Test login protection
  testLoginProtection() {
    const hasSession = !!localStorage.getItem('myrajawali_session')
    const isOnLogin = window.location.pathname === '/login'
    
    console.log('\n🔐 LOGIN PROTECTION TEST:')
    console.log('Has Session:', hasSession)
    console.log('On Login Page:', isOnLogin)
    
    if (hasSession && isOnLogin) {
      console.log('❌ FAIL: User with session on login page!')
    } else if (hasSession && !isOnLogin) {
      console.log('✅ PASS: User with session not on login page')
    } else if (!hasSession && isOnLogin) {
      console.log('✅ PASS: No session, can access login page')
    } else {
      console.log('ℹ️  No session, not on login page')
    }
  },
  
  // Test admin access
  testAdminAccess() {
    const userStr = localStorage.getItem('myrajawali_user')
    const isOnAdmin = window.location.pathname.startsWith('/admin')
    
    console.log('\n👑 ADMIN ACCESS TEST:')
    
    if (!userStr) {
      console.log('No user data - should NOT access admin')
      if (isOnAdmin) {
        console.log('❌ FAIL: No user but on admin page!')
      } else {
        console.log('✅ PASS: No user, not on admin page')
      }
      return
    }
    
    try {
      const user = JSON.parse(userStr)
      console.log('User Role:', user.role)
      console.log('On Admin Page:', isOnAdmin)
      
      if (user.role === 'admin' && isOnAdmin) {
        console.log('✅ PASS: Admin on admin page')
      } else if (user.role === 'admin' && !isOnAdmin) {
        console.log('ℹ️  Admin not on admin page (OK)')
      } else if (user.role !== 'admin' && isOnAdmin) {
        console.log('❌ FAIL: Non-admin on admin page!')
      } else {
        console.log('✅ PASS: Non-admin not on admin page')
      }
    } catch (error) {
      console.log('❌ Invalid user data:', error)
    }
  },
  
  // Force clear and test
  clearAndTest() {
    console.log('\n🧹 CLEARING SESSION AND TESTING:')
    
    // Clear everything
    localStorage.clear()
    sessionStorage.clear()
    
    console.log('✅ All storage cleared')
    console.log('Now try to access /admin - should redirect to login')
    console.log('Try to access /login - should work fine')
    
    // Auto navigate to test
    setTimeout(() => {
      window.location.href = '/admin'
    }, 1000)
  },
  
  // Run all quick tests
  runAll() {
    this.testLoginProtection()
    this.testAdminAccess()
    console.log('\n✅ Quick tests completed!')
  }
}

// Auto run quick test
window.quickTest.runAll()

console.log('\n🚀 QUICK TEST COMMANDS LOADED:')
console.log('- quickTest.testLoginProtection()')
console.log('- quickTest.testAdminAccess()')  
console.log('- quickTest.clearAndTest()')
console.log('- quickTest.runAll()')
