// Simple Auth Test - Untuk debugging export issues

/**
 * Get current user dari session
 * @returns {Object|null} User data if logged in
 */
export function getCurrentUser() {
  try {
    const userData = localStorage.getItem('myrajawali_user')
    if (!userData) return null
    
    return JSON.parse(userData)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is logged in
 * @returns {boolean} Login status
 */
export function isLoggedIn() {
  const userData = getCurrentUser()
  return userData !== null
}

export default {
  getCurrentUser,
  isLoggedIn
}
