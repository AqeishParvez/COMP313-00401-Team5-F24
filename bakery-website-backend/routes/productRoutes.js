const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const Order = require('../models/Order');
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
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can add new products' });
    }
  
    const { name, price, description, availability, quantity } = req.body;
  
    try {
      const newProduct = new Product({
        name,
        price,
        description,
        availability,
        quantity  // Include quantity in the product creation
      });
      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});  

// Update a product (restricted to staff and manager roles)
router.patch('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'manager' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Only managers and staff can update products' });
    }
  
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
  
      // Managers can update all fields, staff can update only availability and quantity
      if (req.user.role === 'manager'){
        if (req.body.name) product.name = req.body.name;
        if (req.body.price) product.price = req.body.price;
        if (req.body.description) product.description = req.body.description;
        if (req.body.availability !== undefined) product.availability = req.body.availability;
        if (req.body.quantity !== undefined) product.quantity = req.body.quantity;  // Update quantity
      }

      if (req.user.role === 'staff'){
        if (req.body.availability !== undefined) product.availability = req.body.availability;
        if (req.body.quantity !== undefined) product.quantity = req.body.quantity;  // Update quantity
      }
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});  

// Delete a product
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).send('Product not found');

        res.json(deletedProduct);
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

// get 5 popular product for the homepage
router.get('/popular', async (req, res) => {
  try {
    // will probably take forever irl, but for now... this is fine
    /*
    break down order's product array into individual
    group by same product and increase count / appearance
    sort Desc
    take 5
    look them up in product
    pass over useful result only
    */
    const popularProducts = await Order.aggregate([
      {$unwind: '$products'},
      {$group: {_id: '$products.product', orderCount: { $sum: 1 }}},
      {$sort: { orderCount: -1 }},
      {$limit: 3},
      {$lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }},
      {$unwind: '$productDetails'},
      {$project: {
          _id: 0,
          productId: '$_id',
          name: '$productDetails.name',
          price: '$productDetails.price',
          quantity: '$productDetails.quantity',
          orderCount: 1 //probably not gonna be useful
        }}
    ]);

    res.json(popularProducts);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

//get 5 most newest item for the homepage
router.get('/newest', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(3); 
    res.json(products);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

//search route
router.get('/search', async (req, res) => {
  const query = req.query.query;
  try {
    const regex = new RegExp(query, 'i');
    const products = await Product.find({ name: { $regex: regex } });
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
