const express = require('express');
const Notification = require('../models/Notification');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

// Create a new notification for managers only
router.post('/', authenticateToken, async (req, res) => {
    console.log("Creating a new notification")
    if (req.user.role !== 'manager' && req.user.role !== 'staff') {
        return res.status(403).json({ message: 'Only staff/managers can create manual notifications' });
    }

    // Sender id is the manager's user id so we can just extract the user id from the request body
    const senderId = req.user.id;
    const role = req.user.role;

    const { userId, message, type = 'general' } = req.body;

    try {
        const newNotification = new Notification({ userId, senderId, message, type, role });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Fetch notifications for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// Mark a notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { readStatus: true });
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});

// Mark a notification as unread
router.patch('/:id/unread', authenticateToken, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { readStatus: false });
        res.json({ message: 'Notification marked as unread' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
});

// Delete all read notifications for the logged-in user
router.delete('/read', authenticateToken, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user.id, readStatus: true });
        res.json({ message: 'Read notifications deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting read notifications' });
    }
});

// Fetch all notifications sent by the logged-in manager
router.get('/sent', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'manager' && req.user.role !== 'staff') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const sentNotifications = await Notification.find({ senderId: req.user.id })
            .populate('userId')
            .sort({ createdAt: -1 });
        res.json(sentNotifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sent notifications' });
    }
});


// Delete a notification
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification' });
    }
});


module.exports = router;