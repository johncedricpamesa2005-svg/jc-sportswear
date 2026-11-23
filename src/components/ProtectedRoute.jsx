import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ user, authReady, children }) {
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="container page py-5 text-center">
        <div className="spinner-border text-danger my-4" role="status" />
        <p className="text-muted">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RoleRoute({ user, role, authReady, allowedRoles = ['admin'], children }) {
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="container page py-5 text-center">
        <div className="spinner-border text-danger my-4" role="status" />
        <p className="text-muted">Checking permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
