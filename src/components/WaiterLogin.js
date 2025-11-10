import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getWaiterById, getAllWaiters } from '../utils/waiterService';
import './WaiterLogin.css';

const WaiterLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Login attempt with:', { email, password });

      // Check if it's a waiter email
      if (!email.includes('@restaurant.com')) {
        setError('Please use waiter email address (@restaurant.com)');
        setLoading(false);
        return;
      }

      // Get waiter ID from email
      const waiterId = email.split('@')[0]; // ram@restaurant.com -> ram
      console.log('📋 Extracted waiter ID:', waiterId);
      
      // First, check if waiter exists in waiters collection
      const waiterData = await getWaiterById(waiterId);
      console.log('📋 Waiter data from collection:', waiterData);
      
      if (!waiterData) {
        setError('Waiter profile not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      // Check if password matches (simple validation for demo)
      if (password !== waiterData.password) {
        setError('Invalid password. Please try again.');
        setLoading(false);
        return;
      }

      // Try Firebase authentication
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('✅ Firebase auth success:', user.uid);
      } catch (firebaseError) {
        console.log('⚠️ Firebase auth failed, trying manual login:', firebaseError.message);
        
        // If Firebase auth fails, we'll use manual authentication
        // This handles cases where waiters aren't in Firebase Auth but are in Firestore
        console.log('🔄 Using manual authentication...');
      }

      // Store waiter info with waiter data (manual auth)
      const waiterUser = {
        uid: `waiter-${waiterId}`, // Generate a manual UID
        id: waiterId, // This is the waiter ID from waiters collection
        email: email,
        name: waiterData.name,
        role: 'waiter',
        loginTime: new Date().toISOString(),
        manualAuth: true // Flag for manual authentication
      };

      localStorage.setItem('waiterUser', JSON.stringify(waiterUser));

      console.log('✅ Waiter logged in manually:', waiterUser.name);
      navigate('/waiter-dashboard');

    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', error.code, error.message);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format';
      case 'auth/user-disabled':
        return 'Account disabled';
      case 'auth/user-not-found':
        return 'Waiter not found in authentication system';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later';
      default:
        return 'Login failed. Using manual authentication...';
    }
  };

  const goToMain = () => {
    navigate('/');
  };

  // Quick login for testing
  const quickLogin = (waiterEmail, waiterPassword) => {
    setEmail(waiterEmail);
    setPassword(waiterPassword);
  };

  return (
    <div className="waiter-login-page">
      {/* Background */}
      <div className="login-background">
        <div className="background-overlay"></div>
      </div>

      {/* Back Button */}
      <button className="back-button" onClick={goToMain}>
        ← Back to Main
      </button>

      {/* Login Form */}
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Waiter Login</h1>
            <p>Access your orders dashboard</p>
          </div>

          {error && (
            <div className={`error-message ${error.includes('manual') ? 'warning' : ''}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Waiter Email</label>
              <input
                id="email"
                type="email"
                placeholder="ram@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In as Waiter'
              )}
            </button>
          </form>

          {/* Quick Login Buttons for Testing */}
          <div className="quick-login-section">
            <h3>Quick Login (Testing):</h3>
            <div className="quick-login-buttons">
              <button 
                className="quick-btn ram"
                onClick={() => quickLogin('ram@restaurant.com', 'ram123')}
              >
                Login as Ram
              </button>
              <button 
                className="quick-btn sanjay"
                onClick={() => quickLogin('sanjay@restaurant.com', 'sanjay123')}
              >
                Login as Sanjay
              </button>
              <button 
                className="quick-btn arun"
                onClick={() => quickLogin('arun@restaurant.com', 'arun123')}
              >
                Login as Arun
              </button>
            </div>
          </div>

          <div className="login-info">
            <h3>Waiter Accounts:</h3>
            <div className="demo-accounts">
              <p><strong>Ram:</strong> ram@restaurant.com / ram123</p>
              <p><strong>Sanjay:</strong> sanjay@restaurant.com / sanjay123</p>
              <p><strong>Arun:</strong> arun@restaurant.com / arun123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterLogin;