const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification.js');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const router = express.Router();

// Get all orders (staff and managers only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.role === 'manager') {
            // Managers see all orders
            const orders = await Order.find()
                .populate('customer', 'name')
                .populate('products.product', 'name')
                .populate('assignedStaff', 'name');
            return res.json(orders);
        } else if (req.user.role === 'staff') {
            // Staff see only assigned orders
            const orders = await Order.find({ assignedStaff: req.user.id })
                .populate('customer', 'name')
                .populate('products.product', 'name')
                .populate('assignedStaff', 'name');
            return res.json(orders);
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Generate aggregated reports (managers and staff only)
router.get('/reports', authenticateToken, async (req, res) => {
    try {
        const matchCondition = req.user.role === 'manager' ? {} : { assignedStaff: req.user.id };
        const reports = await Order.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: "$assignedStaff",
                    confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                    total: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "staffDetails",
                },
            },
            {
                $project: {
                    _id: 0,
                    staff: { $arrayElemAt: ["$staffDetails", 0] },
                    confirmed: 1,
                    completed: 1,
                    pending: 1,
                    total: 1,
                },
            },
        ]);
        res.status(200).json(reports);
    } catch (err) {
        console.error("Error generating reports:", err);
        res.status(500).json({ message: "Error generating reports" });
    }
});

module.exports = router;
