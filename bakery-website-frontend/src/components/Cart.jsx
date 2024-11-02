import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const { cart, removeFromCart } = useCart();

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
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
            {cart.map((item) => (
              <tr key={item.product._id}>
                <td>{item.product.name}</td>
                <td>{item.quantity}</td>
                <td>${item.product.price}</td>
                <td>${item.product.price * item.quantity}</td>
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
      )}
    </div>
  );
};

export default Cart;