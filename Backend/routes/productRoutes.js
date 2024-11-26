const express = require("express");
const Product = require("../models/Product");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware.js");

// Search for a Product by name
router.get("/search", async (req, res) => {
  try {
    console.log(req.query.name);
    console.log(req.query.availability);
    const searchTerm = req.query.name;
    const availability = req.query.availability;

    const filter = {};
    if (searchTerm) {
      filter.name = { $regex: searchTerm, $options: "i" };
    }
    if (availability !== undefined) {
      filter.availability = availability === "true";
    }
    console.log("hey");
    const products = await Product.find(filter);
    if (!products.length)
      return res.status(404).json({ message: "No products found" });

    res.status(200).json({ message: "Search Results", products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new product (restricted to staff and manager roles)
router.post("/", authenticateToken, async (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { name, price, description, availability, quantity } = req.body;

  try {
    const newProduct = new Product({
      name,
      price,
      description,
      availability,
      quantity, // Include quantity in the product creation
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a product (restricted to staff and manager roles)
router.patch("/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.body.name) product.name = req.body.name;
    if (req.body.price) product.price = req.body.price;
    if (req.body.description) product.description = req.body.description;
    if (req.body.availability !== undefined)
      product.availability = req.body.availability;
    if (req.body.quantity !== undefined) product.quantity = req.body.quantity; // Update quantity

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a product
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).send("Product not found");

    res.json(deletedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get product brief (description and price)
router.get("/brief", async (req, res) => {
  try {
    const products = await Product.find({}, "name price description");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get product availability
router.get("/availability", async (req, res) => {
  try {
    const products = await Product.find({}, "name availability");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get product details
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
