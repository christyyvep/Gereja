// Test news creator - run di browser console
// Pastikan sudah login sebagai admin

async function createTestNewsWithDifferentThumbnails() {
  // Import Firebase modules (assuming mereka sudah available di window)
  const { addDoc, collection } = window.firebase?.firestore || {};
  const db = window.db || window.firebase?.firestore?.();
  
  if (!addDoc || !collection || !db) {
    console.error('❌ Firebase not available. Make sure you are on the app page.');
    return;
  }
  
  try {
    console.log('🔄 Creating test news with different thumbnails...');
    
    const testNews = {
      title: "🧪 Test Thumbnail Berbeda " + new Date().getTime(),
      summary: "Test berita untuk memastikan thumbnail mobile dan desktop berbeda. Mobile harus menampilkan kucing (80x80), Desktop harus menampilkan gunung (1200x675).",
      content: "Konten test berita ini dibuat untuk menguji apakah thumbnail mobile (80x80) dan desktop (1200x675) menampilkan gambar yang berbeda. Jika berhasil, Anda akan melihat gambar kucing di mobile dan gambar gunung di desktop.",
      category: "test",
      
      // ⭐ PENTING: Thumbnail dengan URL yang BERBEDA untuk setiap ukuran
      thumbnails: {
        'card-mobile': 'https://res.cloudinary.com/demo/image/upload/w_80,h_80,c_fill,f_auto,q_auto/sample',
        'card-desktop': 'https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,f_auto,q_auto/mountain',
        'detail-mobile': 'https://res.cloudinary.com/demo/image/upload/w_1200,h_675,c_fill,f_auto,q_auto/food',
        'detail-desktop': 'https://res.cloudinary.com/demo/image/upload/w_1435,h_498,c_fill,f_auto,q_auto/dog'
      },
      
      // Legacy field untuk backward compatibility
      thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill,f_auto,q_auto/sample',
      
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
    console.log('📊 Thumbnails yang dibuat:');
    console.log('- card-mobile (kucing):', testNews.thumbnails['card-mobile']);
    console.log('- card-desktop (gunung):', testNews.thumbnails['card-desktop']);
    
    console.log('\n🔄 Refresh halaman news untuk melihat hasilnya!');
    
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error creating test news:', error);
    throw error;
  }
}

console.log('📝 To create test news, copy and run this in browser console:');
console.log('createTestNewsWithDifferentThumbnails()');

// Make function available globally
if (typeof window !== 'undefined') {
  window.createTestNewsWithDifferentThumbnails = createTestNewsWithDifferentThumbnails;
}
