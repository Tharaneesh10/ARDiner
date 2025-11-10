import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const VerifyCollections = () => {
  const [collections, setCollections] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyCollections();
  }, []);

  const verifyCollections = async () => {
    setLoading(true);
    const collectionsData = {};

    try {
      // Check all collections
      const collectionNames = ['users', 'menuItems', 'categories', 'tables', 'cart', 'orders'];
      
      for (const collName of collectionNames) {
        try {
          const snapshot = await getDocs(collection(db, collName));
          collectionsData[collName] = {
            count: snapshot.size,
            documents: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          };
        } catch (error) {
          collectionsData[collName] = {
            count: 0,
            error: error.message
          };
        }
      }

      setCollections(collectionsData);
      
      // Get users specifically
      if (collectionsData.users && collectionsData.users.documents) {
        setUsers(collectionsData.users.documents);
      }

    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testWaiterLogin = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      alert(`✅ Login successful for ${email}`);
      await auth.signOut();
    } catch (error) {
      alert(`❌ Login failed for ${email}: ${error.message}`);
    }
  };

  // Helper function to get passwords for testing
  const getPasswordForUser = (email) => {
    const passwords = {
      'ram@gmail.com': 'ram1234',
      'dinesh@gmail.com': 'dinesh123',
      'sanjay@gmail.com': 'sanjay123',
      'admin@gmail.com': 'admin123'
    };
    return passwords[email] || 'unknown';
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading collections...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Firebase Collections Verification</h2>
      
      <button 
        onClick={verifyCollections}
        style={{
          padding: '10px 20px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Refresh Verification
      </button>

      {/* Collections Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        {Object.entries(collections).map(([name, data]) => (
          <div 
            key={name}
            style={{
              background: data.count > 0 ? '#d4edda' : '#f8d7da',
              padding: '15px',
              borderRadius: '8px',
              border: `2px solid ${data.count > 0 ? '#c3e6cb' : '#f5c6cb'}`
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>{name}</h3>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              {data.count} {data.count === 1 ? 'document' : 'documents'}
            </p>
            {data.error && <p style={{ margin: '5px 0 0 0', color: '#721c24', fontSize: '0.8rem' }}>Error: {data.error}</p>}
          </div>
        ))}
      </div>

      {/* Users Details */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Users Collection Details</h3>
        {users.length === 0 ? (
          <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
            ❌ No users found in the database
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {users.map(user => (
              <div 
                key={user.id}
                style={{
                  background: '#e7f3ff',
                  padding: '15px',
                  borderRadius: '5px',
                  border: '1px solid #b3d9ff'
                }}
              >
                <strong>Email:</strong> {user.email} <br />
                <strong>Name:</strong> {user.name} <br />
                <strong>Role:</strong> {user.role} <br />
                <strong>UID:</strong> {user.uid} <br />
                <button 
                  onClick={() => testWaiterLogin(user.email, getPasswordForUser(user.email))}
                  style={{
                    padding: '5px 10px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Test Login
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collection Details */}
      <div>
        <h3>All Collections Details</h3>
        {Object.entries(collections).map(([name, data]) => (
          <div key={name} style={{ marginBottom: '20px' }}>
            <h4 style={{ textTransform: 'capitalize' }}>{name} ({data.count})</h4>
            {data.documents && data.documents.length > 0 ? (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '5px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <pre style={{ margin: 0, fontSize: '12px' }}>
                  {JSON.stringify(data.documents, null, 2)}
                </pre>
              </div>
            ) : (
              <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
                No documents or error: {data.error || 'Collection exists but empty'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifyCollections;