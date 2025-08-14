const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('bookings');

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                isEmailVerified: user.isEmailVerified,
                totalBookings: user.bookings.length,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;

        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (phone) fieldsToUpdate.phone = phone;
        if (avatar) fieldsToUpdate.avatar = avatar;

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
});

// @desc    Get user booking history
// @route   GET /api/users/bookings
// @access  Private
router.get('/bookings', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const total = await Booking.countDocuments({ user: req.user.id });
        
        const bookings = await Booking.find({ user: req.user.id })
            .populate('movie', 'title poster duration rating')
            .populate('theater', 'name address')
            .populate('show', 'date time language format screen')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const pagination = {};
        const endIndex = page * limit;

        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }

        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: bookings.length,
            pagination,
            data: bookings
        });
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get user dashboard stats
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments({ user: req.user.id });
        const confirmedBookings = await Booking.countDocuments({ 
            user: req.user.id, 
            status: 'confirmed' 
        });
        const cancelledBookings = await Booking.countDocuments({ 
            user: req.user.id, 
            status: 'cancelled' 
        });
        const pendingBookings = await Booking.countDocuments({ 
            user: req.user.id, 
            status: 'pending' 
        });

        // Calculate total amount spent
        const totalSpentResult = await Booking.aggregate([
            { 
                $match: { 
                    user: req.user._id, 
                    status: 'confirmed' 
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalSpent: { $sum: '$finalAmount' } 
                } 
            }
        ]);

        const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].totalSpent : 0;

        // Get recent bookings
        const recentBookings = await Booking.find({ user: req.user.id })
            .populate('movie', 'title poster')
            .populate('theater', 'name address.city')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get upcoming shows
        const upcomingBookings = await Booking.find({
            user: req.user.id,
            status: 'confirmed',
            showDate: { $gte: new Date() }
        })
        .populate('movie', 'title poster')
        .populate('theater', 'name address.city')
        .populate('show', 'date time')
        .sort({ showDate: 1 })
        .limit(3);

        res.status(200).json({
            success: true,
            data: {
                totalBookings,
                confirmedBookings,
                cancelledBookings,
                pendingBookings,
                totalSpent,
                recentBookings,
                upcomingBookings
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;

        const total = await User.countDocuments();
        
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const pagination = {};
        const endIndex = page * limit;

        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }

        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: users.length,
            pagination,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('bookings');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user booking stats
        const totalBookings = await Booking.countDocuments({ user: user._id });
        const totalSpentResult = await Booking.aggregate([
            { 
                $match: { 
                    user: user._id, 
                    status: 'confirmed' 
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalSpent: { $sum: '$finalAmount' } 
                } 
            }
        ]);

        const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].totalSpent : 0;

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                stats: {
                    totalBookings,
                    totalSpent
                }
            }
        });
    } catch (error) {
        console.error('Get single user error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
    try {
        const { role } = req.body;

        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid role (user or admin)'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user role error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error during role update'
        });
    }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin users
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error during user deletion'
        });
    }
});

module.exports = router;
