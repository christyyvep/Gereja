// src/services/laporanJemaat.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from './firebase'
import { logUserActivity, logAdminActivity } from './activityService'

const COLLECTION_NAME = 'reports'
// Alternative collection names to try
const ALTERNATIVE_COLLECTIONS = ['laporan_jemaat', 'prayer_requests', 'jemaat_reports']

// Helper function to find which collection contains a specific document (FIXED)
const findDocumentInCollections = async (documentId) => {
  const allCollections = [COLLECTION_NAME, ...ALTERNATIVE_COLLECTIONS]
  
  for (const collectionName of allCollections) {
    try {
      const docRef = doc(db, collectionName, documentId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        console.log(`📍 Found document ${documentId} in collection: ${collectionName}`)
        return { docRef, collectionName, data: docSnap.data() }
      }
    } catch (error) {
      console.log(`❌ Document ${documentId} not found in ${collectionName}:`, error.message)
    }
  }
  
  throw new Error(`Document ${documentId} not found in any collection`)
}

// Function to check if collection exists and has data (IMPROVED) - REMOVED (not used)
// This function is now embedded directly in getAllLaporanForAdmin for better control

// Service untuk user (mengirim laporan) - IMPROVED
export const submitLaporan = async (laporanData, userId = null) => {
  try {
    console.log('📝 Submitting laporan to Firestore...')
    console.log('📄 Raw laporan data:', laporanData)
    console.log('👤 User ID for laporan:', userId)
    
    // Clean data to remove undefined values (Firestore doesn't accept undefined)
    const cleanedData = {}
    
    Object.entries(laporanData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanedData[key] = value
      } else {
        console.warn(`⚠️ Skipping undefined field: ${key}`)
      }
    })
    
    console.log('🧹 Cleaned laporan data:', cleanedData)
    
    // Ensure required fields have fallback values
    const finalData = {
      ...cleanedData,
      // Add user ID if provided
      userId: userId || cleanedData.userId || cleanedData.nama || 'anonymous',
      // Ensure these fields always exist
      isRead: false,
      status: cleanedData.status || 'pending',
      priority: cleanedData.priority || 'normal',
      // Add timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timestamp: serverTimestamp() // for compatibility
    }
    
    console.log('📄 Final data to submit:', finalData)
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), finalData)
    
    console.log('✅ Laporan berhasil dikirim dengan ID:', docRef.id)
    
    // Log user activity
    try {
      const activityUserId = userId || finalData.userId
      
      // ⭐ IMPORTANT: Use nama from finalData (actual user data from form)
      // This should be the real user's name, not generic "User"
      const correctUserName = finalData.nama && 
                              finalData.nama !== 'User' && 
                              finalData.nama.trim() 
                              ? finalData.nama 
                              : null // Let activityService.getUserName() handle fallback
      
      const activityData = {
        action: 'laporan_submit',
        title: finalData.judul || 'Laporan Jemaat',
        category: finalData.kategori || 'other',
        userName: correctUserName
      }
      
      console.log('📊 [LaporanService] Logging user activity:', activityData)
      console.log('📊 [LaporanService] User ID for activity:', activityUserId)
      console.log('📊 [LaporanService] User name for activity:', correctUserName)
      
      await logUserActivity(activityUserId, activityData)
      console.log('✅ [LaporanService] User activity logged successfully')
      
    } catch (activityError) {
      console.error('❌ [LaporanService] Failed to log user activity:', activityError)
    }
    
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('❌ Error mengirim laporan:', error)
    throw new Error('Gagal mengirim laporan: ' + error.message)
  }
}

// Service untuk admin (mengambil semua laporan) - IMPROVED
export const getAllLaporanForAdmin = async () => {
  try {
    console.log('🔍 Starting getAllLaporanForAdmin...')
    console.log('🔍 Primary collection:', COLLECTION_NAME)
    console.log('🔍 Alternative collections:', ALTERNATIVE_COLLECTIONS)
    
    // Check all collections and find the one with data
    let collectionToUse = null
    let collectionData = []
    
    // Start with primary collection
    const allCollectionsToCheck = [COLLECTION_NAME, ...ALTERNATIVE_COLLECTIONS]
    
    for (const collName of allCollectionsToCheck) {
      console.log(`� Checking collection: ${collName}`)
      
      try {
        // Try different query strategies
        let querySuccess = false
        let querySnapshot = null
        
        // Strategy 1: Basic query without ordering
        try {
          console.log(`� Strategy 1: Basic query for ${collName}`)
          const basicQuery = query(collection(db, collName))
          querySnapshot = await getDocs(basicQuery)
          console.log(`📊 Basic query result for ${collName}: ${querySnapshot.size} documents`)
          
          if (querySnapshot.size > 0) {
            querySuccess = true
            collectionToUse = collName
          }
        } catch (basicError) {
          console.log(`❌ Basic query failed for ${collName}:`, basicError.message)
        }
        
        // Strategy 2: Try with timestamp ordering if basic query has data
        if (querySuccess && querySnapshot.size > 0) {
          try {
            console.log(`📊 Strategy 2: Timestamp ordering for ${collName}`)
            const timestampQuery = query(
              collection(db, collName),
              orderBy('timestamp', 'desc')
            )
            const timestampSnapshot = await getDocs(timestampQuery)
            console.log(`📊 Timestamp query result for ${collName}: ${timestampSnapshot.size} documents`)
            
            if (timestampSnapshot.size > 0) {
              querySnapshot = timestampSnapshot // Use ordered result
              console.log(`✅ Using timestamp-ordered query for ${collName}`)
            }
          } catch (timestampError) {
            console.log(`⚠️ Timestamp ordering failed for ${collName}, using basic query`)
          }
        }
        
        // Strategy 3: Try with createdAt ordering if timestamp failed
        if (querySuccess && querySnapshot.size > 0) {
          try {
            console.log(`📊 Strategy 3: CreatedAt ordering for ${collName}`)
            const createdAtQuery = query(
              collection(db, collName),
              orderBy('createdAt', 'desc')
            )
            const createdAtSnapshot = await getDocs(createdAtQuery)
            console.log(`📊 CreatedAt query result for ${collName}: ${createdAtSnapshot.size} documents`)
            
            if (createdAtSnapshot.size > 0) {
              querySnapshot = createdAtSnapshot // Use ordered result
              console.log(`✅ Using createdAt-ordered query for ${collName}`)
            }
          } catch (createdAtError) {
            console.log(`⚠️ CreatedAt ordering failed for ${collName}, using previous result`)
          }
        }
        
        // If we found data, process it
        if (querySuccess && querySnapshot && querySnapshot.size > 0) {
          console.log(`✅ Found ${querySnapshot.size} documents in collection: ${collName}`)
          
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            console.log(`📄 Processing document ${doc.id} from ${collName}`)
            console.log(`📄 Available fields:`, Object.keys(data))
            
            // Enhanced field mapping
            const processedData = {
              id: doc.id,
              ...data,
              // Enhanced timestamp handling
              createdAt: (() => {
                if (data.createdAt?.toDate) return data.createdAt.toDate().toISOString()
                if (data.timestamp?.toDate) return data.timestamp.toDate().toISOString()
                if (data.createdAt) return new Date(data.createdAt).toISOString()
                if (data.timestamp) return new Date(data.timestamp).toISOString()
                return new Date().toISOString()
              })(),
              updatedAt: (() => {
                if (data.updatedAt?.toDate) return data.updatedAt.toDate().toISOString()
                if (data.timestamp?.toDate) return data.timestamp.toDate().toISOString()
                if (data.updatedAt) return new Date(data.updatedAt).toISOString()
                return new Date().toISOString()
              })(),
              // Enhanced user name mapping (sesuai sistem auth MyRajawali)
              userName: (() => {
                const nameFields = ['userName', 'nama'] // Primary: nama (sistem MyRajawali)
                for (const field of nameFields) {
                  if (data[field] && typeof data[field] === 'string' && data[field].trim()) {
                    return data[field].trim()
                  }
                }
                return 'Unknown User'
              })(),
              // Enhanced category mapping
              jenisLaporan: data.jenisLaporan || data.category || data.type || 'lainnya',
              // Enhanced description mapping
              deskripsi: data.deskripsi || data.description || data.message || data.content || 'No description',
              // Enhanced boolean fields
              isAnonymous: Boolean(data.isAnonymous),
              isRead: Boolean(data.isRead),
              status: data.status || 'pending',
              // Additional fields that might be useful
              priority: data.priority || 'normal',
              tags: data.tags || []
            }
            
            console.log(`📄 Processed data for ${doc.id}:`, {
              userName: processedData.userName,
              jenisLaporan: processedData.jenisLaporan,
              deskripsi: processedData.deskripsi?.substring(0, 50) + '...',
              createdAt: processedData.createdAt,
              isRead: processedData.isRead
            })
            
            collectionData.push(processedData)
          })
          
          break // Stop searching if we found data
        }
        
      } catch (collectionError) {
        console.log(`❌ Error processing collection ${collName}:`, collectionError.message)
      }
    }
    
    if (collectionData.length > 0) {
      console.log(`✅ Successfully retrieved ${collectionData.length} laporan from collection: ${collectionToUse}`)
      console.log(`📊 Sample laporan:`, collectionData.slice(0, 2))
      return collectionData
    } else {
      console.log(`⚠️ No laporan found in any collection`)
      console.log(`💡 Checked collections:`, allCollectionsToCheck)
      console.log(`💡 Consider checking Firebase Console or creating test data`)
      return []
    }
    
  } catch (error) {
    console.error('❌ Fatal error in getAllLaporanForAdmin:', error)
    console.error('❌ Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    
    // Return empty array instead of throwing
    return []
  }
}

// Service untuk admin (menandai laporan sebagai sudah dibaca)
export const markLaporanAsRead = async (laporanId, adminId) => {
  try {
    console.log(`🔍 Searching for document ${laporanId} in all collections...`)
    
    // Find the document in any available collection
    const { docRef, collectionName } = await findDocumentInCollections(laporanId)
    
    await updateDoc(docRef, {
      isRead: true,
      readBy: adminId,
      readAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log(`✅ Laporan ${laporanId} berhasil ditandai sebagai dibaca di collection ${collectionName}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error menandai laporan sebagai dibaca: ', error)
    throw new Error('Gagal menandai laporan sebagai dibaca: ' + error.message)
  }
}

// Service untuk admin (menghapus laporan)
export const deleteLaporan = async (laporanId) => {
  try {
    console.log(`🗑️ Searching for document ${laporanId} to delete...`)
    
    // Find the document in any available collection
    const { docRef, collectionName } = await findDocumentInCollections(laporanId)
    
    await deleteDoc(docRef)
    console.log(`✅ Laporan ${laporanId} berhasil dihapus dari collection ${collectionName}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error menghapus laporan: ', error)
    throw new Error('Gagal menghapus laporan: ' + error.message)
  }
}

// Service untuk admin (update status laporan)
export const updateLaporanStatus = async (laporanId, status, adminId) => {
  try {
    console.log(`📝 Searching for document ${laporanId} to update status...`)
    
    // Find the document in any available collection
    const { docRef, collectionName, data } = await findDocumentInCollections(laporanId)
    
    await updateDoc(docRef, {
      status: status,
      processedBy: adminId,
      processedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log(`✅ Status laporan ${laporanId} berhasil diupdate di collection ${collectionName}`)
    
    // Log admin activity
    try {
      const activityData = {
        action: 'laporan_process',
        title: data.judul || 'Laporan Jemaat',
        status: status,
        targetUserId: data.userId || data.nama
      }
      
      console.log('📊 [LaporanService] Logging admin activity:', activityData)
      await logAdminActivity(adminId, activityData)
      console.log('✅ [LaporanService] Admin activity logged successfully')
      
    } catch (activityError) {
      console.error('❌ [LaporanService] Failed to log admin activity:', activityError)
    }
    
    return { success: true }
  } catch (error) {
    console.error('❌ Error update status laporan: ', error)
    throw new Error('Gagal update status laporan: ' + error.message)
  }
}

// Service untuk admin (realtime listener) - IMPROVED
export const subscribeLaporanUpdates = async (callback) => {
  try {
    console.log('🎧 Setting up improved realtime listener...')
    
    // Find which collection has data using the same logic as getAllLaporanForAdmin
    let collectionToUse = null
    const allCollectionsToCheck = [COLLECTION_NAME, ...ALTERNATIVE_COLLECTIONS]
    
    for (const collName of allCollectionsToCheck) {
      console.log(`🎧 Checking collection for listener: ${collName}`)
      
      try {
        // Quick check if collection has data
        const basicQuery = query(collection(db, collName), limit(1))
        const snapshot = await getDocs(basicQuery)
        
        if (snapshot.size > 0) {
          collectionToUse = collName
          console.log(`✅ Using collection for listener: ${collectionToUse}`)
          break
        }
      } catch (error) {
        console.log(`❌ Error checking ${collName} for listener:`, error.message)
      }
    }
    
    if (!collectionToUse) {
      console.log('⚠️ No collection with data found for listener! Using default:', COLLECTION_NAME)
      collectionToUse = COLLECTION_NAME
    }
    
    console.log('🎧 Setting up realtime listener for:', collectionToUse)
    
    // Try different query strategies for realtime listener
    let listenerQuery
    let queryStrategy = 'basic'
    
    // Strategy 1: Try timestamp ordering
    try {
      console.log('🎧 Attempting timestamp-ordered listener...')
      listenerQuery = query(
        collection(db, collectionToUse),
        orderBy('timestamp', 'desc')
      )
      queryStrategy = 'timestamp'
      console.log('✅ Listener will use timestamp ordering')
    } catch (error) {
      console.log('⚠️ Timestamp ordering failed for listener, trying createdAt...', error.message)
      
      // Strategy 2: Try createdAt ordering
      try {
        console.log('🎧 Attempting createdAt-ordered listener...')
        listenerQuery = query(
          collection(db, collectionToUse),
          orderBy('createdAt', 'desc')
        )
        queryStrategy = 'createdAt'
        console.log('✅ Listener will use createdAt ordering')
      } catch (error2) {
        console.log('⚠️ CreatedAt ordering failed for listener, using basic query...', error2.message)
        
        // Strategy 3: Basic query without ordering
        listenerQuery = query(collection(db, collectionToUse))
        queryStrategy = 'basic'
        console.log('✅ Listener will use basic query (no ordering)')
      }
    }
    
    // Setup the actual listener
    const unsubscribe = onSnapshot(listenerQuery, (querySnapshot) => {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`📡 Realtime update received at ${timestamp}`)
      console.log(`📡 Collection: ${collectionToUse}`)
      console.log(`📡 Query strategy: ${queryStrategy}`)
      console.log(`📡 Snapshot size: ${querySnapshot.size}`)
      console.log(`📡 Snapshot empty: ${querySnapshot.empty}`)
      
      const laporan = []
      
      querySnapshot.forEach((doc, index) => {
        const data = doc.data()
        console.log(`📡 Processing realtime doc ${index + 1}: ${doc.id}`)
        console.log(`📡 Available fields:`, Object.keys(data))
        
        // Use the same enhanced processing logic as getAllLaporanForAdmin
        const processedData = {
          id: doc.id,
          ...data,
          // Enhanced timestamp handling
          createdAt: (() => {
            if (data.createdAt?.toDate) return data.createdAt.toDate().toISOString()
            if (data.timestamp?.toDate) return data.timestamp.toDate().toISOString()
            if (data.createdAt) return new Date(data.createdAt).toISOString()
            if (data.timestamp) return new Date(data.timestamp).toISOString()
            return new Date().toISOString()
          })(),
          updatedAt: (() => {
            if (data.updatedAt?.toDate) return data.updatedAt.toDate().toISOString()
            if (data.timestamp?.toDate) return data.timestamp.toDate().toISOString()
            if (data.updatedAt) return new Date(data.updatedAt).toISOString()
            return new Date().toISOString()
          })(),
          // Enhanced user name mapping (sesuai sistem auth MyRajawali)
          userName: (() => {
            const nameFields = ['userName', 'nama'] // Primary: nama (sistem MyRajawali)
            for (const field of nameFields) {
              if (data[field] && typeof data[field] === 'string' && data[field].trim()) {
                return data[field].trim()
              }
            }
            return 'Unknown User'
          })(),
          // Enhanced category mapping
          jenisLaporan: data.jenisLaporan || data.category || data.type || 'lainnya',
          // Enhanced description mapping
          deskripsi: data.deskripsi || data.description || data.message || data.content || 'No description',
          // Enhanced boolean fields
          isAnonymous: Boolean(data.isAnonymous),
          isRead: Boolean(data.isRead),
          status: data.status || 'pending',
          // Additional fields
          priority: data.priority || 'normal',
          tags: data.tags || []
        }
        
        console.log(`📡 Processed realtime data for ${doc.id}:`, {
          userName: processedData.userName,
          jenisLaporan: processedData.jenisLaporan,
          deskripsi: processedData.deskripsi?.substring(0, 30) + '...',
          isRead: processedData.isRead
        })
        
        laporan.push(processedData)
      })
      
      console.log(`📡 Realtime data processed: ${laporan.length} documents`)
      console.log(`📡 Calling callback with processed data`)
      
      // Call the callback with processed data
      callback(laporan)
      
    }, (error) => {
      console.error('❌ Realtime listener error:', error)
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message
      })
      
      // Call callback with empty array on error
      console.log('📡 Calling callback with empty array due to error')
      callback([])
    })
    
    console.log('✅ Realtime listener setup completed successfully')
    console.log(`✅ Listening on collection: ${collectionToUse} (${queryStrategy} strategy)`)
    
    return unsubscribe
    
  } catch (error) {
    console.error('❌ Error setting up realtime listener:', error)
    console.error('❌ Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    
    // Return dummy unsubscribe function on error
    return () => {
      console.log('🎧 Dummy unsubscribe called (listener setup failed)')
    }
  }
}

// Service untuk user (mengambil laporan user sendiri)
export const getUserLaporan = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const laporan = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      laporan.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
      })
    })
    
    return laporan
  } catch (error) {
    console.error('Error mengambil laporan user: ', error)
    throw new Error('Gagal mengambil laporan: ' + error.message)
  }
}

// Helper functions
export const getJenisIcon = (jenis) => {
  const icons = {
    keluhan: 'fas fa-exclamation-triangle',
    saran: 'fas fa-lightbulb', 
    pujian: 'fas fa-thumbs-up',
    perbaikan_gereja: 'fas fa-wrench',
    error_aplikasi: 'fas fa-bug',
    bantuan_teknis: 'fas fa-question-circle',
    lainnya: 'fas fa-file-alt'
  }
  return icons[jenis] || icons.lainnya
}

export const getJenisLabel = (jenis) => {
  const labels = {
    keluhan: 'Keluhan Pelayanan',
    saran: 'Saran Perbaikan', 
    pujian: 'Pujian dan Apresiasi',
    perbaikan_gereja: 'Perbaikan Fasilitas Gereja',
    error_aplikasi: 'Error Aplikasi',
    bantuan_teknis: 'Bantuan Teknis',
    lainnya: 'Lainnya'
  }
  return labels[jenis] || 'Lainnya'
}

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Menunggu',
    in_progress: 'Diproses',
    resolved: 'Selesai',
    rejected: 'Ditolak'
  }
  return labels[status] || 'Menunggu'
}
