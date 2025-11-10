import { updateUserCart, getUserCart } from './auth';

export const syncCartToFirestore = async (user, cart) => {
  if (!user) {
    console.log('👤 No user logged in, skipping Firestore sync');
    return false;
  }

  const userId = user.uid || user.id;
  if (!userId) {
    console.log('❌ No user ID available for Firestore sync');
    return false;
  }

  try {
    console.log('🔄 Syncing cart to Firestore for user:', userId);
    await updateUserCart(userId, cart);
    console.log('✅ Cart synced to Firestore');
    return true;
  } catch (error) {
    console.error('❌ Cart sync failed:', error);
    return false;
  }
};

export const loadCartFromFirestore = async (user) => {
  if (!user) {
    console.log('👤 No user logged in, loading from localStorage');
    const localCart = localStorage.getItem('restaurantCart');
    return localCart ? JSON.parse(localCart) : [];
  }

  const userId = user.uid || user.id;
  if (!userId) {
    console.log('❌ No user ID available, loading from localStorage');
    const localCart = localStorage.getItem('restaurantCart');
    return localCart ? JSON.parse(localCart) : [];
  }

  try {
    console.log('🔄 Loading cart from Firestore for user:', userId);
    const firestoreCart = await getUserCart(userId);
    
    if (firestoreCart && firestoreCart.length > 0) {
      console.log('✅ Cart loaded from Firestore:', firestoreCart);
      localStorage.setItem('restaurantCart', JSON.stringify(firestoreCart));
      return firestoreCart;
    } else {
      // Fallback to localStorage
      const localCart = localStorage.getItem('restaurantCart');
      const parsedCart = localCart ? JSON.parse(localCart) : [];
      console.log('📦 Using localStorage cart (Firestore empty):', parsedCart);
      return parsedCart;
    }
  } catch (error) {
    console.error('❌ Error loading cart from Firestore:', error);
    // Fallback to localStorage
    const localCart = localStorage.getItem('restaurantCart');
    const parsedCart = localCart ? JSON.parse(localCart) : [];
    console.log('📦 Using localStorage cart (Firestore error):', parsedCart);
    return parsedCart;
  }
};

export const forceCartSync = async (user) => {
  const localCart = localStorage.getItem('restaurantCart');
  if (!localCart) return false;

  try {
    const cart = JSON.parse(localCart);
    return await syncCartToFirestore(user, cart);
  } catch (error) {
    console.error('❌ Error in force cart sync:', error);
    return false;
  }
};