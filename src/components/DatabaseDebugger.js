import React from 'react';
import { debugDatabase, initializeDatabaseWithDebug } from '../utils/DatabaseDebug';

const DatabaseDebugger = () => {
  const handleDebug = async () => {
    console.clear();
    await debugDatabase();
  };

  const handleInitialize = async () => {
    console.clear();
    const success = await initializeDatabaseWithDebug();
    if (success) {
      alert('Database initialized successfully! Check console for details.');
    } else {
      alert('Database initialization failed! Check console for errors.');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f0f8ff',
      borderBottom: '2px solid #007acc'
    }}>
      <h3 style={{ color: '#007acc', marginBottom: '15px' }}>Database Debugger</h3>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={handleDebug}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Debug Database
        </button>
        
        <button 
          onClick={handleInitialize}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Initialize Database
        </button>
      </div>
      
      <p style={{ marginTop: '15px', color: '#666', fontSize: '12px' }}>
        Open Browser Console (F12) to see detailed logs
      </p>
    </div>
  );
};

export default DatabaseDebugger;