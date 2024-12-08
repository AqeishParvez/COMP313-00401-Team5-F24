import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const SendNotifications = () => {
  const { getAuthHeader } = useAuth();
  const [sentNotifications, setSentNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const [recipientRole, setRecipientRole] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [users, setUsers] = useState([]);

  // Fetch all users for recipient dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/users', getAuthHeader());
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
    fetchSentNotifications();
  }, [getAuthHeader]);

  // Fetch all notifications sent by the manager
  const fetchSentNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/notifications/sent', getAuthHeader());
      setSentNotifications(response.data);
    } catch (error) {
      console.error('Error fetching sent notifications:', error);
    }
  };

  // Send a new notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5001/api/notifications/',
        { userId: recipientId, message, type },
        getAuthHeader()
      );
      setMessage('');
      setType('general');
      setRecipientRole('');
      setRecipientId('');
      fetchSentNotifications(); // Refresh the sent notifications table
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Delete a sent notification
  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/notifications/${id}`, getAuthHeader());
      fetchSentNotifications(); // Refresh the sent notifications table
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div>
      <h3>Send Notifications</h3>

      {/* Form to Send Notification */}
      <Form onSubmit={handleSendNotification} className="mb-4">
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Message</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="general">General</option>
                <option value="order_update">Order Update</option>
                <option value="assignment">Assignment</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Recipient Role</Form.Label>
              <Form.Select
                value={recipientRole}
                onChange={(e) => {
                  setRecipientRole(e.target.value);
                  setRecipientId(''); // Clear recipientId when role changes
                }}
                required
              >
                <option value="">Select Role</option>
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Recipient</Form.Label>
              <Form.Select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                disabled={!recipientRole}
                required
              >
                <option value="">Select Recipient</option>
                {users
                  .filter((user) => user.role === recipientRole)
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" variant="primary">
          Send Notification
        </Button>
      </Form>

      {/* Table of Sent Notifications */}
      <h4>Sent Notifications</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Message</th>
            <th>Type</th>
            <th>Recipient</th>
            <th>Read Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sentNotifications.map((notif) => (
            <tr key={notif._id}>
              <td>{notif.message}</td>
              <td>{notif.type}</td>
              <td>{notif.userId?.name || 'Unknown'}</td>
              <td>{notif.readStatus ? 'Read' : 'Unread'}</td>
              <td>{new Date(notif.createdAt).toLocaleString()}</td>
              <td>
                <Button variant="danger" onClick={() => handleDeleteNotification(notif._id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SendNotifications;
