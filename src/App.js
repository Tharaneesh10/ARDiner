import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/auth'; // Import AuthProvider

// Customer Components
import MainMenu from './components/MainMenu';
import CategoryPage from './components/CategoryPage';
import CartPage from './components/CartPage';
import Login from './components/Login';
import ARScanner from './components/ARScanner';
import FoodARViewer from './components/FoodARViewer';

// Admin and Waiter Components
import WaiterLogin from './components/WaiterLogin';
import WaiterDashboard from './components/WaiterDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import WaiterDirect from './components/WaiterDirect';
import InitializeWaiters from './components/InitializeWaiters';

// Maintenance / Tools
import UpdateDB from './components/UpdateDB';
import EmergencyFixModels from './components/EmergencyFixModels';
import CompleteDatabaseReset from './components/CompleteDatabaseReset';
import ModelTester from './components/ModelTester';
import SimpleModelTest from './components/SimpleModelTest';
import CheckUsers from './components/CheckUsers';
import RemoveDuplicates from './components/RemoveDuplicates';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">

          {/* ✅ Database Debugger removed for clean UI */}
          {/* {process.env.NODE_ENV === 'development' && <DatabaseDebugger />} */}

          <Routes>
            {/* ======================== */}
            {/* Customer Routes */}
            {/* ======================== */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/menu" element={<MainMenu />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/ar-scanner" element={<ARScanner />} />
            <Route path="/ar-view" element={<FoodARViewer />} />

            {/* ======================== */}
            {/* Admin Routes */}
            {/* ======================== */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />

            {/* ======================== */}
            {/* Waiter Routes */}
            {/* ======================== */}
            <Route path="/waiter" element={<WaiterDirect />} />
            <Route path="/staff" element={<WaiterDirect />} />
            <Route path="/service" element={<WaiterDirect />} />
            <Route path="/orders" element={<WaiterDirect />} />
            <Route path="/kitchen" element={<WaiterDirect />} />
            <Route path="/waiter-login" element={<WaiterLogin />} />
            <Route path="/waiter-dashboard" element={<WaiterDashboard />} />
            <Route path="/initialize-waiters" element={<InitializeWaiters />} />

            {/* ======================== */}
            {/* Maintenance / Developer Tools */}
            {/* ======================== */}
            <Route path="/check-users" element={<CheckUsers />} />
            <Route path="/remove-duplicates" element={<RemoveDuplicates />} />
            <Route path="/update-db" element={<UpdateDB />} />
            <Route path="/emergency-fix" element={<EmergencyFixModels />} />
            <Route path="/reset-db" element={<CompleteDatabaseReset />} />
            <Route path="/test-models" element={<ModelTester />} />
            <Route path="/simple-test" element={<SimpleModelTest />} />

            {/* ======================== */}
            {/* Catch-All Route */}
            {/* ======================== */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
