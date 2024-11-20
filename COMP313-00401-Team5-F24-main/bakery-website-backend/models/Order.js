const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "confirmed", "ready", "completed"],
    default: "pending",
    required: true,
  },
  totalPrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

// Calculate total price before saving
OrderSchema.pre("save", async function (next) {
  try {
    // Populate products to access product details like price
    await this.populate("products.product");

    // Calculate totalPrice
    this.totalPrice = this.products.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Order", OrderSchema);
