import React from 'react';

const SimpleModelTest = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Simple Model Test</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Pizza</h3>
          <model-viewer
            src="/models/pizza.glb"
            alt="Pizza"
            auto-rotate
            camera-controls
            style={{ width: '300px', height: '300px', border: '2px solid blue' }}
          ></model-viewer>
        </div>
        
        <div>
          <h3>Burger</h3>
          <model-viewer
            src="/models/burgur.glb"
            alt="Burger"
            auto-rotate
            camera-controls
            style={{ width: '300px', height: '300px', border: '2px solid green' }}
          ></model-viewer>
        </div>

        <div>
          <h3>Cake</h3>
          <model-viewer
            src="/models/cake.glb"
            alt="Cake"
            auto-rotate
            camera-controls
            style={{ width: '300px', height: '300px', border: '2px solid orange' }}
          ></model-viewer>
        </div>

        <div>
          <h3>Coffee</h3>
          <model-viewer
            src="/models/coffee.glb"
            alt="Coffee"
            auto-rotate
            camera-controls
            style={{ width: '300px', height: '300px', border: '2px solid brown' }}
          ></model-viewer>
        </div>
      </div>
    </div>
  );
};

export default SimpleModelTest;