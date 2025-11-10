import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  getDocs,
  where,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  getAllWaiters, 
  assignTableToWaiter, 
  getTableAssignment,
  subscribeToWaiters,
  getWaiterCompletedOrders,
  subscribeToCompletedOrders,
  assignTableToWaiterEnhanced,
  completeTableWithAllUpdates,
  forceDeleteTableOrders,
  assignWaiterToTableOrder,
  completeWaiterOrder
} from '../utils/waiterService';
import './WaiterDashboard.css';

const WaiterDashboard = () => {
  const [waiterOrders, setWaiterOrders] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const [waiterInfo, setWaiterInfo] = useState(null);
  const [assigningTable, setAssigningTable] = useState(null);
  const [completingTable, setCompletingTable] = useState(null);
  const [tableAssignments, setTableAssignments] = useState({});
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const [forceUpdate, setForceUpdate] = useState(0);
  const navigate = useNavigate();
  
  const unsubscribeRefs = useRef({
    waiterOrders: null,
    waiters: null,
    completed: null
  });

  const triggerUpdate = () => {
    setForceUpdate(prev => prev + 1);
  };

  useEffect(() => {
    const savedWaiter = localStorage.getItem('waiterUser');
    if (!savedWaiter) {
      navigate('/waiter-login');
      return;
    }

    const waiterData = JSON.parse(savedWaiter);
    setWaiterInfo(waiterData);
    initializeDashboard();

    return () => {
      Object.values(unsubscribeRefs.current).forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [navigate]);

  const initializeDashboard = async () => {
    try {
      console.log('🔄 Initializing waiter dashboard...');
      setDebugInfo('Initializing dashboard...');
      
      const allWaiters = await getAllWaiters();
      setWaiters(allWaiters);
      setDebugInfo(prev => prev + '\nWaiters loaded');
      
      if (waiterInfo?.id) {
        const waiterCompletedOrders = await getWaiterCompletedOrders(waiterInfo.id);
        setCompletedOrders(waiterCompletedOrders);
        setDebugInfo(prev => prev + '\nCompleted orders loaded');
      }
      
      setupRealTimeWaiterOrders();
      setupRealTimeWaiters();
      setupRealTimeCompletedOrders();
      
      setLoading(false);
      console.log('✅ Waiter dashboard initialized');
      setDebugInfo(prev => prev + '\nDashboard ready - Real-time active');
      
    } catch (error) {
      console.error('❌ Error initializing dashboard:', error);
      setDebugInfo(prev => prev + `\nError: ${error.message}`);
      setLoading(false);
    }
  };

  // FIXED: Simplified real-time listener - REMOVE the where clause temporarily
  const setupRealTimeWaiterOrders = () => {
    try {
      console.log('🔔 Setting up REAL-TIME WAITER ORDERS listener...');
      
      // FIX: Remove the complex where clause and test with simple query
      const waiterOrdersQuery = query(
        collection(db, 'waiter_orders'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(waiterOrdersQuery, 
        (snapshot) => {
          console.log('🎯 REAL-TIME WAITER ORDERS UPDATE RECEIVED!');
          
          // Filter the data in JavaScript instead of Firestore query
          const allWaiterOrders = snapshot.docs.map(doc => {
            const data = doc.data();
            const orderData = data.orderData || data;
            return {
              id: doc.id,
              ...data,
              orderDate: orderData.orderDate || data.createdAt || new Date(),
              items: orderData.items || data.items || [],
              userPhone: orderData.userPhone || data.customerPhone || 'No phone',
              orderType: orderData.orderType || data.orderType || 'dine-in',
              tableNumber: data.tableNumber || orderData.tableNumber || '',
              subtotal: orderData.subtotal || 0,
              tax: orderData.tax || 0,
              totalAmount: orderData.totalAmount || data.totalAmount || 0,
              status: data.status || 'pending',
              waiterId: data.waiterId || null,
              waiterName: data.waiterName || null,
              customerName: data.customerName || orderData.customerName || 'Walk-in Customer',
              originalOrderData: orderData
            };
          });

          // Filter to only show pending and assigned orders
          const activeWaiterOrders = allWaiterOrders.filter(order => 
            order.status === 'pending' || order.status === 'assigned'
          );
          
          console.log('🍽️ All waiter orders:', allWaiterOrders.length);
          console.log('🍽️ Active waiter orders:', activeWaiterOrders.length);
          setDebugInfo(prev => `All: ${allWaiterOrders.length} | Active: ${activeWaiterOrders.length} | Tables: ${new Set(activeWaiterOrders.map(o => o.tableNumber)).size}`);
          
          // Update state with active orders only
          setWaiterOrders(activeWaiterOrders);
          updateTableAssignmentsImmediately(activeWaiterOrders);
          triggerUpdate();
          
        },
        (error) => {
          console.error('❌ REAL-TIME WAITER ORDERS LISTENER ERROR:', error);
          setDebugInfo(prev => `❌ Listener error: ${error.message}`);
        }
      );

      unsubscribeRefs.current.waiterOrders = unsubscribe;
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up real-time waiter orders:', error);
      setDebugInfo(prev => `❌ Setup error: ${error.message}`);
    }
  };

  const updateTableAssignmentsImmediately = (waiterOrdersData) => {
    try {
      console.log('🔄 Updating table assignments immediately...');
      
      const assignments = {};
      
      // Create assignments directly from waiter orders data
      waiterOrdersData.forEach(order => {
        if (order.tableNumber) {
          const tableNumber = String(order.tableNumber).trim();
          if (order.waiterId) {
            assignments[tableNumber] = {
              isAssigned: true,
              waiterId: order.waiterId,
              waiterName: order.waiterName,
              waiterEmail: order.waiterEmail
            };
          } else if (!assignments[tableNumber]) {
            assignments[tableNumber] = {
              isAssigned: false,
              waiterId: null,
              waiterName: null
            };
          }
        }
      });

      console.log('✅ Immediate table assignments:', Object.keys(assignments));
      setTableAssignments(assignments);
      triggerUpdate();
      
    } catch (error) {
      console.error('❌ Error updating immediate table assignments:', error);
    }
  };

  const setupRealTimeWaiters = () => {
    try {
      console.log('🔔 Setting up real-time waiters listener...');
      
      const unsubscribe = subscribeToWaiters((waitersData) => {
        console.log('👥 Real-time waiters update received:', waitersData.length, 'waiters');
        setWaiters(waitersData);
        triggerUpdate();
      });

      unsubscribeRefs.current.waiters = unsubscribe;
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up real-time waiters:', error);
    }
  };

  const setupRealTimeCompletedOrders = () => {
    if (!waiterInfo?.id) return;
    
    try {
      console.log('🔔 Setting up real-time completed orders listener...');
      
      const unsubscribe = subscribeToCompletedOrders(waiterInfo.id, (completedData) => {
        console.log('✅ Real-time completed orders update:', completedData.length, 'orders');
        setCompletedOrders(completedData);
        triggerUpdate();
      });

      unsubscribeRefs.current.completed = unsubscribe;
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up real-time completed orders:', error);
    }
  };

  const handleAcceptTable = async (tableNumber) => {
    if (!waiterInfo) {
      alert('❌ Waiter information not found. Please login again.');
      return;
    }
    
    setAssigningTable(tableNumber);
    
    try {
      if (!tableNumber || tableNumber === '') {
        alert('❌ Invalid table number');
        setAssigningTable(null);
        return;
      }

      const waiterId = waiterInfo.id;
      
      if (!waiterId) {
        alert('❌ Waiter ID not found. Please login again.');
        setAssigningTable(null);
        return;
      }

      // IMMEDIATE UI UPDATE
      const updatedAssignments = { ...tableAssignments };
      updatedAssignments[tableNumber] = {
        isAssigned: true,
        waiterId: waiterId,
        waiterName: waiterInfo.name,
        waiterEmail: waiterInfo.email
      };
      setTableAssignments(updatedAssignments);
      
      const updatedWaiterOrders = waiterOrders.map(order => 
        order.tableNumber === tableNumber 
          ? { ...order, status: 'assigned', waiterId: waiterId, waiterName: waiterInfo.name }
          : order
      );
      setWaiterOrders(updatedWaiterOrders);
      
      triggerUpdate();

      console.log(`🔄 Assigning table ${tableNumber} to waiter ${waiterInfo.name}...`);

      // Firestore operations
      const assignResult = await assignTableToWaiterEnhanced(waiterId, tableNumber);
      
      if (!assignResult.success) {
        throw new Error(assignResult.message);
      }

      const waiterOrderResult = await assignWaiterToTableOrder(waiterId, tableNumber);
      
      if (waiterOrderResult.success) {
        console.log(`✅ Table ${tableNumber} assignment completed successfully`);
        setDebugInfo(prev => `✅ Table ${tableNumber} assigned to you!`);
      } else {
        console.warn('⚠️ Waiter order assignment had issues:', waiterOrderResult.message);
        setDebugInfo(prev => `⚠️ Assignment completed with warnings`);
      }
      
    } catch (error) {
      console.error('Error accepting table:', error);
      setDebugInfo(prev => `❌ Failed: ${error.message}`);
      
      setTimeout(() => {
        manuallyRefreshWaiterOrders();
      }, 1000);
      
      alert(`❌ Failed to accept table: ${error.message}`);
    } finally {
      setAssigningTable(null);
    }
  };

  const handleCompleteTable = async (tableNumber) => {
    if (!waiterInfo) {
      alert('❌ Waiter information not found. Please login again.');
      return;
    }
    
    setCompletingTable(tableNumber);
    
    try {
      if (!tableNumber || tableNumber === '') {
        alert('❌ Invalid table number');
        setCompletingTable(null);
        return;
      }

      const tableWaiterOrders = getWaiterOrdersByTable()[tableNumber] || [];
      
      if (tableWaiterOrders.length === 0) {
        alert(`❌ No active waiter orders found for table ${tableNumber}`);
        setCompletingTable(null);
        return;
      }

      const waiterId = waiterInfo.id;
      
      if (!waiterId) {
        alert('❌ Waiter ID not found. Please login again.');
        setCompletingTable(null);
        return;
      }

      const confirmComplete = window.confirm(
        `Complete Table ${tableNumber}?\n\n` +
        `This will move ${tableWaiterOrders.length} order(s) to completed orders.`
      );

      if (!confirmComplete) {
        setCompletingTable(null);
        return;
      }

      console.log(`🔄 Completing table ${tableNumber}...`);
      
      // IMMEDIATE UI UPDATE
      removeTableFromUI(tableNumber);

      const result = await completeTableWithAllUpdates(waiterId, tableNumber, tableWaiterOrders);
      
      if (result.success) {
        setDebugInfo(prev => `✅ Table ${tableNumber} completed!`);
        console.log(`✅ Table ${tableNumber} completed successfully`);
      } else {
        console.error('❌ Completion failed:', result.message);
        setDebugInfo(prev => `⚠️ Completion issues: ${result.message}`);
      }
      
    } catch (error) {
      console.error('Error completing table:', error);
      setDebugInfo(prev => `❌ Failed: ${error.message}`);
      
      setTimeout(() => {
        manuallyRefreshWaiterOrders();
      }, 1000);
    } finally {
      setCompletingTable(null);
    }
  };

  const removeTableFromUI = (tableNumber) => {
    const updatedWaiterOrders = waiterOrders.filter(order => 
      String(order.tableNumber).trim() !== String(tableNumber).trim()
    );
    setWaiterOrders(updatedWaiterOrders);
    
    const updatedAssignments = { ...tableAssignments };
    delete updatedAssignments[tableNumber];
    setTableAssignments(updatedAssignments);
    
    console.log(`🗑️ Removed table ${tableNumber} from UI`);
    triggerUpdate();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('waiterUser');
      navigate('/waiter-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const manuallyRefreshWaiterOrders = async () => {
    try {
      console.log('🔄 Manual refresh triggered...');
      setDebugInfo(prev => '🔄 Refreshing data...');
      
      const waiterOrdersQuery = query(collection(db, 'waiter_orders'));
      
      const snapshot = await getDocs(waiterOrdersQuery);
      const allWaiterOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter in JavaScript
      const activeWaiterOrders = allWaiterOrders.filter(order => 
        order.status === 'pending' || order.status === 'assigned'
      );
      
      console.log('📋 Manual refresh - All:', allWaiterOrders.length, 'Active:', activeWaiterOrders.length);
      setWaiterOrders(activeWaiterOrders);
      updateTableAssignmentsImmediately(activeWaiterOrders);
      setDebugInfo(prev => `✅ Refreshed: ${activeWaiterOrders.length} active orders`);
      
    } catch (error) {
      console.error('❌ Manual refresh error:', error);
      setDebugInfo(prev => `❌ Refresh failed: ${error.message}`);
    }
  };

  // NEW: Debug function to check what's in waiter_orders
  const debugCurrentWaiterOrders = async () => {
    try {
      console.log('🔍 Checking current waiter_orders...');
      const waiterOrdersQuery = query(collection(db, 'waiter_orders'));
      const snapshot = await getDocs(waiterOrdersQuery);
      
      console.log(`📋 Total documents in waiter_orders: ${snapshot.size}`);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📋 Order ${doc.id}:`, {
          tableNumber: data.tableNumber,
          status: data.status,
          waiterId: data.waiterId,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          items: data.items?.length || data.orderData?.items?.length || 0
        });
      });
      
      alert(`Found ${snapshot.size} waiter orders. Check console for details.`);
    } catch (error) {
      console.error('❌ Error checking waiter orders:', error);
      alert('Error checking waiter orders');
    }
  };

  const getWaiterOrdersByTable = () => {
    const tableWaiterOrders = {};
    
    waiterOrders.forEach(order => {
      if (order.tableNumber) {
        const tableNumber = String(order.tableNumber).trim();
        if (!tableWaiterOrders[tableNumber]) {
          tableWaiterOrders[tableNumber] = [];
        }
        tableWaiterOrders[tableNumber].push(order);
      }
    });
    
    return tableWaiterOrders;
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getTotalForTable = (tableNumber) => {
    const tableWaiterOrders = getWaiterOrdersByTable()[tableNumber] || [];
    return tableWaiterOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  const getWaiterTotalEarnings = () => {
    return completedOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  const getTodaysCompletedOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return completedOrders.filter(order => {
      const orderDate = order.completedAt?.toDate ? order.completedAt.toDate() : new Date(order.completedAt);
      return orderDate >= today;
    });
  };

  if (loading) {
    return (
      <div className="waiter-dashboard">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <h3>Loading Waiter Dashboard...</h3>
          <p>Setting up real-time connections...</p>
        </div>
      </div>
    );
  }

  const tableWaiterOrders = getWaiterOrdersByTable();
  const allTables = Object.keys(tableWaiterOrders).sort();
  const todaysCompletedOrders = getTodaysCompletedOrders();

  return (
    <div className="waiter-dashboard" key={forceUpdate}>
      {/* Enhanced Debug Panel */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000,
        maxWidth: '350px'
      }}>
        <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#00ff88' }}>
          🔄 Live Updates Active
        </div>
        <div style={{ marginBottom: '3px' }}>
          <strong>Active Orders:</strong> {waiterOrders.length}
        </div>
        <div style={{ marginBottom: '3px' }}>
          <strong>Tables:</strong> {allTables.length}
        </div>
        <div style={{ fontSize: '10px', color: '#ccc', marginBottom: '8px' }}>
          {debugInfo}
        </div>
        <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
          <button 
            onClick={manuallyRefreshWaiterOrders}
            style={{
              padding: '5px',
              fontSize: '10px',
              background: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh Data
          </button>
          <button 
            onClick={debugCurrentWaiterOrders}
            style={{
              padding: '5px',
              fontSize: '10px',
              background: '#9b59b6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔍 Check Orders
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Waiter Dashboard - SRC Cafe</h1>
          <p>Welcome, <strong>{waiterInfo?.name || waiterInfo?.email}</strong></p>
          <div className="connection-status">
            <span className="status-dot online"></span>
            <span>Real-time Active - {waiterOrders.length} orders, {allTables.length} tables</span>
          </div>
        </div>
        
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="navigation-tabs">
        <button 
          className={`nav-tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          📋 Active Orders ({waiterOrders.length})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Completed ({completedOrders.length})
        </button>
      </div>

      {/* Live Orders View */}
      {activeTab === 'live' && (
        <div className="tables-container">
          {allTables.length === 0 ? (
            <div className="no-tables">
              <div className="no-tables-icon">🪑</div>
              <h3>No active tables</h3>
              <p>New tables will appear here automatically when customers place orders</p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                <strong>Debug:</strong> Check if orders are being created in waiter_orders collection
              </p>
            </div>
          ) : (
            <div className="tables-grid">
              {allTables.map(tableNumber => {
                const tableAssignment = tableAssignments[tableNumber];
                const isAssignedToMe = tableAssignment?.waiterId === waiterInfo?.id;
                const isAssignedToOther = tableAssignment?.isAssigned && !isAssignedToMe;
                const tableWaiterOrdersList = tableWaiterOrders[tableNumber] || [];

                return (
                  <div key={tableNumber} className="table-card">
                    <div className="table-header">
                      <h3 className="table-title">Table {tableNumber}</h3>
                      <div className="table-status">
                        {isAssignedToMe && (
                          <span className="assigned-to-me">✅ Assigned to You</span>
                        )}
                        {isAssignedToOther && (
                          <span className="assigned-to-other">👤 {tableAssignment.waiterName}</span>
                        )}
                        {!tableAssignment?.isAssigned && (
                          <span className="available">🟢 Available</span>
                        )}
                      </div>
                    </div>

                    <div className="table-orders">
                      <h4>Orders ({tableWaiterOrdersList.length}):</h4>
                      {tableWaiterOrdersList.map(order => (
                        <div key={order.id} className="table-order-item">
                          <div className="order-time">
                            {getTimeAgo(order.orderDate)}
                          </div>
                          <div className="order-items-summary">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="order-item-line">
                                <span className="item-name">{item.name}</span>
                                <span className="item-quantity">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="order-status">
                            {order.status === 'pending' && '🆕 New'}
                            {order.status === 'assigned' && '👤 Assigned'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="table-total">
                      <strong>Total: ₹{getTotalForTable(tableNumber).toFixed(2)}</strong>
                    </div>

                    <div className="table-actions">
                      {!tableAssignment?.isAssigned && (
                        <button 
                          className={`action-btn accept-btn ${assigningTable === tableNumber ? 'loading' : ''}`}
                          onClick={() => handleAcceptTable(tableNumber)}
                          disabled={assigningTable === tableNumber}
                        >
                          {assigningTable === tableNumber ? '🔄 Accepting...' : 'Accept Table'}
                        </button>
                      )}
                      
                      {isAssignedToMe && (
                        <button 
                          className={`action-btn complete-btn ${completingTable === tableNumber ? 'loading' : ''}`}
                          onClick={() => handleCompleteTable(tableNumber)}
                          disabled={completingTable === tableNumber}
                        >
                          {completingTable === tableNumber ? '🔄 Completing...' : 'Complete Table'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Completed Orders View */}
      {activeTab === 'completed' && (
        <div className="history-container">
          {completedOrders.length === 0 ? (
            <div className="no-history">
              <div className="no-history-icon">📊</div>
              <h3>No completed orders yet</h3>
            </div>
          ) : (
            <div className="history-list">
              <h3>Completed Orders ({completedOrders.length})</h3>
              <div className="orders-timeline">
                {completedOrders.map(order => (
                  <div key={order.id} className="history-order-card">
                    <div className="history-order-header">
                      <h4>Table {order.tableNumber}</h4>
                      <div className="order-amount">
                        ₹{order.totalAmount?.toFixed(2)}
                      </div>
                    </div>
                    <div className="order-items-history">
                      {order.items?.map((item, index) => (
                        <div key={index} className="history-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaiterDashboard;