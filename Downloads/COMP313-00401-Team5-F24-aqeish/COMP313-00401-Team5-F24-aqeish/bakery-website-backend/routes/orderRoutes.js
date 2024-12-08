const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification.js');
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

const notifyUser = async (userId, orderId, role, message, type) => {
    console.log("User ID: ", userId);
    const newNotification = new Notification({ userId, orderId, role, message, type });
    await newNotification.save();
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

            // Check for product quantity scenarios
            if (item.quantity <= 0) {
                console.log("Product Quantity: ", item.quantity);
                return res.status(400).json({ message: 'Product quantity must be greater than 0' });
            } else if (item.quantity > product.quantity) {
                return res.status(400).json({ message: `Only ${product.quantity} units of ${product.name} available` });
            } else {
                product.quantity -= item.quantity;
                await product.save();
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

        // Notify the customer that the order has been placed
        notifyUser(req.user.id, newOrder,'customer', `Order# ${savedOrder._id} has been placed`, 'order_update');

        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all orders (staff and managers only)
router.get('/', authenticateToken, async (req, res) => {
    // Fetch orders only for the logged-in customer
    if (req.user.role === 'customer') {
        const orders = await Order.find({ customer: req.user.id })
        .populate('customer', 'name')
        .populate('products.product', 'name')
        .populate('assignedStaff', 'name');
        return res.json(orders);
    } else if (req.user.role === 'manager') {
        // Fetch all orders for manager
        const orders = await Order.find()
        .populate('customer', 'name')
        .populate('products.product', 'name')
        .populate('assignedStaff', 'name');
        return res.json(orders);
    } else if (req.user.role === 'staff') {
        // If logged in staff is 'front desk' they can see all orders
        // Search logged in user ing the database using the user id and check if the staff role is 'front desk'
        
        const user = await User.findById(req.user.id);
        console.log("User: ", user);
        if (user.staffRole === 'front desk') {
            const orders = await Order.find()
            .populate('customer', 'name')
            .populate('products.product', 'name')
            .populate('assignedStaff', 'name');
            return res.json(orders);
        } else {
            // Fetch orders assigned to the logged-in staff
            const orders = await Order.find({ assignedStaff: req.user.id })
            .populate('customer', 'name')
            .populate('products.product', 'name')
            .populate('assignedStaff', 'name');
            return res.json(orders);
        };
    }

    res.status(403).json({ message: 'Access denied' });
});

// Get order details by ID (staff, managers and order creator customer only)
router.get('/:id', authenticateToken, async (req, res) => {
    // Check if the order exists
    const orderExists = await Order.exists({ _id: req.params.id });

    if (!orderExists) {
        return res.status(404).json({ message: 'Order not found' });
    }

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

    const { status, assignedStaff, products, priority } = req.body;

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
            const currentStatus = order.status;
            const currentAssignedStaff = order.assignedStaff;
            order.status = status;
            order.assignedStaff = assignedStaff;

            // Notify the customer if the order status changes
            if (currentStatus !== status) {
                notifyUser(await getOrderCreatorId(req.params.id), order, 'customer',`Order# ${order._id} status changed to ${status}`, 'order_update');
            }

            // Notify the assigned staff if the order is assigned to them
            if (currentAssignedStaff !== assignedStaff) {
                console.log("Assigned Staff: ", assignedStaff);
                notifyUser(assignedStaff, order, 'staff',`Order# ${order._id} has been assigned to you`, 'assignment');
            }

        }

        // Update order priority if role is manager
        if (req.user.role === 'manager') {
            order.priority = priority;
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
        return res.status(400).json({ message: 'Order is in progress and cannot be cancelled now' });
    }

    try {
        // Update product quantities and delete the order
        for (const item of order.products) {
            const product = await Product
                .findById(item.product)
                .select('quantity');
            product.quantity += item.quantity;
            await product.save();
        }
        
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });

        // Notify the customer that the order has been deleted
        notifyUser(deletedOrder.customer._id, order, 'customer', `Order# ${deletedOrder._id} has been cancelled`, 'order_update');

        res.json(deletedOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;