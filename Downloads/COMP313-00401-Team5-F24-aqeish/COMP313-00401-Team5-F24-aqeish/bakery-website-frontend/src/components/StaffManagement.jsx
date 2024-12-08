// StaffManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const StaffManagement = () => {
  const { getAuthHeader } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', staffRole: 'baker', password: '123456' });
  const [editingStaff, setEditingStaff] = useState(null); // Holds the staff member being edited
  const [showModal, setShowModal] = useState(false); // Controls modal visibility

  useEffect(() => {
    fetchStaff();
  }, []);

  // Fetch staff members
  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/staff', getAuthHeader());
      setStaffList(response.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  // Add new staff member
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/staff', newStaff, getAuthHeader());
      fetchStaff();
      setNewStaff({ name: '', email: '', staffRole: 'baker', password: '123456' }); // Reset form
    } catch (err) {
      console.error('Error adding staff:', err);
    }
  };

  // Edit staff member
  const handleEditStaff = (staff) => {
    setEditingStaff(staff); // Set the staff to be edited
    setShowModal(true); // Open modal for editing
  };

  // Update staff member
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5001/api/staff/${editingStaff._id}`, editingStaff, getAuthHeader());
      fetchStaff();
      setShowModal(false); // Close the modal
      setEditingStaff(null);
    } catch (err) {
      console.error('Error updating staff:', err);
    }
  };

  // Delete staff member
  const handleDeleteStaff = async (staffId) => {
    try {
      await axios.delete(`http://localhost:5001/api/staff/${staffId}`, getAuthHeader());
      fetchStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
    }
  };

  return (
    <div>
      <h3>Manage Staff</h3>
      
      {/* Add Staff Form */}
      <Form onSubmit={handleAddStaff}>
        <Form.Group controlId="staffName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter staff name"
            value={newStaff.name}
            onChange={(e) => handleInputChange(e, setNewStaff)}
            required
          />
        </Form.Group>

        <Form.Group controlId="staffEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter staff email"
            value={newStaff.email}
            onChange={(e) => handleInputChange(e, setNewStaff)}
            required
          />
        </Form.Group>

        <Form.Group controlId="staffRole">
          <Form.Label>Role</Form.Label>
          <Form.Control
            as="select"
            name="staffRole"
            value={newStaff.staffRole}
            onChange={(e) => handleInputChange(e, setNewStaff)}
            required
          >
            <option value="baker">Baker</option>
            <option value="front desk">Front Desk</option>
            <option value="buyer">Buyer</option>
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit">
          Add Staff
        </Button>
      </Form>

      {/* Staff Table */}
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staff) => (
            <tr key={staff._id}>
              <td>{staff.name}</td>
              <td>{staff.email}</td>
              <td>{staff.staffRole}</td>
              <td>
                <Button variant="warning" onClick={() => handleEditStaff(staff)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDeleteStaff(staff._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Staff Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingStaff && (
            <Form onSubmit={handleUpdateStaff}>
              <Form.Group controlId="editStaffName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter staff name"
                  value={editingStaff.name}
                  onChange={(e) => handleInputChange(e, setEditingStaff)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="editStaffEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter staff email"
                  value={editingStaff.email}
                  onChange={(e) => handleInputChange(e, setEditingStaff)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="editStaffRole">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  as="select"
                  name="staffRole"
                  value={editingStaff.staffRole}
                  onChange={(e) => handleInputChange(e, setEditingStaff)}
                  required
                >
                  <option value="baker">Baker</option>
                  <option value="front desk">Front Desk</option>
                  <option value="buyer">Buyer</option>
                </Form.Control>
              </Form.Group>

              <Button variant="primary" type="submit">
                Update Staff
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StaffManagement;
