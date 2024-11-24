const ProductTimeout = require('../models/ProductTimeout');
const Product = require('../models/Product');

const cleanupExpiredReservations = async () => {
    try {
        const now = new Date();
        const expiredReservations = await ProductTimeout.find({ expiryTime: { $lte: now } });

        for (const reservation of expiredReservations) {
            const product = await Product.findById(reservation.productId);
            if (product) {
                product.quantity += reservation.quantity;
                await product.save();
            }
            await reservation.remove();
        }

        console.log('Expired reservations cleaned up successfully');
    } catch (error) {
        console.error('Error cleaning up expired reservations:', error);
    }
};

module.exports = cleanupExpiredReservations;
