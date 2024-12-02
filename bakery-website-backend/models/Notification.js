const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User receiving the notification
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User sending the notification
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Order associated with the notification
    role: { type: String, enum: ['staff', 'customer', 'manager'], required: true }, // Role of the user
    message: { type: String, required: true },
    type: { type: String, enum: ['order_update', 'assignment', 'general'], default: 'general' }, // Type of notification
    readStatus: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', NotificationSchema);