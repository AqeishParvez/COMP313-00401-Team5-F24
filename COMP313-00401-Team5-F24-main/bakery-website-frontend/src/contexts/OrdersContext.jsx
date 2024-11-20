import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { getAuthHeader, userRole } = useAuth();
  const [hasReadyOrder, setHasReadyOrder] = useState(false);
  const [hasReadyOrderNotified, setHasReadyOrderNotified] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log(userRole);
        
        // Fetch orders from API
        const response = await axios.get('http://localhost:5001/api/orders', getAuthHeader());
        const fetchedOrders = response.data;

        // Set orders
        setOrders(fetchedOrders);

        // Check if any order has a status of true
        const readyOrderExists = fetchedOrders.some(order => order.status === "ready");
        setHasReadyOrder(readyOrderExists);

        // Show a notification if a ready order exists
        if (readyOrderExists && userRole === 'customer' && !hasReadyOrderNotified) {
          setHasReadyOrderNotified(true);
          alert('You have ready order(s).');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };

    fetchOrders();
  }, [getAuthHeader]);

  return (
    <OrdersContext.Provider value={{ orders, hasReadyOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);