// Test Admin Authentication - Quick Fix
// Copy dan jalankan di browser console

(async function testAdminAuth() {
  console.log('🚀 Testing Admin Authentication...');
  
  // 1. Check current user dari localStorage
  const userData = localStorage.getItem('myrajawali_user');
  const sessionData = localStorage.getItem('myrajawali_session');
  
  console.log('📱 LocalStorage Check:');
  console.log('- User data exists:', !!userData);
  console.log('- Session data exists:', !!sessionData);
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 Current User:');
      console.log('- Name:', user.nama);
      console.log('- Role:', user.role);
      console.log('- Is Admin:', user.role === 'admin');
      
      // Test admin access
      if (user.role === 'admin') {
        console.log('✅ User has admin role');
        
        // Try to navigate to admin dashboard
        if (window.location.pathname !== '/admin/dashboard') {
          console.log('🔄 Redirecting to admin dashboard...');
          window.location.href = '/admin/dashboard';
        } else {
          console.log('🎯 Already on admin dashboard');
        }
      } else {
        console.log('❌ User does not have admin role');
        console.log('Current role:', user.role);
      }
      
    } catch (e) {
      console.error('❌ Error parsing user data:', e);
    }
  } else {
    console.log('❌ No user data found - not logged in');
  }
  
  // 2. Check session validity
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      const isExpired = session.expiresAt < now;
      
      console.log('🎫 Session Check:');
      console.log('- Expires at:', new Date(session.expiresAt));
      console.log('- Is expired:', isExpired);
      
      if (isExpired) {
        console.log('❌ Session expired, clearing storage...');
        localStorage.removeItem('myrajawali_user');
        localStorage.removeItem('myrajawali_session');
        window.location.href = '/';
      }
    } catch (e) {
      console.error('❌ Error parsing session data:', e);
    }
  }
  
  // 3. Check if router guards are working
  console.log('🛣️ Router Info:');
  console.log('- Current path:', window.location.pathname);
  console.log('- Should redirect to admin if role is admin');
  
})();

// Quick login as admin function
window.quickAdminLogin = async function() {
  console.log('🔐 Quick Admin Login...');
  
  // Create mock admin session
  const adminUser = {
    userId: 'admin-user-id',
    nama: 'Administrator',
    role: 'admin',
    email: 'admin@myrajawali.com',
    isActive: true,
    loginAt: Date.now()
  };
  
  const session = {
    expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes
    loginAt: Date.now(),
    userId: adminUser.userId
  };
  
  localStorage.setItem('myrajawali_user', JSON.stringify(adminUser));
  localStorage.setItem('myrajawali_session', JSON.stringify(session));
  
  console.log('✅ Mock admin session created');
  console.log('🔄 Reloading page...');
  
  window.location.reload();
};

console.log('💡 Run quickAdminLogin() to create mock admin session');
