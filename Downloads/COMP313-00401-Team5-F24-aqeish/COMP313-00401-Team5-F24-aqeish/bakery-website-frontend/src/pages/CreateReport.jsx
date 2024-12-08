import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const CreateReport = () => {
  const { getAuthHeader } = useAuth();
  const [reportList, setReportList] = useState([]);
  const [newReport, setNewReport] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  // Fetch reports
  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/reports', getAuthHeader());
      setReportList(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err.response?.data || err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prev) => ({ ...prev, [name]: value }));
  };

  // Add new report
  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/reports', newReport, getAuthHeader());
      alert('Report added successfully!');
      fetchReports();
      setNewReport({ title: '', description: '' }); // Reset form
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create report.');
      console.error('Error adding report:', err.response?.data || err);
    }
  };

  // Delete report
  const handleDeleteReport = async (reportId) => {
    try {
      await axios.delete(`http://localhost:5001/api/reports/${reportId}`, getAuthHeader());
      alert('Report deleted successfully!');
      fetchReports();
    } catch (err) {
      alert('Failed to delete report.');
      console.error('Error deleting report:', err.response?.data || err);
    }
  };

  return (
    <div>
      <h3>Manage Reports</h3>
      
      {/* Form to Add New Report */}
      <Form onSubmit={handleAddReport}>
        <Form.Group controlId="reportTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            placeholder="Enter report title"
            value={newReport.title}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="reportDescription" className="mt-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            placeholder="Enter report description"
            value={newReport.description}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Add Report
        </Button>
      </Form>

      {/* Reports Table */}
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reportList.map((report) => (
            <tr key={report._id}>
              <td>{report.title}</td>
              <td>{report.description}</td>
              <td>
                <Button variant="danger" onClick={() => handleDeleteReport(report._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CreateReport;
