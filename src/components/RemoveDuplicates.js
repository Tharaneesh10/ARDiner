import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, writeBatch, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import './RemoveDuplicates.css';

const RemoveDuplicates = () => {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [stats, setStats] = useState({ totalItems: 0, duplicates: 0, uniqueItems: 0 });

  const scanForDuplicates = async () => {
    setScanning(true);
    try {
      const menuItemsRef = collection(db, 'menuItems');
      const menuItemsSnapshot = await getDocs(menuItemsRef);
      
      const allItems = menuItemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Find duplicates by name (case insensitive)
      const nameMap = {};
      const duplicateGroups = [];

      allItems.forEach(item => {
        const normalizedName = item.name.toLowerCase().trim();
        if (nameMap[normalizedName]) {
          nameMap[normalizedName].push(item);
        } else {
          nameMap[normalizedName] = [item];
        }
      });

      // Filter only duplicates (more than 1 item with same name)
      Object.keys(nameMap).forEach(name => {
        if (nameMap[name].length > 1) {
          duplicateGroups.push({
            name: name,
            items: nameMap[name],
            count: nameMap[name].length
          });
        }
      });

      setDuplicates(duplicateGroups);
      
      // Calculate stats
      const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + (group.count - 1), 0);
      const uniqueItems = allItems.length - totalDuplicates;

      setStats({
        totalItems: allItems.length,
        duplicates: totalDuplicates,
        uniqueItems: uniqueItems
      });

    } catch (error) {
      console.error('Error scanning for duplicates:', error);
      alert('Error scanning for duplicates: ' + error.message);
    } finally {
      setScanning(false);
    }
  };

  const removeAllDuplicates = async () => {
    if (!duplicates.length) return;
    
    if (!window.confirm(`Are you sure you want to remove ${stats.duplicates} duplicate items? This action cannot be undone.`)) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      let removedCount = 0;

      for (const duplicateGroup of duplicates) {
        // Keep the first item (oldest or first in array), remove the rest
        const itemsToRemove = duplicateGroup.items.slice(1);
        
        for (const item of itemsToRemove) {
          const itemRef = doc(db, 'menuItems', item.id);
          batch.delete(itemRef);
          removedCount++;
        }
      }

      await batch.commit();
      alert(`✅ Successfully removed ${removedCount} duplicate items!`);
      
      // Rescan to update the list
      await scanForDuplicates();
      
    } catch (error) {
      console.error('Error removing duplicates:', error);
      alert('❌ Error removing duplicates: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeSpecificDuplicate = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to remove "${itemName}"?`)) return;

    try {
      const itemRef = doc(db, 'menuItems', itemId);
      await deleteDoc(itemRef);
      
      alert('✅ Duplicate item removed successfully!');
      await scanForDuplicates(); // Refresh the list
      
    } catch (error) {
      console.error('Error removing specific duplicate:', error);
      alert('❌ Error removing duplicate: ' + error.message);
    }
  };

  const keepSpecificItem = async (itemId, duplicateGroup) => {
    if (!window.confirm(`Keep this item and remove all other duplicates of "${duplicateGroup.name}"?`)) return;

    try {
      const batch = writeBatch(db);
      let removedCount = 0;

      // Remove all items in this group except the one we want to keep
      for (const item of duplicateGroup.items) {
        if (item.id !== itemId) {
          const itemRef = doc(db, 'menuItems', item.id);
          batch.delete(itemRef);
          removedCount++;
        }
      }

      await batch.commit();
      alert(`✅ Kept selected item and removed ${removedCount} duplicates!`);
      await scanForDuplicates(); // Refresh the list
      
    } catch (error) {
      console.error('Error keeping specific item:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  return (
    <div className="remove-duplicates">
      <div className="duplicates-header">
        <h1>🔄 MenuItems Duplicate Cleanup</h1>
        <p>Scan and remove duplicate items from the menuItems collection</p>
      </div>

      <div className="stats-card">
        <div className="stat">
          <span className="stat-number">{stats.totalItems}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.uniqueItems}</span>
          <span className="stat-label">Unique Items</span>
        </div>
        <div className="stat">
          <span className="stat-number">{stats.duplicates}</span>
          <span className="stat-label">Duplicates Found</span>
        </div>
      </div>

      <div className="actions">
        <button 
          onClick={scanForDuplicates} 
          disabled={scanning}
          className="scan-btn"
        >
          {scanning ? '🔍 Scanning...' : '🔍 Scan MenuItems Collection'}
        </button>
        
        {duplicates.length > 0 && (
          <button 
            onClick={removeAllDuplicates} 
            disabled={loading}
            className="remove-all-btn"
          >
            {loading ? '🗑️ Removing...' : `🗑️ Remove All Duplicates (${stats.duplicates})`}
          </button>
        )}
      </div>

      {duplicates.length > 0 && (
        <div className="duplicates-list">
          <h2>📋 Found Duplicate Groups</h2>
          <div className="info-box">
            <strong>Note:</strong> The first item in each group will be kept (green), others will be removed (red)
          </div>
          
          {duplicates.map((duplicateGroup, groupIndex) => (
            <div key={groupIndex} className="duplicate-group">
              <div className="group-header">
                <h3 className="item-name">"{duplicateGroup.name}"</h3>
                <span className="duplicate-count">{duplicateGroup.count} duplicates</span>
              </div>
              
              <div className="duplicate-items">
                {duplicateGroup.items.map((item, itemIndex) => (
                  <div key={item.id} className={`duplicate-item ${itemIndex === 0 ? 'keep-item' : 'remove-item'}`}>
                    <div className="item-info">
                      <div className="item-main">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">₹{item.price}</span>
                      </div>
                      {item.description && (
                        <p className="item-desc">{item.description}</p>
                      )}
                      {item.category && (
                        <span className="item-category">Category: {item.category}</span>
                      )}
                      <div className="item-meta">
                        <span className="item-id">ID: {item.id.substring(0, 8)}...</span>
                        {item.createdAt && (
                          <span className="item-date">
                            Created: {item.createdAt.toDate?.().toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      {itemIndex === 0 ? (
                        <div className="keep-section">
                          <span className="keep-badge">✅ KEEPING</span>
                          <button 
                            onClick={() => keepSpecificItem(item.id, duplicateGroup)}
                            className="keep-btn"
                            title="Keep this item and remove all other duplicates"
                          >
                            Keep Only This
                          </button>
                        </div>
                      ) : (
                        <div className="remove-section">
                          <button 
                            onClick={() => removeSpecificDuplicate(item.id, item.name)}
                            className="remove-btn"
                          >
                            🗑️ Remove
                          </button>
                          <button 
                            onClick={() => keepSpecificItem(item.id, duplicateGroup)}
                            className="keep-single-btn"
                            title="Keep this item instead"
                          >
                            Keep This Instead
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {duplicates.length === 0 && !scanning && (
        <div className="no-duplicates">
          <p>No duplicates found or scan not performed yet.</p>
        </div>
      )}

      {scanning && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Scanning menuItems collection for duplicates...</p>
        </div>
      )}
    </div>
  );
};

export default RemoveDuplicates;