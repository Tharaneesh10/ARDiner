import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPhone, getUserCart } from '../utils/auth';
import foodPreparationVideo from '../assets/backgrounds/food-preparation.mp4';
import './Login.css';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const valid = phoneNumber.length === 10 && /^[6-9]\d{9}$/.test(phoneNumber);
    setIsValid(valid);
    if (phoneNumber.length > 0 && error) setError('');
  }, [phoneNumber, error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setError('Please enter a valid 10-digit phone number starting with 6-9');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = `+91${phoneNumber}`;
      const user = await signInWithPhone(formattedPhone);

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        try {
          const userCart = await getUserCart(user.id);
          localStorage.setItem('restaurantCart', JSON.stringify(userCart || []));
        } catch {
          localStorage.setItem('restaurantCart', JSON.stringify([]));
        }
        navigate('/menu', { state: { user } });
      }
    } catch (error) {
      setError(`Login failed: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left: Glass box */}
      <div className="login-left">
        <div className="glass-form">
          <h2 className="welcome-title">Welcome to SRC Cafe</h2>
          <p className="welcome-sub">Enter your phone number to continue</p>

          <form onSubmit={handleLogin}>
            <div className="phone-input-container">
              <span className="country-code">+91</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) setPhoneNumber(value);
                }}
                placeholder="Enter 10-digit number"
                maxLength="10"
                required
                className="phone-input"
                disabled={loading}
              />
            </div>

            {phoneNumber.length > 0 && (
              <div className={`phone-validation ${isValid ? 'valid' : 'invalid'}`}>
                {isValid
                  ? '✅ Valid phone number'
                  : '❌ Please enter a valid phone number'}
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="login-button"
              disabled={loading || !isValid}
            >
              {loading ? 'Processing...' : 'Continue to Menu'}
            </button>
          </form>
        </div>
      </div>

      {/* Right: Video background with gradient & text overlay */}
      <div className="login-right">
        <video autoPlay loop muted playsInline className="background-video">
          <source src={foodPreparationVideo} type="video/mp4" />
        </video>
        <div className="video-overlay-gradient"></div>
        <div className="video-text">
          <h1>AR Dining <span>Vision</span></h1>
          <p>"Experience the food before you order."</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
