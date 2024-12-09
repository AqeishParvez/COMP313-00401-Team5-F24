const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'staff', 'manager'], default: 'customer' },
    staffRole: { 
        type: String, 
        enum: ['baker', 'front desk', 'buyer'],
        required: false  // We'll handle this requirement with a pre-save hook
    },
    address: { type: String },
    city: { type: String },
    province: { type: String },
    postalCode: { type: String },
    phone: { type: String },
    notificationPreferences: { type: String, enum: ['email', 'sms', 'none'], default: 'email' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to check if staffRole is required
UserSchema.pre('save', function (next) {
    console.log(`Role: ${this.role}`);   // Add this line
    console.log(`Staff Role: ${this.staffRole}`);  // Add this line
    
    if (this.role === 'staff' && !this.staffRole) {
        return next(new Error('Staff role is required for staff members'));
    }
    next();
});


module.exports = mongoose.model('User', UserSchema);
