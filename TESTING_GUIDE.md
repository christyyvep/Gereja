# SCRIPT TESTING UNTUK FIREBASE SECURITY ENHANCEMENT

## 🧪 **MANUAL TESTING CHECKLIST**

### **1. Authentication Testing**

#### ✅ **Login Testing:**
```javascript
// Di browser console (Development mode):

// Test 1: Valid login
await debugSecurity.getCurrentUser() // Should return null initially

// Test 2: Invalid email format
// Try login with invalid email in UI

// Test 3: Rate limiting
// Try multiple failed logins quickly

// Test 4: Check session after successful login
await debugSecurity.getCurrentUser() // Should return user object
await debugSecurity.checkSession() // Should return true
```

#### ✅ **Registration Testing:**
```javascript
// Test 1: Password strength validation
// Try weak passwords in registration form

// Test 2: Email validation
// Try invalid email formats

// Test 3: Nama validation
// Try names not in jemaat database

// Test 4: Duplicate registration
// Try registering same user twice
```

#### ✅ **Session Management Testing:**
```javascript
// Test 1: Session timeout warning
await debugSecurity.forceSessionWarning() // Should show warning modal

// Test 2: Session expiry
// Wait for natural session expiry or modify session timestamp

// Test 3: Session extension
// Click "Perpanjang Sesi" in warning modal
```

### **2. Authorization Testing**

#### ✅ **Role-based Access:**
```javascript
// Test 1: Admin panel access
// Login as regular user, try to access /admin

// Test 2: Admin features
// Login as admin, verify all admin features work

// Test 3: Moderator features
// Test moderator-specific permissions

// Test 4: Route guards
// Try direct URL access without proper role
```

### **3. Security Features Testing**

#### ✅ **Rate Limiting:**
```javascript
// Test rate limiting
await debugSecurity.testRateLimit('test_user_1')
await debugSecurity.testRateLimit('test_user_1') // Should show decreased attempts
await debugSecurity.testRateLimit('test_user_1') // Should eventually block
```

#### ✅ **Security Logging:**
```javascript
// Test security event logging
await debugSecurity.logEvent('test_event', { test: true })

// Check browser console for logged events
// Check Firebase Console > Firestore > securityEvents collection
```

### **4. Database Security Testing**

#### ✅ **Firestore Rules:**
```javascript
// Test in Firebase Console > Firestore > Rules > Simulator

// Test 1: Unauthenticated access
// Simulator: Authentication = false, try to read jemaat collection

// Test 2: Authenticated user reading own data
// Simulator: Authentication = true, try to read jemaat doc with matching UID

// Test 3: Unauthorized role update
// Simulator: Regular user trying to update role field
```

### **5. Performance Testing**

#### ✅ **Load Testing:**
```bash
# Install artillery for load testing
npm install -g artillery

# Create artillery config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Login flow"
    requests:
      - get:
          url: "/"
      - post:
          url: "/api/login"
          json:
            email: "test@example.com"
            password: "testpassword"
EOF

# Run load test
artillery run load-test.yml
```

## 🔧 **AUTOMATED TESTING SETUP**

### **1. Jest Testing Setup**

```bash
# Install testing dependencies
npm install --save-dev jest @vue/test-utils
```

**jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'vue'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest'
  },
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js'
  ]
}
```

### **2. Security Test Cases**

**tests/security.test.js:**
```javascript
import { loginUser, registerUser, validatePassword } from '../src/services/auth-enhanced'
import { checkRateLimit } from '../src/services/firebase-security'

describe('Security Features', () => {
  test('Password validation rejects weak passwords', () => {
    const result = validatePassword('123')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password minimal 8 karakter')
  })

  test('Password validation accepts strong passwords', () => {
    const result = validatePassword('StrongPass123!')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('Rate limiting blocks after max attempts', () => {
    const identifier = 'test_user'
    
    // First few attempts should be allowed
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(identifier, 5, 60000)
      expect(result.allowed).toBe(true)
    }
    
    // Next attempt should be blocked
    const blockedResult = checkRateLimit(identifier, 5, 60000)
    expect(blockedResult.allowed).toBe(false)
  })

  test('Login fails with invalid credentials', async () => {
    await expect(loginUser('invalid@email.com', 'wrongpassword'))
      .rejects.toThrow('Email atau password salah')
  })
})
```

### **3. Integration Testing**

**tests/integration.test.js:**
```javascript
import { mount } from '@vue/test-utils'
import LoginPage from '../src/views/LoginPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

describe('Login Integration', () => {
  test('Login form submits with valid data', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
    })

    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router]
      }
    })

    // Fill form
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#password').setValue('validpassword')

    // Submit form
    await wrapper.find('.login-button').trigger('click')

    // Assert loading state
    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
  })
})
```

## 📊 **MONITORING & METRICS**

### **1. Security Metrics to Track**

```javascript
// Add to admin dashboard
const securityMetrics = {
  // Login metrics
  totalLogins: 0,
  failedLogins: 0,
  successRate: 0,
  
  // Session metrics
  averageSessionDuration: 0,
  sessionTimeouts: 0,
  
  // Security events
  unauthorizedAccess: 0,
  rateLimitHits: 0,
  
  // Performance metrics
  averageLoginTime: 0,
  averagePageLoadTime: 0
}
```

### **2. Alert Thresholds**

```javascript
const alertThresholds = {
  failedLoginRate: 0.1, // 10% failed login rate
  sessionTimeoutRate: 0.05, // 5% session timeout rate
  unauthorizedAccessPerHour: 10,
  rateLimitHitsPerHour: 50
}
```

### **3. Health Check Endpoint**

```javascript
// firebase-functions/index.js
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    security: {
      appCheck: true,
      firestore: true,
      functions: true
    }
  })
})
```

## 🚨 **TROUBLESHOOTING GUIDE**

### **Common Issues:**

1. **Firebase Functions not working:**
   - Check function logs: `firebase functions:log`
   - Verify deployment: `firebase deploy --only functions`
   - Check IAM permissions

2. **Firestore rules blocking requests:**
   - Use Rules Simulator in Firebase Console
   - Check authentication state
   - Verify user roles in database

3. **Session issues:**
   - Clear localStorage: `localStorage.clear()`
   - Check session timestamps
   - Verify session timeout configuration

4. **Rate limiting too aggressive:**
   - Adjust limits in firebase-security.js
   - Clear rate limit store: `window.debugSecurity.testRateLimit('reset')`

5. **App Check failures:**
   - Verify reCAPTCHA site key
   - Check domain configuration
   - Test with App Check disabled in development

### **Debug Commands:**

```javascript
// Available in development console:

// Check current user
await debugSecurity.getCurrentUser()

// Test session validity
await debugSecurity.checkSession()

// Force session warning
await debugSecurity.forceSessionWarning()

// Test rate limiting
await debugSecurity.testRateLimit('test_id')

// Clear all debug data
localStorage.clear()
sessionStorage.clear()
```

## ✅ **PRODUCTION DEPLOYMENT CHECKLIST**

- [ ] Firebase Functions deployed and working
- [ ] Firestore Security Rules updated and tested
- [ ] App Check configured with real reCAPTCHA keys
- [ ] Environment variables set correctly
- [ ] Performance testing completed
- [ ] Security testing completed
- [ ] Monitoring dashboard set up
- [ ] Backup and rollback plan ready
- [ ] Team trained on new security features

## 📞 **SUPPORT CONTACTS**

- **Firebase Support:** Firebase Console → Support
- **reCAPTCHA Support:** Google reCAPTCHA Console
- **Security Issues:** Create GitHub issue with [SECURITY] prefix
