import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserInfo } from '../helpers/utils.js';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requiredRoles }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userInfo = await getUserInfo();
        setRole(userInfo.role);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setRole(null); // Ensure role is null if fetching fails
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

    if (location.pathname === '/staff-reports' && role === 'staff') {
    return children;
  }

  // Check if user role is in requiredRoles
  return requiredRoles.includes(role) ? children : <Navigate to="/login" />;
};

// Define PropTypes for better validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;
