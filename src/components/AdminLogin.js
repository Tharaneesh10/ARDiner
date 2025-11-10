import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import './AdminLogin.css';

const AdminLogin = () => {
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
      console.log('🔄 Admin login attempt:', { email });

      // Check if it's an admin email
      if (!email.includes('@admin.com')) {
        setError('Please use admin email address (@admin.com)');
        setLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify admin role
      if (email === 'admin@admin.com') {
        const adminUser = {
          uid: user.uid,
          email: user.email,
          role: 'admin',
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        console.log('✅ Admin logged in successfully');
        navigate('/admin-dashboard');
      } else {
        setError('Access denied. Admin privileges required.');
      }

    } catch (error) {
      console.error('❌ Admin login error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'Account disabled';
      case 'auth/user-not-found':
        return 'Admin not found';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later';
      default:
        return 'Login failed. Please try again';
    }
  };

  const goToMain = () => {
    navigate('/');
  };

  return (
    <div className="admin-login-page">
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
            <h1>Admin Login</h1>
            <p>Access restaurant management system</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                id="email"
                type="email"
                placeholder="admin@admin.com"
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
                placeholder="Enter admin password"
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
                'Sign In as Admin'
              )}
            </button>
          </form>

          <div className="login-info">
            <h3>Admin Account:</h3>
            <div className="demo-accounts">
              <p><strong>Email:</strong> admin@admin.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;