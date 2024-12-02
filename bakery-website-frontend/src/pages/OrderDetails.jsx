import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const OrderDetails = () => {
    const { id } = useParams(); // Get the order ID from the URL
    const { getAuthHeader } = useAuth();
    const { addToCart } = useCart();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/orders/${id}`, getAuthHeader());
                setOrder(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id, getAuthHeader]);

    const handleReorder = (product, quantity) => {
        if (product.quantity > 0) {
            addToCart(product, quantity);
        }
    };

    if (loading) {
        return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    const handleEditOrder = async () => {
        navigate(`/orders/edit/${id}`);
    }   

    return (
        <div>
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Customer Name:</strong> {order.customer?.name}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
            <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            <h4>Products</h4>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Reorder</th>
                    </tr>
                </thead>
                <tbody>
                    {order.products.map((item) => (
                        <tr key={item.product._id}>
                            <td>{item.product.name}</td>
                            <td>{item.quantity}</td>
                            <td>${item.product.price.toFixed(2)}</td>
                            <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                            <td>
                                <Button
                                    variant="primary"
                                    onClick={() => handleReorder(item.product, 1)}
                                >
                                    Reorder this
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button variant="warning" onClick={handleEditOrder}>Edit Order</Button>
        </div>
    );
};

export default OrderDetails;