// Test Daily Verse Rotation Logic
import { getDailyVerseUrl, getTodaysDailyVerseNumber, getSpecificDailyVerse } from '../src/utils/imageUtils.js'

console.log('🧪 Testing Daily Verse Rotation Logic...\n')

// Test 1: Get today's daily verse
console.log('📅 Test 1: Today\'s Daily Verse')
const todaysVerse = getDailyVerseUrl()
const todaysNumber = getTodaysDailyVerseNumber()
console.log(`Today's ayat number: ${todaysNumber}`)
console.log(`Today's verse URL: ${todaysVerse}`)
console.log('')

// Test 2: Test with specific dates (simulate different days)
console.log('📅 Test 2: Simulating different dates')
const originalDate = Date

// Mock different dates to test rotation
const testDates = [
  new Date('2025-01-01'), // Should give consistent result
  new Date('2025-01-02'), // Should give different result
  new Date('2025-01-03'),
  new Date('2025-01-04'),
  new Date('2025-01-05'),
  new Date('2025-01-06'), // Should cycle back
]

testDates.forEach((testDate, index) => {
  // Mock Date constructor
  global.Date = function(...args) {
    if (args.length === 0) {
      return testDate
    }
    return new originalDate(...args)
  }
  global.Date.now = () => testDate.getTime()
  
  const ayatNumber = getTodaysDailyVerseNumber()
  console.log(`Date: ${testDate.toISOString().split('T')[0]} -> Ayat: ${ayatNumber}`)
})

// Restore original Date
global.Date = originalDate

console.log('')

// Test 3: Test specific ayat numbers
console.log('📖 Test 3: Getting specific ayat numbers')
for (let i = 1; i <= 5; i++) {
  const specificVerse = getSpecificDailyVerse(i)
  console.log(`Ayat ${i}: ${specificVerse}`)
}

console.log('')
console.log('✅ All tests completed!')
