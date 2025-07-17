// create-test-news-with-different-thumbnails.js
// Script untuk membuat test news dengan thumbnail berbeda untuk mobile dan desktop

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  // Gunakan config yang sama dengan aplikasi
  apiKey: "AIzaSyCiIlHxWCPNY52b_2_Qzwb3OUk2_QsLc_Y",
  authDomain: "rajawali-church-app.firebaseapp.com", 
  projectId: "rajawali-church-app",
  storageBucket: "rajawali-church-app.appspot.com",
  messagingSenderId: "820867623340",
  appId: "1:820867623340:web:a0e1e2f3g4h5i6j7k8l9m0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestNewsWithDifferentThumbnails() {
  try {
    console.log('🔄 Creating test news with different thumbnails...');
    
    const testNews = {
      title: "Test Berita - Thumbnail Berbeda",
      summary: "Ini adalah test berita untuk memastikan thumbnail mobile dan desktop berbeda",
      content: "Konten test berita ini dibuat untuk menguji apakah thumbnail mobile (80x80) dan desktop (1200x675) menampilkan gambar yang berbeda.",
      category: "test",
      
      // ⭐ SIMPLE: Pakai thumbnail yang sama, nanti di-resize otomatis
      thumbnails: {
        'cardDesktop': 'samples/cloudinary-icon',
        'cardMobile': 'samples/cloudinary-icon'
      },
      
      // Legacy field untuk backward compatibility
      thumbnail: 'samples/cloudinary-icon',
      
      // Metadata
      publishDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      author: 'Test Admin',
      source: 'Debug Script',
      priority: 1,
      isEvent: false,
      showInAnnouncement: false,
      tags: ['test', 'debug', 'thumbnail'],
      attachLinks: [
        {
          url: 'https://cloudinary.com',
          description: 'Cloudinary - Image Management'
        },
        'https://example.com'
      ],
      views: 0
    };
    
    const docRef = await addDoc(collection(db, 'news'), testNews);
    
    console.log('✅ Test news created with ID:', docRef.id);
    console.log('📊 Thumbnail yang akan di-resize otomatis:');
    console.log('- Mobile (80x80): samples/cloudinary-icon -> akan jadi 80x80');
    console.log('- Desktop (1200x675): samples/cloudinary-icon -> akan jadi 1200x675');
    
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error creating test news:', error);
    throw error;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createTestNewsWithDifferentThumbnails };
} else {
  // Browser environment
  window.createTestNewsWithDifferentThumbnails = createTestNewsWithDifferentThumbnails;
}

console.log('📝 To create test news, run: createTestNewsWithDifferentThumbnails()');

// Auto-execute untuk testing
if (typeof module !== 'undefined' && module.exports) {
  createTestNewsWithDifferentThumbnails();
}
