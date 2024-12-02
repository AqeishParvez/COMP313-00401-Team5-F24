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
            await reservation.delete;
        }

        console.log('Expired reservations cleaned up successfully');
        console.log('Next clean up scheduled for:', new Date(Date.now() + 1000 * 60 * 30).toLocaleTimeString());
    } catch (error) {
        console.error('Error cleaning up expired reservations:', error);
    }
};

module.exports = cleanupExpiredReservations;
