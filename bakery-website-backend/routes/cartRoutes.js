const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

const router = express.Router();

const productTimeouts = new Map(); // To track timeouts for products
const timeoutDuration = 5000; // 30 minutes

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
  console.log("User ID: ", userId);

  try {
      let cart = await Cart.findOne({ userId: userId });
      if (!cart) {
          // Create a new cart if it doesn't exist
          cart = new Cart({ userId: userId, products: [] });
      }

      // Check if product is already in the cart
      const existingProduct = cart.products.find((p) => p.product.toString() === productId);
      if (existingProduct) {
          existingProduct.quantity += quantity;
      } else {
          console.log("Product not in cart");
          cart.products.push({ product: productId, quantity });
      }

      // Temporarily update quantity for the product in the database
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (product.quantity < quantity) {
          return res.status(400).json({ message: 'Insufficient stock' });
      }

      product.quantity -= quantity;
      await product.save();

      // Setup a timeout to reset the quantity and clean up the cart
      productTimeouts.set(
          productId,
          setTimeout(async () => {
              const updatedProduct = await Product.findById(productId);
              if (updatedProduct) {
                  updatedProduct.quantity += quantity;
                  await updatedProduct.save();
              }

              // Remove the product from all carts where it's still present
              await Cart.updateMany(
                  { 'products.product': productId },
                  { $pull: { products: { product: productId } } }
              );

              productTimeouts.delete(productId);
          }, timeoutDuration) // Adjust this timeout duration as needed
      );

      await cart.save();
      res.json(cart.products);
  } catch (error) {
      console.log("Error adding to cart", error);
      res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Remove from Cart
router.delete('/:productId', authenticateToken, checkRole(['customer']), async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const productInCart = cart.products.find((p) => p.product.toString() === productId);
        if (!productInCart) return res.status(404).json({ message: 'Product not in cart' });

        // Update product quantity in the database immediately
        const product = await Product.findById(productId);
        if (product) {
            product.quantity += productInCart.quantity;
            await product.save();
        }

        // Clear the timeout for the product
        if (productTimeouts.has(productId)) {
            clearTimeout(productTimeouts.get(productId));
            productTimeouts.delete(productId);
            console.log(`Cleared timeout for product ${product.name}`);
        }

        // Remove the product from the cart
        cart.products = cart.products.filter((p) => p.product.toString() !== productId);
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

        // Map cart products to order products format
        const orderProducts = cart.products.map(item => ({
            product: item.product._id,
            quantity: item.quantity
        }));

        // Validate product quantities and reduce them in the database
        for (let item of cart.products) {
            const product = await Product.findById(item.product._id);
            if (!product || product.quantity < item.quantity) {
                return res.status(400).json({ message: `Only ${product.quantity || 0} units of ${product.name || 'this product'} are available` });
            }
            product.quantity -= item.quantity;
            await product.save();

            // Clear any pending timeout for the product
            if (productTimeouts.has(product._id.toString())) {
                clearTimeout(productTimeouts.get(product._id.toString()));
                productTimeouts.delete(product._id.toString());
                console.log(`Cleared timeout for product ${product.name}`);
            }
        }

        // Create the order
        const newOrder = new Order({
            customer: req.user.id,
            products: orderProducts,
            status: 'pending', // default status for new orders
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