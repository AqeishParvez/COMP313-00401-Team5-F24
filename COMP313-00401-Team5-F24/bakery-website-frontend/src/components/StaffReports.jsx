import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const StaffReports = () => {
  const { getAuthHeader, userRole, userId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/orders', getAuthHeader());
      let filteredOrders = response.data;

      // Apply role-based filtering
      if (userRole === 'staff') {
        filteredOrders = filteredOrders.filter(order => order.assignedStaff?._id === userId);
      }

      setOrders(filteredOrders);
    } catch (err) {
      setError('Failed to load reports.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h3>Staff Reports</h3>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Products</th>
            <th>Assigned Staff</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order.customer?.name || 'N/A'}</td>
              <td>{order.status}</td>
              <td>{order.priority || 'N/A'}</td>
              <td>
                {order.products
                  .map(product => `${product.product.name} (x${product.quantity})`)
                  .join(', ')}
              </td>
              <td>{order.assignedStaff?.name || 'Unassigned'}</td>
              <td>{order.totalPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default StaffReports;
