import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './MenuItems.css';

const MenuItems = ({ selectedCategory, onAddToCart }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      let q;
      
      if (selectedCategory === 'all') {
        q = query(collection(db, 'menuItems'));
      } else {
        q = query(
          collection(db, 'menuItems'), 
          where('categoryId', '==', selectedCategory)
        );
      }

      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      setMenuItems(items);
      console.log('Fetched menu items:', items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleARView = (item) => {
    if (item.model3D) {
      navigate('/ar-view', { 
        state: { 
          foodModel: item.model3D, 
          foodName: item.name 
        } 
      });
    } else {
      alert('3D model not available for this item');
    }
  };

  const handleAddToCart = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
    } else {
      console.log('Added to cart:', item);
      alert(`Added ${item.name} to cart!`);
    }
  };

  const getImageUrl = (item) => {
    if (imageErrors[item.id]) {
      return getFallbackImage(item.type);
    }
    
    if (!item.image) {
      return getFallbackImage(item.type);
    }
    
    return item.image;
  };

  const handleImageError = (itemId, event) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const getFallbackImage = (type) => {
    const fallbackImages = {
      'VEG': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%2328a745"/><text x="150" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle">VEG</text></svg>',
      'NON-VEG': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23dc3545"/><text x="150" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle">NON-VEG</text></svg>',
      'veg': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%2328a745"/><text x="150" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle">VEG</text></svg>',
      'non-veg': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23dc3545"/><text x="150" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle">NON-VEG</text></svg>',
    };
    return fallbackImages[type] || fallbackImages['VEG'];
  };

  if (loading) {
    return <div className="loading">Loading menu items...</div>;
  }

  return (
    <div className="menu-items-container">
      <h2 className="section-title">
        {selectedCategory === 'all' 
          ? 'All Items' 
          : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Items`
        }
      </h2>
      
      {menuItems.length === 0 ? (
        <div className="no-items">
          <div className="no-items-icon">🍽️</div>
          <h3>No items found</h3>
          <p>No menu items available in this category.</p>
        </div>
      ) : (
        <div className="menu-items-grid">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-item-card">
              <div className="item-image-container">
                <img 
                  src={getImageUrl(item)} 
                  alt={item.name} 
                  className="item-image"
                  onError={(e) => handleImageError(item.id, e)}
                  loading="lazy"
                />
                <div className={`item-type-badge ${item.type?.toLowerCase() === 'non-veg' ? 'non-veg' : 'veg'}`}>
                  {item.type ? item.type.toUpperCase() : 'VEG'}
                </div>
                
                {item.model3D && (
                  <div className="model-available-badge">
                    <span>3D</span>
                  </div>
                )}
              </div>
              
              <div className="item-details">
                <div className="item-header">
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-price">₹{item.price}</div>
                </div>
                
                <p className="item-description">{item.description}</p>
                
                <div className="item-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    <span className="cart-icon">🛒</span>
                    Add to Cart
                  </button>
                  
                  {item.model3D && (
                    <button 
                      className="ar-view-btn"
                      onClick={() => handleARView(item)}
                    >
                      <span className="ar-icon">👁️</span>
                      AR View
                    </button>
                  )}
                </div>

                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="debug-info">
                    Model: {item.model3D ? '✅ Available' : '❌ Missing'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItems;