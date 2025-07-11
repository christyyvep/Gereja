// src/services/streakService.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

const STREAK_COLLECTION = 'streaks'

/**
 * Membuat data streak baru di Firestore
 * @param {string} userId - ID user
 * @returns {Object} Data streak baru
 */
export async function createNewStreakInFirestore(userId) {
  try {
    const today = new Date().toDateString()
    
    const newStreakData = {
      userId: userId,
      streakCount: 1,  // ✅ PERBAIKAN: Default = 1, bukan 0
      lastLoginDate: today,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      totalLogins: 1,
      longestStreak: 1
    }

    await saveStreakToFirestore(userId, newStreakData)
    
    console.log('🎉 [StreakService] New streak created with count = 1')
    return newStreakData
    
  } catch (error) {
    console.error('❌ [StreakService] Error creating new streak:', error)
    throw error
  }
}

/**
 * Fungsi utama untuk check dan update streak - LOGIKA DIPERBAIKI
 * @param {string} userId - ID user
 * @returns {number} Streak count terbaru
 */
export async function checkAndUpdateStreak(userId) {
  try {
    if (!userId) {
      console.error('❌ [StreakService] No userId provided')
      return 1  // ✅ PERBAIKAN: Return 1, bukan 0
    }

    console.log('🔍 [StreakService] Checking streak for user:', userId)

    const today = new Date().toDateString()
    
    // Ambil data streak dari Firestore
    let streakData = await getStreakFromFirestore(userId)
    
    // ✅ PERBAIKAN: Jika belum ada data, buat baru dengan streak = 1
    if (!streakData) {
      console.log('📝 [StreakService] First time login, creating streak = 1')
      streakData = await createNewStreakInFirestore(userId)
      return streakData.streakCount  // Return 1
    }

    // ✅ PERBAIKAN: Jika sudah check hari ini, return streak yang ada tanpa update database
    if (streakData.lastLoginDate === today) {
      console.log('📅 [StreakService] Already checked today, streak remains:', streakData.streakCount)
      return streakData.streakCount
    }

    // Cek apakah akses berturut-turut (consecutive days)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    let newStreakCount
    
    if (streakData.lastLoginDate === yesterdayStr) {
      // Akses berturut-turut - tambah streak
      newStreakCount = (streakData.streakCount || 1) + 1
      console.log(`🔥 [StreakService] Consecutive access! ${streakData.streakCount} → ${newStreakCount}`)
    } else {
      // Ada gap - reset streak ke 1 (bukan 0!)
      newStreakCount = 1
      console.log(`💔 [StreakService] Gap detected, streak reset: ${streakData.streakCount} → 1`)
    }

    // Update ke Firestore
    await updateStreakInFirestore(userId, newStreakCount, today)
    
    return newStreakCount
    
  } catch (error) {
    console.error('❌ [StreakService] Error in checkAndUpdateStreak:', error)
    return 1  // ✅ PERBAIKAN: Return 1 sebagai fallback, bukan 0
  }
}

/**
 * ✅ BARU: Force check streak (untuk testing atau reset manual)
 * @param {string} userId - ID user
 * @returns {number} Streak count terbaru
 */
export async function forceCheckStreak(userId) {
  try {
    if (!userId) {
      console.error('❌ [StreakService] No userId provided for force check')
      return 1
    }

    console.log('🔄 [StreakService] FORCE checking streak for user:', userId)

    const today = new Date().toDateString()
    
    // Ambil data streak dari Firestore
    let streakData = await getStreakFromFirestore(userId)
    
    if (!streakData) {
      console.log('📝 [StreakService] Force check - First time, creating streak = 1')
      streakData = await createNewStreakInFirestore(userId)
      return streakData.streakCount
    }

    // Force update tanpa cek tanggal
    const currentStreak = streakData.streakCount || 1
    
    // Cek apakah berturut-turut dari hari sebelumnya
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    let newStreakCount
    
    if (streakData.lastLoginDate === yesterdayStr) {
      // Berturut-turut - tambah
      newStreakCount = currentStreak + 1
      console.log(`🔥 [StreakService] FORCE - Consecutive! ${currentStreak} → ${newStreakCount}`)
    } else if (streakData.lastLoginDate === today) {
      // Sama hari - tambah 1 anyway untuk testing
      newStreakCount = currentStreak + 1
      console.log(`🧪 [StreakService] FORCE - Same day test! ${currentStreak} → ${newStreakCount}`)
    } else {
      // Gap - reset ke 1
      newStreakCount = 1
      console.log(`💔 [StreakService] FORCE - Gap detected, reset to 1`)
    }

    // Update ke Firestore
    await updateStreakInFirestore(userId, newStreakCount, today)
    
    return newStreakCount
    
  } catch (error) {
    console.error('❌ [StreakService] Error in force check streak:', error)
    return 1
  }
}

export async function saveStreakToFirestore(userId, streakData) {
  try {
    if (!userId) {
      throw new Error('User ID tidak boleh kosong')
    }

    console.log('💾 [StreakService] Saving streak to Firestore:', { userId, streakData })

    const streakDocRef = doc(db, STREAK_COLLECTION, userId)
    
    const dataToSave = {
      ...streakData,
      userId: userId,
      updatedAt: serverTimestamp(),
      lastSyncedAt: new Date().toISOString()
    }

    await setDoc(streakDocRef, dataToSave, { merge: true })
    
    console.log('✅ [StreakService] Streak saved successfully to Firestore')
    return true
    
  } catch (error) {
    console.error('❌ [StreakService] Error saving streak to Firestore:', error)
    throw error
  }
}

export async function getStreakFromFirestore(userId) {
  try {
    if (!userId) {
      throw new Error('User ID tidak boleh kosong')
    }

    console.log('📥 [StreakService] Loading streak from Firestore for user:', userId)

    const streakDocRef = doc(db, STREAK_COLLECTION, userId)
    const streakDoc = await getDoc(streakDocRef)
    
    if (streakDoc.exists()) {
      const data = streakDoc.data()
      console.log('✅ [StreakService] Streak loaded from Firestore:', data)
      return data
    } else {
      console.log('📝 [StreakService] No streak data found, will create new')
      return null
    }
    
  } catch (error) {
    console.error('❌ [StreakService] Error loading streak from Firestore:', error)
    throw error
  }
}

export async function updateStreakInFirestore(userId, newStreakCount, lastLoginDate) {
  try {
    const streakDocRef = doc(db, STREAK_COLLECTION, userId)
    
    // Pastikan newStreakCount minimal 1
    newStreakCount = Math.max(newStreakCount || 1, 1)
    
    const updateData = {
      userId: userId,
      streakCount: newStreakCount,
      lastLoginDate: lastLoginDate,
      updatedAt: serverTimestamp(),
      totalLogins: 1, // Default jika belum ada data
      longestStreak: newStreakCount // Default = streak sekarang
    }

    try {
      // Coba ambil data existing
      const currentData = await getStreakFromFirestore(userId)
      if (currentData) {
        updateData.totalLogins = (currentData.totalLogins || 0) + 1
        updateData.longestStreak = Math.max(newStreakCount, currentData.longestStreak || 0)
      }
    } catch (getError) {
      console.warn('⚠️ [StreakService] Could not get current data:', getError)
      // Lanjut dengan nilai default
    }

    // Selalu gunakan setDoc dengan merge untuk menghindari error document not exists
    await setDoc(streakDocRef, updateData, { merge: true })
    
    console.log('🔄 [StreakService] Streak updated in Firestore:', updateData)
    return updateData
    
  } catch (error) {
    console.error('❌ [StreakService] Error updating streak:', error)
    // Return minimal data untuk menghindari crash
    return {
      userId,
      streakCount: 1,
      lastLoginDate,
      updatedAt: new Date().toISOString(),
      totalLogins: 1,
      longestStreak: 1
    }
  }
}