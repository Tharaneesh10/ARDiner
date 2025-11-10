import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainMenu.css";
import backgroundVideo from "../assets/backgrounds/restaurant-ambiance.mp4";

const MainMenu = () => {
  const navigate = useNavigate();
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    "Good food is the foundation of genuine happiness.",
    "Where every meal tells a story.",
    "Taste the difference, feel the excellence.",
    "A culinary journey for your senses.",
    "Creating memories, one dish at a time."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDineIn = () => {
    navigate("/category", { state: { orderType: "dine-in" } });
  };

  const handleTakeAway = () => {
    navigate("/category", { state: { orderType: "take-away" } });
  };

  return (
    <div className="main-menu">
      {/* Background Video */}
      <video autoPlay muted loop playsInline className="menu-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Overlay & gradient */}
      <div className="menu-overlay"></div>

      {/* Floating animated particles */}
      <div className="menu-particles">
        {[...Array(20)].map((_, i) => (
          <span key={i} className="particle" />
        ))}
      </div>

      {/* Main Content */}
      <div className="menu-content">
        <div className="menu-header">
          <h1 className="cafe-name">SRC Café</h1>
          <h3 className="cafe-subtitle">Augmented Reality Dining</h3>

          {/* Quote Animation */}
          <div className="menu-quote">
            <p key={currentQuote} className="fade-quote">
              “{quotes[currentQuote]}”
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="menu-buttons">
          <button className="menu-btn dine-in" onClick={handleDineIn}>
            <div className="btn-icon">🍽️</div>
            <div className="btn-text">Dine-In</div>
            <p>Experience the ambiance</p>
          </button>

          <button className="menu-btn take-away" onClick={handleTakeAway}>
            <div className="btn-icon">🥡</div>
            <div className="btn-text">Take Away</div>
            <p>Enjoy from anywhere</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
