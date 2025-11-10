import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const debugWaiterSystem = async (waiterId) => {
  console.log('🔍 === WAITER SYSTEM DEBUG START ===');
  
  try {
    // 1. Check if waiter document exists
    const waiterRef = doc(db, 'waiters', waiterId);
    const waiterDoc = await getDoc(waiterRef);
    
    console.log('1. Waiter document exists:', waiterDoc.exists());
    if (waiterDoc.exists()) {
      console.log('   Waiter data:', waiterDoc.data());
    } else {
      console.log('   ❌ Waiter document not found!');
    }

    // 2. Check waiters collection
    const waitersSnapshot = await getDocs(collection(db, 'waiters'));
    console.log('2. All waiters in collection:');
    waitersSnapshot.forEach(doc => {
      console.log(`   - ${doc.id}:`, doc.data());
    });

    // 3. Check orders collection
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    console.log('3. Orders in collection:', ordersSnapshot.size);
    ordersSnapshot.forEach(doc => {
      console.log(`   - ${doc.id}:`, { 
        table: doc.data().tableNumber, 
        status: doc.data().status 
      });
    });

    // 4. Check completed_orders collection
    const completedSnapshot = await getDocs(collection(db, 'completed_orders'));
    console.log('4. Completed orders:', completedSnapshot.size);

    // 5. Test write permissions
    console.log('5. Testing write permissions...');
    try {
      const testRef = doc(collection(db, 'test_permissions'));
      await setDoc(testRef, { test: true, timestamp: new Date() });
      console.log('   ✅ Write permission: SUCCESS');
    } catch (writeError) {
      console.log('   ❌ Write permission: FAILED', writeError.message);
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
  
  console.log('🔍 === WAITER SYSTEM DEBUG END ===');
};

export const forceAssignTable = async (waiterId, tableNumber) => {
  try {
    console.log(`🔄 Force assigning table ${tableNumber} to waiter ${waiterId}`);
    
    const waiterRef = doc(db, 'waiters', waiterId);
    const waiterDoc = await getDoc(waiterRef);
    
    if (!waiterDoc.exists()) {
      throw new Error(`Waiter ${waiterId} not found in database`);
    }
    
    const currentTables = waiterDoc.data().currentTables || [];
    const updatedTables = [...currentTables, tableNumber];
    
    await updateDoc(waiterRef, {
      currentTables: updatedTables,
      lastActive: new Date()
    });
    
    console.log(`✅ Table ${tableNumber} force-assigned to ${waiterId}`);
    return { success: true, message: 'Table assigned successfully' };
  } catch (error) {
    console.error('❌ Force assign failed:', error);
    return { success: false, message: error.message };
  }
};