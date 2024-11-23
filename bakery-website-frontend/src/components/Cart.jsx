import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, isLoading, removeFromCart, checkout } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return <p>Loading...</p>;
  }


  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
  };

  const handleCheckout = async () => {
    try {
      const result = await checkout();
      console.log(result);
      alert('Order successfully Placed!');
      navigate('/orders');
    } catch (error) {
      alert('Checkout failed: ' + error.response.data.message);
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={item.product?._id || index}>
                <td>{item.product?.name || "Unnamed Product"}</td>
                <td>{item.quantity}</td>
                <td>${item.product?.price || 0}</td>
                <td>${(item.product?.price * item.quantity || 0).toFixed(2)}</td>
                <td>
                  <Button variant="danger" onClick={() => removeFromCart(item.product._id)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="3" className="text-right"><strong>Total Price:</strong></td>
              <td colSpan="2"><strong>${calculateTotalPrice()}</strong></td>
            </tr>
          </tbody>
        </Table>
        <Button variant="primary" onClick={handleCheckout} disabled={cart.length === 0}>
        Checkout
        </Button>
        </>
      )}
    </div>
  );
};

export default Cart;