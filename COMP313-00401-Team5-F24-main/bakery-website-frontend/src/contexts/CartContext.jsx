// CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { getAuthHeader, userId, userRole } = useAuth();
  const [cart, setCart] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);


  // Fetch the cart from the backend when the user logs in
  useEffect(() => {
    if (userId) {
      fetchCart();
    } else {
      setCart([]); // Clear cart when user logs out
      setIsLoading(false); // Stop loading when user logs out
    }
  }, [userId]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching cart");
      const response = await axios.get('http://localhost:5001/api/cart', getAuthHeader());
      setCart(response.data);
      setItemCount(response.data.length);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/cart',
        { userId, productId: product._id, quantity },
        getAuthHeader(), {params: { userId }}
      );
      setCart(response.data); // Update cart with the new state from backend
      alert('Item added to cart');
      fetchCart();
    } catch (error) {
        // display message received from the server
        alert(error.response.data.message);
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`http://localhost:5001/api/cart/${productId}`, getAuthHeader());
      setCart(response.data); // Update cart with the new state from backend
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Clear the cart

  const checkout = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/cart/checkout', {userId}, getAuthHeader());
      setCart([]); // Clear cart after checkout
      fetchCart();
      return response.data; // Return order details if needed
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error; // Rethrow the error to handle it in the component
    }
  };
  

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, setCart, itemCount, fetchCart, checkout, isLoading }}>
      {children}
    </CartContext.Provider>
  );
};



export const useCart = () => useContext(CartContext);