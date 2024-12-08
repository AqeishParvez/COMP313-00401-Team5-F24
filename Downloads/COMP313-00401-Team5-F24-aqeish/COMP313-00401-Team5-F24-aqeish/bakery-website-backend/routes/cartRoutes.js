const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const ProductTimeout = require('../models/ProductTimeout');

const router = express.Router();

const productTimeouts = new Map(); // To track timeouts for products
const timeoutDuration = 60000 * 30; // 30 minutes

// Get Cart
router.get('/', authenticateToken, checkRole(['customer']), async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('products.product');
        if (!cart) return res.json([]); // Return empty cart if none exists
        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart' });
    }
});

// Add to Cart
router.post('/', authenticateToken, checkRole(['customer']), async (req, res) => {
  const { productId, quantity, userId } = req.body;

  try {
      const product = await Product.findById(productId);
      if (!product || product.quantity < quantity) {
          return res.status(400).json({ message: 'Insufficient stock' });
      }

      // Deduct quantity from product stock
      product.quantity -= quantity;
      await product.save();

      // Create or update ProductTimeout
      const expiryTime = new Date(Date.now() + timeoutDuration);
      const existingTimeout = await ProductTimeout.findOne({ productId, userId });

      if (existingTimeout) {
          existingTimeout.quantity += quantity;
          existingTimeout.expiryTime = expiryTime;
          await existingTimeout.save();
      } else {
          await ProductTimeout.create({ productId, userId, quantity, expiryTime });
      }

      // Update cart
      let cart = await Cart.findOne({ userId });
      if (!cart) cart = new Cart({ userId, products: [] });

      const existingProduct = cart.products.find(p => p.product.toString() === productId);
      if (existingProduct) {
          existingProduct.quantity += quantity;
      } else {
          cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      res.json(cart.products);
  } catch (error) {
      console.error("Error adding to cart", error);
      res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Remove from Cart
router.delete('/:productId', authenticateToken, checkRole(['customer']), async (req, res) => {
  const { productId } = req.params;

  try {
      const cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) return res.status(404).json({ message: 'Cart not found' });

      const productInCart = cart.products.find(p => p.product.toString() === productId);
      if (!productInCart) return res.status(404).json({ message: 'Product not in cart' });

      // Restore product stock
      const product = await Product.findById(productId);
      if (product) {
          product.quantity += productInCart.quantity;
          await product.save();
      }

      // Remove ProductTimeout entry
      await ProductTimeout.findOneAndDelete({ productId, userId: req.user.id });

      // Update cart
      cart.products = cart.products.filter(p => p.product.toString() !== productId);
      await cart.save();

      res.json(cart.products);
  } catch (error) {
      console.error("Error removing from cart", error);
      res.status(500).json({ message: 'Error removing from cart' });
  }
});

// Checkout
router.post('/checkout', authenticateToken, checkRole(['customer']), async (req, res) => {
  try {
      const cart = await Cart.findOne({ userId: req.user.id }).populate('products.product');
      if (!cart || cart.products.length === 0) {
          return res.status(400).json({ message: 'Cart is empty' });
      }

      const orderProducts = [];
      for (const item of cart.products) {
          const timeoutEntry = await ProductTimeout.findOne({ productId: item.product._id, userId: req.user.id });
          if (!timeoutEntry || timeoutEntry.quantity < item.quantity) {
              return res.status(400).json({ message: `Insufficient reserved stock for ${item.product.name}` });
          }

          // Confirm reserved quantity
          timeoutEntry.quantity -= item.quantity;
          if (timeoutEntry.quantity === 0) {
            // As this is a mongoose model, we cannot use remove() method
            await timeoutEntry.delete;
          } else {
              await timeoutEntry.save();
          }

          orderProducts.push({ product: item.product._id, quantity: item.quantity });
      }

      // Create the order
      const newOrder = new Order({
          customer: req.user.id,
          products: orderProducts,
          status: 'pending',
          createdAt: Date.now(),
      });

      await newOrder.save();

      // Clear the cart
      cart.products = [];
      await cart.save();

      res.json(newOrder);
  } catch (error) {
      console.error("Error during checkout", error);
      res.status(500).json({ message: 'Error during checkout' });
  }
});


module.exports = router;