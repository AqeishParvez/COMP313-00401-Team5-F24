const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

// Place an order (customers only)
router.post('/', authenticateToken, async (req, res) => {
    if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Only customers can place orders' });
    }

    const { products } = req.body;  // Ensure this is an array

    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: 'Products must be an array and cannot be empty' });
    }

    try {
        let totalPrice = 0;
        const productDetails = [];

        for (let item of products) {
            const product = await Product.findById(item.product);  // Make sure the product exists
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product} not found` });
            }

            productDetails.push({ product: product._id, quantity: item.quantity });
            totalPrice += product.price * item.quantity;
        }

        const newOrder = new Order({
            customer: req.user.id,
            products: productDetails,
            totalPrice
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all orders (staff and managers only)
router.get('/', authenticateToken, async (req, res) => {
    if (req.user.role === 'customer') {
        // Fetch only this customer's orders
        const orders = await Order.find({ customer: req.user.id });
        return res.json(orders);
    }
    // Fetch all orders for staff and manager
    if (req.user.role === 'staff' || req.user.role === 'manager') {
        const orders = await Order.find();
        return res.json(orders);
    }
    res.status(403).json({ message: 'Access denied' });
});

// Get order details by ID (staff and managers only)
router.get('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff' && req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const order = await Order.findById(req.params.id).populate('customer').populate('products.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update order status (staff and managers only)
router.patch('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff' && req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Assign staff to an order (staff and managers only)
router.patch('/:id/assign', authenticateToken, async (req, res) => {
    if (req.user.role !== 'manager' && req.user.role !== 'staff') {
        return res.status(403).json({ message: 'Only staff/managers can assign orders to staff' });
    }

    const { staffId } = req.body;

    try {
        const staffMember = await User.findById(staffId);
        if (!staffMember || staffMember.role !== 'staff') {
            return res.status(404).json({ message: 'Staff member not found or not a staff' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.assignedStaff = staffMember._id;
        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;