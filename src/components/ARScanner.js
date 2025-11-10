import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import './ARScanner.css';

const TableEmoji = ({ position, tableNumber, onTableSelect }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={() => onTableSelect(tableNumber)}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Table {tableNumber}
      </Text>
    </group>
  );
};

const ARScanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, orderType } = location.state;
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Initialize tables with emoji positions
    const initialTables = [
      { id: 1, position: [0, 0, 0], emoji: '😀' },
      { id: 2, position: [3, 0, 0], emoji: '😊' },
      { id: 3, position: [-3, 0, 0], emoji: '😎' },
      { id: 4, position: [0, 0, 3], emoji: '🥳' },
      { id: 5, position: [0, 0, -3], emoji: '🤩' }
    ];
    setTables(initialTables);
  }, []);

  const handleTableSelect = (tableNumber) => {
    setSelectedTable(tableNumber);
  };

  const proceedToCart = () => {
    if (orderType === 'dine-in' && !selectedTable) {
      alert('Please select a table');
      return;
    }

    navigate('/cart', { 
      state: { 
        cart, 
        orderType, 
        tableNumber: selectedTable 
      } 
    });
  };

  return (
    <div className="ar-scanner">
      <h2>Scan Your Table</h2>
      
      <div className="scanner-container">
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {tables.map(table => (
            <TableEmoji
              key={table.id}
              position={table.position}
              tableNumber={table.id}
              onTableSelect={handleTableSelect}
            />
          ))}
          
          <OrbitControls />
        </Canvas>
      </div>

      {selectedTable && (
        <p className="selected-table">Selected: Table {selectedTable}</p>
      )}

      <div className="scanner-actions">
        <button onClick={proceedToCart} className="proceed-btn">
          PROCEED TO CART
        </button>
      </div>
    </div>
  );
};

export default ARScanner;