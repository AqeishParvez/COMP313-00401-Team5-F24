const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const router = express.Router();

const getOrderCreatorId = async (orderId) => {
    const order = await Order.findById(orderId).populate('customer');
    return order.customer.id;
};

const orderChangeAllowed = async (orderId, role) => {
    const order = await Order.findById(orderId);
    
    if (order.status === 'completed') {
        return false;
    }
    
    if (order.status === 'confirmed' && role !== 'customer') {
        return true;
    }

    if (order.status === 'pending') {
        return true;
    }

    return false;
};

// Place an order (customers only)
router.post('/',authenticateToken, checkRole(['customer']), async (req, res) => {
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
        const orders = await Order.find({ customer: req.user.id })
        .populate('customer', 'name')
        .populate('products.product', 'name')
        .populate('assignedStaff', 'name');
        return res.json(orders);
    }
    // Fetch all orders for staff and manager
    if (req.user.role === 'staff' || req.user.role === 'manager') {
        const orders = await Order.find()
        .populate('customer', 'name')
        .populate('products.product', 'name')
        .populate('assignedStaff', 'name');
        return res.json(orders);
    }
    res.status(403).json({ message: 'Access denied' });
});

// Get order details by ID (staff, managers and order creator customer only)
router.get('/:id', authenticateToken, async (req, res) => {
    const isAuthorized = req.user.role === 'staff' || req.user.role === 'manager' || req.user.id === await getOrderCreatorId(req.params.id);
    if (!isAuthorized) {
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

// Update order status and products (staff, managers only and rest of the info for order creator customer)
router.patch('/:id', authenticateToken, async (req, res) => {
    console.log("Requester Role: ", req.user.role);
    const isAuthorized = req.user.role === 'staff' || req.user.role === 'manager' || req.user.id === await getOrderCreatorId(req.params.id);
    console.log("Is Authorized: ", isAuthorized);
    if (!isAuthorized) {
        return res.status(403).json({ message: 'Access denied' });
    }

    const { status, assignedStaff, products } = req.body;

    if (!['pending', 'confirmed', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    if (!await orderChangeAllowed(req.params.id, req.user.role)) {
        return res.status(403).json({ message: 'Order status prevents changes. Please call us to see if changes can be made.' });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Update status and assigned staff if role is staff or manager
        if (req.user.role === 'staff' || req.user.role === 'manager') {
            order.status = status;
            order.assignedStaff = assignedStaff;
        }

        // Update products and calculate total price
        order.products = products;

        // Calculate total price
        let totalPrice = 0;
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (product) {
                totalPrice += product.price * item.quantity;
            }
        }
        order.totalPrice = totalPrice;

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

// Delete an order (managers only)
router.delete('/:id', authenticateToken, async (req, res) => {
    // find the order by id
    const order = await Order.findById(req.params.id);
    console.log("Order customer: ", order.customer);
    console.log("User ID: ", req.user.id);

    //check if the deletion request is from a manager or the customer who placed the order
    if (req.user.role === 'customer' && order.customer.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
    }

    // if order status is not pending, it cannot be deleted
    if (order.status !== 'pending') {
        return res.status(400).json({ message: 'Order is in progress and cannot be deleted now' });
    }

    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });

        res.json(deletedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});






module.exports = router;