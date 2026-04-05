import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  userRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, userRole }) => {
  // If no user is logged in, redirect to landing page
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  // If specific role is required, check if user has it
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
