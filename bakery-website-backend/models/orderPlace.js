const mongoose = require('mongoose');
const Product = require('./Product'); // Importing Product model for price lookup

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
    totalPrice: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate total price based on product prices and quantities
OrderSchema.pre('save', async function (next) {
    let total = 0;

    // Loop through the products array to calculate the total price
    for (const item of this.products) {
        const product = await Product.findById(item.product);
        if (!product) {
            return next(new Error(`Product with ID ${item.product} not found`));
        }
        
        total += product.price * item.quantity;
    }

    this.totalPrice = total; // Set the total price
    next();
});

module.exports = mongoose.model('Order', OrderSchema);
