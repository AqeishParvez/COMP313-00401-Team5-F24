import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OrderManagement = () => {
  const { getAuthHeader } = useAuth();
  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [productSummary, setProductSummary] = useState([]); // To store aggregated product summary
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, []);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/orders', getAuthHeader());
      setOrders(response.data);
      calculateProductSummary(response.data); // Calculate product summary after fetching orders
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Fetch staff members to display assigned staff names
  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/staff', getAuthHeader());
      setStaffList(response.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  // Calculate product summary
  const calculateProductSummary = (orders) => {
    const summary = {};
    orders.forEach((order) => {
      if (order.assignedStaff?.id === getAuthHeader()?.userId) { // Filter orders assigned to the logged-in staff
        // Exclude completed orders from the summary
        if (order.status === 'completed') {
          return;
        }
        order.products.forEach(({ product, quantity }) => {
          if (summary[product.name]) {
            summary[product.name] += quantity;
          } else {
            summary[product.name] = quantity;
          }
        });
      }
    });

    // Convert summary object to an array for easier rendering
    const summaryArray = Object.entries(summary).map(([name, quantity]) => ({ name, quantity }));
    setProductSummary(summaryArray);
  };

  // Navigate to Order Details page
  const handleViewOrder = (orderId) => {
    navigate(`/orders/details/${orderId}`);
  };

  // Navigate to Edit Order page
  const handleEditOrder = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5001/api/orders/${orderId}`, getAuthHeader());
      fetchOrders(); // Refresh orders after deletion
    } catch (err) {
      alert(err.response.data.message);
      console.error('Error deleting order:', err);
    }
  };

  return (
    <div>
      <h3>Manage Orders</h3>

      {/* Product Summary Section */}
      <div className="mt-4">
        <h4>Pending Product Summary</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {productSummary.map((product) => (
              <tr key={product.name}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Order Management Table */}
      <h4>Orders List</h4>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Products</th>
            <th>Assigned Staff</th>
            <th>Total Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.customer?.name}</td>
              <td>{order.status}</td>
              <td>{order.priority}</td>
              <td>
                {order.products.map((product) => (
                  <span key={product.product._id}>
                    {product.product.name} (x{product.quantity})
                    <br />
                  </span>
                ))}
              </td>
              <td>{order.assignedStaff?.name || 'Unassigned'}</td>
              <td>{(order.totalPrice).toFixed(2)}</td>
              <td>
                <Button variant="info" onClick={() => handleViewOrder(order._id)} className="me-2">View</Button>
                <Button variant="warning" onClick={() => handleEditOrder(order._id)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDeleteOrder(order._id)}>Cancel Order</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default OrderManagement;