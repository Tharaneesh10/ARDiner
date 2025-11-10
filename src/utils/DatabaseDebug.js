import { db, auth } from '../firebase/config';
import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const debugDatabase = async () => {
  try {
    console.log('=== DATABASE DEBUG START ===');
    
    // Test Firebase connection
    console.log('1. Testing Firebase connection...');
    console.log('Firebase config:', db.app.options);
    
    // Check if collections exist
    console.log('2. Checking existing data...');
    
    // Check categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log('Existing categories:', categoriesSnapshot.docs.map(doc => doc.data()));
    
    // Check menu items
    const menuItemsSnapshot = await getDocs(collection(db, 'menuItems'));
    console.log('Existing menu items:', menuItemsSnapshot.docs.map(doc => doc.data()));
    
    // Check users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log('Existing users:', usersSnapshot.docs.map(doc => doc.data()));
    
    console.log('=== DATABASE DEBUG END ===');
    return true;
  } catch (error) {
    console.error('Debug error:', error);
    return false;
  }
};

export const initializeDatabaseWithDebug = async () => {
  try {
    console.log('🚀 Starting database initialization with debug...');

    // Test basic Firebase connection first
    try {
      const testDoc = await getDocs(collection(db, 'categories'));
      console.log('✅ Firebase connection successful');
    } catch (firebaseError) {
      console.error('❌ Firebase connection failed:', firebaseError);
      return false;
    }

    // 1. Create Admin User
    try {
      const adminUser = await createUserWithEmailAndPassword(
        auth, 
        'admin@gmail.com', 
        '12345'
      );
      console.log('✅ Admin user created in Auth');
      
      await setDoc(doc(db, 'users', adminUser.user.uid), {
        email: 'admin@gmail.com',
        role: 'admin',
        name: 'Administrator',
        createdAt: new Date()
      });
      console.log('✅ Admin user added to Firestore');
    } catch (error) {
      console.log('ℹ️ Admin user already exists:', error.message);
    }

    // 2. Create Waiters
    const waiters = [
      { email: 'ram@gmail.com', password: '12345', name: 'Ram', role: 'waiter' },
      { email: 'dinesh@gmail.com', password: '12345', name: 'Dinesh', role: 'waiter' },
      { email: 'sanjay@gmail.com', password: '12345', name: 'Sanjay', role: 'waiter' }
    ];

    for (const waiter of waiters) {
      try {
        const waiterUser = await createUserWithEmailAndPassword(auth, waiter.email, waiter.password);
        await setDoc(doc(db, 'users', waiterUser.user.uid), {
          email: waiter.email,
          role: 'waiter',
          name: waiter.name,
          createdAt: new Date()
        });
        console.log(`✅ Waiter ${waiter.email} created`);
      } catch (error) {
        console.log(`ℹ️ Waiter ${waiter.email} already exists`);
      }
    }

    // 3. Create Categories
    const categories = [
      { id: 'all', name: 'All Items', image: 'https://via.placeholder.com/200x200/666666/white?text=All', order: 0, createdBy: 'admin', createdAt: new Date() },
      { id: 'veg', name: 'Vegetarian', image: 'https://via.placeholder.com/200x200/4CAF50/white?text=Veg', order: 1, createdBy: 'admin', createdAt: new Date() },
      { id: 'non-veg', name: 'Non-Veg', image: 'https://via.placeholder.com/200x200/F44336/white?text=Non-Veg', order: 2, createdBy: 'admin', createdAt: new Date() },
      { id: 'desserts', name: 'Desserts', image: 'https://via.placeholder.com/200x200/FF9800/white?text=Desserts', order: 3, createdBy: 'admin', createdAt: new Date() },
      { id: 'beverages', name: 'Beverages', image: 'https://via.placeholder.com/200x200/2196F3/white?text=Drinks', order: 4, createdBy: 'admin', createdAt: new Date() }
    ];

    for (const category of categories) {
      await setDoc(doc(db, 'categories', category.id), category);
      console.log(`✅ Category ${category.name} created`);
    }

    // 4. Create Menu Items
    const menuItems = [
      // Vegetarian
      { name: 'Veg Pizza', price: 250, categoryId: 'veg', description: 'Delicious vegetable pizza', image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Pizza', type: 'veg', available: true, createdBy: 'admin', createdAt: new Date() },
      { name: 'Veg Burger', price: 180, categoryId: 'veg', description: 'Crispy veg patty burger', image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Burger', type: 'veg', available: true, createdBy: 'admin', createdAt: new Date() },
      { name: 'Veg Momos', price: 120, categoryId: 'veg', description: 'Steamed vegetable dumplings', image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Momos', type: 'veg', available: true, createdBy: 'admin', createdAt: new Date() },
      { name: 'Veg Noodles', price: 160, categoryId: 'veg', description: 'Stir-fried vegetable noodles', image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Noodles', type: 'veg', available: true, createdBy: 'admin', createdAt: new Date() },
      { name: 'French Fries', price: 160, categoryId: 'veg', description: 'Crispy golden fries', image: 'https://via.placeholder.com/300x200/4CAF50/white?text=French+Fries', type: 'veg', available: true, createdBy: 'admin', createdAt: new Date() },

      // Non-Veg
      { name: 'Chicken Sandwich', price: 220, categoryId: 'non-veg', description: 'Grilled chicken sandwich', image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Sandwich', type: 'non-veg', available: true, createdBy: 'admin', createdAt: new Date() },
      { name: 'Chicken Pizza', price: 320, categoryId: 'non-veg', description: 'Chicken topped pizza', image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Pizza', type: 'non-veg', available: true, createdBy: 'admin', createdAt: new Date() },
      { name: 'Chicken Burger', price: 240, categoryId: 'non-veg', description: 'Juicy chicken burger', image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Burger', type: 'non-veg', available: true, createdBy: 'admin', createdAt: new Date() },
      { name: 'Chicken Noodles', price: 200, categoryId: 'non-veg', description: 'Chicken stir-fry noodles', image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Noodles', type: 'non-veg', available: true, createdBy: 'admin', createdAt: new Date() },

      // Desserts
      { name: 'Chocolate Cake', price: 150, categoryId: 'desserts', description: 'Rich chocolate cake', image: 'https://via.placeholder.com/300x200/FF9800/white?text=Chocolate+Cake', type: 'veg', available: true, createdBy: 'admin', createdAt: new Date() },
      { name: 'Vanilla Ice Cream', price: 120, categoryId: 'desserts', description: 'Creamy vanilla ice cream', image: 'https://via.placeholder.com/300x200/FF9800/white?text=Vanilla+Ice+Cream', type: 'veg', available: true, createdBy: 'admin', createdAt: new Date() },

      // Beverages
      { name: 'Chocolate Milkshake', price: 180, categoryId: 'beverages', description: 'Creamy chocolate shake', image: 'https://via.placeholder.com/300x200/2196F3/white?text=Chocolate+Milkshake', type: 'veg', available: true, createdBy: 'admin', createdAt: new Date() },
      { name: 'Hot Coffee', price: 100, categoryId: 'beverages', description: 'Fresh brewed coffee', image: 'https://via.placeholder.com/300x200/2196F3/white?text=Hot+Coffee', type: 'veg', available: true, createdBy: 'admin', createdAt: new Date() }
    ];

    for (const item of menuItems) {
      await addDoc(collection(db, 'menuItems'), item);
      console.log(`✅ Menu item ${item.name} created`);
    }

    // 5. Create Tables
    const tables = [
      { id: 1, status: 'available', emoji: '😀', capacity: 4, createdAt: new Date() },
      { id: 2, status: 'available', emoji: '😊', capacity: 4, createdAt: new Date() },
      { id: 3, status: 'available', emoji: '😎', capacity: 6, createdAt: new Date() },
      { id: 4, status: 'available', emoji: '🥳', capacity: 4, createdAt: new Date() },
      { id: 5, status: 'available', emoji: '🤩', capacity: 8, createdAt: new Date() }
    ];

    for (const table of tables) {
      await setDoc(doc(db, 'tables', table.id.toString()), table);
      console.log(`✅ Table ${table.id} created`);
    }

    console.log('🎉 Database initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('💥 Database initialization failed:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    return false;
  }
};