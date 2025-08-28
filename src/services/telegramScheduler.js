// src/services/telegramScheduler.js
// Service untuk scheduling otomatis pengiriman renungan ke Telegram

import { db } from './firebase'
import { 
  collection, 
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc
} from 'firebase/firestore'
import telegramService from './telegramService'

const SCHEDULER_COLLECTION = 'telegram_scheduler'

/**
 * Schedule renungan untuk dikirim otomatis berdasarkan tanggal
 * @param {Object} renunganData - Data renungan
 * @param {string} scheduledDate - Tanggal pengiriman (YYYY-MM-DD)
 * @returns {Promise<string>} Schedule ID
 */
export async function scheduleRenunganTelegram(renunganData, scheduledDate) {
  try {
    console.log('📅 [TelegramScheduler] Scheduling renungan for:', scheduledDate)
    
    // Validasi tanggal
    const targetDate = new Date(scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (targetDate < today) {
      throw new Error('Tanggal pengiriman tidak boleh di masa lalu')
    }
    
    // Cek apakah sudah ada schedule untuk tanggal yang sama
    const existingSchedules = await getScheduleByDate(scheduledDate)
    if (existingSchedules.length > 0) {
      console.log('⚠️ [TelegramScheduler] Schedule already exists for this date, updating...')
      // Update existing schedule
      await updateDoc(doc(db, SCHEDULER_COLLECTION, existingSchedules[0].id), {
        renunganData: renunganData,
        updatedAt: new Date(),
        status: 'scheduled'
      })
      return existingSchedules[0].id
    }
    
    // Buat schedule baru
    const scheduleData = {
      renunganId: renunganData.id,
      renunganData: renunganData,
      scheduledDate: scheduledDate,
      scheduledTime: `${scheduledDate}T06:00:00`, // Default jam 6 pagi
      status: 'scheduled', // 'scheduled', 'sent', 'failed', 'cancelled'
      createdAt: new Date(),
      createdBy: renunganData.createdBy || 'admin',
      attempts: 0,
      maxAttempts: 3
    }
    
    const docRef = await addDoc(collection(db, SCHEDULER_COLLECTION), scheduleData)
    console.log('✅ [TelegramScheduler] Schedule created:', docRef.id)
    
    return docRef.id
    
  } catch (error) {
    console.error('❌ [TelegramScheduler] Error scheduling renungan:', error)
    throw error
  }
}

/**
 * Batalkan schedule renungan
 * @param {string} scheduleId - ID schedule
 * @returns {Promise<boolean>} Success status
 */
export async function cancelRenunganSchedule(scheduleId) {
  try {
    await updateDoc(doc(db, SCHEDULER_COLLECTION, scheduleId), {
      status: 'cancelled',
      cancelledAt: new Date()
    })
    console.log('✅ [TelegramScheduler] Schedule cancelled:', scheduleId)
    return true
  } catch (error) {
    console.error('❌ [TelegramScheduler] Error cancelling schedule:', error)
    throw error
  }
}

/**
 * Get schedule berdasarkan tanggal
 * @param {string} date - Tanggal (YYYY-MM-DD)
 * @returns {Promise<Array>} Array schedules
 */
export async function getScheduleByDate(date) {
  try {
    const schedulerRef = collection(db, SCHEDULER_COLLECTION)
    const q = query(
      schedulerRef,
      where('scheduledDate', '==', date),
      where('status', 'in', ['scheduled', 'failed'])
    )
    
    const querySnapshot = await getDocs(q)
    const schedules = []
    
    querySnapshot.forEach((doc) => {
      schedules.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return schedules
  } catch (error) {
    console.error('❌ [TelegramScheduler] Error getting schedules:', error)
    return []
  }
}

/**
 * Get semua schedule yang pending
 * @returns {Promise<Array>} Array pending schedules
 */
export async function getPendingSchedules() {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const schedulerRef = collection(db, SCHEDULER_COLLECTION)
    const q = query(
      schedulerRef,
      where('scheduledDate', '<=', today),
      where('status', '==', 'scheduled'),
      orderBy('scheduledDate', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    const schedules = []
    
    querySnapshot.forEach((doc) => {
      schedules.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log(`📋 [TelegramScheduler] Found ${schedules.length} pending schedules`)
    return schedules
  } catch (error) {
    console.error('❌ [TelegramScheduler] Error getting pending schedules:', error)
    return []
  }
}

/**
 * Proses pengiriman schedule yang sudah waktunya
 * Function ini harus dipanggil secara berkala (cron job)
 */
export async function processScheduledMessages() {
  try {
    console.log('🔄 [TelegramScheduler] Processing scheduled messages...')
    
    const pendingSchedules = await getPendingSchedules()
    let processedCount = 0
    let successCount = 0
    let failedCount = 0
    
    for (const schedule of pendingSchedules) {
      try {
        console.log(`📤 [TelegramScheduler] Sending scheduled renungan: ${schedule.renunganData.title}`)
        
        // Kirim renungan via Telegram
        const result = await telegramService.sendRenunganToTelegram(schedule.renunganData)
        
        if (result.success) {
          // Update status ke 'sent'
          await updateDoc(doc(db, SCHEDULER_COLLECTION, schedule.id), {
            status: 'sent',
            sentAt: new Date(),
            sentResult: result,
            attempts: schedule.attempts + 1
          })
          
          successCount++
          console.log(`✅ [TelegramScheduler] Successfully sent: ${schedule.renunganData.title}`)
        } else {
          throw new Error('Telegram send failed')
        }
        
      } catch (error) {
        console.error(`❌ [TelegramScheduler] Failed to send: ${schedule.renunganData.title}`, error)
        
        const newAttempts = schedule.attempts + 1
        
        if (newAttempts >= schedule.maxAttempts) {
          // Max attempts reached, mark as failed
          await updateDoc(doc(db, SCHEDULER_COLLECTION, schedule.id), {
            status: 'failed',
            failedAt: new Date(),
            attempts: newAttempts,
            lastError: error.message
          })
        } else {
          // Retry later
          await updateDoc(doc(db, SCHEDULER_COLLECTION, schedule.id), {
            attempts: newAttempts,
            lastError: error.message,
            nextRetry: new Date(Date.now() + (30 * 60 * 1000)) // Retry after 30 minutes
          })
        }
        
        failedCount++
      }
      
      processedCount++
    }
    
    console.log(`📊 [TelegramScheduler] Processing complete:`, {
      total: processedCount,
      success: successCount,
      failed: failedCount
    })
    
    return {
      total: processedCount,
      success: successCount,
      failed: failedCount
    }
    
  } catch (error) {
    console.error('❌ [TelegramScheduler] Error processing scheduled messages:', error)
    throw error
  }
}

/**
 * Get schedule untuk renungan tertentu
 * @param {string} renunganId - ID renungan
 * @returns {Promise<Object|null>} Schedule data
 */
export async function getScheduleByRenunganId(renunganId) {
  try {
    const schedulerRef = collection(db, SCHEDULER_COLLECTION)
    const q = query(
      schedulerRef,
      where('renunganId', '==', renunganId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ [TelegramScheduler] Error getting schedule by renungan ID:', error)
    return null
  }
}

/**
 * Update schedule renungan
 * @param {string} scheduleId - ID schedule
 * @param {Object} updateData - Data untuk update
 * @returns {Promise<boolean>} Success status
 */
export async function updateSchedule(scheduleId, updateData) {
  try {
    await updateDoc(doc(db, SCHEDULER_COLLECTION, scheduleId), {
      ...updateData,
      updatedAt: new Date()
    })
    console.log('✅ [TelegramScheduler] Schedule updated:', scheduleId)
    return true
  } catch (error) {
    console.error('❌ [TelegramScheduler] Error updating schedule:', error)
    throw error
  }
}

/**
 * Delete schedule (hard delete)
 * @param {string} scheduleId - ID schedule
 * @returns {Promise<boolean>} Success status
 */
export async function deleteSchedule(scheduleId) {
  try {
    await deleteDoc(doc(db, SCHEDULER_COLLECTION, scheduleId))
    console.log('✅ [TelegramScheduler] Schedule deleted:', scheduleId)
    return true
  } catch (error) {
    console.error('❌ [TelegramScheduler] Error deleting schedule:', error)
    throw error
  }
}

export default {
  scheduleRenunganTelegram,
  cancelRenunganSchedule,
  getScheduleByDate,
  getPendingSchedules,
  processScheduledMessages,
  getScheduleByRenunganId,
  updateSchedule,
  deleteSchedule
}
