// src/components/CreateFirestoreUsersOnly.js
import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const CreateFirestoreUsersOnly = () => {
  const [status, setStatus] = useState('');

  const createFirestoreUsers = async () => {
    setStatus('Creating users in Firestore only...');
    
    const users = [
      { 
        uid: 'manual-admin-001',
        email: 'admin@gmail.com', 
        name: 'Administrator', 
        role: 'admin',
        createdAt: new Date()
      },
      { 
        uid: 'manual-ram-001',
        email: 'ram@gmail.com', 
        name: 'Ram', 
        role: 'waiter',
        createdAt: new Date()
      },
      { 
        uid: 'manual-dinesh-001',
        email: 'dinesh@gmail.com', 
        name: 'Dinesh', 
        role: 'waiter',
        createdAt: new Date()
      },
      { 
        uid: 'manual-sanjay-001', 
        email: 'sanjay@gmail.com', 
        name: 'Sanjay', 
        role: 'waiter',
        createdAt: new Date()
      }
    ];

    let createdCount = 0;

    try {
      // Clear existing users first
      const existingUsers = await getDocs(collection(db, 'users'));
      const deletePromises = existingUsers.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      setStatus('Cleared existing users...');

      for (const user of users) {
        await addDoc(collection(db, 'users'), user);
        createdCount++;
        setStatus(`Created ${user.email}...`);
      }

      setStatus(`✅ Successfully created ${createdCount} users in Firestore!`);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create Firestore Users Only</h2>
      <p><strong>Note:</strong> This creates users only in Firestore, not in Authentication.</p>
      <button onClick={createFirestoreUsers}>Create Firestore Users</button>
      {status && <pre style={{ marginTop: '20px' }}>{status}</pre>}
    </div>
  );
};

export default CreateFirestoreUsersOnly;