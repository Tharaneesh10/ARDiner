import React, { useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const FixFirestoreUsers = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fixFirestoreUsers = async () => {
    setLoading(true);
    setStatus('Starting to fix Firestore users...');

    const waiters = [
      { email: 'ram@gmail.com', password: 'ram1234', name: 'Ram', role: 'waiter' },
      { email: 'dinesh@gmail.com', password: 'dinesh123', name: 'Dinesh', role: 'waiter' },
      { email: 'sanjay@gmail.com', password: 'sanjay123', name: 'Sanjay', role: 'waiter' },
      { email: 'admin@gmail.com', password: 'admin123', name: 'Administrator', role: 'admin' }
    ];

    let fixedCount = 0;

    for (const user of waiters) {
      try {
        setStatus(`Processing ${user.email}...`);

        // First, try to sign in to get the UID
        let userUID = null;
        try {
          const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
          userUID = userCredential.user.uid;
          await auth.signOut(); // Sign out immediately
          setStatus(`✅ Got UID for ${user.email}: ${userUID}`);
        } catch (authError) {
          setStatus(`❌ Could not get UID for ${user.email}: ${authError.message}`);
          continue; // Skip this user if we can't get UID
        }

        // Check if user already exists in Firestore
        const usersQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const snapshot = await getDocs(usersQuery);
        
        if (snapshot.empty) {
          // User doesn't exist in Firestore, create it
          setStatus(`Creating Firestore record for ${user.email}...`);
          
          await addDoc(collection(db, 'users'), {
            uid: userUID,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: new Date()
          });
          
          fixedCount++;
          setStatus(`✅ Created Firestore record for ${user.email}`);
        } else {
          setStatus(`ℹ️ ${user.email} already exists in Firestore`);
        }

      } catch (error) {
        setStatus(`❌ Error with ${user.email}: ${error.message}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setStatus(`🎉 Fixed ${fixedCount} user records in Firestore`);
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Fix Firestore Users Collection</h2>
      <p><strong>Problem:</strong> Users exist in Authentication but not in Firestore.</p>
      <p>This will create Firestore records for all waiter and admin users.</p>
      
      <button 
        onClick={fixFirestoreUsers}
        disabled={loading}
        style={{
          padding: '15px 30px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          marginBottom: '20px',
          width: '100%'
        }}
      >
        {loading ? 'Fixing Users...' : 'Fix Firestore Users'}
      </button>
      
      {status && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #dee2e6',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '14px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default FixFirestoreUsers;