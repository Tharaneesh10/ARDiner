import React, { useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const DebugUsers = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const debugUsers = async () => {
    setLoading(true);
    setLogs([]);

    const users = [
      { email: 'ram@gmail.com', password: 'ram1234', name: 'Ram', role: 'waiter' },
      { email: 'dinesh@gmail.com', password: 'dinesh123', name: 'Dinesh', role: 'waiter' },
      { email: 'sanjay@gmail.com', password: 'sanjay123', name: 'Sanjay', role: 'waiter' },
      { email: 'admin@gmail.com', password: 'admin123', name: 'Administrator', role: 'admin' }
    ];

    try {
      // Step 1: Check Firestore connection
      addLog('🔧 Step 1: Testing Firestore connection...', 'info');
      try {
        const testDoc = await addDoc(collection(db, 'test_connection'), { test: true });
        await getDocs(collection(db, 'test_connection'));
        addLog('✅ Firestore connection working', 'success');
        // Clean up
        // await deleteDoc(testDoc);
      } catch (error) {
        addLog(`❌ Firestore error: ${error.message}`, 'error');
        return;
      }

      // Step 2: Check if users collection exists and has data
      addLog('📊 Step 2: Checking users collection...', 'info');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      addLog(`Users collection has ${usersSnapshot.size} documents`, 'info');
      
      if (usersSnapshot.size > 0) {
        usersSnapshot.forEach(doc => {
          addLog(`📄 User document: ${doc.id} - ${JSON.stringify(doc.data())}`, 'info');
        });
      }

      // Step 3: Check each user individually
      addLog('👤 Step 3: Checking individual users...', 'info');
      
      for (const user of users) {
        addLog(`--- Checking ${user.email} ---`, 'info');
        
        // Check Authentication
        try {
          addLog(`Checking Authentication for ${user.email}...`, 'info');
          const userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
          const uid = userCredential.user.uid;
          addLog(`✅ Auth: User exists with UID: ${uid}`, 'success');
          await auth.signOut();
          
          // Check Firestore
          const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
          const firestoreSnapshot = await getDocs(userQuery);
          
          if (firestoreSnapshot.empty) {
            addLog(`❌ Firestore: No record found for ${user.email}`, 'error');
            
            // Try to create the Firestore record
            addLog(`Attempting to create Firestore record...`, 'info');
            try {
              await setDoc(doc(db, 'users', uid), {
                uid: uid,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: new Date()
              });
              addLog(`✅ SUCCESS: Created Firestore record for ${user.email}`, 'success');
            } catch (createError) {
              addLog(`❌ FAILED to create Firestore record: ${createError.message}`, 'error');
            }
          } else {
            addLog(`✅ Firestore: Record exists for ${user.email}`, 'success');
            firestoreSnapshot.forEach(doc => {
              addLog(`   Document data: ${JSON.stringify(doc.data())}`, 'info');
            });
          }
          
        } catch (authError) {
          addLog(`❌ Auth: ${user.email} - ${authError.message}`, 'error');
          
          // If auth user doesn't exist, create it
          if (authError.code === 'auth/user-not-found') {
            addLog(`Creating new auth user for ${user.email}...`, 'info');
            try {
              const newUser = await createUserWithEmailAndPassword(auth, user.email, user.password);
              addLog(`✅ Created new auth user: ${newUser.user.uid}`, 'success');
              
              // Create Firestore record
              await setDoc(doc(db, 'users', newUser.user.uid), {
                uid: newUser.user.uid,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: new Date()
              });
              addLog(`✅ Created Firestore record for new user`, 'success');
              
              await auth.signOut();
            } catch (createError) {
              addLog(`❌ Failed to create user: ${createError.message}`, 'error');
            }
          }
        }
        
        addLog('', 'info'); // Empty line for spacing
      }

      addLog('🎉 Debug completed!', 'success');

    } catch (error) {
      addLog(`💥 Debug failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const forceCreateUsers = async () => {
    setLoading(true);
    setLogs([]);
    
    const users = [
      { email: 'ram@gmail.com', password: 'ram1234', name: 'Ram', role: 'waiter' },
      { email: 'dinesh@gmail.com', password: 'dinesh123', name: 'Dinesh', role: 'waiter' },
      { email: 'sanjay@gmail.com', password: 'sanjay123', name: 'Sanjay', role: 'waiter' },
      { email: 'admin@gmail.com', password: 'admin123', name: 'Administrator', role: 'admin' }
    ];

    let createdCount = 0;

    for (const user of users) {
      addLog(`🔄 Force creating ${user.email}...`, 'info');
      
      try {
        // Create auth user (will fail if exists, that's okay)
        let uid;
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
          uid = userCredential.user.uid;
          addLog(`✅ Auth user created: ${uid}`, 'success');
        } catch (authError) {
          if (authError.code === 'auth/email-already-in-use') {
            // Sign in to get UID
            const existingUser = await signInWithEmailAndPassword(auth, user.email, user.password);
            uid = existingUser.user.uid;
            await auth.signOut();
            addLog(`✅ Auth user exists: ${uid}`, 'info');
          } else {
            throw authError;
          }
        }

        // Force create Firestore document using UID as document ID
        await setDoc(doc(db, 'users', uid), {
          uid: uid,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: new Date(),
          forceCreated: true // Marker to identify forced creations
        });

        addLog(`✅ Firestore record created for ${user.email}`, 'success');
        createdCount++;

      } catch (error) {
        addLog(`❌ Failed to create ${user.email}: ${error.message}`, 'error');
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    addLog(`🎉 Force created ${createdCount} users`, 'success');
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Users Debug Tool</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={debugUsers}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Debug Users
        </button>
        
        <button 
          onClick={forceCreateUsers}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Force Create All Users
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '5px', 
        padding: '15px',
        maxHeight: '500px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        {logs.map((log, index) => (
          <div 
            key={index}
            style={{
              padding: '5px 0',
              borderBottom: '1px solid #eee',
              color: log.type === 'error' ? '#dc3545' : 
                     log.type === 'success' ? '#28a745' : '#6c757d'
            }}
          >
            [{log.time}] {log.message}
          </div>
        ))}
        
        {logs.length === 0 && (
          <div style={{ color: '#6c757d', textAlign: 'center', padding: '20px' }}>
            No logs yet. Click a button to start.
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#667eea' }}>
          Working... Please wait.
        </div>
      )}
    </div>
  );
};

export default DebugUsers;