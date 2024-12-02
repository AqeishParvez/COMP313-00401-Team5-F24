import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Modal from "./Modal";

import { Link } from "react-router-dom";  // Import the Link component




const OrderManagement = () => {
  const { getAuthHeader } = useAuth();
  const [orders, setOrders] = useState([]);

  const [pickorders, setPickOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [errMessage, setErrMessage] = useState();
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const openModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };


  const handleReviewSubmit = (orderId, rating) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderId === orderId ? { ...order, rating } : order
      )
    );
    closeModal();  // Close the modal after submitting the review
  };







  
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchStaff();
    fetchHistory();
    fetchPickOrders();
  }, []);

  const handleReview = () =>{

    const getOrders = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/orders",
          getAuthHeader()
        );
  
        const pendingOrders = response.data.filter(order => order.status === 'pending');
        setOrders(pendingOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    
  }


  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/orders",
        getAuthHeader()
      );

      const pendingOrders = response.data.filter(order => order.status === 'pending');
      setOrders(pendingOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // Fetch orders
  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/orders",
        getAuthHeader()
      );
      console.log("history", response.data);

      const completedOrders = response.data.filter(order => order.status === 'completed');
      console.log("pickup", response.data);
     
      
      setHistory(completedOrders);
    } catch (err) {
      console.error("Error fetching History orders:", err);
      if (err.status === 404) {
        setErrMessage("No History orders found");
      }
    }
  };

  const fetchPickOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/orders",
        getAuthHeader()
      );

      const pickOrders = response.data.filter(order => order.status === 'ready');
      console.log("pickup", response.data);
      setPickOrders(pickOrders);
    } catch (err) {
      console.error("Error fetching pick orders:", err);
      if (err.status === 404) {
        setErrMessage("No pick orders found");
      }
    }
  };

  // Fetch staff members to display assigned staff names
  const fetchStaff = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/staff",
        getAuthHeader()
      );
      setStaffList(response.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  // Navigate to Edit Order page
  const handleEditOrder = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
  };


  const handleReviewOrder = (orderId) => {
    navigate(`/review/${orderId}`);
  }; 
  // Delete order
  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/orders/${orderId}`,
        getAuthHeader()
      );
      fetchOrders(); // Refresh orders after deletion
    } catch (err) {
      alert(err.response.data.message);
      console.error("Error deleting order:", err);
    }
  };




  const searchOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/orders/search?customerName=${searchTerm}`,
        getAuthHeader()
      );
      setOrders(response.data.orders);
      if (!response.data.orders.length) {
        setErrMessage("No orders found with the given customer name.");
      }
    } catch (err) {
      console.error("Error searching orders:", err);
      setErrMessage("No orders found with the given customer name.");
    }
  };
  const filterOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/orders/filter?status=${statusFilter}`,
        getAuthHeader()
      );
      setOrders(response.data.orders);
      if (!response.data.orders.length) {
        setErrMessage("No orders found with the selected status.");
      }
    } catch (err) {
      console.error("Error filtering orders:", err);
      setErrMessage("No orders found with the given status.");
    }
  };
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    fetchOrders(); // Refetch all orders
  };

  return (
    <div>
      <h3>Manage Orders</h3>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group controlId="search">
            <Form.Label>Search by Customer Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter customer name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="mt-2" variant="primary" onClick={searchOrders}>
              Search
            </Button>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="statusFilter">
            <Form.Label>Filter by Status</Form.Label>
            <Form.Control
              as="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="ready">Ready For Collection</option>

              <option value="completed">Completed</option>

            </Form.Control>
            <Button className="mt-2" variant="primary" onClick={filterOrders}>
              Apply Filter
            </Button>
          </Form.Group>
        </Col>
      </Row>
      <Button variant="secondary" onClick={resetFilters}>
        Reset Filters
      </Button>

      {errMessage && (
        <Alert variant="warning" className="mt-4">
          {errMessage}
        </Alert>
      )}

<h3>Order Ready for Pickup</h3>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Status</th>
            <th>Products</th>
            {/* <th>Assigned Staff</th> */}
            <th>Total Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* {errMessage && <p>{errMessage}</p>} */}
          {pickorders.map((order) => (
            <tr key={order._id}>
              <td>{order.customer?.name}</td>
              <td>{order?.status}</td>
              <td>
                {order.products.map((product) => (
                  <span key={product.product._id}>
                    {product.product.name} (x{product.quantity})
                    <br />
                  </span>
                ))}
              </td>
              {/* <td>{order.assignedStaff?.name || "Unassigned"}</td> */}
              <td>{order.totalPrice.toFixed(2)}</td>
              <td>
              <Button
                  variant="warning"
                  onClick={() => handleEditOrder(order._id)}
                >
                  Edit
                </Button>{" "}
                <Button
                  variant="danger"
                  onClick={() => handleDeleteOrder(order._id)}
                >
                  Cancel Order
                </Button>
                </td>
              
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Pending Orders</h3>

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
          {orders.map((order) => (
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
              <td>{order.assignedStaff?.name || "Unassigned"}</td>
              <td>{order.totalPrice.toFixed(2)}</td>
              <td>
                <Button
                  variant="warning"
                  onClick={() => handleEditOrder(order._id)}
                >
                  Edit
                </Button>{" "}
                <Button
                  variant="danger"
                  onClick={() => handleDeleteOrder(order._id)}
                >
                  Cancel Order
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h3>Completed Orders</h3>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Status</th>
            <th>Products</th>
            <th>Assigned Staff</th>
            <th>Total Price</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {/* {errMessage && <p>{errMessage}</p>} */}
          {history.map((order) => (
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
              <td>{order.assignedStaff?.name || "Unassigned"}</td>
              <td>{order.totalPrice.toFixed(2)}</td>
              <td>            <button onClick={() => handleReviewOrder(order._id)}>Review Order</button>

              
            
              </td>


              {/* Review Modal */}
              {/* <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleReviewSubmit}
        orderId={order._Id}
        currentRating={orders.find((order) => order.orderId === selectedOrderId)?.rating}
      /> */}



            </tr>
          ))}
        </tbody>
      </Table>

     
    </div>
  );
};

export default OrderManagement;
