import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { 
  collection, 
  onSnapshot,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  Timestamp
} from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminInfo, setAdminInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    if (!savedAdmin) {
      navigate('/admin-login');
      return;
    }
    setAdminInfo(JSON.parse(savedAdmin));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  };

  if (!adminInfo) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <p>SRC Cafe</p>
          <div className="admin-info">
            <small>{adminInfo.email}</small>
          </div>
        </div>
        
        <nav className="admin-nav">
          <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </button>
          <button className={`nav-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            🍽️ Menu Management
          </button>
          <button className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            📋 Completed Orders
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'orders' && <CompletedOrders />}
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    categories: 0,
    completedOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const menuItemsSnapshot = await getDocs(collection(db, 'menuItems'));
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const completedOrdersSnapshot = await getDocs(collection(db, 'completed_orders'));

        const totalRevenue = completedOrdersSnapshot.docs.reduce((sum, doc) => {
          return sum + (doc.data().totalAmount || 0);
        }, 0);

        setStats({
          totalItems: menuItemsSnapshot.size,
          categories: categoriesSnapshot.size,
          completedOrders: completedOrdersSnapshot.size,
          totalRevenue: totalRevenue
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-overview">
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Menu Items</h3>
          <p className="stat-number">{stats.totalItems}</p>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <p className="stat-number">{stats.categories}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Orders</h3>
          <p className="stat-number">{stats.completedOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

// Menu Management Component with Full CRUD
const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for menu items
    const unsubscribeMenu = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(items);
      setLoading(false);
    });

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();

    return () => unsubscribeMenu();
  }, []);

  const handleAddItem = async (newItem) => {
    try {
      await addDoc(collection(db, 'menuItems'), {
        ...newItem,
        price: parseInt(newItem.price),
        available: true,
        createdAt: new Date(),
        createdBy: 'admin'
      });
      setShowAddForm(false);
      alert('✅ Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('❌ Error adding item: ' + error.message);
    }
  };

  const handleEditItem = async (updatedItem) => {
    try {
      const itemRef = doc(db, 'menuItems', updatedItem.id);
      await updateDoc(itemRef, {
        name: updatedItem.name,
        price: parseInt(updatedItem.price),
        categoryId: updatedItem.categoryId,
        description: updatedItem.description,
        image: updatedItem.image,
        type: updatedItem.type,
        available: updatedItem.available,
        updatedAt: new Date()
      });
      setEditingItem(null);
      alert('✅ Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('❌ Error updating item: ' + error.message);
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        await deleteDoc(doc(db, 'menuItems', itemId));
        alert('✅ Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('❌ Error deleting item: ' + error.message);
      }
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const itemRef = doc(db, 'menuItems', item.id);
      await updateDoc(itemRef, {
        available: !item.available,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('❌ Error updating availability: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="menu-management">
      <div className="section-header">
        <h1>Menu Management</h1>
        <button 
          className="btn-primary" 
          onClick={() => setShowAddForm(true)}
        >
          + Add New Item
        </button>
      </div>

      {showAddForm && (
        <MenuItemForm 
          categories={categories}
          onSave={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingItem && (
        <MenuItemForm 
          item={editingItem}
          categories={categories}
          onSave={handleEditItem}
          onCancel={() => setEditingItem(null)}
        />
      )}

      <div className="menu-items-list">
        {menuItems.length === 0 ? (
          <div className="no-items">
            <div className="no-items-icon">🍽️</div>
            <h3>No menu items found</h3>
            <p>Add your first menu item to get started</p>
          </div>
        ) : (
          <div className="items-grid">
            {menuItems.map(item => (
              <div key={item.id} className="menu-item-card">
                <div className="item-image">
                  <img 
                    src={item.image || 'https://via.placeholder.com/300x200/666666/white?text=No+Image'} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200/666666/white?text=No+Image';
                    }}
                  />
                  <span className={`availability-badge ${item.available ? 'available' : 'unavailable'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description || 'No description available'}</p>
                  <div className="item-meta">
                    <span className="price">₹{item.price}</span>
                    <span className="category">{item.categoryId}</span>
                    <span className={`type ${item.type}`}>
                      {item.type === 'veg' ? '🥬 Veg' : '🍗 Non-Veg'}
                    </span>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => setEditingItem(item)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className={`btn-toggle ${item.available ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleAvailability(item)}
                    >
                      {item.available ? '🚫 Disable' : '✅ Enable'}
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteItem(item.id, item.name)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Menu Item Form Component
const MenuItemForm = ({ item, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState(item || {
    name: '',
    price: '',
    categoryId: '',
    description: '',
    image: '',
    type: 'veg',
    available: true
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-overlay">
      <form className="menu-item-form" onSubmit={handleSubmit}>
        <h3>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
        
        <div className="form-group">
          <label>Item Name *</label>
          <input
            type="text"
            placeholder="Enter item name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              type="number"
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Food Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="veg">🥬 Vegetarian</option>
              <option value="non-veg">🍗 Non-Vegetarian</option>
            </select>
          </div>

          <div className="form-group">
            <label>Availability</label>
            <select
              value={formData.available}
              onChange={(e) => setFormData({...formData, available: e.target.value === 'true'})}
            >
              <option value={true}>✅ Available</option>
              <option value={false}>🚫 Unavailable</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Enter item description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            placeholder="Enter image URL (optional)"
            value={formData.image}
            onChange={(e) => setFormData({...formData, image: e.target.value})}
          />
          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
          </button>
        </div>
      </form>
    </div>
  );
};

// Completed Orders Component
const CompletedOrders = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterWaiter, setFilterWaiter] = useState('');
  const [filterTable, setFilterTable] = useState('');

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const ordersQuery = query(
          collection(db, 'completed_orders'),
          orderBy('completedAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Remove duplicates based on order ID
          const uniqueOrders = removeDuplicateOrders(ordersData);
          setCompletedOrders(uniqueOrders);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching completed orders:', error);
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, []);

  // Function to remove duplicate orders
  const removeDuplicateOrders = (orders) => {
    const seen = new Set();
    return orders.filter(order => {
      // Use order ID as unique identifier
      if (seen.has(order.id)) {
        return false;
      }
      seen.add(order.id);
      return true;
    });
  };

  // Filter orders based on criteria
  const filteredOrders = completedOrders.filter(order => {
    const matchesDate = !filterDate || 
      (order.completedAt && new Date(order.completedAt.toDate ? order.completedAt.toDate() : order.completedAt).toDateString() === new Date(filterDate).toDateString());
    
    const matchesWaiter = !filterWaiter || 
      (order.waiterName && order.waiterName.toLowerCase().includes(filterWaiter.toLowerCase()));
    
    const matchesTable = !filterTable || 
      (order.tableNumber && order.tableNumber.toString().includes(filterTable));

    return matchesDate && matchesWaiter && matchesTable;
  });

  // Calculate statistics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = filteredOrders.length;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const exportToPDF = (order) => {
    const doc = new jsPDF();
    
    // Set margins and initial position
    const margin = 20;
    let yPosition = margin;
    
    // Restaurant Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('SRC Cafe', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Address: Perundurai, Erode', margin, yPosition);
    yPosition += 6;
    doc.text('Phone: 999-999-9999', margin, yPosition);
    yPosition += 15;
    
    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, 190, yPosition);
    yPosition += 10;
    
    // Order Information - Only essential details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('ORDER RECEIPT', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Order ID: ${order.id.substring(0, 12)}...`, margin, yPosition);
    yPosition += 6;
    doc.text(`Customer: ${order.customerName || 'Walk-in Customer'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Phone: ${order.customerPhone || 'No phone'}`, margin, yPosition);
    yPosition += 10;
    
    // Items Table Header
    doc.setFont(undefined, 'bold');
    doc.text('No', margin, yPosition);
    doc.text('Item', margin + 15, yPosition);
    doc.text('Qty', 140, yPosition);
    doc.text('Price', 170, yPosition);
    yPosition += 8;
    
    // Add line under header
    doc.setLineWidth(0.2);
    doc.line(margin, yPosition, 190, yPosition);
    yPosition += 10;
    
    // Order Items
    doc.setFont(undefined, 'normal');
    (order.items || []).forEach((item, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }
      
      // Item number
      doc.text(`${index + 1}`, margin, yPosition);
      
      // Item name (with word wrap)
      const itemName = item.name || 'Unknown Item';
      const maxWidth = 100;
      const lines = doc.splitTextToSize(itemName, maxWidth);
      
      // If item name wraps to multiple lines, adjust positioning
      if (lines.length > 1) {
        doc.text(lines, margin + 15, yPosition);
        yPosition += (lines.length * 5) + 2;
      } else {
        doc.text(itemName, margin + 15, yPosition);
        yPosition += 7;
      }
      
      // Quantity and Price on the same line
      doc.text(`x${item.quantity || 1}`, 140, yPosition - (lines.length > 1 ? (lines.length * 5) : 0));
      const itemPrice = item.totalPrice || (item.price * item.quantity) || 0;
      doc.text(`₹${itemPrice}`, 170, yPosition - (lines.length > 1 ? (lines.length * 5) : 0));
    });
    
    yPosition += 10;
    
    // Add total line
    doc.line(margin, yPosition, 190, yPosition);
    yPosition += 10;
    
    // Order Summary
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 140, yPosition);
    doc.text(`₹${order.totalAmount?.toFixed(2) || '0.00'}`, 170, yPosition);
    yPosition += 15;
    
    // Payment Method
    doc.setFont(undefined, 'normal');
    doc.text(`Payment Method: ${order.paymentMethod || 'Cash'}`, margin, yPosition);
    yPosition += 10;
    
    // Order Timing
    const formatTimeForPDF = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    };
    
    doc.text(`Order Placed: ${formatTimeForPDF(order.orderDate || order.createdAt)}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Completed: ${formatTimeForPDF(order.completedAt || order.orderCompletedAt)}`, margin, yPosition);
    
    // Footer
    yPosition += 15;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Thank you for dining with us!', margin, yPosition);
    yPosition += 4;
    doc.text('Visit again!', margin, yPosition);
    
    // Save the PDF
    doc.save(`SRC-Cafe-Receipt-${order.tableNumber || 'TAKEAWAY'}-${order.id.substring(0, 8)}.pdf`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Loading completed orders...</p>
      </div>
    );
  }

  return (
    <div className="completed-orders">
      <div className="section-header">
        <h1>Completed Orders</h1>
        <div className="orders-stats">
          <div className="stat-badge">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{totalOrders}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">₹{totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Filter by Waiter:</label>
          <input
            type="text"
            placeholder="Enter waiter name"
            value={filterWaiter}
            onChange={(e) => setFilterWaiter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Filter by Table:</label>
          <input
            type="text"
            placeholder="Enter table number"
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
          />
        </div>
        <button 
          className="btn-secondary"
          onClick={() => {
            setFilterDate('');
            setFilterWaiter('');
            setFilterTable('');
          }}
        >
          Clear Filters
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📋</div>
          <h3>No completed orders found</h3>
          <p>{completedOrders.length === 0 ? 'No orders have been completed yet.' : 'No orders match your filters.'}</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Table {order.tableNumber || 'N/A'}</h3>
                  <div className="order-meta">
                    <span className="order-id">ID: {order.id.substring(0, 12)}...</span>
                    <span className="order-time">{formatDate(order.completedAt)}</span>
                  </div>
                </div>
                <div className="order-amount">
                  <div className="total-amount">₹{order.totalAmount?.toFixed(2) || '0.00'}</div>
                  <div className="waiter-info">👤 {order.waiterName || 'Unknown Waiter'}</div>
                </div>
              </div>

              <div className="order-details">
                <div className="customer-info">
                  <span><strong>Customer:</strong> {order.customerName || 'Walk-in Customer'}</span>
                  <span><strong>Phone:</strong> {order.customerPhone || 'No phone'}</span>
                  <span><strong>Payment:</strong> {order.paymentMethod || 'Cash'}</span>
                </div>

                <div className="order-items">
                  <h4>Order Items:</h4>
                  <div className="items-list">
                    {(order.items || []).map((item, index) => (
                      <div key={index} className="order-item">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">₹{item.totalPrice || (item.price * item.quantity)}</span>
                        <span className={`item-type ${item.type}`}>
                          {item.type === 'veg' ? '🥬' : '🍗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax:</span>
                    <span>₹{order.tax?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="summary-row total">
                    <span><strong>Total:</strong></span>
                    <span><strong>₹{order.totalAmount?.toFixed(2) || '0.00'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="order-actions">
                <button 
                  className="btn-primary"
                  onClick={() => exportToPDF(order)}
                >
                  📄 Export PDF
                </button>
                <div className="order-timing">
                  <small>
                    {order.orderReceivedAt && `Received: ${formatTime(order.orderReceivedAt)}`}
                    {order.orderCompletedAt && ` • Completed: ${formatTime(order.orderCompletedAt)}`}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;