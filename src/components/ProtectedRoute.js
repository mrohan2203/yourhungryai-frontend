import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if the user is authenticated (e.g., token exists in localStorage)
  const isAuthenticated = localStorage.getItem('token');

  // If authenticated, render the child routes (Outlet)
  // If not authenticated, redirect to the LoginPage
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;