import React, { useState, useRef, useEffect } from 'react';
import './FoodARViewer.css';

const FoodARViewer = ({ foodModel, foodName, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const videoRef = useRef(null);
  const modelContainerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    console.log('🔄 FoodARViewer loaded:', { foodModel, foodName });
    
    return () => {
      stopCamera();
    };
  }, [foodModel, foodName]);

  const startCamera = async () => {
    try {
      setLoading(true);
      setError(null);

      // Stop existing camera if any
      stopCamera();

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setCameraActive(true);
              setLoading(false);
              console.log('📷 Camera started successfully');
            })
            .catch(playError => {
              console.warn('Play warning:', playError);
              setCameraActive(true);
              setLoading(false);
            });
        };
      }

    } catch (err) {
      console.error('Camera error:', err);
      setError(`Camera access denied. Please allow camera permissions. Error: ${err.message}`);
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleModelLoad = () => {
    console.log('✅ Model loaded successfully');
    setModelLoaded(true);
  };

  const handleModelError = (event) => {
    console.error('❌ Model error:', event);
    setError(`Failed to load 3D model: ${foodModel}`);
  };

  const handleRetry = () => {
    setError(null);
    if (cameraActive) {
      startCamera();
    }
  };

  // Fixed: Remove the problematic optional chaining assignment
  const resetModel = () => {
    if (modelContainerRef.current) {
      modelContainerRef.current.style.transform = 'scale(1)';
    }
  };

  return (
    <div className="ar-container">
      {/* Header */}
      <div className="ar-header">
        <button className="ar-back-button" onClick={onBack}>
          ← Back
        </button>
        <h2 className="ar-title">AR View: {foodName}</h2>
        
        {!cameraActive ? (
          <button className="start-ar-btn" onClick={startCamera}>
            📷 Start Camera
          </button>
        ) : (
          <button className="stop-ar-btn" onClick={stopCamera}>
            ❌ Stop Camera
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="ar-loading">
          <div className="loading-spinner"></div>
          <h3>Starting Camera...</h3>
          <p>Please allow camera permissions when prompted</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="ar-error">
          <h3>⚠️ Camera Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-btn">
              Try Again
            </button>
            <button onClick={onBack} className="back-btn">
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Camera View with 3D Model */}
      {cameraActive && !loading && !error && (
        <div className="ar-camera-view">
          {/* Camera Feed - Full Screen */}
          <video
            ref={videoRef}
            className="camera-feed"
            playsInline
            muted
            autoPlay
          />
          
          {/* 3D Model Container - Positioned over camera */}
          <div 
            className="model-container"
            ref={modelContainerRef}
          >
            <model-viewer
              src={foodModel}
              alt={`3D model of ${foodName}`}
              auto-rotate
              camera-controls
              shadow-intensity="2"
              exposure="2"
              environment-image="neutral"
              camera-orbit="0deg 75deg 2m"
              field-of-view="30deg"
              interaction-prompt="none"
              ar
              ar-modes="webxr"
              onLoad={handleModelLoad}
              onError={handleModelError}
              style={{
                width: '300px',
                height: '300px',
                backgroundColor: 'transparent'
              }}
            >
              {/* Loading indicator */}
              <div slot="progress-bar" className="model-progress">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>

              {/* AR Button */}
              <button slot="ar-button" className="model-ar-button">
                👆 Tap to Place in AR
              </button>
            </model-viewer>
          </div>

          {/* AR Instructions */}
          <div className="ar-instructions">
            <div className="instruction-card">
              <h3>🎯 AR Instructions</h3>
              <div className="instruction-steps">
                <div className="step">
                  <span className="step-icon">1</span>
                  <p>Click <strong>"Tap to Place in AR"</strong> on the model</p>
                </div>
                <div className="step">
                  <span className="step-icon">2</span>
                  <p>Allow AR permissions if prompted</p>
                </div>
                <div className="step">
                  <span className="step-icon">3</span>
                  <p>Point camera at a flat surface</p>
                </div>
                <div className="step">
                  <span className="step-icon">4</span>
                  <p>Tap to place the model in your world</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Controls - Fixed syntax */}
          <div className="quick-controls">
            <button className="control-btn" onClick={resetModel}>
              🔄 Reset
            </button>
            <button className="control-btn" onClick={stopCamera}>
              📷 Stop
            </button>
          </div>
        </div>
      )}

      {/* 3D Preview (when camera is off) */}
      {!cameraActive && !loading && !error && (
        <div className="preview-mode">
          <div className="preview-container">
            <model-viewer
              src={foodModel}
              alt={`3D model of ${foodName}`}
              auto-rotate
              camera-controls
              shadow-intensity="1.5"
              exposure="1.5"
              camera-orbit="0deg 75deg 105%"
              field-of-view="45deg"
              onLoad={handleModelLoad}
              onError={handleModelError}
              style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#f8f9fa',
                borderRadius: '15px'
              }}
            >
              <div slot="progress-bar" className="model-progress">
                Loading 3D model...
              </div>
            </model-viewer>
          </div>

          <div className="preview-instructions">
            <h3>Ready for AR Experience?</h3>
            <p>Click "Start Camera" to see this {foodName} in your environment using augmented reality!</p>
            <button className="start-camera-btn" onClick={startCamera}>
              📷 Start Camera for AR
            </button>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="status-bar">
        <span className={`status-indicator ${cameraActive ? 'active' : 'inactive'}`}>
          ● {cameraActive ? 'Camera Active' : 'Camera Off'}
        </span>
        <span className="model-status">
          {modelLoaded ? '✅ Model Ready' : '🔄 Loading Model'}
        </span>
      </div>
    </div>
  );
};

export default FoodARViewer;