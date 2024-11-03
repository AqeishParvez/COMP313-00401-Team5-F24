
const User = require('../models/User');

// Update user information and notification preferences
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, notifications } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, email, notifications },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User information updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user information', error: error.message });
    }
};

// Delete user (customers only)
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is a customer
        if (user.role !== 'customer') {
            return res.status(403).json({ message: 'Only customers can delete their account' });
        }

        await User.findByIdAndDelete(id);

        res.json({ message: 'User account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user account', error: error.message });
    }
};
