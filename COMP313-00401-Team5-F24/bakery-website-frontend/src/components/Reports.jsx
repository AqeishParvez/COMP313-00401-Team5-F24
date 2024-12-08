import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Alert } from 'react-bootstrap';

const ReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User not authenticated');
                    return;
                }

                const response = await axios.get('http://localhost:5001/api/reports', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setReports(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load reports');
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="container mt-4">
            <h1>All Reports</h1>

            {/* Display Error Message */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Display Reports */}
            <Table striped bordered hover className="mt-4">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report._id}>
                            <td>{report.title}</td>
                            <td>{report.description}</td>
                            <td>{new Date(report.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ReportsPage;
