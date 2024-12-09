const mongoose = require('mongoose');

const ProductTimeoutSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    expiryTime: { type: Date, required: true },
});

module.exports = mongoose.model('ProductTimeout', ProductTimeoutSchema);