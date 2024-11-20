import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OrderManagement = () => {
  const { getAuthHeader } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
      setFilteredOrders(response.data); // Initialize filteredOrders with all orders
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

  // debounced search functionality
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (!searchTerm) {
        setFilteredOrders(orders);
      } else {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = orders.filter((order) => {
          return (
            (order.customer?.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (order.status || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (order.products.some((product) =>
              product.product.name.toLowerCase().includes(lowerCaseSearchTerm)
            )) ||
            (order.assignedStaff?.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            order.totalPrice.toString().includes(lowerCaseSearchTerm)
          );
        });
        setFilteredOrders(filtered);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, orders]);

  return (
    <div>
      <h3>Manage Orders</h3>

      {/* Search Bar */}
      <Form.Control
        type="text"
        placeholder="Search orders..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="my-3"
      />

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Status</th>
            <th>Products</th>
            <th>Assigned Staff</th>
            <th>Total Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order._id}>
              <td>{order.customer?.name}</td>
              <td>{order.status}</td>
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