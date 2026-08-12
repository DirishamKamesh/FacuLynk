import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  allowedRole: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { role, isAuthenticated, accountStatus } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    // Redirect to respective dashboard
    return <Navigate to={role === 'HOD' ? '/hod/dashboard' : '/faculty/dashboard'} replace />;
  }

  // Account status check for HOD members
  if (role === 'HOD' && accountStatus === 'pending_activation') {
    return <Navigate to="/hod-activate" replace />;
  }

  // Account status check for Faculty members
  if (role === 'FACULTY') {
    if (accountStatus === 'PENDING') {
      return <Navigate to="/pending-approval" replace />;
    }
    if (accountStatus === 'REJECTED') {
      return <Navigate to="/rejected" replace />;
    }
  }

  return <Outlet />;
};

