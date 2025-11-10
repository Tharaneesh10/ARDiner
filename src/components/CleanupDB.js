import React from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

const CleanupDB = () => {
  const handleCleanup = async () => {
    try {
      console.log('🧹 Cleaning duplicate menu items...');
      
      const menuItemsSnapshot = await getDocs(collection(db, 'menuItems'));
      const itemsMap = new Map();
      let duplicatesRemoved = 0;
      
      // Identify and remove duplicates
      for (const doc of menuItemsSnapshot.docs) {
        const data = doc.data();
        const key = `${data.name}-${data.categoryId}`;
        
        if (!itemsMap.has(key)) {
          itemsMap.set(key, doc);
        } else {
          // Delete duplicate
          await deleteDoc(doc.ref);
          duplicatesRemoved++;
          console.log(`🗑️ Deleted duplicate: ${data.name}`);
        }
      }
      
      alert(`Database cleaned! Removed ${duplicatesRemoved} duplicate items.`);
      console.log(`✅ Removed ${duplicatesRemoved} duplicate menu items`);
      
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('Error cleaning database: ' + error.message);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#fff3cd',
      borderBottom: '2px solid #ffc107'
    }}>
      <button onClick={handleCleanup} style={{
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px'
      }}>
        🧹 Clean Duplicate Items
      </button>
      <p style={{ marginTop: '10px', color: '#856404', fontSize: '14px' }}>
        Use this to remove duplicate menu items from the database
      </p>
    </div>
  );
};

export default CleanupDB;