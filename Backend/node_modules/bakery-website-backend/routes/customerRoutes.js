// routes/staffRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Create a new staff member


// Get all staff members
router.get("/", async (req, res) => {
  try {
    const cutomers = await User.find({ role: "customer" });
    res.status(200).json(cutomers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// // Get a specific staff member by ID
// router.get("/staff/:id", async (req, res) => {
//   try {
//     const staffMember = await User.findById(req.params.id);
//     if (staffMember && staffMember.role === "customer") {
//       res.status(200).json(staffMember);
//     } else {
//       res.status(404).json({ message: "Staff member not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


module.exports = router;
