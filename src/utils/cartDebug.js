import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const debugCartIssue = async (userId, phoneNumber) => {
  console.log('=== CART DEBUG START ===');
  console.log('User ID:', userId);
  console.log('Phone Number:', phoneNumber);
  
  try {
    // Check if user document exists
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('✅ User document exists');
      console.log('User data:', userDoc.data());
    } else {
      console.log('❌ User document does not exist');
    }
    
    // Test write permission
    const testData = {
      testField: `Test at ${new Date().toISOString()}`,
      testUpdatedAt: new Date()
    };
    
    await updateDoc(userRef, testData);
    console.log('✅ Write permission test: SUCCESS');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
  
  console.log('=== CART DEBUG END ===');
};

export const forceSaveCart = async (userId, cartItems) => {
  try {
    console.log('🔄 Force saving cart for user:', userId);
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const cartData = {
      cart: cartItems,
      cartUpdatedAt: new Date(),
      lastCartSync: new Date()
    };
    
    if (userDoc.exists()) {
      await updateDoc(userRef, cartData);
      console.log('✅ Cart force saved (update)');
    } else {
      // Create user document with all required fields
      await setDoc(userRef, {
        ...cartData,
        phoneNumber: '', // Will be updated
        createdAt: new Date(),
        lastLogin: new Date(),
        orderHistory: []
      });
      console.log('✅ Cart force saved (create)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Force save failed:', error);
    return false;
  }
};