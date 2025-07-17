// Quick test - add news with simple thumbnail
// Jalankan di browser console

const testNews = {
  title: "Test Berita - Ada Thumbnail", 
  summary: "Test berita dengan thumbnail cloudinary",
  content: "Ini adalah test berita untuk memastikan thumbnail muncul.",
  category: "test",
  thumbnail: "samples/cloudinary-icon",
  publishDate: new Date(),
  createdAt: new Date(),
  author: "Test Admin",
  isPublished: true
};

// Manual add ke Firestore via console browser
console.log("Data untuk ditambahkan:", testNews);
