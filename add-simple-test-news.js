// Simple script untuk tambah test news dengan thumbnail yang pasti ada

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCiIlHxWCPNY52b_2_Qzwb3OUk2_QsLc_Y",
  authDomain: "rajawali-church-app.firebaseapp.com", 
  projectId: "rajawali-church-app",
  storageBucket: "rajawali-church-app.appspot.com",
  messagingSenderId: "820867623340",
  appId: "1:820867623340:web:a0e1e2f3g4h5i6j7k8l9m0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSimpleTestNews() {
  try {
    console.log('🔄 Adding simple test news...');
    
    const testNews = {
      title: "Test Berita Simple",
      summary: "Ini test berita dengan thumbnail yang pasti ada",
      content: "Konten test untuk memastikan thumbnail muncul dengan benar di mobile (80x80) dan desktop (1200x675).",
      category: "test",
      
      // ⭐ SIMPLE: Pakai Cloudinary sample yang pasti ada
      thumbnail: "samples/cloudinary-icon",
      
      // Metadata sederhana
      publishDate: new Date(),
      createdAt: new Date(),
      author: 'Test Admin',
      isPublished: true,
      views: 0
    };
    
    const docRef = await addDoc(collection(db, 'news'), testNews);
    console.log('✅ Test news added with ID:', docRef.id);
    
  } catch (error) {
    console.error('❌ Error adding test news:', error);
  }
}

// Jalankan
addSimpleTestNews();
