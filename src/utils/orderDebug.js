import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const testOrderListener = () => {
  console.log('🔍 Testing order listener...');
  
  const ordersQuery = query(
    collection(db, 'orders'),
    where('orderType', '==', 'dine-in'),
    orderBy('orderDate', 'desc')
  );

  const unsubscribe = onSnapshot(ordersQuery, 
    (snapshot) => {
      console.log('🎯 ORDER LISTENER TRIGGERED!');
      console.log('📦 Orders count:', snapshot.size);
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          console.log('🆕 NEW ORDER ADDED:', change.doc.data());
        }
        if (change.type === 'modified') {
          console.log('✏️ ORDER MODIFIED:', change.doc.data());
        }
        if (change.type === 'removed') {
          console.log('🗑️ ORDER REMOVED:', change.doc.id);
        }
      });

      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📊 All dine-in orders:', ordersData);
    },
    (error) => {
      console.error('❌ Order listener error:', error);
    }
  );

  return unsubscribe;
};

export const checkCurrentOrders = async () => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('orderType', '==', 'dine-in')
    );
    
    const snapshot = await getDocs(ordersQuery);
    console.log('📋 Current dine-in orders in database:', snapshot.size);
    
    snapshot.forEach((doc) => {
      console.log(`🍽️ Order ${doc.id}:`, {
        tableNumber: doc.data().tableNumber,
        status: doc.data().status,
        items: doc.data().items?.length,
        totalAmount: doc.data().totalAmount
      });
    });
    
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error checking orders:', error);
    return 0;
  }
};