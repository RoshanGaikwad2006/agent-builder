import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';


const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect unauthenticated logins to the /login screen
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
