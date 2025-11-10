import { collection, doc, setDoc, updateDoc, getDoc, getDocs, query, where, onSnapshot, writeBatch, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

// Waiter collection structure
export const waiterStructure = {
  name: 'string',
  email: 'string',
  password: 'string',
  isActive: 'boolean',
  currentTables: 'array',
  totalOrdersServed: 'number',
  createdAt: 'timestamp',
  lastActive: 'timestamp'
};

// WaiterInfo collection structure
export const waiterInfoStructure = {
  waiterId: 'string',
  name: 'string',
  email: 'string',
  phone: 'string',
  shift: 'string',
  isActive: 'boolean',
  tablesAssigned: 'array',
  ordersServed: 'number',
  totalEarnings: 'number',
  rating: 'number',
  createdAt: 'timestamp',
  lastActive: 'timestamp',
  performance: {
    todayOrders: 'number',
    todayEarnings: 'number',
    weeklyAverage: 'number'
  }
};

// Initialize waiters in database
export const initializeWaiters = async () => {
  const waiters = [
    {
      id: 'ram',
      name: 'Ram',
      email: 'ram@restaurant.com',
      password: 'ram123',
      isActive: true,
      currentTables: [],
      totalOrdersServed: 0,
      createdAt: new Date(),
      lastActive: new Date()
    },
    {
      id: 'sanjay',
      name: 'Sanjay',
      email: 'sanjay@restaurant.com', 
      password: 'sanjay123',
      isActive: true,
      currentTables: [],
      totalOrdersServed: 0,
      createdAt: new Date(),
      lastActive: new Date()
    },
    {
      id: 'arun',
      name: 'Arun',
      email: 'arun@restaurant.com',
      password: 'arun123',
      isActive: true,
      currentTables: [],
      totalOrdersServed: 0,
      createdAt: new Date(),
      lastActive: new Date()
    }
  ];

  try {
    console.log('🔄 Initializing waiters...');
    
    for (const waiter of waiters) {
      const waiterRef = doc(db, 'waiters', waiter.id);
      await setDoc(waiterRef, waiter);
      console.log(`✅ Waiter ${waiter.name} initialized`);
    }
    
    console.log('🎉 All waiters initialized successfully');
    return { success: true, message: 'Waiters initialized successfully' };
  } catch (error) {
    console.error('❌ Error initializing waiters:', error);
    return { success: false, message: error.message };
  }
};

// Initialize waiter info collection
export const initializeWaiterInfo = async () => {
  const waitersInfo = [
    {
      waiterId: 'ram',
      name: 'Ram Kumar',
      email: 'ram@restaurant.com',
      phone: '+91 9876543210',
      shift: 'morning',
      isActive: true,
      tablesAssigned: [],
      ordersServed: 0,
      totalEarnings: 0,
      rating: 4.5,
      createdAt: new Date(),
      lastActive: new Date(),
      performance: {
        todayOrders: 0,
        todayEarnings: 0,
        weeklyAverage: 0
      }
    },
    {
      waiterId: 'sanjay',
      name: 'Sanjay Patel',
      email: 'sanjay@restaurant.com',
      phone: '+91 9876543211',
      shift: 'evening',
      isActive: true,
      tablesAssigned: [],
      ordersServed: 0,
      totalEarnings: 0,
      rating: 4.2,
      createdAt: new Date(),
      lastActive: new Date(),
      performance: {
        todayOrders: 0,
        todayEarnings: 0,
        weeklyAverage: 0
      }
    },
    {
      waiterId: 'arun',
      name: 'Arun Sharma',
      email: 'arun@restaurant.com',
      phone: '+91 9876543212',
      shift: 'night',
      isActive: true,
      tablesAssigned: [],
      ordersServed: 0,
      totalEarnings: 0,
      rating: 4.7,
      createdAt: new Date(),
      lastActive: new Date(),
      performance: {
        todayOrders: 0,
        todayEarnings: 0,
        weeklyAverage: 0
      }
    }
  ];

  try {
    console.log('🔄 Initializing waiter info collection...');
    
    for (const waiter of waitersInfo) {
      const waiterInfoRef = doc(db, 'waiterinfo', waiter.waiterId);
      await setDoc(waiterInfoRef, waiter);
      console.log(`✅ Waiter info created for: ${waiter.name}`);
    }
    
    console.log('🎉 All waiter info initialized successfully');
    return { success: true, message: 'Waiter info collection initialized successfully' };
  } catch (error) {
    console.error('❌ Error initializing waiter info:', error);
    return { success: false, message: error.message };
  }
};

// Get all waiters
export const getAllWaiters = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'waiters'));
    const waiters = [];
    querySnapshot.forEach((doc) => {
      waiters.push({ id: doc.id, ...doc.data() });
    });
    return waiters;
  } catch (error) {
    console.error('❌ Error getting waiters:', error);
    return [];
  }
};

// Get waiter by ID
export const getWaiterById = async (waiterId) => {
  try {
    if (!waiterId) {
      console.error('❌ No waiter ID provided');
      return null;
    }
    
    const waiterRef = doc(db, 'waiters', waiterId);
    const waiterDoc = await getDoc(waiterRef);
    
    if (waiterDoc.exists()) {
      return { id: waiterDoc.id, ...waiterDoc.data() };
    } else {
      console.error(`❌ Waiter document not found for ID: ${waiterId}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error getting waiter ${waiterId}:`, error);
    return null;
  }
};

// Get waiter info by ID
export const getWaiterInfo = async (waiterId) => {
  try {
    if (!waiterId) {
      console.error('❌ No waiter ID provided');
      return null;
    }
    
    const waiterInfoRef = doc(db, 'waiterinfo', waiterId);
    const waiterInfoDoc = await getDoc(waiterInfoRef);
    
    if (waiterInfoDoc.exists()) {
      return { id: waiterInfoDoc.id, ...waiterInfoDoc.data() };
    } else {
      console.error(`❌ Waiter info not found for ID: ${waiterId}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error getting waiter info ${waiterId}:`, error);
    return null;
  }
};

// Get all waiter info
export const getAllWaiterInfo = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'waiterinfo'));
    const waitersInfo = [];
    querySnapshot.forEach((doc) => {
      waitersInfo.push({ id: doc.id, ...doc.data() });
    });
    
    waitersInfo.sort((a, b) => a.name.localeCompare(b.name));
    
    return waitersInfo;
  } catch (error) {
    console.error('❌ Error getting all waiter info:', error);
    return [];
  }
};

// Assign table to waiter
export const assignTableToWaiter = async (waiterId, tableNumber) => {
  try {
    if (!waiterId || !tableNumber) {
      throw new Error('Waiter ID and table number are required');
    }

    const tableNumberStr = String(tableNumber).trim();
    
    if (!tableNumberStr) {
      throw new Error('Table number cannot be empty');
    }

    const waiterRef = doc(db, 'waiters', waiterId);
    const waiter = await getWaiterById(waiterId);
    
    if (!waiter) {
      throw new Error(`Waiter ${waiterId} not found in database`);
    }

    const currentTables = waiter.currentTables || [];
    
    if (currentTables.includes(tableNumberStr)) {
      return { success: true, message: 'Table already assigned' };
    }

    const updateData = {
      currentTables: [...currentTables, tableNumberStr],
      lastActive: new Date()
    };
    
    await updateDoc(waiterRef, updateData);

    return { success: true, message: 'Table assigned successfully' };
  } catch (error) {
    console.error(`❌ Error assigning table ${tableNumber} to waiter ${waiterId}:`, error);
    return { success: false, message: error.message };
  }
};

// Update waiter info when table is assigned
export const updateWaiterTableAssignment = async (waiterId, tableNumber, action = 'assign') => {
  try {
    const waiterInfo = await getWaiterInfo(waiterId);
    if (!waiterInfo) {
      throw new Error(`Waiter info not found for ID: ${waiterId}`);
    }

    const waiterInfoRef = doc(db, 'waiterinfo', waiterId);
    let currentTables = waiterInfo.tablesAssigned || [];

    if (action === 'assign') {
      if (!currentTables.includes(tableNumber)) {
        currentTables.push(tableNumber);
      }
    } else if (action === 'unassign') {
      currentTables = currentTables.filter(table => table !== tableNumber);
    }

    await updateDoc(waiterInfoRef, {
      tablesAssigned: currentTables,
      lastActive: new Date()
    });

    console.log(`✅ Waiter info updated: ${action} table ${tableNumber} for ${waiterInfo.name}`);
    return { success: true, message: `Table ${action}ed successfully` };
  } catch (error) {
    console.error(`❌ Error updating waiter table assignment:`, error);
    return { success: false, message: error.message };
  }
};

// Enhanced assign table function that updates both collections
export const assignTableToWaiterEnhanced = async (waiterId, tableNumber) => {
  try {
    console.log(`🔄 Enhanced table assignment for waiter ${waiterId}, table ${tableNumber}`);
    
    const assignResult = await assignTableToWaiter(waiterId, tableNumber);
    
    if (!assignResult.success) {
      throw new Error(assignResult.message);
    }
    
    const infoResult = await updateWaiterTableAssignment(waiterId, tableNumber, 'assign');
    
    if (!infoResult.success) {
      console.warn('⚠️ Table assigned but waiter info update failed:', infoResult.message);
    }
    
    const orderResult = await assignWaiterToTableOrder(waiterId, tableNumber);
    
    if (!orderResult.success) {
      console.warn('⚠️ Table assigned but waiter order update failed:', orderResult.message);
    }
    
    return { 
      success: true, 
      message: `Table ${tableNumber} assigned to waiter successfully with all updates` 
    };
    
  } catch (error) {
    console.error(`❌ Error in enhanced table assignment:`, error);
    return { success: false, message: error.message };
  }
};

// Remove table from waiter
export const removeTableFromWaiter = async (waiterId, tableNumber) => {
  try {
    const waiterRef = doc(db, 'waiters', waiterId);
    const waiter = await getWaiterById(waiterId);
    
    if (!waiter) {
      throw new Error('Waiter not found');
    }

    const currentTables = waiter.currentTables || [];
    const updatedTables = currentTables.filter(table => table !== tableNumber);
    
    await updateDoc(waiterRef, {
      currentTables: updatedTables,
      lastActive: new Date()
    });

    return { success: true, message: 'Table removed successfully' };
  } catch (error) {
    console.error('❌ Error removing table:', error);
    return { success: false, message: error.message };
  }
};

// Check if table is assigned to any waiter
export const getTableAssignment = async (tableNumber) => {
  try {
    if (!tableNumber) {
      return { isAssigned: false, waiterId: null, waiterName: null };
    }
    
    const waitersQuery = query(
      collection(db, 'waiters'),
      where('currentTables', 'array-contains', String(tableNumber))
    );
    
    const querySnapshot = await getDocs(waitersQuery);
    
    if (!querySnapshot.empty) {
      const waiterDoc = querySnapshot.docs[0];
      const assignment = {
        isAssigned: true,
        waiterId: waiterDoc.id,
        waiterName: waiterDoc.data().name,
        waiterEmail: waiterDoc.data().email
      };
      return assignment;
    }
    
    return { isAssigned: false, waiterId: null, waiterName: null };
  } catch (error) {
    console.error(`❌ Error checking table assignment for ${tableNumber}:`, error);
    return { isAssigned: false, waiterId: null, waiterName: null };
  }
};

// Delete orders from orders collection with better error handling
export const deleteOrdersFromCollection = async (orders) => {
  try {
    console.log(`🗑️ Attempting to delete ${orders.length} orders from orders collection...`);
    
    let ordersDeleted = 0;
    const deletionErrors = [];
    
    for (const order of orders) {
      try {
        console.log(`🗑️ Attempting to delete order: ${order.id}`);
        const orderRef = doc(db, 'orders', order.id);
        
        // Try to delete directly without checking existence first
        await deleteDoc(orderRef);
        ordersDeleted++;
        console.log(`✅ Successfully deleted order ${order.id} from orders collection`);
        
      } catch (orderError) {
        console.error(`❌ Error deleting order ${order.id}:`, orderError);
        
        // If document doesn't exist, that's fine - count as deleted
        if (orderError.code === 'not-found') {
          console.log(`ℹ️ Order ${order.id} already deleted, counting as success`);
          ordersDeleted++;
        } else {
          deletionErrors.push({ orderId: order.id, error: orderError.message });
        }
        continue;
      }
    }
    
    console.log(`✅ Individual deletion completed: ${ordersDeleted} orders deleted, ${deletionErrors.length} errors`);
    
    return {
      success: deletionErrors.length === 0,
      ordersDeleted: ordersDeleted,
      errors: deletionErrors,
      message: deletionErrors.length === 0 
        ? `Successfully deleted ${ordersDeleted} orders from orders collection`
        : `Deleted ${ordersDeleted} orders with ${deletionErrors.length} errors`
    };
    
  } catch (error) {
    console.error('❌ Error in deleteOrdersFromCollection:', error);
    return {
      success: false,
      message: error.message,
      ordersDeleted: 0,
      errors: [{ error: error.message }]
    };
  }
};

// Delete waiter orders for a specific table
export const deleteWaiterOrders = async (tableNumber) => {
  try {
    console.log(`🗑️ Deleting waiter orders for table ${tableNumber}`);
    
    const waiterOrdersQuery = query(
      collection(db, 'waiter_orders'),
      where('tableNumber', '==', String(tableNumber))
    );
    
    const querySnapshot = await getDocs(waiterOrdersQuery);
    
    let deletedCount = 0;
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      console.log(`🗑️ Deleting waiter order: ${doc.id}`);
      deletedCount++;
    });
    
    if (deletedCount > 0) {
      await batch.commit();
      console.log(`✅ Deleted ${deletedCount} waiter orders for table ${tableNumber}`);
    }
    
    return {
      success: true,
      deletedCount: deletedCount,
      message: `Deleted ${deletedCount} waiter orders`
    };
    
  } catch (error) {
    console.error(`❌ Error deleting waiter orders:`, error);
    return {
      success: false,
      message: error.message,
      deletedCount: 0
    };
  }
};

// NEW: Move waiter orders directly to completed_orders
export const moveWaiterOrdersToCompleted = async (waiterId, tableNumber, waiterOrders) => {
  try {
    console.log(`🔄 Moving waiter orders for table ${tableNumber} to completed_orders`);
    console.log(`📦 Waiter orders to process:`, waiterOrders.map(order => ({ id: order.id, table: order.tableNumber })));
    
    const batch = writeBatch(db);
    const waiter = await getWaiterById(waiterId);
    
    if (!waiter) {
      throw new Error(`Waiter ${waiterId} not found`);
    }

    let ordersMoved = 0;

    for (const waiterOrder of waiterOrders) {
      try {
        // Create completed order in completed_orders collection
        const completedOrderRef = doc(collection(db, 'completed_orders'));
        
        // Use the order data from waiterOrder
        const orderData = waiterOrder.orderData || waiterOrder;
        
        const detailedItems = (orderData.items || []).map(item => ({
          id: item.id || '',
          name: item.name || 'Unknown Item',
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          totalPrice: Number(item.price || 0) * Number(item.quantity || 1),
          type: item.type || 'veg',
          category: item.category || 'main course'
        }));

        const subtotal = detailedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = orderData.tax || subtotal * 0.05;
        const totalAmount = orderData.totalAmount || subtotal + tax;

        const completedOrderData = {
          id: completedOrderRef.id,
          originalOrderId: waiterOrder.id,
          waiterId: waiterId,
          waiterName: waiter.name,
          tableNumber: tableNumber,
          
          items: detailedItems,
          subtotal: subtotal,
          tax: tax,
          totalAmount: totalAmount,
          
          customerPhone: orderData.userPhone || orderData.customerPhone || 'No phone',
          customerName: orderData.customerName || 'Walk-in Customer',
          
          orderType: orderData.orderType || 'dine-in',
          orderDate: orderData.orderDate || new Date(),
          orderReceivedAt: orderData.orderDate || new Date(),
          completedAt: new Date(),
          orderCompletedAt: new Date(),
          
          status: 'served',
          paymentMethod: orderData.paymentMethod || 'cash',
          paymentStatus: 'paid',
          
          notes: orderData.notes || '',
          numberOfGuests: orderData.numberOfGuests || 1,
          
          createdAt: new Date(),
          updatedAt: new Date()
        };

        batch.set(completedOrderRef, completedOrderData);
        console.log(`✅ Added waiter order ${waiterOrder.id} to completed_orders as ${completedOrderRef.id}`);

        ordersMoved++;

      } catch (orderError) {
        console.error(`❌ Error processing waiter order ${waiterOrder.id}:`, orderError);
        continue;
      }
    }

    // Update waiter stats
    const waiterRef = doc(db, 'waiters', waiterId);
    batch.update(waiterRef, {
      totalOrdersServed: (waiter.totalOrdersServed || 0) + ordersMoved,
      lastActive: new Date()
    });

    console.log(`🔄 Committing batch with ${ordersMoved} waiter orders to move...`);
    
    // Commit the batch operation
    await batch.commit();
    
    console.log(`✅ Successfully committed batch. Moved ${ordersMoved} waiter orders from table ${tableNumber} to completed_orders`);
    
    return { 
      success: true, 
      message: `Table ${tableNumber} completed. ${ordersMoved} waiter orders moved to completed orders.`,
      ordersMoved: ordersMoved
    };

  } catch (error) {
    console.error(`❌ Error in batch operation for table ${tableNumber}:`, error);
    console.error('Error details:', error.message, error.code);
    return { success: false, message: error.message };
  }
};

// Complete waiter order and move to completed_orders
export const completeWaiterOrderAndCleanup = async (waiterId, tableNumber, waiterOrders) => {
  try {
    console.log(`🔄 Completing waiter order for table ${tableNumber} and cleaning up`);
    
    // Step 1: Move waiter orders to completed_orders
    const moveResult = await moveWaiterOrdersToCompleted(waiterId, tableNumber, waiterOrders);
    
    if (!moveResult.success) {
      throw new Error(`Failed to move orders: ${moveResult.message}`);
    }
    
    // Step 2: Delete from waiter_orders collection
    const waiterOrdersDeleted = await deleteWaiterOrders(tableNumber);
    
    // Step 3: Update waiter stats
    const totalAmount = waiterOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const statsResult = await updateWaiterOrderStats(waiterId, totalAmount);
    
    // Step 4: Remove table assignment
    const unassignResult = await updateWaiterTableAssignment(waiterId, tableNumber, 'unassign');
    const removeTableResult = await removeTableFromWaiter(waiterId, tableNumber);
    
    console.log(`✅ Table ${tableNumber} completion successful`);
    
    return { 
      success: true, 
      message: `Table ${tableNumber} completed. ${moveResult.ordersMoved} orders processed.`,
      ordersMoved: moveResult.ordersMoved,
      waiterOrdersDeleted: waiterOrdersDeleted.deletedCount,
      totalAmount: totalAmount
    };
    
  } catch (error) {
    console.error(`❌ Error completing waiter order:`, error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

// Move orders from orders collection to completed_orders collection and delete from orders
export const moveOrdersToCompleted = async (waiterId, tableNumber, orders) => {
  try {
    console.log(`🔄 Moving orders for table ${tableNumber} to completed_orders and deleting from orders`);
    console.log(`📦 Orders to process:`, orders.map(order => ({ id: order.id, table: order.tableNumber })));
    
    const batch = writeBatch(db);
    const waiter = await getWaiterById(waiterId);
    
    if (!waiter) {
      throw new Error(`Waiter ${waiterId} not found`);
    }

    let ordersMoved = 0;
    let ordersDeleted = 0;

    for (const order of orders) {
      try {
        // Create completed order in completed_orders collection
        const completedOrderRef = doc(collection(db, 'completed_orders'));
        
        const detailedItems = (order.items || []).map(item => ({
          id: item.id || '',
          name: item.name || 'Unknown Item',
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          totalPrice: Number(item.price || 0) * Number(item.quantity || 1),
          type: item.type || 'veg',
          category: item.category || 'main course'
        }));

        const subtotal = detailedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = order.tax || subtotal * 0.05;
        const totalAmount = subtotal + tax;

        const completedOrderData = {
          id: completedOrderRef.id,
          originalOrderId: order.id,
          waiterId: waiterId,
          waiterName: waiter.name,
          tableNumber: tableNumber,
          
          items: detailedItems,
          subtotal: subtotal,
          tax: tax,
          totalAmount: totalAmount,
          
          customerPhone: order.userPhone || order.customerPhone || 'No phone',
          customerName: order.customerName || 'Walk-in Customer',
          
          orderType: order.orderType || 'dine-in',
          orderDate: order.orderDate || new Date(),
          orderReceivedAt: order.orderDate || new Date(),
          completedAt: new Date(),
          orderCompletedAt: new Date(),
          
          status: 'served',
          paymentMethod: order.paymentMethod || 'cash',
          paymentStatus: 'paid',
          
          notes: order.notes || '',
          numberOfGuests: order.numberOfGuests || 1,
          
          createdAt: new Date(),
          updatedAt: new Date()
        };

        batch.set(completedOrderRef, completedOrderData);
        console.log(`✅ Added order ${order.id} to completed_orders as ${completedOrderRef.id}`);

        // Delete from active orders collection using the correct order ID
        const orderRef = doc(db, 'orders', order.id);
        batch.delete(orderRef);
        console.log(`🗑️ Marked order ${order.id} for deletion from orders collection`);

        ordersMoved++;
        ordersDeleted++;

      } catch (orderError) {
        console.error(`❌ Error processing order ${order.id}:`, orderError);
        continue;
      }
    }

    // Update waiter stats and remove table assignment
    const waiterRef = doc(db, 'waiters', waiterId);
    const currentTables = waiter.currentTables || [];
    const updatedTables = currentTables.filter(table => table !== String(tableNumber));

    batch.update(waiterRef, {
      currentTables: updatedTables,
      totalOrdersServed: (waiter.totalOrdersServed || 0) + ordersMoved,
      lastActive: new Date()
    });

    console.log(`🔄 Committing batch with ${ordersMoved} orders to move and ${ordersDeleted} to delete...`);
    
    // Commit the batch operation
    await batch.commit();
    
    console.log(`✅ Successfully committed batch. Moved ${ordersMoved} orders from table ${tableNumber} to completed_orders and deleted ${ordersDeleted} from orders`);
    
    return { 
      success: true, 
      message: `Table ${tableNumber} completed. ${ordersMoved} orders moved to completed orders and deleted from active orders.`,
      ordersMoved: ordersMoved,
      ordersDeleted: ordersDeleted
    };

  } catch (error) {
    console.error(`❌ Error in batch operation for table ${tableNumber}:`, error);
    console.error('Error details:', error.message, error.code);
    return { success: false, message: error.message };
  }
};

// Force delete all orders for a specific table
export const forceDeleteTableOrders = async (tableNumber) => {
  try {
    console.log(`💥 FORCE DELETING all orders for table ${tableNumber}`);
    
    // Query all orders for this table
    const ordersQuery = query(
      collection(db, 'orders'),
      where('tableNumber', '==', String(tableNumber)),
      where('orderType', '==', 'dine-in')
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    console.log(`📋 Found ${querySnapshot.size} orders to force delete for table ${tableNumber}`);
    
    let deletedCount = 0;
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      console.log(`🗑️ Force deleting order: ${doc.id}`);
      deletedCount++;
    });
    
    if (deletedCount > 0) {
      await batch.commit();
      console.log(`✅ Force deleted ${deletedCount} orders for table ${tableNumber}`);
    }
    
    return {
      success: true,
      deletedCount: deletedCount,
      message: `Force deleted ${deletedCount} orders for table ${tableNumber}`
    };
    
  } catch (error) {
    console.error(`❌ Error in forceDeleteTableOrders:`, error);
    return {
      success: false,
      message: error.message,
      deletedCount: 0
    };
  }
};

// ENHANCED: Complete table with waiter_orders focus
export const completeTableWithAllUpdates = async (waiterId, tableNumber, waiterOrders) => {
  try {
    console.log(`🔄 Enhanced completion for table ${tableNumber} from waiter_orders`);
    console.log(`📦 Processing ${waiterOrders.length} waiter orders`);
    
    // METHOD 1: Move waiter orders to completed_orders and cleanup
    const moveResult = await moveWaiterOrdersToCompleted(waiterId, tableNumber, waiterOrders);
    
    if (!moveResult.success) {
      console.error('❌ Moving waiter orders failed');
      throw new Error(moveResult.message);
    }
    
    // METHOD 2: Delete from waiter_orders collection
    const waiterOrdersDeleted = await deleteWaiterOrders(tableNumber);
    
    // METHOD 3: Update waiter stats
    const totalAmount = waiterOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const statsResult = await updateWaiterOrderStats(waiterId, totalAmount);
    
    // METHOD 4: Remove table assignment
    const unassignResult = await updateWaiterTableAssignment(waiterId, tableNumber, 'unassign');
    const removeTableResult = await removeTableFromWaiter(waiterId, tableNumber);
    
    console.log(`✅ Table ${tableNumber} completion process finished`);
    
    return { 
      success: true, 
      message: `Table ${tableNumber} completed successfully from waiter_orders.`,
      ordersMoved: moveResult.ordersMoved,
      waiterOrdersDeleted: waiterOrdersDeleted.deletedCount,
      totalAmount: totalAmount
    };
    
  } catch (error) {
    console.error(`❌ Error in completeTableWithAllUpdates:`, error);
    
    // Emergency cleanup
    const emergencyWaiterDelete = await deleteWaiterOrders(tableNumber);
    
    return { 
      success: false, 
      message: `Failed to complete table: ${error.message}. Emergency cleanup performed.`,
      waiterOrdersDeleted: emergencyWaiterDelete.deletedCount
    };
  }
};

// Update waiter stats when order is completed
export const updateWaiterOrderStats = async (waiterId, orderAmount) => {
  try {
    const waiterInfo = await getWaiterInfo(waiterId);
    if (!waiterInfo) {
      throw new Error(`Waiter info not found for ID: ${waiterId}`);
    }

    const waiterInfoRef = doc(db, 'waiterinfo', waiterId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = waiterInfo.lastActive?.toDate ? waiterInfo.lastActive.toDate() : new Date(waiterInfo.lastActive);
    const isNewDay = lastActive < today;

    const updateData = {
      ordersServed: (waiterInfo.ordersServed || 0) + 1,
      totalEarnings: (waiterInfo.totalEarnings || 0) + orderAmount,
      lastActive: new Date(),
      performance: {
        todayOrders: isNewDay ? 1 : (waiterInfo.performance?.todayOrders || 0) + 1,
        todayEarnings: isNewDay ? orderAmount : (waiterInfo.performance?.todayEarnings || 0) + orderAmount,
        weeklyAverage: waiterInfo.performance?.weeklyAverage || 0
      }
    };

    await updateDoc(waiterInfoRef, updateData);

    console.log(`✅ Waiter stats updated for ${waiterInfo.name}: +₹${orderAmount}`);
    return { success: true, message: 'Waiter stats updated successfully' };
  } catch (error) {
    console.error(`❌ Error updating waiter order stats:`, error);
    return { success: false, message: error.message };
  }
};

// Get waiter's completed orders
export const getWaiterCompletedOrders = async (waiterId) => {
  try {
    const completedQuery = query(
      collection(db, 'completed_orders'),
      where('waiterId', '==', waiterId)
    );
    
    const querySnapshot = await getDocs(completedQuery);
    const completedOrders = [];
    querySnapshot.forEach((doc) => {
      completedOrders.push({ id: doc.id, ...doc.data() });
    });
    
    completedOrders.sort((a, b) => {
      const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
      const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
      return dateB - dateA;
    });
    
    return completedOrders;
  } catch (error) {
    console.error('❌ Error getting completed orders:', error);
    return [];
  }
};

// Real-time listener for waiter updates
export const subscribeToWaiters = (callback) => {
  try {
    const waitersQuery = collection(db, 'waiters');
    
    return onSnapshot(waitersQuery, 
      (snapshot) => {
        const waiters = [];
        snapshot.forEach((doc) => {
          waiters.push({ id: doc.id, ...doc.data() });
        });
        console.log('👥 Real-time waiters update:', waiters.length, 'waiters');
        callback(waiters);
      },
      (error) => {
        console.error('❌ Real-time waiter listener error:', error);
      }
    );
  } catch (error) {
    console.error('❌ Error setting up real-time waiters listener:', error);
  }
};

// Real-time listener for completed orders
export const subscribeToCompletedOrders = (waiterId, callback) => {
  try {
    if (!waiterId) {
      console.error('❌ No waiter ID provided for completed orders listener');
      return;
    }

    const completedQuery = query(
      collection(db, 'completed_orders'),
      where('waiterId', '==', waiterId)
    );
    
    return onSnapshot(completedQuery, 
      (snapshot) => {
        const completedOrders = [];
        snapshot.forEach((doc) => {
          completedOrders.push({ id: doc.id, ...doc.data() });
        });
        
        completedOrders.sort((a, b) => {
          const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt);
          const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt);
          return dateB - dateA;
        });
        
        console.log('✅ Real-time completed orders update:', completedOrders.length, 'orders');
        callback(completedOrders);
      },
      (error) => {
        console.error('❌ Real-time completed orders listener error:', error);
      }
    );
  } catch (error) {
    console.error('❌ Error setting up real-time completed orders listener:', error);
  }
};

// Create waiter order in waiter_orders collection
export const createWaiterOrder = async (orderData, tableNumber) => {
  try {
    console.log('🔄 Creating waiter order for table:', tableNumber);
    
    const waiterOrderRef = doc(collection(db, 'waiter_orders'));
    
    const waiterOrderData = {
      id: waiterOrderRef.id,
      tableNumber: tableNumber,
      orderId: orderData.id,
      orderData: orderData,
      status: 'pending',
      createdAt: new Date(),
      customerName: orderData.customerName || "Walk-in Customer",
      customerPhone: orderData.userPhone || 'No phone',
      totalAmount: orderData.totalAmount,
      items: orderData.items,
      orderType: orderData.orderType,
      waiterAssigned: false,
      waiterId: null,
      waiterName: null
    };
    
    await setDoc(waiterOrderRef, waiterOrderData);
    
    console.log('✅ Waiter order created:', waiterOrderRef.id);
    return { 
      success: true, 
      message: 'Waiter order created successfully',
      waiterOrderId: waiterOrderRef.id 
    };
  } catch (error) {
    console.error('❌ Error creating waiter order:', error);
    return { success: false, message: error.message };
  }
};

// Assign waiter to table in waiter_orders collection
export const assignWaiterToTableOrder = async (waiterId, tableNumber) => {
  try {
    if (!waiterId || !tableNumber) {
      throw new Error('Waiter ID and table number are required');
    }

    const waiterOrdersQuery = query(
      collection(db, 'waiter_orders'),
      where('tableNumber', '==', String(tableNumber)),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(waiterOrdersQuery);
    
    if (querySnapshot.empty) {
      throw new Error(`No active waiter order found for table ${tableNumber}`);
    }

    const waiterOrderDoc = querySnapshot.docs[0];
    const waiter = await getWaiterById(waiterId);
    
    if (!waiter) {
      throw new Error(`Waiter ${waiterId} not found`);
    }

    await updateDoc(waiterOrderDoc.ref, {
      waiterId: waiterId,
      waiterName: waiter.name,
      waiterAssigned: true,
      status: 'assigned',
      updatedAt: new Date()
    });

    return { 
      success: true, 
      message: `Waiter ${waiter.name} assigned to table ${tableNumber}` 
    };
  } catch (error) {
    console.error(`❌ Error assigning waiter to table order ${tableNumber}:`, error);
    return { success: false, message: error.message };
  }
};

// Complete waiter order (mark as completed)
export const completeWaiterOrder = async (tableNumber, waiterId) => {
  try {
    console.log(`🔄 Completing waiter order for table ${tableNumber}`);
    
    const waiterOrdersQuery = query(
      collection(db, 'waiter_orders'),
      where('tableNumber', '==', String(tableNumber)),
      where('status', '==', 'assigned'),
      where('waiterId', '==', waiterId)
    );
    
    const querySnapshot = await getDocs(waiterOrdersQuery);
    
    if (querySnapshot.empty) {
      throw new Error(`No active waiter order found for table ${tableNumber} assigned to you`);
    }

    const waiterOrderDoc = querySnapshot.docs[0];
    
    await updateDoc(waiterOrderDoc.ref, {
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`✅ Waiter order completed for table ${tableNumber}`);
    return { 
      success: true, 
      message: `Waiter order for table ${tableNumber} completed successfully` 
    };
  } catch (error) {
    console.error(`❌ Error completing waiter order for table ${tableNumber}:`, error);
    return { success: false, message: error.message };
  }
};

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    const waiters = await getAllWaiters();
    const testRef = doc(collection(db, 'connection_test'));
    await setDoc(testRef, {
      test: true,
      timestamp: new Date()
    });
    
    await deleteDoc(testRef);
    
    return { 
      success: true, 
      waitersCount: waiters.length,
      message: `Database connection successful. Found ${waiters.length} waiters.`
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      message: 'Database connection failed.'
    };
  }
};