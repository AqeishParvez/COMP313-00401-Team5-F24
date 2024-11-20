const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

// Register a new user
router.post("/register", async (req, res) => {
  console.log("Creating a new user");
  const { name, email, password, role, staffRole } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Set up user data, only including staffRole if role is 'staff'
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      staffRole: role === "staff" ? staffRole : undefined, // Only include staffRole if role is 'staff'
    };

    const user = new User(userData);

    try {
      await user.save();
    } catch (err) {
      console.log("Error: ", err);
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout user (for token-based systems, this is handled client-side by simply removing the token)
router.post("/logout", (req, res) => {
  res.json({ message: "User logged out" });
});

// View all users (restricted to managers)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user details by ID (restricted to managers and staff)
router.get("/users/:id", authenticateToken, async (req, res) => {
  if (req.user.role === "customer") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to get user details (including role)
router.get("/me", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role, // Include the role in the response
    staffRole: user.staffRole, // Include the staff role in the response
  });
});

router.post("/update", authenticateToken, async (req, res) => {
  console.log("--------");
  const userId = req.user.id;
  console.log("User ID:", userId); // Debugging output
  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ message: "Need to Log in!" });

  const { name, email, password, role, staffRole } = req.body;
  user.name = name;
  user.email = email;
  // user.password = password;
  user.role = role;
  // user.staffRole = staffRole;
  console.log("User:", user); // Debugging

  try {
    await user.save();

    res.status(201).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update password
// reset password with name and email verification
router.patch("/reset-password", async (req, res) => {
  const { name, email, newPassword } = req.body;

  if (!name || !email || !newPassword) {
    return res.status(400).json({ message: "Name, email, and new password are required." });
  }

  try {
    // find user by name and email
    const user = await User.findOne({ name, email });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please verify the details." });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // save updated user
    await user.save();

    res.status(200).json({ message: "Password reset successfully. Please login." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete account information restricted for customers alone
router.delete("/customers/:id", authenticateToken, async (req, res) => {
  if (req.user.role === "customer") {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
});

module.exports = router;
