import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagerDashboard = () => {
  // Product states
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, availability: true, quantity: 0 });
  const [editingProduct, setEditingProduct] = useState(null);

  // Staff states
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', staffRole: 'baker', password: '123456' }); // Placeholder password for staff that is added
  const [editingStaff, setEditingStaff] = useState(null);

  // Order states
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('pending');
  const [assignedStaff, setAssignedStaff] = useState('');

  // Error and loading states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch products, staff, and orders on component mount
  useEffect(() => {
    fetchProducts();  
    fetchStaff();
    fetchOrders();
  }, []);

  // Helper function to get the Authorization header
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/products', getAuthHeader());
      setProducts(response.data);
    } catch (err) {
      setError('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/staff', getAuthHeader());
      setStaffList(response.data);
    } catch (err) {
      setError('Error fetching staff');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/orders', getAuthHeader());
      setOrders(response.data);
    } catch (err) {
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/products', newProduct, getAuthHeader());
      setNewProduct({ name: '', description: '', price: 0, availability: true, quantity: 0 });
      fetchProducts();
    } catch (err) {
      setError('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  // Add new staff
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/staff', newStaff, getAuthHeader());
      setNewStaff({ name: '', email: '', staffRole: 'baker', password: '123456' });
      fetchStaff();
    } catch (err) {
      setError('Error adding staff');
    } finally {
      setLoading(false);
    }
  };

  // Edit existing staff
  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:5001/api/staff/${editingStaff._id}`, editingStaff, getAuthHeader());
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      setError('Error updating staff');
    } finally {
      setLoading(false);
    }
  };

  // Delete a staff member
  const handleDeleteStaff = async (staffId) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5001/api/staff/${staffId}`, getAuthHeader());
      fetchStaff();
    } catch (err) {
      setError('Error deleting staff');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5001/api/orders/${selectedOrder._id}`, { status: newStatus }, getAuthHeader());
      fetchOrders();
    } catch (err) {
      setError('Error updating order status');
    } finally {
      setLoading(false);
    }
  };

  // Assign staff to an order
  const handleAssignStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5001/api/orders/${selectedOrder._id}/assign`, { staffId: assignedStaff }, getAuthHeader());
      fetchOrders();
    } catch (err) {
      setError('Error assigning staff to order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Inventory, Staff, and Order Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Product Management */}
      <h3>Add New Product</h3>
      <form onSubmit={handleAddProduct}>
        <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={(e) => handleInputChange(e, setNewProduct)} required />
        <input type="text" name="description" placeholder="Description" value={newProduct.description} onChange={(e) => handleInputChange(e, setNewProduct)} required />
        <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={(e) => handleInputChange(e, setNewProduct)} required />
        <input type="number" name="quantity" placeholder="Quantity" value={newProduct.quantity} onChange={(e) => handleInputChange(e, setNewProduct)} required />
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Product'}</button>
      </form>

      <h3>Current Inventory</h3>
      {products.map((product) => (
        <div key={product._id}>
          <p>{product.name} - {product.description}</p>
        </div>
      ))}

      {/* Staff Management */}
      <h3>Add New Staff</h3>
      <form onSubmit={handleAddStaff}>
        <input type="text" name="name" placeholder="Name" value={newStaff.name} onChange={(e) => handleInputChange(e, setNewStaff)} required />
        <input type="email" name="email" placeholder="Email" value={newStaff.email} onChange={(e) => handleInputChange(e, setNewStaff)} required />
        <select name="staffRole" value={newStaff.staffRole} onChange={(e) => handleInputChange(e, setNewStaff)} required>
          <option value="baker">Baker</option>
          <option value="front desk">Front Desk</option>
          <option value="buyer">Buyer</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Staff'}</button>
      </form>

      <h3>Staff Members</h3>
      {staffList.map((staff) => (
        <div key={staff._id}>
          <p>{staff.name} - {staff.staffRole}</p>
          <button onClick={() => handleEditStaff(staff)}>Edit</button>
          <button onClick={() => handleDeleteStaff(staff._id)}>Delete</button>
        </div>
      ))}

      {editingStaff && (
        <div>
          <h3>Edit Staff Member</h3>
          <form onSubmit={handleUpdateStaff}>
            <input type="text" name="name" placeholder="Name" value={editingStaff.name} onChange={(e) => handleInputChange(e, setEditingStaff)} required />
            <input type="email" name="email" placeholder="Email" value={editingStaff.email} onChange={(e) => handleInputChange(e, setEditingStaff)} required />
            <select name="staffRole" value={editingStaff.staffRole} onChange={(e) => handleInputChange(e, setEditingStaff)} required>
              <option value="baker">Baker</option>
              <option value="front desk">Front Desk</option>
              <option value="buyer">Buyer</option>
            </select>
            <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Staff'}</button>
            <button type="button" onClick={() => setEditingStaff(null)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Order Management */}
      <h3>Orders</h3>
      {orders.map((order) => (
        <div key={order._id}>
          <p>Order for {order.customer.name} - Status: {order.status}</p>
          <button onClick={() => setSelectedOrder(order)}>Manage Order</button>
        </div>
      ))}

      {selectedOrder && (
        <div>
          <h3>Manage Order</h3>
          <p>Current Status: {selectedOrder.status}</p>

          {/* Update Order Status */}
          <form onSubmit={handleUpdateStatus}>
            <label>Status:</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
            <button type="submit">Update Status</button>
          </form>

          {/* Assign Staff */}
          <form onSubmit={handleAssignStaff}>
            <label>Assign to Staff:</label>
            <select value={assignedStaff} onChange={(e) => setAssignedStaff(e.target.value)}>
              <option value="">Select Staff</option>
              {staffList.map((staff) => (
                <option key={staff._id} value={staff._id}>{staff.name}</option>
              ))}
            </select>
            <button type="submit">Assign Staff</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
