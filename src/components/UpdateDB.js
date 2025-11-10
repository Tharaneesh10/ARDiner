// src/components/UpdateDB.js
import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const UpdateDB = () => {
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState('');

  const updateDatabase = async () => {
    setUpdating(true);
    setResult('Starting database update...\n');
    
    try {
      // Map of menu items to their 3D model files
      const modelMap = {
        'Veg Pizza': '/models/pizza.glb',
        'Veg Burger': '/models/burgur.glb',
        'Veg Momos': '/models/momos.glb',
        'Veg Noodles': '/models/noodles.glb',
        'French Fries': '/models/fries1.glb',
        'Chicken Sandwich': '/models/sandwich.glb',
        'Chicken Pizza': '/models/pizza.glb',
        'Chicken Burger': '/models/burgur.glb',
        'Chicken Noodles': '/models/noodles.glb',
        'Chocolate Cake': '/models/cake.glb',
        'Vanilla Ice Cream': '/models/ice.glb',
        'Chocolate Milkshake': '/models/milkshake.glb',
        'Hot Coffee': '/models/coffee.glb'
      };

      // Get all menu items
      const menuItemsSnapshot = await getDocs(collection(db, 'menuItems'));
      let updatedCount = 0;
      let logMessages = [];

      logMessages.push(`Found ${menuItemsSnapshot.size} menu items in database\n`);

      // Update each menu item
      for (const docSnapshot of menuItemsSnapshot.docs) {
        const item = docSnapshot.data();
        const modelPath = modelMap[item.name];
        
        if (modelPath) {
          await updateDoc(doc(db, 'menuItems', docSnapshot.id), {
            model3D: modelPath
          });
          updatedCount++;
          const message = `✅ Updated: ${item.name} → ${modelPath}`;
          logMessages.push(message);
          setResult(logMessages.join('\n'));
          console.log(message);
        } else {
          const message = `⚠️ No model mapping for: ${item.name}`;
          logMessages.push(message);
          setResult(logMessages.join('\n'));
        }
      }

      const finalMessage = `\n🎉 SUCCESS: Updated ${updatedCount} menu items with 3D models!`;
      logMessages.push(finalMessage);
      setResult(logMessages.join('\n'));
      
    } catch (error) {
      console.error('Error updating database:', error);
      setResult(`❌ ERROR: ${error.message}\n\nCheck the browser console for details.`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '50px auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          Update Database with 3D Models
        </h2>
        
        <p style={{ color: '#666', marginBottom: '20px' }}>
          This will add 3D model paths to all menu items in your Firestore database.
        </p>

        <button 
          onClick={updateDatabase}
          disabled={updating}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: updating ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: updating ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
            fontWeight: 'bold',
            width: '200px'
          }}
        >
          {updating ? '🔄 Updating...' : '🚀 Update Database'}
        </button>
        
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          border: '1px solid #e9ecef',
          fontFamily: 'monospace, Consolas, "Courier New"',
          whiteSpace: 'pre-wrap',
          minHeight: '300px',
          maxHeight: '500px',
          overflow: 'auto',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {result || 'Click "Update Database" to start...'}
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>What this does:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
            <li>Adds <code>model3D</code> field to each menu item</li>
            <li>Maps food names to corresponding GLB files in <code>/models/</code> folder</li>
            <li>Enables AR View buttons in your CategoryPage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UpdateDB;