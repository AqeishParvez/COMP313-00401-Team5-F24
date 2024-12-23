// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const cleanupExpiredReservations = require('./middleware/reservationCleanup');

// Initialize the app
const app = express();
dotenv.config();

// Middleware
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const staffRoutes = require('./routes/staffRoutes');
const cartRoutes = require('./routes/cartRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Set up routes
app.get('/', (req, res) => {
    res.send('Welcome to the Bakery Website Backend');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', staffRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/notifications', notificationRoutes);

// Cleanup expired reservations every 30 minutes
cleanupExpiredReservations(); // Run once on startup
setInterval(cleanupExpiredReservations, 1000 * 60 * 30);

// Start the server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})