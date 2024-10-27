const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware.js');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new product (restricted to staff and manager roles)
router.post('/', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff' && req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied' });
    }

    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a product (restricted to staff and manager roles)
router.patch('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'staff' && req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (req.body.name) product.name = req.body.name;
        if (req.body.price) product.price = req.body.price;
        if (req.body.description) product.description = req.body.description;
        if (req.body.availability !== undefined) product.availability = req.body.availability;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a product
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.remove();
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get product brief (description and price)
router.get('/brief', async (req, res) => {
    try {
        const products = await Product.find({}, 'name price description');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get product availability
router.get('/availability', async (req, res) => {
    try {
        const products = await Product.find({}, 'name availability');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get product details
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
