import { db } from '@/services/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

/**
 * Update news structure - migration utility
 * This function is used to update the structure of existing news items in Firestore
 */
export const updateNewsStructure = async () => {
  try {
    console.log('🔄 Starting news structure update...')
    
    const newsCollection = collection(db, 'news')
    const snapshot = await getDocs(newsCollection)
    
    let updateCount = 0
    
    for (const docSnapshot of snapshot.docs) {
      const newsData = docSnapshot.data()
      
      // Check if update is needed
      if (!newsData.version || newsData.version !== '2.0') {
        const updates = {
          version: '2.0',
          updatedAt: new Date(),
          // Add any other structure updates needed
          structure: 'updated'
        }
        
        await updateDoc(doc(db, 'news', docSnapshot.id), updates)
        updateCount++
        
        console.log(`✅ Updated news item: ${docSnapshot.id}`)
      }
    }
    
    console.log(`✅ News structure update completed. Updated ${updateCount} items.`)
    return { 
      success: true, 
      message: `Successfully updated ${updateCount} news items`,
      count: updateCount 
    }
    
  } catch (error) {
    console.error('❌ Error updating news structure:', error)
    return { 
      success: false, 
      message: 'Failed to update news structure',
      error: error.message 
    }
  }
}

/**
 * Check if news structure update is needed
 */
export const checkNewsStructureStatus = async () => {
  try {
    const newsCollection = collection(db, 'news')
    const snapshot = await getDocs(newsCollection)
    
    let needsUpdate = 0
    let total = snapshot.size
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      if (!data.version || data.version !== '2.0') {
        needsUpdate++
      }
    })
    
    return {
      total,
      needsUpdate,
      isUpdateNeeded: needsUpdate > 0
    }
    
  } catch (error) {
    console.error('❌ Error checking news structure status:', error)
    return {
      total: 0,
      needsUpdate: 0,
      isUpdateNeeded: false,
      error: error.message
    }
  }
}

/**
 * Rollback news structure changes
 */
export const rollbackNewsStructure = async () => {
  try {
    console.log('🔄 Rolling back news structure...')
    
    const newsCollection = collection(db, 'news')
    const snapshot = await getDocs(newsCollection)
    
    let rollbackCount = 0
    
    for (const docSnapshot of snapshot.docs) {
      const newsData = docSnapshot.data()
      
      if (newsData.version === '2.0') {
        const updates = {
          version: '1.0',
          updatedAt: new Date(),
          structure: 'rollback'
        }
        
        await updateDoc(doc(db, 'news', docSnapshot.id), updates)
        rollbackCount++
      }
    }
    
    console.log(`✅ Rollback completed. Rolled back ${rollbackCount} items.`)
    return { 
      success: true, 
      message: `Successfully rolled back ${rollbackCount} news items`,
      count: rollbackCount 
    }
    
  } catch (error) {
    console.error('❌ Error rolling back news structure:', error)
    return { 
      success: false, 
      message: 'Failed to rollback news structure',
      error: error.message 
    }
  }
}

/**
 * Update all news documents (alias for updateNewsStructure)
 */
export const updateAllNewsDocuments = updateNewsStructure

/**
 * Update single news document
 * @param {string} newsId - ID of the news document to update
 */
export const updateSingleNewsDocument = async (newsId) => {
  try {
    console.log(`🔄 Updating single news document: ${newsId}`)
    
    const newsRef = doc(db, 'news', newsId)
    const updates = {
      version: '2.0',
      updatedAt: new Date(),
      structure: 'updated'
    }
    
    await updateDoc(newsRef, updates)
    
    console.log(`✅ Updated news item: ${newsId}`)
    return { 
      success: true, 
      message: `Successfully updated news item ${newsId}` 
    }
    
  } catch (error) {
    console.error(`❌ Error updating news item ${newsId}:`, error)
    return { 
      success: false, 
      message: `Failed to update news item ${newsId}`,
      error: error.message 
    }
  }
}

export default updateNewsStructure
