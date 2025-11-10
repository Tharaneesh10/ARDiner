import { db, auth } from '../firebase/config';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const initializeDatabase = async () => {
  try {
    // 1. Create Admin User in Authentication & Firestore
    try {
      const adminUser = await createUserWithEmailAndPassword(
        auth, 
        'admin@gmail.com', 
        '12345'
      );
      
      await setDoc(doc(db, 'users', adminUser.user.uid), {
        email: 'admin@gmail.com',
        role: 'admin',
        name: 'Administrator',
        createdAt: new Date()
      });
    } catch (error) {
      console.log('Admin user already exists or auth disabled');
    }

    // 2. Create Sample Waiter Users
    const waiters = [
      { email: 'ram@gmail.com', password: '12345', name: 'Ram', role: 'waiter' },
      { email: 'dinesh@gmail.com', password: '12345', name: 'Dinesh', role: 'waiter' },
      { email: 'sanjay@gmail.com', password: '12345', name: 'Sanjay', role: 'waiter' }
    ];

    for (const waiter of waiters) {
      try {
        const waiterUser = await createUserWithEmailAndPassword(
          auth,
          waiter.email,
          waiter.password
        );
        
        await setDoc(doc(db, 'users', waiterUser.user.uid), {
          email: waiter.email,
          role: 'waiter',
          name: waiter.name,
          createdAt: new Date()
        });
      } catch (error) {
        console.log(`Waiter ${waiter.email} already exists`);
      }
    }

    // 3. Create Categories
    const categories = [
      { 
        id: 'all',
        name: 'All Items', 
        image: 'https://via.placeholder.com/200x200/666666/white?text=All',
        order: 0,
        createdBy: 'admin'
      },
      { 
        id: 'veg',
        name: 'Vegetarian', 
        image: 'https://via.placeholder.com/200x200/4CAF50/white?text=Veg',
        order: 1,
        createdBy: 'admin'
      },
      { 
        id: 'non-veg',
        name: 'Non-Veg', 
        image: 'https://via.placeholder.com/200x200/F44336/white?text=Non-Veg',
        order: 2,
        createdBy: 'admin'
      },
      { 
        id: 'desserts',
        name: 'Desserts', 
        image: 'https://via.placeholder.com/200x200/FF9800/white?text=Desserts',
        order: 3,
        createdBy: 'admin'
      },
      { 
        id: 'beverages',
        name: 'Beverages', 
        image: 'https://via.placeholder.com/200x200/2196F3/white?text=Drinks',
        order: 4,
        createdBy: 'admin'
      }
    ];

    for (const category of categories) {
      await setDoc(doc(db, 'categories', category.id), category);
    }

    // 4. Create Menu Items with proper details
    const menuItems = [
      // Vegetarian Items
      {
        name: 'Veg Pizza',
        price: 250,
        categoryId: 'veg',
        description: 'Delicious vegetable pizza with fresh toppings and cheese',
        image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Pizza',
        type: 'veg',
        available: true,
        createdBy: 'admin'
      },
      {
        name: 'Veg Burger',
        price: 180,
        categoryId: 'veg',
        description: 'Crispy veg patty with fresh vegetables and sauces',
        image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Burger',
        type: 'veg',
        available: true,
        createdBy: 'admin'
      },
      {
        name: 'Veg Momos',
        price: 120,
        categoryId: 'veg',
        description: 'Steamed dumplings filled with mixed vegetables',
        image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Momos',
        type: 'veg',
        available: true,
        createdBy: 'admin'
      },
      {
        name: 'Veg Noodles',
        price: 160,
        categoryId: 'veg',
        description: 'Stir-fried noodles with fresh vegetables',
        image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Veg+Noodles',
        type: 'veg',
        available: true,
        createdBy: 'admin'
      },
      {
        name: 'French Fries',
        price: 160,
        categoryId: 'veg',
        description: 'Crispy golden fries served with ketchup',
        image: 'https://via.placeholder.com/300x200/4CAF50/white?text=French+Fries',
        type: 'veg',
        available: true,
        createdBy: 'admin'
      },

      // Non-Veg Items
      {
        name: 'Chicken Sandwich',
        price: 220,
        categoryId: 'non-veg',
        description: 'Grilled chicken sandwich with mayo and lettuce',
        image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Sandwich',
        type: 'non-veg',
        available: true,
        createdBy: 'admin'
      },
      {
        name: 'Chicken Pizza',
        price: 320,
        categoryId: 'non-veg',
        description: 'Pizza topped with grilled chicken and cheese',
        image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Pizza',
        type: 'non-veg',
        available: true,
        createdBy: 'admin'
      },
      {
        name: 'Chicken Burger',
        price: 240,
        categoryId: 'non-veg',
        description: 'Juicy chicken patty with special sauce',
        image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Burger',
        type: 'non-veg',
        available: true,
        createdBy: 'admin'
      },
      {
        name: 'Chicken Noodles',
        price: 200,
        categoryId: 'non-veg',
        description: 'Stir-fried noodles with chicken and vegetables',
        image: 'https://via.placeholder.com/300x200/F44336/white?text=Chicken+Noodles',
        type: 'non-veg',
        available: true,
        createdBy: 'admin'
      },

      // Desserts
      {
        name: 'Chocolate Cake',
        price: 150,
        categoryId: 'desserts',
        description: 'Rich chocolate cake with chocolate frosting',
        image: 'https://via.placeholder.com/300x200/FF9800/white?text=Chocolate+Cake',
        type: 'veg',
        available: true,
        createdBy: 'admin'
      },
      {
        name: 'Vanilla Ice Cream',
        price: 120,
        categoryId: 'desserts',
        description: 'Creamy vanilla ice cream scoop',
        image: 'https://via.placeholder.com/300x200/FF9800/white?text=Vanilla+Ice+Cream',
        type: 'veg',
        available: true,
        createdBy: 'admin'
      },

      // Beverages
      {
        name: 'Chocolate Milkshake',
        price: 180,
        categoryId: 'beverages',
        description: 'Creamy chocolate milkshake with whipped cream',
        image: 'https://via.placeholder.com/300x200/2196F3/white?text=Chocolate+Milkshake',
        type: 'veg',
        available: true,
        createdBy: 'admin'
      },
      {
        name: 'Hot Coffee',
        price: 100,
        categoryId: 'beverages',
        description: 'Freshly brewed hot coffee',
        image: 'https://via.placeholder.com/300x200/2196F3/white?text=Hot+Coffee',
        type: 'veg',
        available: true,
        createdBy: 'admin'
      }
    ];

    // Clear existing menu items first (optional)
    // Then add new menu items
    for (const item of menuItems) {
      await addDoc(collection(db, 'menuItems'), {
        ...item,
        createdAt: new Date()
      });
    }

    // 5. Create Tables
    const tables = [
      { id: 1, status: 'available', emoji: '😀', capacity: 4 },
      { id: 2, status: 'available', emoji: '😊', capacity: 4 },
      { id: 3, status: 'available', emoji: '😎', capacity: 6 },
      { id: 4, status: 'available', emoji: '🥳', capacity: 4 },
      { id: 5, status: 'available', emoji: '🤩', capacity: 8 }
    ];

    for (const table of tables) {
      await setDoc(doc(db, 'tables', table.id.toString()), {
        ...table,
        createdAt: new Date()
      });
    }

    console.log('Production database initialized successfully with all menu items!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};