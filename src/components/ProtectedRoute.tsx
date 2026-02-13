import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !user?.esAdmin) {
    return <Navigate to="/dashboard-user" replace />;
  }

  if (requiredRole === 'user' && user?.esAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
