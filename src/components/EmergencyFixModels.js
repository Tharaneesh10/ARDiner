// src/components/EmergencyFixModels.js
import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const EmergencyFixModels = () => {
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState('');

  const fixAllModelPaths = async () => {
    setFixing(true);
    setResult('🚨 EMERGENCY FIX: Updating all model paths...\n\n');
    
    try {
      const menuItemsSnapshot = await getDocs(collection(db, 'menuItems'));
      let fixedCount = 0;
      let logMessages = [];

      for (const docSnapshot of menuItemsSnapshot.docs) {
        const item = docSnapshot.data();
        const currentModel = item.model3D;
        
        if (currentModel && currentModel.includes('.gib')) {
          // Fix the file extension
          const correctedModel = currentModel.replace('.gib', '.glb');
          
          await updateDoc(doc(db, 'menuItems', docSnapshot.id), {
            model3D: correctedModel
          });
          
          fixedCount++;
          const message = `✅ FIXED: ${item.name}\n   FROM: ${currentModel}\n   TO:   ${correctedModel}`;
          logMessages.push(message);
          setResult(logMessages.join('\n\n'));
        }
      }

      if (fixedCount === 0) {
        logMessages.push('✅ All model paths are already correct!');
      } else {
        logMessages.push(`\n🎉 SUCCESS: Fixed ${fixedCount} model paths!`);
      }
      
      setResult(logMessages.join('\n\n'));
      
    } catch (error) {
      console.error('Error fixing models:', error);
      setResult(`❌ ERROR: ${error.message}`);
    } finally {
      setFixing(false);
    }
  };

  const checkCurrentPaths = async () => {
    setFixing(true);
    setResult('🔍 Checking current model paths...\n\n');
    
    try {
      const menuItemsSnapshot = await getDocs(collection(db, 'menuItems'));
      let logMessages = [];

      menuItemsSnapshot.docs.forEach(docSnapshot => {
        const item = docSnapshot.data();
        const message = `📦 ${item.name}\n   Model: ${item.model3D || 'MISSING'}\n   Status: ${item.model3D && item.model3D.includes('.gib') ? '❌ NEEDS FIX' : '✅ OK'}`;
        logMessages.push(message);
      });

      setResult(logMessages.join('\n\n'));
      
    } catch (error) {
      console.error('Error checking paths:', error);
      setResult(`❌ ERROR: ${error.message}`);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'monospace'
    }}>
      <h2 style={{ color: '#d63031' }}>🚨 EMERGENCY MODEL PATH FIX</h2>
      <p><strong>Problem:</strong> Database has .gib instead of .glb</p>
      
      <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <button 
          onClick={checkCurrentPaths}
          disabled={fixing}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0984e3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Check Current Paths
        </button>
        
        <button 
          onClick={fixAllModelPaths}
          disabled={fixing}
          style={{
            padding: '10px 20px',
            backgroundColor: '#d63031',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {fixing ? 'Fixing...' : 'FIX ALL PATHS'}
        </button>
      </div>
      
      <pre style={{ 
        background: '#2d3436', 
        color: '#dfe6e9',
        padding: '20px', 
        borderRadius: '5px',
        overflow: 'auto',
        minHeight: '400px',
        fontSize: '14px',
        lineHeight: '1.4'
      }}>
        {result || 'Click "Check Current Paths" to see what needs fixing...'}
      </pre>
    </div>
  );
};

export default EmergencyFixModels;