import React, { useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const CheckUsers = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  const checkUsers = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Get users from Firestore
      const usersSnapshot = await getDocs(collection(db, 'users'));
      addResult(`Found ${usersSnapshot.size} users in Firestore`, 'info');

      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Test passwords for each user
      for (const user of users) {
        addResult(`Testing ${user.email}...`, 'info');
        
        const passwords = [
          '123456', 'password', '12345678', '123456789',
          'ram1234', 'dinesh123', 'sanjay123', 'admin123'
        ];

        let foundPassword = null;

        for (const password of passwords) {
          try {
            await signInWithEmailAndPassword(auth, user.email, password);
            foundPassword = password;
            addResult(`✅ SUCCESS: ${user.email} / ${password}`, 'success');
            await auth.signOut();
            break;
          } catch (error) {
            // Continue to next password
          }
        }

        if (!foundPassword) {
          addResult(`❌ No working password for ${user.email}`, 'error');
        }
      }

    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Check User Passwords</h2>
      <button onClick={checkUsers} disabled={loading}>
        {loading ? 'Checking...' : 'Check All Users'}
      </button>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        marginTop: '20px',
        borderRadius: '5px',
        maxHeight: '400px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        {results.map((result, index) => (
          <div key={index} style={{ 
            color: result.type === 'error' ? '#dc3545' : 
                   result.type === 'success' ? '#28a745' : '#6c757d',
            marginBottom: '5px'
          }}>
            [{result.time}] {result.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckUsers;