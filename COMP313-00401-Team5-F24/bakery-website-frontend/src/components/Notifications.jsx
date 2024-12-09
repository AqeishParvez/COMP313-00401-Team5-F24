import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { getAuthHeader } = useAuth();
    const [readNotifications, setReadNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/notifications/', getAuthHeader());
            const notifications = response.data;
            setReadNotifications(notifications.filter((notif) => notif.readStatus));
            setUnreadNotifications(notifications.filter((notif) => !notif.readStatus));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [getAuthHeader]);

    const markAsRead = async (id) => {
        try {
            await axios.patch(`http://localhost:5001/api/notifications/${id}/read`, null, getAuthHeader());
            setUnreadNotifications((prev) => prev.filter((notif) => notif._id !== id));
            setReadNotifications((prev) => [
                ...prev,
                unreadNotifications.find((notif) => notif._id === id),
            ]);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAsUnread = async (id) => {
        try {
            await axios.patch(`http://localhost:5001/api/notifications/${id}/unread`, null, getAuthHeader());
            setReadNotifications((prev) => prev.filter((notif) => notif._id !== id));
            setUnreadNotifications((prev) => [
                ...prev,
                readNotifications.find((notif) => notif._id === id),
            ]);
        } catch (error) {
            console.error('Error marking notification as unread:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`http://localhost:5001/api/notifications/${id}`, getAuthHeader());
            setReadNotifications((prev) => prev.filter((notif) => notif._id !== id));
            setUnreadNotifications((prev) => prev.filter((notif) => notif._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearAllReadNotifications = async () => {
        try {
            await axios.delete('http://localhost:5001/api/notifications/read', getAuthHeader());
            setReadNotifications([]);
        } catch (error) {
            console.error('Error clearing read notifications:', error);
        }
    };

    // Navigate to Order Details page
    const handleViewOrder = (orderId) => {
        navigate(`/orders/details/${orderId}`);
    };

    return (
        <div>
            <h3>Notifications</h3>

            <Button variant="danger" onClick={clearAllReadNotifications} className="mb-3">
                Clear All Read Notifications
            </Button>

            <h4>Unread Notifications</h4>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Message</th>
                        <th>Type</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {unreadNotifications.map((notif) => (
                        <tr key={notif._id}>
                            <td>{notif.message}</td>
                            <td>{notif.type}</td>
                            <td>{new Date(notif.createdAt).toLocaleString()}</td>
                            <td>
                                <Button variant="info" onClick={() => handleViewOrder(notif.orderId)} className="me-2">
                                    View Order
                                </Button>
                                <Button variant="success" onClick={() => markAsRead(notif._id)} className="me-2">
                                    Mark as Read
                                </Button>
                                <Button variant="danger" onClick={() => deleteNotification(notif._id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <h4>Read Notifications</h4>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Message</th>
                        <th>Type</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {readNotifications.map((notif) => (
                        <tr key={notif._id}>
                            <td>{notif.message}</td>
                            <td>{notif.type}</td>
                            <td>{new Date(notif.createdAt).toLocaleString()}</td>
                            <td>
                                <Button variant="warning" onClick={() => markAsUnread(notif._id)} className="me-2">
                                    Mark as Unread
                                </Button>
                                <Button variant="danger" onClick={() => deleteNotification(notif._id)}>
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

export default Notifications;