// src/components/DatabaseInitializer.js
import React from 'react';
import { initializeDatabase } from './InitializeDB';

const DatabaseInitializer = () => {
  const handleInitialize = async () => {
    try {
      console.log('Initializing database...');
      const success = await initializeDatabase();
      if (success) {
        alert('Database initialized successfully! Refresh the page.');
      } else {
        alert('Error initializing database. Check console.');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd'
    }}>
      <button 
        onClick={handleInitialize}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Initialize Database
      </button>
      <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
        Click this button to populate the database with categories and menu items.
        Remove this component after initialization.
      </p>
    </div>
  );
};

export default DatabaseInitializer;