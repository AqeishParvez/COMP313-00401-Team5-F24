import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserInfo } from '../helpers/utils.js';
import ManagerDashboard from '../pages/ManagerDashboard';

const ProtectedRoute = ({ children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const userRole = await getUserInfo();
      setRole(userRole.role);
      setLoading(false);
    };

    fetchRole();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return role === 'manager' ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
