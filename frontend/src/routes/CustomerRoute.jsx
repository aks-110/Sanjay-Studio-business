import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CustomerRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'Customer') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return children;
};

export default CustomerRoute;