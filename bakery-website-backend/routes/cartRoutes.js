const express = require("express");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();
const checkRole = require("../middleware/roleMiddleware");

// Get Cart
// GET /api/cart
router.get(
  "/",
  authenticateToken,
  checkRole(["customer"]),
  async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.user.id }).populate(
        "products.product"
      );
      if (!cart) return res.json([]); // Return empty cart if none exists
      res.json(cart.products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart" });
    }
  }
);

// Add to Cart
// POST /api/cart
router.post(
  "/",
  authenticateToken,
  checkRole(["customer"]),
  async (req, res) => {
    const { productId, quantity, userId } = req.body;
    console.log("User ID: ", userId);

    try {
      let cart = await Cart.findOne({ userId: userId });
      if (!cart) {
        // Create a new cart if it doesn't exist
        cart = new Cart({ userId: userId, products: [] });
      }

      // Check if product is already in the cart
      const existingProduct = cart.products.find(
        (p) => p.product.toString() === productId
      );
      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        console.log("Product not in cart");
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      res.json(cart.products);
    } catch (error) {
      console.log("Error adding to cart", error);
      res.status(500).json({ message: "Error adding to cart" });
    }
  }
);

// Remove from Cart
// DELETE /api/cart/:productId
router.delete(
  "/:productId",
  authenticateToken,
  checkRole(["customer"]),
  async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.user.id });
      console.log("Cart: ", cart);
      console.log("User ID: ", req.user.id);
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      cart.products = cart.products.filter(
        (p) => p.product.toString() !== req.params.productId
      );
      await cart.save();
      res.json(cart.products);
    } catch (error) {
      res.status(500).json({ message: "Error removing from cart" });
    }
  }
);

// Checkout
// POST /api/checkout
router.post(
  "/checkout",
  authenticateToken,
  checkRole(["customer"]),
  async (req, res) => {
    try {
      const cart = await Cart.findOne({ userId: req.user.id }).populate(
        "products.product"
      );
      if (!cart || cart.products.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Map cart products to order products format
      const orderProducts = cart.products.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      // Create the order
      const newOrder = new Order({
        customer: req.user.id,
        products: orderProducts,
        status: "pending", // default status for new orders
        createdAt: Date.now(),
      });

      console.log("New Order: ", newOrder);

      try {
        await newOrder.save(); // `totalPrice` is calculated by pre-save hook

        // Clear the cart
        cart.products = [];
        await cart.save();
      } catch (error) {
        console.log("Error saving order", error);
        res.status(500).json({ message: "Error saving order" });
      }
      res.json(newOrder);
    } catch (error) {
      res.status(500).json({ message: "Error during checkout" });
    }
  }
);

module.exports = router;
