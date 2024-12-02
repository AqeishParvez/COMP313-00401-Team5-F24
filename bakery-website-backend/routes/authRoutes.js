const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

// Add for password reset, Move this to app if needed
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    console.log("Creating a new user")
    const { name, email, password, role, staffRole } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Set up user data, only including staffRole if role is 'staff'
        const userData ={
            name,
            email,
            password: hashedPassword,
            role,
            staffRole: role === 'staff' ? staffRole : undefined // Only include staffRole if role is 'staff'
        }

        const user = new User(userData);
        
        try{
            await user.save();
        } catch (err) {
            console.log("Error: ", err)
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Password reset request linl
router.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user){
        res.status(200).json({ msg: 'A password reset link will be sent to the email if it exists in our system.'});
    } else {
        const resetToken = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(email)
        const mailOptions = {
            from: process.env.EMAIL,
            //to: req.body.email,
            to: email,
            subject: 'Bakery - Password Reset Request',
            text: `Here is your reset link:\n ${req.protocol}://${process.env.FRONTEND_URL}/reset/${resetToken}`
        };
        res.status(200).json({ msg: 'A password reset link will be sent to the email if it exists in our system.'});
        
        try {
            await transporter.sendMail(mailOptions);
            res.status(200).send('Password reset email sent');
        } catch (err) {
            res.status(500).send('Error sending email');
        }
        
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Logout user (for token-based systems, this is handled client-side by simply removing the token)
router.post('/logout', (req, res) => {
    res.json({ message: 'User logged out' });
});

// View all users (restricted to managers)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user details by ID (restricted to managers and staff)
router.get('/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role === 'customer') {
        return res.status(403).json({ message: 'Access denied' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to get user details (including role)
router.get('/me', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,  // Include the role in the response
        staffRole: user.staffRole,  // Include the staff role in the response
        address: user.address,
        city: user.city,
        province: user.province,
        postalCode: user.postalCode,
        phone: user.phone,
        notificationPreferences: user.notificationPreferences
    });
});

router.post('/update', authenticateToken, async (req, res) => {
    console.log("--------")
    const userId = req.user.id;
    console.log('User ID:', userId);  // Debugging output
    const user = await User.findById(userId)

    if (!user) return res.status(404).json({ message: 'Need to Log in!' });

    const { name, email, password, role, staffRole, address, city, province, postalCode, phone, notificationPreferences } = req.body;
    user.name = name;
    user.email = email;
    user.address = address;
    user.city = city;
    user.province = province;
    user.postalCode = postalCode;
    user.phone = phone;
    user.notificationPreferences = notificationPreferences;

    // Password, staff role and role are only updated if the user is a manager
    if (req.user.role === 'manager') {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        user.role = role;
        user.staffRole = role === 'staff' ? staffRole : undefined;
    }

    try {
        await user.save();

        res.status(201).json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Change Password
router.post('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        console.log("Matching result: ", isMatch)

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;