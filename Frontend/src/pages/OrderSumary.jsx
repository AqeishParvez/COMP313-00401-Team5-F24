import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { format } from 'date-fns';
import { hi } from "date-fns/locale";


const OrderManagement = () => {
  const { getAuthHeader } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pickorders, setPickOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [errMessage, setErrMessage] = useState();
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchStaff();
    fetchHistory();
    fetchPickOrders();
  }, []);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/orders",
        getAuthHeader()
      );
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // Fetch orders
  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/orders",
        getAuthHeader()
      );
      console.log("history", response.data);

      const completedOrders = response.data.filter(order => order.status === 'completed');
      
      const updatedOrders = completedOrders.map((order) => {
        // Format the date using `date-fns`
        const formattedDate = format(new Date(order.createdAt), 'MMMM dd, yyyy');
        
        // Return the updated order object with the formatted date
        return {
          ...order,
          createdAt: formattedDate
        };
      });












      setHistory(updatedOrders);
    } catch (err) {
      console.error("Error fetching History orders:", err);
      if (err.status === 404) {
        setErrMessage("No History orders found");
      }
    }
  };

  const fetchPickOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/orders/pick-up",
        getAuthHeader()
      );
      console.log("pickup", response.data);
      setPickOrders(response.data);
    } catch (err) {
      console.error("Error fetching pick orders:", err);
      if (err.status === 404) {
        setErrMessage("No pick orders found");
      }
    }
  };

  // Fetch staff members to display assigned staff names
  const fetchStaff = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/staff",
        getAuthHeader()
      );
      setStaffList(response.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  // Navigate to Edit Order page
  const handleEditOrder = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/orders/${orderId}`,
        getAuthHeader()
      );
      fetchOrders(); // Refresh orders after deletion
    } catch (err) {
      alert(err.response.data.message);
      console.error("Error deleting order:", err);
    }
  };

  const searchOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/orders/search?customerName=${searchTerm}`,
        getAuthHeader()
      );
      setOrders(response.data.orders);
      if (!response.data.orders.length) {
        setErrMessage("No orders found with the given customer name.");
      }
    } catch (err) {
      console.error("Error searching orders:", err);
      setErrMessage("No orders found with the given customer name.");
    }
  };
  const filterOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/orders/filter?status=${statusFilter}`,
        getAuthHeader()
      );
      setOrders(response.data.orders);
      if (!response.data.orders.length) {
        setErrMessage("No orders found with the selected status.");
      }
    } catch (err) {
      console.error("Error filtering orders:", err);
      setErrMessage("No orders found with the given status.");
    }
  };
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    fetchOrders(); // Refetch all orders
  };



  return (
    <div>
    

      

      
      


      

<h3>Order Summary</h3>


     
        
          {/* {errMessage && <p>{errMessage}</p>} */}
          
         

          
          
          {history.map((order) => (  
            
             <Table striped bordered hover className="mt-4">
             <thead>
               <tr>
                 <th>Date</th>
                 <th>Products</th>
                 <th>Total Price</th>
          
               </tr>
             </thead>


            <tbody>
            <tr key={order._id}>
                 <td>{order.createdAt}</td>
              <td>
                {order.products.map((product) => (
                  <span key={product.product._id}>
                    {product.product.name} (x{product.quantity})
                    <br />
                  </span>
                ))}
              </td>
              <td>{order.totalPrice.toFixed(2)}</td>
             
            
            </tr>
               </tbody>

</Table>
          ))}
     


     

      
    </div>
  );
};

export default OrderManagement;
