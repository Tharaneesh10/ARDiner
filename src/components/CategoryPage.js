import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { updateUserCart, getUserCart } from '../utils/auth';
import FoodARViewer from './FoodARViewer';
import './CategoryPage.css';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [arActive, setArActive] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [animateTitle, setAnimateTitle] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const orderType = location.state?.orderType || 'dine-in';

  useEffect(() => {
    initializeUserAndCart();
    fetchCategoriesAndMenuItems();
  }, []);

  useEffect(() => {
    setAnimateTitle(true);
    const timer = setTimeout(() => setAnimateTitle(false), 600);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

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

  const forceSaveCart = async (userId, cartItems) => {
    try {
      const cleanedCartItems = cartItems.map(item => ({
        id: String(item.id || ''),
        name: String(item.name || ''),
        price: Number(item.price || 0),
        image: String(item.image || ''),
        quantity: Number(item.quantity || 1),
        type: String(item.type || 'veg'),
        category: String(item.category || '')
      })).filter(item => item.id && item.name);

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      const cartData = deepCleanObject({
        cart: cleanedCartItems,
        cartUpdatedAt: new Date(),
        lastCartSync: new Date()
      });

      if (userDoc.exists()) {
        await updateDoc(userRef, cartData);
      } else {
        await setDoc(userRef, {
          ...cartData,
          phoneNumber: currentUser?.phoneNumber || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          orderHistory: []
        });
      }

      return true;
    } catch {
      return false;
    }
  };

  const initializeUserAndCart = async () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        const userId = user.uid || user.id;
        if (userId) {
          const userCart = await getUserCart(userId);
          if (userCart && userCart.length > 0) {
            setCart(userCart);
            localStorage.setItem('restaurantCart', JSON.stringify(userCart));
          } else {
            const localCart = localStorage.getItem('restaurantCart');
            setCart(localCart ? JSON.parse(localCart) : []);
          }
        }
      } catch {
        const localCart = localStorage.getItem('restaurantCart');
        setCart(localCart ? JSON.parse(localCart) : []);
      }
    } else {
      const savedCart = localStorage.getItem('restaurantCart');
      setCart(savedCart ? JSON.parse(savedCart) : []);
    }
    setCartLoaded(true);
  };

  useEffect(() => {
    if (cartLoaded && cart.length >= 0) {
      localStorage.setItem('restaurantCart', JSON.stringify(cart));
      if (currentUser) {
        const userId = currentUser.uid || currentUser.id;
        if (userId) {
          updateUserCart(userId, cart).catch(() => forceSaveCart(userId, cart));
        }
      }
    }
  }, [cart, currentUser, cartLoaded]);

  const fetchCategoriesAndMenuItems = async () => {
    try {
      setLoading(true);
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData.sort((a, b) => a.order - b.order));

      const menuItemsSnapshot = await getDocs(collection(db, 'menuItems'));
      const menuItemsData = menuItemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(menuItemsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    const cartItem = deepCleanObject({
      id: String(item.id || ''),
      name: String(item.name || ''),
      price: Number(item.price || 0),
      image: String(item.image || ''),
      quantity: 1,
      type: String(item.type || 'veg'),
      category: String(item.category || '')
    });

    if (!cartItem.id || !cartItem.name) return;

    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    } else {
      newCart = [...cart, cartItem];
    }

    setCart(newCart);
    localStorage.setItem('restaurantCart', JSON.stringify(newCart));

    if (currentUser) {
      const userId = currentUser.uid || currentUser.id;
      if (userId) {
        await updateUserCart(userId, newCart).catch(() => forceSaveCart(userId, newCart));
      }
    }

    alert(`✅ ${item.name} added to cart!`);
  };

  const handleARView = (item) => {
    if (!item.model3D) {
      alert('3D model not available for this item');
      return;
    }

    setSelectedFood({ name: item.name, model: item.model3D });
    setArActive(true);
  };

  const handleBackFromAR = () => {
    setArActive(false);
    setSelectedFood(null);
  };

  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const goToCart = () => {
    navigate('/cart', {
      state: { cart, orderType, user: currentUser }
    });
  };

  const getImageUrl = (item) =>
    imageErrors[item.id] ? getFallbackImage(item.type) : (item.image || getFallbackImage(item.type));

  const handleImageError = (itemId) => setImageErrors(prev => ({ ...prev, [itemId]: true }));

  const getFallbackImage = (type) => {
    const fallbackImages = {
      'VEG': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%2328a745"/><text x="150" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle">VEG IMAGE</text></svg>',
      'NON-VEG': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%23dc3545"/><text x="150" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle">NON-VEG IMAGE</text></svg>'
    };
    return fallbackImages[type] || fallbackImages['VEG'];
  };

  const handleCategoryClick = (categoryId) => setSelectedCategory(categoryId);

  const getFilteredMenuItems = () => {
    let filteredItems = menuItems;
    if (selectedCategory !== 'all') {
      filteredItems = filteredItems.filter(item => item.categoryId === selectedCategory);
    }
    if (searchTerm) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredItems;
  };

  const handleBack = () => navigate('/');

  if (arActive && selectedFood) {
    return <FoodARViewer foodModel={selectedFood.model} foodName={selectedFood.name} onBack={handleBackFromAR} />;
  }

  if (loading) {
    return (
      <div className="category-page">
        <div className="loading">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="video-background">
        <div className="background-overlay"></div>
      </div>

      <button className="back-button" onClick={handleBack}>← Back to Main</button>

      <div className="category-header">
        <h1>Our Menu</h1>
        <p className="order-type-badge">{orderType.toUpperCase().replace('-', ' ')}</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="category-tabs">
        <button
          className={`tab-button ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('all')}
        >
          All Items
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            className={`tab-button ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart-floating-button" onClick={goToCart}>
          <div className="cart-icon">🛒</div>
          <div className="cart-count">{getTotalItems()}</div>
          <div className="cart-total">₹{getTotalPrice()}</div>
        </div>
      )}

      <div className="menu-items-section">
        <h2 className={`section-title ${animateTitle ? 'fade-slide' : ''}`}>
          {selectedCategory === 'all'
            ? 'Explore Our Delicious Menu'
            : categories.find(cat => cat.id === selectedCategory)?.name}
        </h2>

        <div className="menu-items-grid">
          {getFilteredMenuItems().map(item => (
            <div key={item.id} className="menu-item-card">
              <div className="item-image">
                <img
                  src={getImageUrl(item)}
                  alt={item.name}
                  onError={() => handleImageError(item.id)}
                  loading="lazy"
                  className="menu-item-image"
                />
                {/* Removed item-type-badge here */}
                {item.model3D && <div className="model-available-badge">3D Model Available</div>}
              </div>
              <div className="item-content">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <div className="item-footer">
                  <span className="item-price">₹{item.price}</span>
                  <div className="item-actions">
                    <button className="add-to-cart-btn" onClick={() => handleAddToCart(item)}>Add to Cart</button>
                    {item.model3D && (
                      <button className="ar-view-btn" onClick={() => handleARView(item)}>
                        👁️ View in AR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {getFilteredMenuItems().length === 0 && (
          <div className="no-items">
            <p>No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
