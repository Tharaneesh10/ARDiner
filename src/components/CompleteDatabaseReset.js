// src/components/CompleteDatabaseReset.js
import React, { useState } from 'react';
import { db, auth } from '../firebase/config';
import { collection, addDoc, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const CompleteDatabaseReset = () => {
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState('');

  const resetDatabase = async () => {
    setResetting(true);
    setResult('🚀 Starting complete database reset...\n\n');
    
    try {
      // 1. Clear existing data
      setResult(prev => prev + '🧹 Clearing existing data...\n');
      await clearExistingData();

      // 2. Create categories
      setResult(prev => prev + '📁 Creating categories...\n');
      const categories = [
        { id: 'all', name: 'All Items', image: 'https://via.placeholder.com/200x200/666666/white?text=All', order: 0 },
        { id: 'veg', name: 'Vegetarian', image: 'https://via.placeholder.com/200x200/4CAF50/white?text=Veg', order: 1 },
        { id: 'non-veg', name: 'Non-Veg', image: 'https://via.placeholder.com/200x200/F44336/white?text=Non-Veg', order: 2 },
        { id: 'desserts', name: 'Desserts', image: 'https://via.placeholder.com/200x200/FF9800/white?text=Desserts', order: 3 },
        { id: 'beverages', name: 'Beverages', image: 'https://via.placeholder.com/200x200/2196F3/white?text=Drinks', order: 4 }
      ];

      for (const category of categories) {
        await setDoc(doc(db, 'categories', category.id), {
          ...category,
          createdBy: 'admin',
          createdAt: new Date()
        });
        setResult(prev => prev + `✅ ${category.name}\n`);
      }

      // 3. Create menu items with CORRECT model paths
      setResult(prev => prev + '\n🍕 Creating menu items with 3D models...\n');
      const menuItems = [
        // Vegetarian Items
        {
          name: 'Veg Pizza',
          price: 250,
          categoryId: 'veg',
          description: 'Delicious vegetable pizza with fresh toppings and cheese',
          image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Pizza',
          model3D: '/models/pizza.glb',
          type: 'veg',
          available: true
        },
        {
          name: 'Veg Burger',
          price: 180,
          categoryId: 'veg',
          description: 'Crispy veg patty with fresh vegetables and sauces',
          image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Burger',
          model3D: '/models/burgur.glb',
          type: 'veg',
          available: true
        },
        {
          name: 'Veg Momos',
          price: 120,
          categoryId: 'veg',
          description: 'Steamed dumplings filled with mixed vegetables',
          image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Momos',
          model3D: '/models/momos.glb',
          type: 'veg',
          available: true
        },
        {
          name: 'Veg Noodles',
          price: 160,
          categoryId: 'veg',
          description: 'Stir-fried noodles with fresh vegetables',
          image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Noodles',
          model3D: '/models/noodles.glb',
          type: 'veg',
          available: true
        },
        {
          name: 'French Fries',
          price: 160,
          categoryId: 'veg',
          description: 'Crispy golden fries served with ketchup',
          image: 'https://via.placeholder.com/300x200/4CAF50/white?text=French+Fries',
          model3D: '/models/fries1.glb',
          type: 'veg',
          available: true
        },

        // Non-Veg Items
        {
          name: 'Chicken Sandwich',
          price: 220,
          categoryId: 'non-veg',
          description: 'Grilled chicken sandwich with mayo and lettuce',
          image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Sandwich',
          model3D: '/models/sandwich.glb',
          type: 'non-veg',
          available: true
        },
        {
          name: 'Chicken Pizza',
          price: 320,
          categoryId: 'non-veg',
          description: 'Pizza topped with grilled chicken and cheese',
          image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Pizza',
          model3D: '/models/pizza.glb',
          type: 'non-veg',
          available: true
        },
        {
          name: 'Chicken Burger',
          price: 240,
          categoryId: 'non-veg',
          description: 'Juicy chicken patty with special sauce',
          image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Burger',
          model3D: '/models/burgur.glb',
          type: 'non-veg',
          available: true
        },
        {
          name: 'Chicken Noodles',
          price: 200,
          categoryId: 'non-veg',
          description: 'Stir-fried noodles with chicken and vegetables',
          image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Noodles',
          model3D: '/models/noodles.glb',
          type: 'non-veg',
          available: true
        },

        // Desserts
        {
          name: 'Chocolate Cake',
          price: 150,
          categoryId: 'desserts',
          description: 'Rich chocolate cake with chocolate frosting',
          image: 'https://via.placeholder.com/300x200/FF9800/white?text=Chocolate+Cake',
          model3D: '/models/cake.glb',
          type: 'veg',
          available: true
        },
        {
          name: 'Vanilla Ice Cream',
          price: 120,
          categoryId: 'desserts',
          description: 'Creamy vanilla ice cream scoop',
          image: 'https://via.placeholder.com/300x200/FF9800/white?text=Vanilla+Ice+Cream',
          model3D: '/models/ice.glb',
          type: 'veg',
          available: true
        },

        // Beverages
        {
          name: 'Chocolate Milkshake',
          price: 180,
          categoryId: 'beverages',
          description: 'Creamy chocolate milkshake with whipped cream',
          image: 'https://via.placeholder.com/300x200/2196F3/white?text=Chocolate+Milkshake',
          model3D: '/models/milkshake.glb',
          type: 'veg',
          available: true
        },
        {
          name: 'Hot Coffee',
          price: 100,
          categoryId: 'beverages',
          description: 'Freshly brewed hot coffee',
          image: 'https://via.placeholder.com/300x200/2196F3/white?text=Hot+Coffee',
          model3D: '/models/coffee.glb',
          type: 'veg',
          available: true
        }
      ];

      for (const item of menuItems) {
        await addDoc(collection(db, 'menuItems'), {
          ...item,
          createdBy: 'admin',
          createdAt: new Date()
        });
        setResult(prev => prev + `✅ ${item.name} → ${item.model3D}\n`);
      }

      setResult(prev => prev + '\n🎉 DATABASE RESET COMPLETE! All models should work now.\n');

    } catch (error) {
      console.error('Reset error:', error);
      setResult(prev => prev + `\n❌ ERROR: ${error.message}\n`);
    } finally {
      setResetting(false);
    }
  };

  const clearExistingData = async () => {
    try {
      // Clear menu items
      const menuItemsSnapshot = await getDocs(collection(db, 'menuItems'));
      const menuItemDeletes = menuItemsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(menuItemDeletes);

      // Clear categories (except 'all')
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoryDeletes = categoriesSnapshot.docs.map(doc => {
        if (doc.id !== 'all') return deleteDoc(doc.ref);
      }).filter(Boolean);
      await Promise.all(categoryDeletes);

    } catch (error) {
      console.log('Clear data warning:', error.message);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '900px', 
      margin: '0 auto',
      fontFamily: 'monospace'
    }}>
      <h2 style={{ color: '#e17055', textAlign: 'center' }}>🔄 COMPLETE DATABASE RESET</h2>
      <p style={{ textAlign: 'center', color: '#666' }}>
        This will delete all existing data and create fresh menu items with CORRECT 3D model paths.
      </p>

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <button 
          onClick={resetDatabase}
          disabled={resetting}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: resetting ? '#b2bec3' : '#e17055',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: resetting ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {resetting ? '🔄 Resetting Database...' : '🚀 RESET DATABASE NOW'}
        </button>
      </div>

      <pre style={{ 
        background: '#2d3436', 
        color: '#dfe6e9',
        padding: '20px', 
        borderRadius: '8px',
        overflow: 'auto',
        minHeight: '500px',
        fontSize: '14px',
        lineHeight: '1.4',
        border: '2px solid #e17055'
      }}>
        {result || 'Click the button above to reset your database with correct 3D model paths...'}
      </pre>
    </div>
  );
};

export default CompleteDatabaseReset;