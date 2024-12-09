import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert, Card, Container, Row, Col, Modal } from 'react-bootstrap';

const Profile = () => {
  const { getAuthHeader, logout, userId } = useAuth();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false); // For password change modal
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/me', getAuthHeader());
        setUser(response.data);
        setFormData(response.data);
      } catch (err) {
        setError('Failed to load profile information.');
        console.error(err);
      }
    };

    fetchProfile();
  }, [getAuthHeader]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(
        'http://localhost:5001/api/auth/update',
        formData,
        getAuthHeader()
      );
      setSuccess('Profile updated successfully.');
      setUser(formData);
      setEditing(false);
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    }
  };

    // Handle profile deletion (for customers only)
    const handleDelete = async () => {
      if (!window.confirm('Are you sure you want to delete your profile? This action is irreversible.')) {
        return;
      }
      try {
        // Get user id from getAuthHeader
        await axios.delete(`http://localhost:5001/api/auth/${userId}`, getAuthHeader());
        logout; // Log the user out after deleting the profile
        navigate('/login');
        window.location.reload(); // Reload the page to redirect to the login page
      } catch (err) {
        setError('Failed to delete profile.');
        console.error(err);
      }
    };  

  // Handle Change Password
  const handleChangePassword = async () => {
    setPasswordError('');
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5001/api/auth/change-password',
        { currentPassword, newPassword },
        getAuthHeader()
      );
      setSuccess('Password changed successfully.');
      setShowModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPasswordError('Failed to change password. Please try again.');
      console.error(err);
    }
  };

  // Handle input changes for password modal
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h3" className="text-center">
              {editing ? "Edit Profile" : "My Profile"}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              {!editing ? (
                <div>
                  <div className="mb-3">
                    <strong>Name:</strong> {user.name}
                  </div>
                  <div className="mb-3">
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div className="mb-3">
                    <strong>Role:</strong> {user.role}
                  </div>
                  {user.role === 'staff' && (
                    <div className="mb-3">
                      <strong>Staff Role:</strong> {user.staffRole}
                    </div>
                  )}
                  <div className="mb-3">
                    <strong>Address:</strong> {user.address || 'N/A'}
                  </div>
                  <div className="mb-3">
                    <strong>City:</strong> {user.city || 'N/A'}
                  </div>
                  <div className="mb-3">
                    <strong>Province:</strong> {user.province || 'N/A'}
                  </div>
                  <div className="mb-3">
                    <strong>Postal Code:</strong> {user.postalCode || 'N/A'}
                  </div>
                  <div className="mb-3">
                    <strong>Phone:</strong> {user.phone || 'N/A'}
                  </div>
                  <div className="mb-3">
                    <strong>Notification Preferences:</strong> {user.notificationPreferences}
                  </div>

                  <div className="d-flex justify-content-between">
                    <Button variant="primary" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                    <Button variant="secondary" onClick={() => setShowModal(true)}>
                      Change Password
                    </Button>
                    {user.role === 'customer' && (
                      <Button variant="danger" onClick={handleDelete}>
                        Delete Profile
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Form onSubmit={handleUpdate}>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  {user.role === 'staff' && (
                    <Form.Group>
                      <Form.Label>Staff Role</Form.Label>
                      <Form.Control
                        as="select"
                        name="staffRole"
                        value={formData.staffRole || ''}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Staff Role</option>
                        <option value="baker">Baker</option>
                        <option value="front desk">Front Desk</option>
                        <option value="buyer">Buyer</option>
                      </Form.Control>
                    </Form.Group>
                  )}
                  <Form.Group>
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Province</Form.Label>
                    <Form.Control
                      type="text"
                      name="province"
                      value={formData.province || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
                      value={formData.postalCode || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Notification Preferences</Form.Label>
                    <Form.Control
                      as="select"
                      name="notificationPreferences"
                      value={formData.notificationPreferences || ''}
                      onChange={handleChange}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="none">None</option>
                    </Form.Control>
                  </Form.Group>
                  <div className="d-flex justify-content-between mt-4">
                    <Button type="submit" variant="success">
                      Save Changes
                    </Button>
                    <Button variant="secondary" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          <Form>
            <Form.Group>
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangePassword}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;