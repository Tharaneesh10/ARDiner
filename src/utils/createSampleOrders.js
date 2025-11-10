import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createSampleOrders = async () => {
  const sampleOrders = [
    {
      tableNumber: '1',
      orderType: 'dine-in',
      status: 'confirmed',
      items: [
        {
          id: '1',
          name: 'Butter Chicken',
          price: 320,
          quantity: 2,
          type: 'non-veg',
          category: 'main course'
        },
        {
          id: '2', 
          name: 'Garlic Naan',
          price: 60,
          quantity: 3,
          type: 'veg',
          category: 'breads'
        }
      ],
      subtotal: 820,
      tax: 41,
      totalAmount: 861,
      userPhone: '+919876543210',
      orderDate: new Date(),
      paymentMethod: 'cash'
    },
    {
      tableNumber: '2',
      orderType: 'dine-in', 
      status: 'confirmed',
      items: [
        {
          id: '3',
          name: 'Paneer Butter Masala',
          price: 280,
          quantity: 1,
          type: 'veg',
          category: 'main course'
        },
        {
          id: '4',
          name: 'Jeera Rice',
          price: 120,
          quantity: 1,
          type: 'veg',
          category: 'rice'
        }
      ],
      subtotal: 400,
      tax: 20,
      totalAmount: 420,
      userPhone: '+919876543211',
      orderDate: new Date(),
      paymentMethod: 'card'
    }
  ];

  try {
    console.log('🔄 Creating sample orders...');
    
    for (const order of sampleOrders) {
      const docRef = await addDoc(collection(db, 'orders'), order);
      console.log(`✅ Created sample order: ${docRef.id} for table ${order.tableNumber}`);
    }
    
    console.log('🎉 Sample orders created successfully');
    return { success: true, message: 'Sample orders created' };
  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
    return { success: false, message: error.message };
  }
};