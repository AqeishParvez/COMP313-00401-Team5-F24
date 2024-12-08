const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const Report = require('../models/Report');

router.post('/', authenticateToken, checkRole(['manager']), async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id; // Extract userId from the authenticated user

    // Validate required fields
    if (!title || !description) {
        return res.status(400).json({ error: 'Missing required fields: title, description' });
    }

    try {
        const newReport = new Report({ title, description, userId });
        await newReport.save();
        res.status(201).json({ message: 'Report created successfully', report: newReport });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report' });
    }
});

router.get('/', authenticateToken, checkRole(['manager', 'staff']), async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

module.exports = router;
