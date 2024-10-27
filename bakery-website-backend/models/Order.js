const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 }
    }],
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'completed'], 
        default: 'pending' 
    },
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
