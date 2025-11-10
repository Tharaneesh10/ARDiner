import React from 'react';
import { initializeWaiters } from '../utils/waiterService';

const InitializeWaiters = () => {
  const handleInitialize = async () => {
    try {
      await initializeWaiters();
      alert('✅ Waiters initialized successfully! Check Firebase console.');
    } catch (error) {
      console.error('❌ Error initializing waiters:', error);
      alert('❌ Failed to initialize waiters. Check console for details.');
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{
        background: 'white',
        color: '#333',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h2>Initialize Waiters</h2>
        <p style={{ margin: '20px 0', color: '#666' }}>
          This will create waiter accounts for <strong>Ram, Sanjay, and Arun</strong> in Firestore.
        </p>
        
        <button 
          onClick={handleInitialize}
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Create Waiter Accounts
        </button>

        <div style={{ marginTop: '30px', textAlign: 'left', background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h4>Waiters to be created:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
              <strong>Ram</strong> - ram@restaurant.com (Password: ram123)
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
              <strong>Sanjay</strong> - sanjay@restaurant.com (Password: sanjay123)
            </li>
            <li style={{ padding: '8px 0' }}>
              <strong>Arun</strong> - arun@restaurant.com (Password: arun123)
            </li>
          </ul>
        </div>

        <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
          Note: After creating waiters, you need to manually create these accounts in Firebase Authentication.
        </p>
      </div>
    </div>
  );
};

export default InitializeWaiters;