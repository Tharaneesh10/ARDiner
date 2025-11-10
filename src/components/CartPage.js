import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  arrayUnion, 
  getDoc, 
  setDoc,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../utils/auth';
import { clearUserCart, updateUserCart, getUserCart } from '../utils/auth';
import './CartPage.css';

const CartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [user, setUser] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Loading cart page data...');
    loadUserCart();
    
    if (location.state?.user) {
      setUser(location.state.user);
    } else if (currentUser) {
      setUser(currentUser);
    } else {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
    }
    
    if (location.state?.orderType) {
      setOrderType(location.state.orderType);
    }
    
    const savedTable = localStorage.getItem('currentTable');
    if (savedTable) {
      setTableNumber(savedTable);
    }
    
    // Check if we're coming from a successful order with cart cleared
    if (location.state?.cartCleared) {
      console.log('🔄 Cart was cleared in previous order, ensuring empty state');
      setCart([]);
      localStorage.removeItem('restaurantCart');
    }
    
    console.log('✅ Cart page initialized');
  }, [location, currentUser]);

  // Load cart from Firestore based on user phone number
  const loadUserCart = async () => {
    try {
      const effectiveUser = currentUser || user;
      
      if (effectiveUser) {
        const userId = effectiveUser.uid || effectiveUser.id;
        if (userId) {
          console.log('🔄 Loading cart from Firestore for user:', userId);
          const firestoreCart = await getUserCart(userId);
          
          if (firestoreCart && firestoreCart.length > 0) {
            console.log('✅ Cart loaded from Firestore:', firestoreCart);
            setCart(firestoreCart);
            localStorage.setItem('restaurantCart', JSON.stringify(firestoreCart));
          } else {
            // Fallback to localStorage
            const savedCart = localStorage.getItem('restaurantCart');
            if (savedCart) {
              const parsedCart = JSON.parse(savedCart);
              console.log('📦 Cart from localStorage:', parsedCart);
              setCart(parsedCart);
            }
          }
        }
      } else {
        // No user, load from localStorage only
        const savedCart = localStorage.getItem('restaurantCart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('📦 Cart from localStorage (no user):', parsedCart);
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error('❌ Error loading user cart:', error);
      // Fallback to localStorage
      const savedCart = localStorage.getItem('restaurantCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem('currentTable', tableNumber);
    }
  }, [tableNumber]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('restaurantCart', JSON.stringify(updatedCart));
    
    // Update Firestore in background
    if (user) {
      const userId = user.uid || user.id;
      if (userId) {
        try {
          await updateUserCart(userId, updatedCart);
          console.log('✅ Cart updated in Firestore');
        } catch (error) {
          console.error('❌ Error updating cart in Firestore:', error);
        }
      }
    }
  };

  const removeFromCart = async (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('restaurantCart', JSON.stringify(updatedCart));
    
    // Update Firestore in background
    if (user) {
      const userId = user.uid || user.id;
      if (userId) {
        try {
          await updateUserCart(userId, updatedCart);
          console.log('✅ Cart updated in Firestore after removal');
        } catch (error) {
          console.error('❌ Error updating cart in Firestore:', error);
        }
      }
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTaxAmount = () => {
    return getTotalPrice() * 0.05;
  };

  const getGrandTotal = () => {
    return getTotalPrice() + getTaxAmount();
  };

  // Create waiter order with proper structure
  const createWaiterOrder = async (orderData, tableNumber) => {
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
      return waiterOrderRef.id;
    } catch (error) {
      console.error('❌ Error creating waiter order:', error);
      throw error;
    }
  };

  const handleConfirmOrder = async () => {
    const effectiveUser = currentUser || user;
    
    if (!effectiveUser) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (orderType === 'dine-in' && !tableNumber.trim()) {
      alert('Please enter your table number');
      return;
    }

    if (orderType === 'dine-in' && !/^\d+$/.test(tableNumber.trim())) {
      alert('Please enter a valid table number');
      return;
    }

    setIsConfirming(true);

    try {
      const userId = effectiveUser.uid || effectiveUser.id;
      if (!userId) {
        throw new Error('No user ID found');
      }

      console.log('👤 Creating order for user:', userId);
      console.log('📦 Current cart before order:', cart);
      
      const generatedOrderId = generateOrderId();
      setOrderId(generatedOrderId);
      
      // Create proper order data structure
      const orderData = {
        id: generatedOrderId,
        userId: userId,
        userPhone: effectiveUser.phoneNumber || effectiveUser.phone || 'No phone',
        customerName: "Walk-in Customer",
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          type: item.type || 'veg',
          category: item.category || '',
          image: item.image || '',
          totalPrice: Number((item.price * item.quantity).toFixed(2))
        })),
        subtotal: Number(getTotalPrice().toFixed(2)),
        tax: Number(getTaxAmount().toFixed(2)),
        totalAmount: Number(getGrandTotal().toFixed(2)),
        orderType: orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber.trim() : 'Take Away',
        status: 'confirmed',
        orderDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        orderNumber: 'ORD' + Date.now().toString().slice(-6)
      };

      console.log('📦 Order data to save:', orderData);

      // STEP 1: Save to orders collection
      try {
        const orderRef = await addDoc(collection(db, 'orders'), orderData);
        console.log('✅ Order saved to orders collection:', orderRef.id);
        
        await setDoc(doc(db, 'orders', generatedOrderId), orderData);
        console.log('✅ Order also saved with ID:', generatedOrderId);
      } catch (orderError) {
        console.error('❌ Failed to save to orders collection:', orderError);
        throw orderError;
      }

      // STEP 2: Save to user's orderHistory
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          orderHistory: arrayUnion({
            ...orderData,
            firestoreId: generatedOrderId,
            savedAt: new Date()
          })
        });
        console.log('✅ Order added to user orderHistory');
      } catch (userOrderError) {
        console.error('❌ Failed to save to user orderHistory:', userOrderError);
        // Continue even if this fails
      }

      // STEP 3: Create waiter order ONLY for dine-in
      if (orderType === 'dine-in') {
        try {
          const waiterOrderId = await createWaiterOrder(orderData, tableNumber.trim());
          console.log('✅ Waiter order created with ID:', waiterOrderId);
        } catch (waiterOrderError) {
          console.error('❌ Failed to create waiter order:', waiterOrderError);
          // Continue even if this fails
        }
      }

      // STEP 4: CLEAR CART - ENHANCED CLEARING
      console.log('🧹 Starting cart clearing process...');
      
      try {
        // Clear from Firestore first
        console.log('🔥 Clearing from Firestore...');
        await clearUserCart(userId);
        
        // Clear from React state
        console.log('⚛️ Clearing from React state...');
        setCart([]);
        
        // Clear from localStorage
        console.log('💾 Clearing from localStorage...');
        localStorage.removeItem('restaurantCart');
        localStorage.removeItem('currentTable');
        
        // Clear any session storage
        sessionStorage.removeItem('restaurantCart');
        
        console.log('✅ Cart cleared from all sources');
        console.log('📦 Cart state after clearing:', []); // Should be empty
        
      } catch (clearError) {
        console.error('❌ Error during cart clearing:', clearError);
        // Even if clearing fails, we should still proceed
      }

      const successMessage = `✅ Order confirmed!\nOrder ID: ${generatedOrderId}\nTable: ${tableNumber || 'Take Away'}\nTotal: ₹${getGrandTotal().toFixed(2)}`;
      console.log('🎉 ' + successMessage);
      
      // Show success message
      alert(successMessage);
      
      // Navigate after a short delay to ensure state updates
      setTimeout(() => {
        console.log('🧭 Navigating to category page...');
        console.log('📦 Final cart state before navigation:', cart);
        
        navigate('/category', { 
          state: { 
            orderConfirmed: true,
            orderId: generatedOrderId,
            orderType: orderType,
            cartCleared: true // Add this flag
          } 
        });
      }, 500);
      
    } catch (error) {
      console.error('❌ Error confirming order:', error);
      
      let errorMessage = 'Failed to confirm order. Please try again.';
      
      if (error.message.includes('No user ID found')) {
        errorMessage = 'User session expired. Please login again.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Database permission denied. Please contact admin.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      alert(`❌ ${errorMessage}\n\nDebug: ${error.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  const generateOrderId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleBackToMenu = () => {
    navigate('/category', { 
      state: { 
        orderType: orderType,
        user: user
      } 
    });
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <button className="back-button" onClick={handleBackToMenu}>
            ← Back to Menu
          </button>
          <h1>Your Cart</h1>
        </div>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items from our menu</p>
          <button className="continue-shopping-btn" onClick={handleBackToMenu}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="back-button" onClick={handleBackToMenu}>
          ← Back to Menu
        </button>
        <h1>Your Cart</h1>
        <div className="order-type-badge">
          {orderType.toUpperCase().replace('-', ' ')}
        </div>
      </div>

      <div className="order-info-section">
        <div className="order-type-display">
          <h3>Order Type: <span className="order-type-value">{orderType.toUpperCase().replace('-', ' ')}</span></h3>
        </div>
        
        {orderType === 'dine-in' && (
          <div className="table-input-section">
            <label htmlFor="tableNumber" className="table-label">
              Table Number *
            </label>
            <input
              id="tableNumber"
              type="text"
              placeholder="Enter your table number (e.g., 5, 12, 23)"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value.replace(/\D/g, ''))}
              className="table-input"
              maxLength="3"
            />
            {!tableNumber && (
              <p className="table-help-text">Please enter your table number to continue</p>
            )}
          </div>
        )}
        
        {orderType === 'take-away' && (
          <div className="takeaway-notice">
            <p>🛍️ Your order will be prepared for take away</p>
          </div>
        )}
      </div>

      {user && (
        <div className="user-info-section">
          <p className="user-info-display">
            Ordering for: {user.phoneNumber || user.phone || 'Guest'}
          </p>
        </div>
      )}

      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="item-image">
              <img 
                src={item.image || '/placeholder-food.jpg'} 
                alt={item.name}
                className="cart-item-image"
              />
              <div className={`item-type-badge ${item.type?.toLowerCase() === 'veg' ? 'veg' : 'non-veg'}`}>
                {item.type || 'VEG'}
              </div>
            </div>
            
            <div className="item-details">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-price">₹{item.price}</p>
              {item.category && (
                <p className="item-category">{item.category}</p>
              )}
            </div>
            
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            
            <div className="item-total">
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>
            
            <button 
              className="remove-btn"
              onClick={() => removeFromCart(item.id)}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Items ({getTotalItems()}):</span>
          <span>₹{getTotalPrice().toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (5%):</span>
          <span>₹{getTaxAmount().toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total Amount:</span>
          <span>₹{getGrandTotal().toFixed(2)}</span>
        </div>
        
        <div className="order-confirmation-section">
          {orderType === 'dine-in' && tableNumber && (
            <div className="table-confirmation">
              <p>✅ You are ordering for <strong>Table {tableNumber}</strong></p>
            </div>
          )}
          
          <button 
            className="confirm-order-btn"
            onClick={handleConfirmOrder}
            disabled={isConfirming || (orderType === 'dine-in' && !tableNumber)}
          >
            {isConfirming ? (
              <>
                <div className="loading-spinner"></div>
                Confirming Order...
              </>
            ) : (
              `Confirm Order - ₹${getGrandTotal().toFixed(2)}`
            )}
          </button>
          
          {orderType === 'dine-in' && !tableNumber && (
            <p className="validation-error">
              ⚠️ Please enter your table number to confirm order
            </p>
          )}
          
          <p className="order-note">
            Your order will be saved to order history and cart will be cleared
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;