import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase/config';

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // You can add role-based protection here
  return children;
};

export default ProtectedRoute;