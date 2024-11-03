import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserInfo } from '../helpers/utils.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user info asynchronously when the component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getUserInfo();
        setUserRole(userInfo.role);
        setUserId(userInfo.id);
        console.log("User ID:", userInfo.id);  // Debugging output
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner, to indicate loading
  }

  return (
    <AuthContext.Provider value={{ getAuthHeader, userRole, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
