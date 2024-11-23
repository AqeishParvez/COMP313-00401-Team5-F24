// ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const ProductManagement = () => {
  const { getAuthHeader } = useAuth();
  const { userRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: 0, quantity: 0 });
  const [editingProduct, setEditingProduct] = useState(null); // Holds the product being edited
  const [showModal, setShowModal] = useState(false); // Controls modal visibility

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products', getAuthHeader());
      setProducts(response.data);
      console.log('Products:', response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
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
    try {
      await axios.post('http://localhost:5001/api/products', newProduct, getAuthHeader());
      fetchProducts();
      setNewProduct({ name: '', description: '', price: 0, quantity: 0 }); // Reset form
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  // Edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product); // Set the product to be edited
    setShowModal(true); // Open modal for editing
  };

  // Update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:5001/api/products/${editingProduct._id}`, editingProduct, getAuthHeader());
      fetchProducts();
      setShowModal(false); // Close the modal
      setEditingProduct(null);
    } catch (err) {
      console.error('Error updating product:', err);
      // Display message from the server if available in an alert
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      }
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    console.log('Attempting to delete product with ID:', productId);
    console.log('Authorization headers:', getAuthHeader());
  
    try {
      await axios.delete(`http://localhost:5001/api/products/${productId}`, getAuthHeader());
      fetchProducts(); // Refresh product list after deletion
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };  

  return (
    <div>
      <h3>Manage Products</h3>
      
      {/* Add Product Form */}
      <Form onSubmit={handleAddProduct}>
        <Form.Group controlId="productName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter product name"
            value={newProduct.name}
            onChange={(e) => handleInputChange(e, setNewProduct)}
            required
          />
        </Form.Group>

        <Form.Group controlId="productDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            name="description"
            placeholder="Enter product description"
            value={newProduct.description}
            onChange={(e) => handleInputChange(e, setNewProduct)}
            required
          />
        </Form.Group>

        <Form.Group controlId="productPrice">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            name="price"
            placeholder="Enter product price"
            value={newProduct.price}
            onChange={(e) => handleInputChange(e, setNewProduct)}
            required
          />
        </Form.Group>

        <Form.Group controlId="productQuantity">
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            type="number"
            name="quantity"
            placeholder="Enter quantity"
            value={newProduct.quantity}
            onChange={(e) => handleInputChange(e, setNewProduct)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Add Product
        </Button>
      </Form>

      {/* Product Table */}
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>${product.price}</td>
              <td>{product.quantity}</td>
              {/* Display available if true otherwise show out of stock */}
              <td>{product.availability ? 'Available' : 'Out of Stock'}</td>
              <td>
                <Button variant="warning" onClick={() => handleEditProduct(product)}>Edit</Button>{' '}
                {/* Make delete button disabled if userRole is staff */}
                <Button variant="danger" onClick={() => handleDeleteProduct(product._id)} disabled={userRole === 'staff'}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingProduct && (
            <Form onSubmit={handleUpdateProduct}>
              <Form.Group controlId="editProductName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  readOnly={userRole === 'staff'} // Make field read-only if userRole is staff
                  placeholder="Enter product name"
                  value={editingProduct.name}
                  onChange={(e) => handleInputChange(e, setEditingProduct)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="editProductDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  readOnly={userRole === 'staff'} // Make field read-only if userRole is staff
                  placeholder="Enter product description"
                  value={editingProduct.description}
                  onChange={(e) => handleInputChange(e, setEditingProduct)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="editProductPrice">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  placeholder="Enter product price"
                  readOnly={userRole === 'staff'} // Make field read-only if userRole is staff
                  value={editingProduct.price}
                  onChange={(e) => handleInputChange(e, setEditingProduct)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="editProductQuantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={editingProduct.quantity}
                  onChange={(e) => handleInputChange(e, setEditingProduct)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Update Product
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductManagement;
