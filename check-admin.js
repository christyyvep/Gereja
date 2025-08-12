// Check if admin user exists and has correct role
// Run this in browser console after opening the app

import { db } from './src/services/firebase-security.js';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user...');
    
    const jemaatRef = collection(db, 'jemaat');
    const adminQuery = query(jemaatRef, where('role', '==', 'admin'));
    const adminDocs = await getDocs(adminQuery);
    
    if (adminDocs.empty) {
      console.log('❌ No admin user found!');
      console.log('Creating admin user...');
      
      // Check if there's a user with nama 'admin'
      const nameQuery = query(jemaatRef, where('nama', '==', 'admin'));
      const nameDocs = await getDocs(nameQuery);
      
      if (!nameDocs.empty) {
        console.log('👤 Found user with name "admin", updating role...');
        const doc = nameDocs.docs[0];
        await updateDoc(doc.ref, { role: 'admin' });
        console.log('✅ Updated admin role');
      } else {
        console.log('❌ No user found with name "admin"');
        console.log('Please create admin user manually or run create-admin.js');
      }
    } else {
      console.log('✅ Admin user(s) found:');
      adminDocs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. Name: ${data.nama}, Role: ${data.role}, Active: ${data.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  }
}

// Auto-run when imported
checkAdminUser();
