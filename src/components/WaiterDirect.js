import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getWaiterById } from '../utils/waiterService';
import './WaiterDirect.css';

const WaiterDirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    autoLoginWaiter();
  }, []);

  const autoLoginWaiter = async () => {
    try {
      // Pre-defined waiter credentials
      const waiterCredentials = [
        { email: 'ram@restaurant.com', password: 'ram123', waiterId: 'ram' },
        { email: 'sanjay@restaurant.com', password: 'sanjay123', waiterId: 'sanjay' },
        { email: 'arun@restaurant.com', password: 'arun123', waiterId: 'arun' },
      ];

      let loggedIn = false;
      let successfulWaiter = null;

      // Try each waiter credential until one works
      for (const credential of waiterCredentials) {
        try {
          console.log(`🔄 Trying to login as: ${credential.email}`);
          const userCredential = await signInWithEmailAndPassword(
            auth, 
            credential.email, 
            credential.password
          );
          
          const user = userCredential.user;

          // Get waiter data from waiters collection
          const waiterData = await getWaiterById(credential.waiterId);
          
          if (!waiterData) {
            console.error(`❌ Waiter data not found for: ${credential.waiterId}`);
            continue;
          }

          // Store waiter info with both auth and waiter data
          const waiterUser = {
            uid: user.uid,
            id: credential.waiterId, // This is the waiter ID from waiters collection
            email: user.email,
            name: waiterData.name,
            role: 'waiter',
            loginTime: new Date().toISOString(),
            autoLogin: true
          };

          localStorage.setItem('waiterUser', JSON.stringify(waiterUser));

          console.log('✅ Auto-logged in as:', waiterUser.name);
          loggedIn = true;
          successfulWaiter = waiterUser;
          break; // Stop trying once successful

        } catch (err) {
          console.log(`❌ Failed with ${credential.email}:`, err.message);
          continue; // Try next credential
        }
      }

      if (loggedIn) {
        // Small delay to show success message
        setTimeout(() => {
          navigate('/waiter-dashboard');
        }, 1000);
      } else {
        setError('All waiter accounts are unavailable. Please contact administrator.');
        setLoading(false);
      }

    } catch (error) {
      console.error('❌ Auto-login failed:', error);
      setError('Automatic login failed. Please use manual login.');
      setLoading(false);
    }
  };

  const goToManualLogin = () => {
    navigate('/waiter-login');
  };

  const goToCustomerSite = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="waiter-direct-container">
        <div className="loading-section">
          <div className="loading-spinner-large"></div>
          <h2>Waiter Dashboard</h2>
          <p>Logging you in automatically...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="waiter-direct-container">
        <div className="error-section">
          <div className="error-icon">⚠️</div>
          <h2>Auto-Login Failed</h2>
          <p className="error-message">{error}</p>
          <div className="action-buttons">
            <button onClick={goToManualLogin} className="btn btn-primary">
              Manual Waiter Login
            </button>
            <button onClick={goToCustomerSite} className="btn btn-secondary">
              Customer Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WaiterDirect;