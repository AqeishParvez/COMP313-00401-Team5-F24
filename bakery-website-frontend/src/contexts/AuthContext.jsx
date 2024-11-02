import React, { createContext, useContext } from 'react';
import { getUserInfo } from '../helpers/utils.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const userRole = getUserInfo().role;
  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  return (
    <AuthContext.Provider value={{ getAuthHeader, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
