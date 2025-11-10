// src/components/InitializeDB.js - WORKING VERSION
import { db, auth } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');

    // Clear existing data to prevent duplicates
    await clearExistingData();

    // 1. Create Users in BOTH Authentication AND Firestore
    console.log('👥 Creating users...');
    
    const users = [
      { email: 'admin@gmail.com', password: 'admin123', name: 'Administrator', role: 'admin' },
      { email: 'ram@gmail.com', password: 'ram1234', name: 'Ram', role: 'waiter' },
      { email: 'dinesh@gmail.com', password: 'dinesh123', name: 'Dinesh', role: 'waiter' },
      { email: 'sanjay@gmail.com', password: 'sanjay123', name: 'Sanjay', role: 'waiter' }
    ];

    for (const user of users) {
      await createUserInBothSystems(user);
    }

    // 2. Create Categories
    console.log('📁 Creating categories...');
    const categories = [
      { 
        id: 'all',
        name: 'All Items', 
        image: 'https://via.placeholder.com/200x200/666666/white?text=All',
        order: 0,
        createdBy: 'admin',
        createdAt: serverTimestamp()
      },
      { 
        id: 'veg',
        name: 'Vegetarian', 
        image: 'https://via.placeholder.com/200x200/4CAF50/white?text=Veg',
        order: 1,
        createdBy: 'admin',
        createdAt: serverTimestamp()
      },
      { 
        id: 'non-veg',
        name: 'Non-Veg', 
        image: 'https://via.placeholder.com/200x200/F44336/white?text=Non-Veg',
        order: 2,
        createdBy: 'admin',
        createdAt: serverTimestamp()
      },
      { 
        id: 'desserts',
        name: 'Desserts', 
        image: 'https://via.placeholder.com/200x200/FF9800/white?text=Desserts',
        order: 3,
        createdBy: 'admin',
        createdAt: serverTimestamp()
      },
      { 
        id: 'beverages',
        name: 'Beverages', 
        image: 'https://via.placeholder.com/200x200/2196F3/white?text=Drinks',
        order: 4,
        createdBy: 'admin',
        createdAt: serverTimestamp()
      }
    ];

    for (const category of categories) {
      await setDoc(doc(db, 'categories', category.id), category);
      console.log(`✅ Category ${category.name} created`);
    }

    // 3. Create Menu Items
    console.log('🍕 Creating menu items...');
    const menuItems = [
      {
        name: 'Veg Pizza',
        price: 250,
        categoryId: 'veg',
        description: 'Delicious vegetable pizza with fresh toppings and cheese',
        image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Pizza',
        model3D: '/models/pizza.glb',
        type: 'veg',
        available: true,
        createdBy: 'admin',
        createdAt: serverTimestamp()
      },
      {
        name: 'Veg Burger',
        price: 180,
        categoryId: 'veg',
        description: 'Crispy veg patty with fresh vegetables and sauces',
        image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Burger',
        model3D: '/models/burgur.glb',
        type: 'veg',
        available: true,
        createdBy: 'admin',
        createdAt: serverTimestamp()
      },
      {
        name: 'Chicken Burger',
        price: 240,
        categoryId: 'non-veg',
        description: 'Juicy chicken patty with special sauce',
        image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Burger',
        model3D: '/models/burgur.glb',
        type: 'non-veg',
        available: true,
        createdBy: 'admin',
        createdAt: serverTimestamp()
      },
      {
        name: 'Chocolate Milkshake',
        price: 180,
        categoryId: 'beverages',
        description: 'Creamy chocolate milkshake with whipped cream',
        image: 'https://via.placeholder.com/300x200/2196F3/white?text=Chocolate+Milkshake',
        model3D: '/models/milkshake.glb',
        type: 'veg',
        available: true,
        createdBy: 'admin',
        createdAt: serverTimestamp()
      }
    ];

    for (const item of menuItems) {
      await addDoc(collection(db, 'menuItems'), item);
      console.log(`✅ Menu item ${item.name} created`);
    }

    // 4. Create Tables
    console.log('🪑 Creating tables...');
    const tables = [
      { id: 1, status: 'available', emoji: '😀', capacity: 4, createdAt: serverTimestamp() },
      { id: 2, status: 'available', emoji: '😊', capacity: 4, createdAt: serverTimestamp() },
      { id: 3, status: 'available', emoji: '😎', capacity: 6, createdAt: serverTimestamp() },
      { id: 4, status: 'available', emoji: '🥳', capacity: 4, createdAt: serverTimestamp() },
      { id: 5, status: 'available', emoji: '🤩', capacity: 8, createdAt: serverTimestamp() }
    ];

    for (const table of tables) {
      await setDoc(doc(db, 'tables', table.id.toString()), table);
      console.log(`✅ Table ${table.id} created`);
    }

    // 5. Create Sample Cart Data
    console.log('🛒 Creating sample cart data...');
    await createSampleCartData();

    // 6. Create Sample Orders
    console.log('📋 Creating sample orders...');
    await createSampleOrders();

    console.log('🎉 Database initialized successfully!');
    return true;

  } catch (error) {
    console.error('💥 Error initializing database:', error);
    return false;
  }
};

// CORRECT USER CREATION FUNCTION
const createUserInBothSystems = async (userData) => {
  try {
    console.log(`🔄 Creating user: ${userData.email}`);
    
    // Step 1: Create in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    const uid = userCredential.user.uid;
    console.log(`✅ Auth user created: ${userData.email} (UID: ${uid})`);

    // Step 2: Create in Firestore using UID as document ID
    await setDoc(doc(db, 'users', uid), {
      uid: uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: serverTimestamp()
    });
    
    console.log(`✅ Firestore user created: ${userData.email}`);
    
    // Step 3: Sign out immediately to avoid auth state issues
    await auth.signOut();
    
    return true;

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`ℹ️ User ${userData.email} already exists in Authentication`);
      // Don't throw error - just continue
      return true;
    } else {
      console.log(`❌ Error creating user ${userData.email}:`, error.message);
      throw error; // Re-throw other errors
    }
  }
};

// Sample Cart Data Function
const createSampleCartData = async () => {
  try {
    const sampleCart = {
      items: [
        {
          id: '1',
          name: 'Veg Pizza',
          price: 250,
          quantity: 2,
          type: 'veg',
          image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Pizza',
          categoryId: 'veg'
        }
      ],
      subtotal: 500,
      tax: 25,
      total: 525,
      orderType: 'dine-in',
      tableNumber: '3',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, 'cart'), sampleCart);
    console.log('✅ Sample cart created');

  } catch (error) {
    console.log('ℹ️ Error creating sample cart:', error.message);
  }
};

// Sample Orders Function
const createSampleOrders = async () => {
  try {
    const sampleOrder = {
      phoneNumber: '9876543210',
      customerName: 'John Doe',
      items: [
        {
          id: '1',
          name: 'Veg Pizza',
          price: 250,
          quantity: 1,
          type: 'veg',
          image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Pizza'
        }
      ],
      subtotal: 250,
      tax: 12.5,
      total: 262.5,
      orderType: 'dine-in',
      tableNumber: '3',
      status: 'pending',
      waiterStatus: 'new',
      kitchenStatus: 'pending',
      orderNumber: 'ORD' + Date.now().toString().slice(-6),
      createdAt: serverTimestamp(),
      assignedWaiter: null
    };

    await addDoc(collection(db, 'orders'), sampleOrder);
    console.log('✅ Sample order created');

  } catch (error) {
    console.log('ℹ️ Error creating sample order:', error.message);
  }
};

// Clear Existing Data Function
const clearExistingData = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    
    const collectionsToClear = ['menuItems', 'orders', 'cart'];
    
    for (const collectionName of collectionsToClear) {
      const snapshot = await getDocs(collection(db, collectionName));
      const deletes = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletes);
      console.log(`✅ Cleared ${snapshot.size} ${collectionName}`);
    }
    
    // Clear categories except 'all'
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoryDeletes = categoriesSnapshot.docs.map(doc => {
      if (doc.id !== 'all') return deleteDoc(doc.ref);
    }).filter(Boolean);
    await Promise.all(categoryDeletes);
    console.log(`✅ Cleared ${categoryDeletes.length} categories`);
    
    // Clear tables
    const tablesSnapshot = await getDocs(collection(db, 'tables'));
    const tableDeletes = tablesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(tableDeletes);
    console.log(`✅ Cleared ${tablesSnapshot.size} tables`);
    
    // NOTE: We DON'T clear users collection to preserve auth-Firestore links
    
  } catch (error) {
    console.log('ℹ️ Clear data issue:', error.message);
  }
};

export { initializeDatabase };