import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const ReviewOrder = () => {
  const { getAuthHeader, userRole } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [rating, SetRating] = useState(1);

  useEffect(() => {
    fetchOrderDetails();
    fetchStaff();
    fetchProducts();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/orders/${orderId}`, getAuthHeader());
      setOrder(response.data);
      setSelectedProducts(response.data.products.map(p => ({ product: p.product._id, quantity: p.quantity })));
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const fetchStaff = async () => {
    if (userRole !== 'customer') {
      try {
        const response = await axios.get('http://localhost:5001/api/staff', getAuthHeader());
        setStaffList(response.data);
      } catch (err) {
        console.error('Error fetching staff:', err);
      }
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products', getAuthHeader());
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Add or update product selection in the order
  const handleAddProduct = () => {
    if (selectedProductId && quantity > 0) {
      setSelectedProducts(prev => {
        const existingProduct = prev.find(p => p.product === selectedProductId);
        if (existingProduct) {
          // Update quantity if product is already selected
          return prev.map(p =>
            p.product === selectedProductId ? { ...p, quantity } : p
          );

          navigate("/")
        } else {
          // Add new product to selected list
          return [...prev, { product: selectedProductId, rating }];
          alert("Rate Successful")

          navigate("/")
        }
      });
    }
  };





  // Remove product from order
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.product !== productId));
  };

  const handleSaveOrder = async () => {
    try {
      await axios.patch(
        `http://localhost:5001/api/orders/${orderId}`,
        { ...order, products: selectedProducts },
        getAuthHeader()
      );
      navigate('/orders'); // Go back to order management page
    } catch (err) {
        alert("Order Rated Successfully" );
navigate("/orders")

        console.error('Error saving order:', err);
    }
  };

  return (
    <div>
      <h2>Rate Order</h2>
      {order && (
        <>
          <Form>
            {userRole !== 'customer' &&
            <Form.Group controlId="orderStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={order.status}
                onChange={(e) => setOrder(prev => ({ ...prev, status: e.target.value }))}
              >

                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="ready">Ready For Collection</option>

              
              </Form.Control>
            </Form.Group
            
            >
            }

            {userRole !== 'customer' && (
              <Form.Group controlId="assignedStaff">
                <Form.Label>Assign Staff</Form.Label>
                <Form.Control
                  as="select"
                  value={order.assignedStaff}
                  onChange={(e) => setOrder(prev => ({ ...prev, assignedStaff: e.target.value }))}
                >
                  <option value="">Select Staff</option>
                  {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>{staff.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}

            {/* Product Selection */}
            <h4>Select 1 - 10 Rating </h4>
            <Form.Group controlId="selectProduct">
              <Form.Label>Select Product To Rate</Form.Label>

             
              <Form.Control
                as="select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="rating">
              <Form.Label>Rating</Form.Label>
              <Form.Control
              
                type="number"
                min={1}
                max={10}
                onChange={(e) =>{
                    if (e> 10) {
                        alert("Input Value Between ! and 10 ")
                        
                    }
                    
                    SetRating(parseInt(e.target.value) || "")} }
              />
            </Form.Group>

            {/* <Button variant="primary" onClick={handleAddProduct}>
              Rate Product
            </Button> */}

            {/* Order Products Table */}
            <h4>Order Products</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Rating</th>
                  
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((selected) => {
                  const product = products.find(p => p._id === selected.product);
                  return (
                    <tr key={selected.product}>
                      <td>{product?.name}</td>
                      <td>{selected.quantity}</td>
                      <td>${(product ? product.price * selected.quantity : 0).toFixed(2)}</td>

                      <td>{selected.Rating}</td>
                     
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <Button variant="primary" onClick={handleSaveOrder}>Save Order</Button>
            <Button variant="secondary" onClick={() => navigate('/orders')}>Cancel</Button>
          </Form>
        </>
      )}
    </div>
  );
};

export default ReviewOrder;