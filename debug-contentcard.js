// Debug ContentCard component
console.log('🔍 Testing ContentCard component...')

// Test Vue component compilation
import { createApp } from 'vue'

// Simple test to see if ContentCard can be loaded
async function testContentCard() {
  try {
    // Try to import ContentCard
    const ContentCard = await import('./src/components/common/ContentCard.vue')
    console.log('✅ ContentCard imported successfully:', ContentCard)
    
    // Check if it has a valid template
    if (ContentCard.default) {
      console.log('✅ ContentCard has default export')
      console.log('✅ Component name:', ContentCard.default.name)
      console.log('✅ Component render:', typeof ContentCard.default.render)
      console.log('✅ Component template:', typeof ContentCard.default.template)
    }
    
  } catch (error) {
    console.error('❌ Error importing ContentCard:', error)
    console.error('❌ Error details:', error.message)
    console.error('❌ Error stack:', error.stack)
  }
}

testContentCard()
