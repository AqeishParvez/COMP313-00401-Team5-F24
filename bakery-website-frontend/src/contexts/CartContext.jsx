// CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token, logout } = useAuth();
  const [cart, setCart] = useState([]);

  // Fetch the cart from the backend when the user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]); // Clear cart when user logs out
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/cart',
        { productId: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data); // Update cart with the new state from backend
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`http://localhost:5001/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data); // Update cart with the new state from backend
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);