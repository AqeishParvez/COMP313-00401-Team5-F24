const express = require('express');
const router = express.Router();
const Order = require('./models/Order'); // Order model
const Product = require('./models/Product'); // Product model
const authenticateToken = require('../middleware/authMiddleware.js');
const mongoose = require('mongoose');
// Middleware to authenticate user (for example purposes, you may already have this set up)
function authenticateUser(req, res, next) {
    if (req.isAuthenticated()) { // Example check for an authenticated user
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Place a new order
router.post('/orders', authenticateUser, async (req, res) => {
    try {
        const { products } = req.body; // Expected format: [{ product: 'productId', quantity: 2 }, ...]

        // Validate and calculate total price
        let totalPrice = 0;
        const orderProducts = [];

        for (let item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ error: `Product with id ${item.product} not found` });
            }
            
            const quantity = item.quantity || 1; // Use provided quantity or default to 1
            totalPrice += product.price * quantity;

            orderProducts.push({
                product: product._id,
                quantity
            });
        }

        // Create and save the new order
        const newOrder = new Order({
            customer: req.user._id, // Assuming req.user contains the authenticated user's data
            products: orderProducts,
            totalPrice,
            status: 'pending', // Default status on creation
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

module.exports = router;
