/**
 * Emergency Auth Fix
 * Clear all auth states and restart
 */

console.log('🚨 Emergency Auth Fix - Clearing all auth states...');

// Clear localStorage
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear sessionStorage  
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Clear IndexedDB (Firebase cache)
if ('indexedDB' in window) {
  indexedDB.deleteDatabase('firebaseLocalStorageDb');
  console.log('✅ Firebase IndexedDB cleared');
}

// Force reload
console.log('🔄 Reloading page...');
setTimeout(() => {
  window.location.reload(true);
}, 1000);
