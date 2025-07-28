// Firebase Functions untuk MyRajawali Security
// File ini akan ditempatkan di functions/index.js pada Firebase Project

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const bcrypt = require('bcrypt')

// Initialize Firebase Admin
admin.initializeApp()
const db = admin.firestore()

// Security configuration
const SALT_ROUNDS = 12
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 menit
const ADMIN_ROLES = ['admin', 'super_admin']

/**
 * Hash password menggunakan bcrypt
 */
exports.hashPassword = functions.https.onCall(async (data, context) => {
  try {
    // Validasi input
    if (!data.password || typeof data.password !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Password is required')
    }

    if (data.password.length < 8) {
      throw new functions.https.HttpsError('invalid-argument', 'Password must be at least 8 characters')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)
    
    // Log security event
    console.log('Password hashed successfully', {
      timestamp: new Date().toISOString(),
      userAgent: context.rawRequest?.headers?.['user-agent'],
      ip: context.rawRequest?.ip
    })
    
    return { hashedPassword }
  } catch (error) {
    console.error('Password hashing error:', error)
    throw new functions.https.HttpsError('internal', 'Password hashing failed')
  }
})

/**
 * Verifikasi password dengan bcrypt
 */
exports.verifyPassword = functions.https.onCall(async (data, context) => {
  try {
    // Validasi input
    if (!data.password || !data.hashedPassword) {
      throw new functions.https.HttpsError('invalid-argument', 'Password and hashedPassword are required')
    }

    // Verifikasi password
    const isValid = await bcrypt.compare(data.password, data.hashedPassword)
    
    // Log security event
    console.log('Password verification', {
      timestamp: new Date().toISOString(),
      isValid,
      userAgent: context.rawRequest?.headers?.['user-agent'],
      ip: context.rawRequest?.ip
    })
    
    return { isValid }
  } catch (error) {
    console.error('Password verification error:', error)
    // Jangan expose error detail untuk security
    return { isValid: false }
  }
})

/**
 * Check login attempts dan rate limiting
 */
exports.checkLoginAttempts = functions.https.onCall(async (data, context) => {
  try {
    const { email } = data
    
    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email is required')
    }

    // Cek failed login attempts dalam rentang waktu tertentu
    const now = admin.firestore.Timestamp.now()
    const timeLimit = new admin.firestore.Timestamp(
      now.seconds - (LOCKOUT_DURATION / 1000), 
      now.nanoseconds
    )

    const attemptsRef = db.collection('failedLogins')
    const attemptsQuery = attemptsRef
      .where('email', '==', email.toLowerCase())
      .where('timestamp', '>', timeLimit)
      .orderBy('timestamp', 'desc')

    const attemptsSnapshot = await attemptsQuery.get()
    const attemptCount = attemptsSnapshot.size

    // Log security event
    console.log('Login attempts check', {
      email,
      attemptCount,
      allowed: attemptCount < MAX_LOGIN_ATTEMPTS,
      timestamp: new Date().toISOString(),
      ip: context.rawRequest?.ip
    })

    return {
      allowed: attemptCount < MAX_LOGIN_ATTEMPTS,
      attemptCount,
      maxAttempts: MAX_LOGIN_ATTEMPTS,
      lockoutDuration: LOCKOUT_DURATION
    }
  } catch (error) {
    console.error('Check login attempts error:', error)
    throw new functions.https.HttpsError('internal', 'Failed to check login attempts')
  }
})

/**
 * Record failed login attempt
 */
exports.recordFailedLogin = functions.https.onCall(async (data, context) => {
  try {
    const { email, reason } = data
    
    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email is required')
    }

    // Record failed login
    const failedLoginData = {
      email: email.toLowerCase(),
      reason: reason || 'unknown',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: context.rawRequest?.ip || null,
      userAgent: context.rawRequest?.headers?.['user-agent'] || null
    }

    await db.collection('failedLogins').add(failedLoginData)

    // Log security event
    console.log('Failed login recorded', {
      email,
      reason,
      timestamp: new Date().toISOString(),
      ip: context.rawRequest?.ip
    })

    return { success: true }
  } catch (error) {
    console.error('Record failed login error:', error)
    throw new functions.https.HttpsError('internal', 'Failed to record failed login')
  }
})

/**
 * Update user role (admin only)
 */
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  try {
    const { userId, newRole, adminUserId } = data
    
    // Validasi input
    if (!userId || !newRole || !adminUserId) {
      throw new functions.https.HttpsError('invalid-argument', 'userId, newRole, and adminUserId are required')
    }

    // Validasi admin authority
    const adminDoc = await db.collection('jemaat').doc(adminUserId).get()
    if (!adminDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Admin user not found')
    }

    const adminData = adminDoc.data()
    if (!ADMIN_ROLES.includes(adminData.role)) {
      throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions')
    }

    // Validasi target user
    const userDoc = await db.collection('jemaat').doc(userId).get()
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Target user not found')
    }

    // Validasi role baru
    const validRoles = ['jemaat', 'moderator', 'admin', 'super_admin']
    if (!validRoles.includes(newRole)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid role')
    }

    // Prevent self-demotion dari super_admin
    if (adminUserId === userId && adminData.role === 'super_admin' && newRole !== 'super_admin') {
      throw new functions.https.HttpsError('permission-denied', 'Cannot demote yourself from super_admin')
    }

    // Update role
    await db.collection('jemaat').doc(userId).update({
      role: newRole,
      roleUpdatedBy: adminUserId,
      roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Log security event
    console.log('User role updated', {
      targetUserId: userId,
      newRole,
      adminUserId,
      timestamp: new Date().toISOString(),
      ip: context.rawRequest?.ip
    })

    return { success: true }
  } catch (error) {
    console.error('Update user role error:', error)
    
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to update user role')
  }
})

/**
 * Cleanup old failed login records (scheduled function)
 */
exports.cleanupFailedLogins = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Asia/Jakarta')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now()
      const cutoffTime = new admin.firestore.Timestamp(
        now.seconds - (7 * 24 * 60 * 60), // 7 hari
        now.nanoseconds
      )

      const oldRecordsQuery = db.collection('failedLogins')
        .where('timestamp', '<', cutoffTime)

      const oldRecordsSnapshot = await oldRecordsQuery.get()
      
      if (oldRecordsSnapshot.empty) {
        console.log('No old failed login records to cleanup')
        return null
      }

      // Hapus dalam batch
      const batch = db.batch()
      oldRecordsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      
      console.log(`Cleaned up ${oldRecordsSnapshot.size} old failed login records`)
      return null
    } catch (error) {
      console.error('Cleanup failed logins error:', error)
      return null
    }
  })

/**
 * Security monitoring dan alerting
 */
exports.securityAlert = functions.firestore
  .document('failedLogins/{loginId}')
  .onCreate(async (snap, context) => {
    try {
      const data = snap.data()
      const email = data.email
      
      // Hitung failed attempts dalam 1 jam terakhir
      const now = admin.firestore.Timestamp.now()
      const oneHourAgo = new admin.firestore.Timestamp(
        now.seconds - (60 * 60),
        now.nanoseconds
      )

      const recentAttemptsQuery = db.collection('failedLogins')
        .where('email', '==', email)
        .where('timestamp', '>', oneHourAgo)

      const recentAttemptsSnapshot = await recentAttemptsQuery.get()
      const attemptCount = recentAttemptsSnapshot.size

      // Alert jika terlalu banyak attempts
      if (attemptCount >= 10) {
        console.warn('SECURITY ALERT: High number of failed login attempts', {
          email,
          attemptCount,
          timestamp: new Date().toISOString(),
          ip: data.ip
        })

        // TODO: Kirim notifikasi ke admin atau sistem monitoring
        // Bisa menggunakan Cloud Messaging, email, atau webhook
      }

      return null
    } catch (error) {
      console.error('Security alert error:', error)
      return null
    }
  })

/**
 * Rate limiting untuk berbagai operasi
 */
exports.checkRateLimit = functions.https.onCall(async (data, context) => {
  try {
    const { operation, identifier, maxAttempts = 10, windowMinutes = 15 } = data
    
    if (!operation || !identifier) {
      throw new functions.https.HttpsError('invalid-argument', 'operation and identifier are required')
    }

    const now = admin.firestore.Timestamp.now()
    const windowStart = new admin.firestore.Timestamp(
      now.seconds - (windowMinutes * 60),
      now.nanoseconds
    )

    // Cek attempts dalam window time
    const attemptsRef = db.collection('rateLimits')
    const attemptsQuery = attemptsRef
      .where('operation', '==', operation)
      .where('identifier', '==', identifier)
      .where('timestamp', '>', windowStart)

    const attemptsSnapshot = await attemptsQuery.get()
    const attemptCount = attemptsSnapshot.size

    // Record attempt ini
    await db.collection('rateLimits').add({
      operation,
      identifier,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: context.rawRequest?.ip
    })

    return {
      allowed: attemptCount < maxAttempts,
      attemptCount: attemptCount + 1,
      maxAttempts,
      windowMinutes
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    throw new functions.https.HttpsError('internal', 'Failed to check rate limit')
  }
})

/**
 * Cleanup rate limit records (scheduled function)
 */
exports.cleanupRateLimits = functions.pubsub
  .schedule('every 6 hours')
  .timeZone('Asia/Jakarta')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now()
      const cutoffTime = new admin.firestore.Timestamp(
        now.seconds - (24 * 60 * 60), // 24 jam
        now.nanoseconds
      )

      const oldRecordsQuery = db.collection('rateLimits')
        .where('timestamp', '<', cutoffTime)

      const oldRecordsSnapshot = await oldRecordsQuery.get()
      
      if (oldRecordsSnapshot.empty) {
        console.log('No old rate limit records to cleanup')
        return null
      }

      // Hapus dalam batch
      const batches = []
      let currentBatch = db.batch()
      let batchSize = 0

      oldRecordsSnapshot.docs.forEach((doc) => {
        currentBatch.delete(doc.ref)
        batchSize++

        if (batchSize >= 500) { // Firestore batch limit
          batches.push(currentBatch)
          currentBatch = db.batch()
          batchSize = 0
        }
      })

      if (batchSize > 0) {
        batches.push(currentBatch)
      }

      // Commit all batches
      await Promise.all(batches.map(batch => batch.commit()))
      
      console.log(`Cleaned up ${oldRecordsSnapshot.size} old rate limit records`)
      return null
    } catch (error) {
      console.error('Cleanup rate limits error:', error)
      return null
    }
  })
