const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  availability: { type: Boolean, default: true },
  quantity: { type: Number, required: true, default: 0 },  // Add quantity field
  createdAt: { type: Date, default: Date.now }
});

// Function to auto update availability based on quantity on every save or update
ProductSchema.pre('save', function(next) {
  this.availability = this.quantity > 0;
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
