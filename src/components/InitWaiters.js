import React, { useState } from 'react';
import { initializeDatabase } from './InitializeDB';

const InitWaiters = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInitialize = async () => {
    setLoading(true);
    setMessage('Initializing... Check browser console for details.');
    
    try {
      const success = await initializeDatabase();
      if (success) {
        setMessage('✅ Database initialized successfully! Waiters should now be created.');
      } else {
        setMessage('❌ Database initialization failed. Check console for errors.');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Initialize Waiter Accounts</h2>
      <p>This will create waiter users in Firebase Authentication and Firestore.</p>
      
      <button 
        onClick={handleInitialize} 
        disabled={loading}
        style={{
          padding: '15px 30px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Initializing...' : 'Initialize Database'}
      </button>
      
      {message && (
        <div style={{
          padding: '15px',
          background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          color: message.includes('✅') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4>What this does:</h4>
        <ul>
          <li>Creates waiter accounts in Firebase Authentication</li>
          <li>Creates user records in Firestore with waiter role</li>
          <li>Creates sample orders for testing</li>
          <li>Sets up categories and menu items</li>
        </ul>
        
        <h4>Waiter Credentials:</h4>
        <ul>
          <li><strong>ram@gmail.com</strong> / 123456</li>
          <li><strong>dinesh@gmail.com</strong> / 123456</li>
          <li><strong>sanjay@gmail.com</strong> / 123456</li>
        </ul>
      </div>
    </div>
  );
};

export default InitWaiters;