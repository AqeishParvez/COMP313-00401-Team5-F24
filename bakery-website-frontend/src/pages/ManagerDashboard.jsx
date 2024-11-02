import React, { useState } from 'react';
import ProductManagement from '../components/ProductManagement.jsx';
import StaffManagement from '../components/StaffManagement.jsx';
import OrderManagement from '../components/OrderManagement.jsx';

const ManagerDashboard = () => {
  const [view, setView] = useState('');  // State to track the selected view

  // Helper function for Authorization Header
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  return (
    <div>
      <h2>Manager Dashboard</h2>

      {/* Buttons to select view */}
      <div className="d-flex justify-content-around mb-3">
        <button onClick={() => setView('products')} className="btn btn-primary">Manage Products</button>
        <button onClick={() => setView('staff')} className="btn btn-secondary">Manage Staff</button>
        <button onClick={() => setView('orders')} className="btn btn-success">Manage Orders</button>
      </div>

      {/* Render selected view */}
      {view === 'products' && <ProductManagement getAuthHeader={getAuthHeader} />}
      {view === 'staff' && <StaffManagement getAuthHeader={getAuthHeader} />}
      {view === 'orders' && <OrderManagement getAuthHeader={getAuthHeader} />}
    </div>
  );
};

export default ManagerDashboard;
