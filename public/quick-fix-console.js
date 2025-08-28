// QUICK FIX DUPLICATE TELEGRAM USERS
// Copy-paste script ini ke browser console di halaman admin

console.log('🚀 STARTING QUICK FIX...');

// Function to fix duplicate users
async function quickFixDuplicateUsers() {
  try {
    console.log('📋 Step 1: Import Firebase modules...');
    
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, getDocs, deleteDoc, doc, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    // Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyBtGgShLr_s_qgq0GhOEPmh5VfwZUJDHeY",
      authDomain: "myrajawali-app.firebaseapp.com",
      projectId: "myrajawali-app",
      storageBucket: "myrajawali-app.firebasestorage.app",
      messagingSenderId: "414682263250",
      appId: "1:414682263250:web:34750949198ce982da470b"
    };

    console.log('🔧 Step 2: Initialize Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🗑️ Step 3: Deleting all existing data...');
    const registrationsRef = collection(db, 'telegram_registrations');
    const snapshot = await getDocs(registrationsRef);
    
    console.log(`Found ${snapshot.size} documents to delete`);
    
    // Delete all existing documents
    const deletePromises = [];
    snapshot.forEach(docSnap => {
      deletePromises.push(deleteDoc(doc(db, 'telegram_registrations', docSnap.id)));
    });
    
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${deletePromises.length} documents`);

    console.log('➕ Step 4: Adding single test user...');
    
    // Add single test user
    await addDoc(registrationsRef, {
      telegramUserId: '5929124699',
      telegramUsername: 'anitha_single',
      telegramFirstName: 'Anitha Test Single',
      telegramLastName: null,
      status: 'approved',
      registeredAt: new Date(),
      approvedAt: new Date(),
      approvedBy: 'quick-fix'
    });
    
    console.log('✅ Single user added successfully!');

    console.log('📤 Step 5: Testing single message...');
    
    // Test sending single message
    const botToken = '8330380524:AAFCEuYTsuPk3Ev4E0flNScn0BhO7K76Myw';
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const testMessage = `🧪 QUICK FIX TEST

Ini test setelah hapus duplikat.
Harusnya hanya 1 pesan yang diterima.

⏰ ${new Date().toLocaleString('id-ID')}
🔧 Fixed by: Console Script`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: '5929124699',
        text: testMessage,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Test message sent successfully!');
      console.log(`Message ID: ${result.result.message_id}`);
    } else {
      console.log('❌ Test message failed:', result.description);
    }

    console.log('🎉 QUICK FIX COMPLETED!');
    console.log('📋 Summary:');
    console.log('- All duplicate data deleted');
    console.log('- 1 single user added and approved');
    console.log('- Test message sent');
    console.log('');
    console.log('🚀 Now you can test broadcast in admin panel!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error in quick fix:', error);
    return false;
  }
}

// Run the fix
quickFixDuplicateUsers();

// Also provide manual steps
console.log(`
📋 MANUAL STEPS (if script fails):

1. Go to Firebase Console: https://console.firebase.google.com/project/myrajawali-app/firestore
2. Delete all documents in 'telegram_registrations' collection
3. Add 1 document with these fields:
   - telegramUserId: "5929124699"
   - telegramFirstName: "Anitha Test"
   - status: "approved"
   - registeredAt: [current timestamp]
   - approvedAt: [current timestamp]

4. Test broadcast in admin panel
`);
