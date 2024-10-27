import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, availability: true });
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/products');
        setProducts(response.data);
      } catch (err) {
        setError('Error fetching products');
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/products', newProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewProduct({ name: '', description: '', price: 0, availability: true, quantity: 0 });
      window.location.reload();  // Refresh to show the new product
    } catch (err) {
      setError('Error adding product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:5001/api/products/${editingProduct._id}`, editingProduct, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditingProduct(null);
      window.location.reload();  // Refresh to show the updated product
    } catch (err) {
      setError('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5001/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      window.location.reload();  // Refresh to show the updated product list
    } catch (err) {
      setError('Error deleting product');
    }
  };

  return (
    <div>
      <h2>Inventory Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h3>Add New Product</h3>
      <form onSubmit={handleAddProduct}>
        <input type="text" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required />
        <input type="text" placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} required />
        <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} required />
        <input type="number" placeholder="Quantity" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })} required />
        <button type="submit">Add Product</button>
      </form>

      <h3>Current Inventory</h3>
      {products.map((product) => (
        <div key={product._id}>
          <p>{product.name}</p>
          <button onClick={() => handleEditProduct(product)}>Edit</button>
          <button onClick={() => handleDeleteProduct(product._id)}>Delete</button>
        </div>
      ))}

      {editingProduct && (
        <div>
          <h3>Edit Product</h3>
          <form onSubmit={handleUpdateProduct}>
            <input type="text" placeholder="Product Name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} required />
            <input type="text" placeholder="Description" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} required />
            <input type="number" placeholder="Price" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} required />
            <input type="number" placeholder="Quantity" value={editingProduct.quantity} onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) })} required />
            <button type="submit">Update Product</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;