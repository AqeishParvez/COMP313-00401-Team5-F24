// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a new staff member
router.post('/staff', async (req, res) => {
    try {
        const { name, email, password, staffRole } = req.body;
        const newStaff = new User({
            name,
            email,
            password,
            role: 'staff',
            staffRole,
        });
        await newStaff.save();
        res.status(201).json(newStaff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all staff members
router.get('/staff', async (req, res) => {
    try {
        const staffMembers = await User.find({ role: 'staff' });
        res.status(200).json(staffMembers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific staff member by ID
router.get('/staff/:id', async (req, res) => {
    try {
        const staffMember = await User.findById(req.params.id);
        if (staffMember && staffMember.role === 'staff') {
            res.status(200).json(staffMember);
        } else {
            res.status(404).json({ message: 'Staff member not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a staff member by ID
router.put('/staff/:id', async (req, res) => {
    try {
        const { name, email, staffRole } = req.body;
        const staffMember = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, staffRole },
            { new: true, runValidators: true }
        );
        if (staffMember && staffMember.role === 'staff') {
            res.status(200).json(staffMember);
        } else {
            res.status(404).json({ message: 'Staff member not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a staff member by ID
router.delete('/staff/:id', async (req, res) => {
    try {
        const staffMember = await User.findByIdAndDelete(req.params.id);
        if (staffMember && staffMember.role === 'staff') {
            res.status(200).json({ message: 'Staff member deleted' });
        } else {
            res.status(404).json({ message: 'Staff member not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
