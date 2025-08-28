// test-schedule-processing.js
// Script untuk test manual processing scheduled renungan

import { processScheduledMessages, getPendingSchedules } from './src/services/telegramScheduler.js'
import backgroundScheduler from './src/services/backgroundScheduler.js'

/**
 * Test processing scheduled messages manually
 */
async function testScheduleProcessing() {
  try {
    console.log('🧪 [Test] Starting schedule processing test...')
    
    // 1. Check pending schedules
    console.log('\n📋 Step 1: Checking pending schedules...')
    const pendingSchedules = await getPendingSchedules()
    console.log(`Found ${pendingSchedules.length} pending schedules:`)
    
    pendingSchedules.forEach((schedule, index) => {
      console.log(`  ${index + 1}. ${schedule.renunganData.title} - ${schedule.scheduledDate}`)
    })
    
    if (pendingSchedules.length === 0) {
      console.log('✅ No pending schedules to process')
      return
    }
    
    // 2. Filter schedules for today
    console.log('\n📅 Step 2: Filtering schedules for today...')
    const today = new Date().toISOString().split('T')[0]
    console.log(`Today: ${today}`)
    
    const todaySchedules = pendingSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.scheduledDate).toISOString().split('T')[0]
      return scheduleDate === today
    })
    
    console.log(`Found ${todaySchedules.length} schedules for today:`)
    todaySchedules.forEach((schedule, index) => {
      console.log(`  ${index + 1}. ${schedule.renunganData.title}`)
    })
    
    if (todaySchedules.length === 0) {
      console.log('✅ No schedules for today')
      return
    }
    
    // 3. Process schedules
    console.log('\n🚀 Step 3: Processing today\'s schedules...')
    const results = await processScheduledMessages(todaySchedules)
    
    console.log('\n📊 Results:')
    console.log(`  Success: ${results.success}`)
    console.log(`  Processed: ${results.processed}`)
    console.log(`  Failed: ${results.failed}`)
    
    if (results.details) {
      console.log('\n📝 Details:')
      results.details.forEach((detail, index) => {
        console.log(`  ${index + 1}. ${detail.renunganTitle}: ${detail.status}`)
        if (detail.error) {
          console.log(`     Error: ${detail.error}`)
        }
      })
    }
    
    console.log('\n✅ [Test] Schedule processing test completed')
    
  } catch (error) {
    console.error('❌ [Test] Error in schedule processing test:', error)
  }
}

/**
 * Test background scheduler
 */
async function testBackgroundScheduler() {
  try {
    console.log('🧪 [Test] Testing background scheduler...')
    
    // Get status
    const status = backgroundScheduler.getStatus()
    console.log('📊 Scheduler Status:', status)
    
    // Force process today
    console.log('\n🔧 Force processing today\'s schedules...')
    const results = await backgroundScheduler.forceProcessToday()
    
    console.log('📊 Force Process Results:', results)
    
    console.log('\n✅ [Test] Background scheduler test completed')
    
  } catch (error) {
    console.error('❌ [Test] Error testing background scheduler:', error)
  }
}

/**
 * Create test schedule for today (for testing purposes)
 */
async function createTestSchedule() {
  try {
    const { scheduleRenunganTelegram } = await import('./src/services/telegramScheduler.js')
    
    const testRenungan = {
      id: 'test-' + Date.now(),
      title: 'Test Renungan Hari Ini',
      content: 'Ini adalah test renungan untuk testing schedule processing.',
      verse: 'Yohanes 3:16',
      date: new Date()
    }
    
    const today = new Date().toISOString().split('T')[0]
    
    console.log('🧪 [Test] Creating test schedule for today...')
    const scheduleId = await scheduleRenunganTelegram(testRenungan, today)
    
    console.log(`✅ [Test] Test schedule created: ${scheduleId}`)
    console.log(`📅 Scheduled for: ${today}`)
    console.log(`📖 Renungan: ${testRenungan.title}`)
    
    return scheduleId
    
  } catch (error) {
    console.error('❌ [Test] Error creating test schedule:', error)
  }
}

// Command line usage
if (typeof process !== 'undefined' && process.argv) {
  const command = process.argv[2]
  
  switch (command) {
    case 'process':
      testScheduleProcessing()
      break
    case 'scheduler':
      testBackgroundScheduler()
      break
    case 'create':
      createTestSchedule()
      break
    default:
      console.log('Usage:')
      console.log('  node test-schedule-processing.js process   # Test processing')
      console.log('  node test-schedule-processing.js scheduler # Test background scheduler')
      console.log('  node test-schedule-processing.js create    # Create test schedule')
  }
}

export {
  testScheduleProcessing,
  testBackgroundScheduler,
  createTestSchedule
}
