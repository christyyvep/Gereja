// Debug Authentication Status
// Run this in browser console to check auth state

console.log('🔍 MyRajawali Auth Debug');
console.log('========================');

// Check localStorage
const session = localStorage.getItem('myrajawali_session');
const user = localStorage.getItem('myrajawali_user');

console.log('📱 Local Storage:');
console.log('Session:', session);
console.log('User:', user);

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('👤 Parsed User Data:');
    console.log('- ID:', userData.userId);
    console.log('- Name:', userData.nama);
    console.log('- Role:', userData.role);
    console.log('- Email:', userData.email);
    console.log('- Is Active:', userData.isActive);
  } catch (e) {
    console.error('❌ Error parsing user data:', e);
  }
}

if (session) {
  try {
    const sessionData = JSON.parse(session);
    console.log('🎫 Session Data:');
    console.log('- Expires:', new Date(sessionData.expiresAt));
    console.log('- Is Expired:', sessionData.expiresAt < Date.now());
    console.log('- Login At:', new Date(sessionData.loginAt));
  } catch (e) {
    console.error('❌ Error parsing session data:', e);
  }
}

// Check if auth functions work
try {
  const { getCurrentUser, isLoggedIn, hasRole } = window.authHybrid || {};
  
  if (getCurrentUser) {
    console.log('🔐 Auth Functions:');
    console.log('- getCurrentUser():', getCurrentUser());
    console.log('- isLoggedIn():', isLoggedIn());
    console.log('- hasRole("admin"):', hasRole('admin'));
  } else {
    console.log('❌ Auth functions not available globally');
  }
} catch (e) {
  console.error('❌ Error calling auth functions:', e);
}

// Check Vue router current route
try {
  const router = window.vueRouter;
  if (router) {
    console.log('🛣️ Current Route:', router.currentRoute.value.path);
    console.log('Route Meta:', router.currentRoute.value.meta);
  }
} catch (e) {
  console.log('Router not available globally');
}

console.log('========================');
