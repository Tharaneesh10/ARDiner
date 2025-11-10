import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Your existing functions
export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const isAdmin = (role) => role === 'admin';
export const isWaiter = (role) => role === 'waiter';

// Phone-based authentication functions
export const checkUserExists = async (phoneNumber) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

export const getUserByPhone = async (phoneNumber) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    return null;
  }
};

export const createUserWithPhone = async (phoneNumber) => {
  try {
    const userRef = doc(collection(db, 'users'));
    const userData = {
      phoneNumber: phoneNumber,
      createdAt: new Date(),
      cart: [],
      orderHistory: [],
      lastLogin: new Date()
    };
    
    await setDoc(userRef, userData);
    
    return {
      id: userRef.id,
      ...userData
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const signInWithPhone = async (phoneNumber) => {
  try {
    // Check if user exists
    let user = await getUserByPhone(phoneNumber);
    
    if (!user) {
      // Create new user if doesn't exist
      user = await createUserWithPhone(phoneNumber);
    } else {
      // Update last login for existing user
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error in phone sign in:', error);
    throw error;
  }
};

// Enhanced Cart management functions
export const getUserCart = async (userId) => {
  try {
    console.log('🔄 Getting cart for user:', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      let cart = userData.cart || [];
      
      // Clean the cart data when retrieving
      cart = cart.map(item => ({
        id: String(item.id || ''),
        name: String(item.name || ''),
        price: Number(item.price || 0),
        image: String(item.image || ''),
        quantity: Number(item.quantity || 1),
        type: String(item.type || 'veg'),
        category: String(item.category || '')
      })).filter(item => item.id && item.name); // Remove items without ID or name
      
      console.log('✅ Cleaned cart retrieved from Firestore:', cart);
      return cart;
    } else {
      console.log('❌ User document does not exist:', userId);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting user cart:', error);
    return [];
  }
};

// Deep clean function to remove all undefined values
const deepCleanObject = (obj) => {
  if (obj === null || obj === undefined) return null;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepCleanObject(item)).filter(item => item !== null && item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = deepCleanObject(value);
      if (cleanedValue !== null && cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  
  return obj;
};

export const updateUserCart = async (userId, cartItems) => {
  try {
    console.log('🔄 updateUserCart called with:', { userId, cartItems });
    
    if (!userId) {
      throw new Error('No user ID provided');
    }

    // Deep clean the cart data
    const cleanedCartItems = cartItems.map(item => ({
      id: String(item.id || ''),
      name: String(item.name || ''),
      price: Number(item.price || 0),
      image: String(item.image || ''),
      quantity: Number(item.quantity || 1),
      type: String(item.type || 'veg'),
      category: String(item.category || '')
    })).filter(item => item.id && item.name); // Remove items without ID or name

    console.log('🧹 Deep cleaned cart items:', cleanedCartItems);

    const userRef = doc(db, 'users', userId);
    
    const updateData = deepCleanObject({
      cart: cleanedCartItems,
      cartUpdatedAt: new Date(),
      lastCartSync: new Date()
    });

    console.log('📦 Final data to save:', updateData);
    
    await updateDoc(userRef, updateData);
    console.log('✅ Cart successfully updated in Firestore');
    
    // Update localStorage with cleaned data too
    localStorage.setItem('restaurantCart', JSON.stringify(cleanedCartItems));
    
    return true;
    
  } catch (error) {
    console.error('❌ updateUserCart error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    throw error;
  }
};

// Clear user's cart after order
export const clearUserCart = async (userId) => {
  try {
    console.log('🔄 Clearing user cart for:', userId);
    
    const userRef = doc(db, 'users', userId);
    
    // First check if user document exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        cart: [],
        cartUpdatedAt: new Date(),
        lastCartSync: new Date()
      });
      console.log('✅ User cart cleared in Firestore');
    } else {
      console.log('⚠️ User document does not exist, nothing to clear');
    }
    
    // Clear localStorage
    localStorage.removeItem('restaurantCart');
    localStorage.removeItem('currentTable');
    
    console.log('✅ Local storage cleared');
    
  } catch (error) {
    console.error('❌ Error clearing user cart:', error);
    throw error;
  }
};

// Order management functions
export const createOrder = async (orderData) => {
  try {
    console.log('🔄 Creating order:', orderData);
    
    const orderRef = doc(collection(db, 'orders'));
    
    // Clean order data
    const cleanedOrderData = deepCleanObject({
      ...orderData,
      id: orderRef.id,
      createdAt: new Date(),
      status: 'confirmed',
      orderNumber: 'ORD' + Date.now().toString().slice(-6)
    });
    
    console.log('📦 Cleaned order data to save:', cleanedOrderData);
    
    await setDoc(orderRef, cleanedOrderData);
    console.log('✅ Order created successfully with ID:', orderRef.id);
    
    return cleanedOrderData;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};