import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'agency';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, isAdmin, isAgency, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/agency/offers" replace />;
  }

  if (requiredRole === 'agency' && !isAgency) {
    return <Navigate to="/admin/offers" replace />;
  }

  if (isAgency && currentUser && !currentUser.isProfileComplete && window.location.pathname !== '/agency/profile') {
    return <Navigate to="/agency/profile" replace />;
  }

  if (isAgency && currentUser && currentUser.isProfileComplete === true && currentUser.isApproved === false && window.location.pathname !== '/agency/approval') {
    return <Navigate to="/agency/approval" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;