import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, isInstructor, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (requiredRole === 'instructor' && !isInstructor) return <Navigate to="/courses" replace />;
  if (requiredRole === 'admin' && !isAdmin) return <Navigate to="/courses" replace />;
  return children;
}