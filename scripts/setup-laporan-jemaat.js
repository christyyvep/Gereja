// scripts/setup-laporan-jemaat.js
// Script untuk setup struktur Firestore untuk laporan jemaat

import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore'

// Firebase config (sesuaikan dengan config project Anda)
const firebaseConfig = {
  // Ambil dari firebase config yang sudah ada
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Setup Firestore structure untuk laporan jemaat
 * 
 * Collection: laporan_jemaat
 * Document structure:
 * {
 *   id: string (auto-generated),
 *   userId: string,
 *   userName: string,
 *   userEmail: string,
 *   jenisLaporan: 'keluhan' | 'saran' | 'pujian' | 'perbaikan_gereja' | 'error_aplikasi' | 'bantuan_teknis' | 'lainnya',
 *   deskripsi: string,
 *   isAnonymous: boolean,
 *   isRead: boolean,
 *   status: 'pending' | 'in_progress' | 'resolved' | 'rejected',
 *   readBy: string (adminId),
 *   readAt: timestamp,
 *   processedBy: string (adminId),
 *   processedAt: timestamp,
 *   createdAt: timestamp,
 *   updatedAt: timestamp
 * }
 */

export const setupLaporanJemaatStructure = async () => {
  try {
    console.log('Setting up Firestore structure for laporan_jemaat...')
    
    // Tidak perlu membuat dokumen dummy
    // Firestore akan otomatis membuat collection saat dokumen pertama ditambahkan
    
    console.log('✅ Firestore structure ready for laporan_jemaat')
    console.log('📋 Collection: laporan_jemaat')
    console.log('📝 Fields:')
    console.log('  - userId: string')
    console.log('  - userName: string') 
    console.log('  - userEmail: string')
    console.log('  - jenisLaporan: string')
    console.log('  - deskripsi: string')
    console.log('  - isAnonymous: boolean')
    console.log('  - isRead: boolean')
    console.log('  - status: string')
    console.log('  - readBy: string (optional)')
    console.log('  - readAt: timestamp (optional)')
    console.log('  - processedBy: string (optional)')
    console.log('  - processedAt: timestamp (optional)')
    console.log('  - createdAt: timestamp')
    console.log('  - updatedAt: timestamp')
    
    return true
  } catch (error) {
    console.error('❌ Error setting up Firestore structure:', error)
    throw error
  }
}

/**
 * Firestore Security Rules untuk laporan jemaat:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Laporan Jemaat Rules
 *     match /laporan_jemaat/{documentId} {
 *       // User can create laporan
 *       allow create: if request.auth != null && 
 *                     request.auth.uid == resource.data.userId;
 *       
 *       // User can read their own laporan
 *       allow read: if request.auth != null && 
 *                   (request.auth.uid == resource.data.userId || 
 *                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
 *       
 *       // Only admin can update/delete laporan
 *       allow update, delete: if request.auth != null && 
 *                             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
 *     }
 *   }
 * }
 */

// Untuk testing - buat beberapa sample data
export const createSampleLaporanData = async () => {
  try {
    console.log('Creating sample laporan data...')
    
    const sampleData = [
      {
        userId: 'sample-user-1',
        userName: 'Maria Sari',
        userEmail: 'maria@example.com',
        jenisLaporan: 'keluhan',
        deskripsi: 'Volume musik terlalu keras saat ibadah, mohon dapat disesuaikan.',
        isAnonymous: false,
        isRead: false,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        userId: 'sample-user-2',
        userName: 'Anonim',
        userEmail: 'anonymous@example.com',
        jenisLaporan: 'saran',
        deskripsi: 'Bagaimana kalau diadakan kelas katekisasi untuk remaja?',
        isAnonymous: true,
        isRead: true,
        status: 'in_progress',
        readBy: 'admin-1',
        readAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        userId: 'sample-user-3',
        userName: 'Budi Santoso',
        userEmail: 'budi@example.com',
        jenisLaporan: 'pujian',
        deskripsi: 'Terima kasih untuk khotbah yang menginspirasi minggu lalu.',
        isAnonymous: false,
        isRead: false,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ]
    
    for (const data of sampleData) {
      await addDoc(collection(db, 'laporan_jemaat'), data)
    }
    
    console.log('✅ Sample laporan data created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
    throw error
  }
}

// Uncomment dan jalankan script ini jika ingin membuat sample data
// setupLaporanJemaatStructure()
// createSampleLaporanData()

export default {
  setupLaporanJemaatStructure,
  createSampleLaporanData
}
