// src/services/backgroundScheduler.js
// Background service untuk menjalankan scheduled telegram messages

import { processScheduledMessages, getPendingSchedules } from './telegramScheduler'

class BackgroundScheduler {
  constructor() {
    this.isRunning = false
    this.intervalId = null
    this.checkInterval = 60000 // Check every 1 minute
  }

  /**
   * Start background scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('📅 Background scheduler already running')
      return
    }

    console.log('🚀 Starting background scheduler...')
    this.isRunning = true

    // Run immediately first
    this.checkAndProcessSchedules()

    // Then run every minute
    this.intervalId = setInterval(() => {
      this.checkAndProcessSchedules()
    }, this.checkInterval)

    console.log('✅ Background scheduler started')
  }

  /**
   * Stop background scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('⏹️ Background scheduler stopped')
  }

  /**
   * Check and process scheduled messages
   */
  async checkAndProcessSchedules() {
    try {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      console.log(`� [BackgroundScheduler] Current time: ${now.toLocaleTimeString('id-ID')}`)
      
      // Proses schedule hanya pada jam 00:00-00:05 (window 5 menit untuk toleransi)
      const isScheduleTime = currentHour === 0 && currentMinute <= 5
      
      if (!isScheduleTime) {
        // Di luar jam schedule, hanya check tanpa process
        const pendingSchedules = await getPendingSchedules()
        if (pendingSchedules.length > 0) {
          console.log(`📋 [BackgroundScheduler] ${pendingSchedules.length} pending schedules (waiting for 00:00)`)
        }
        return
      }
      
      console.log('🚀 [BackgroundScheduler] Schedule time! Processing scheduled messages...')
      
      // Get pending schedules
      const pendingSchedules = await getPendingSchedules()
      
      if (pendingSchedules.length === 0) {
        console.log('📅 [BackgroundScheduler] No pending schedules found')
        return
      }

      console.log(`📋 [BackgroundScheduler] Found ${pendingSchedules.length} pending schedules`)

      // Get current date (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0]
      
      // Filter schedules for today
      const todaySchedules = pendingSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.scheduledDate).toISOString().split('T')[0]
        return scheduleDate === today
      })

      if (todaySchedules.length === 0) {
        console.log(`📅 [BackgroundScheduler] No schedules for today (${today})`)
        return
      }

      console.log(`🎯 [BackgroundScheduler] Found ${todaySchedules.length} schedules for today`)

      // Process today's schedules
      const results = await processScheduledMessages(todaySchedules)
      
      if (results.success) {
        console.log(`✅ [BackgroundScheduler] Successfully processed ${results.processed} schedules`)
        
        // Log summary untuk admin
        console.log(`📊 [BackgroundScheduler] Schedule Summary:`)
        console.log(`   - Processed: ${results.processed}`)
        console.log(`   - Success: ${results.success}`)
        console.log(`   - Failed: ${results.failed}`)
        
        if (results.failed > 0) {
          console.warn(`⚠️ [BackgroundScheduler] ${results.failed} schedules failed`)
        }
      } else {
        console.error('❌ [BackgroundScheduler] Failed to process schedules:', results.error)
      }

    } catch (error) {
      console.error('❌ [BackgroundScheduler] Error checking schedules:', error)
    }
  }

  /**
   * Manual trigger for processing schedules
   */
  async triggerManual() {
    console.log('🔧 [BackgroundScheduler] Manual trigger activated')
    await this.checkAndProcessSchedules()
  }

  /**
   * Force process schedules sekarang (untuk testing)
   */
  async forceProcessToday() {
    try {
      console.log('🔧 [BackgroundScheduler] Force processing today\'s schedules...')
      
      const pendingSchedules = await getPendingSchedules()
      const today = new Date().toISOString().split('T')[0]
      
      const todaySchedules = pendingSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.scheduledDate).toISOString().split('T')[0]
        return scheduleDate === today
      })

      if (todaySchedules.length === 0) {
        console.log(`📅 [BackgroundScheduler] No schedules for today (${today})`)
        return { success: true, processed: 0, message: 'No schedules for today' }
      }

      console.log(`🎯 [BackgroundScheduler] Force processing ${todaySchedules.length} schedules`)
      
      const results = await processScheduledMessages(todaySchedules)
      return results
      
    } catch (error) {
      console.error('❌ [BackgroundScheduler] Error in force process:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      lastCheck: new Date().toISOString()
    }
  }
}

// Export singleton instance
const backgroundScheduler = new BackgroundScheduler()
export default backgroundScheduler

// Auto-start scheduler when module is loaded (for production)
if (process.env.NODE_ENV === 'production') {
  backgroundScheduler.start()
  console.log('🔄 Auto-started background scheduler for production')
}
