const express = require('express');
const mongoose = require('mongoose'); // Import mongoose for aggregation
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ✅ IMPROVEMENT: Helper function to shape the user response and avoid repetition.
const formatUserResponse = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
    };
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const totalBookings = await Booking.countDocuments({ user: req.user.id });

        const userData = formatUserResponse(user);
        userData.totalBookings = totalBookings;

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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
            data: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Update profile error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error during profile update' });
    }
});

// @desc    Get user booking history
// @route   GET /api/users/bookings
// @access  Private
router.get('/bookings', protect, async (req, res) => {
    // This route is well-written, no changes needed.
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const total = await Booking.countDocuments({ user: req.user.id });
        
        const bookings = await Booking.find({ user: req.user.id })
            .populate('movie', 'title poster duration rating')
            .populate('theater', 'name address')
            .populate('show', 'date time showLanguage format screen') // Renamed from 'language'
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

        res.status(200).json({ success: true, count: bookings.length, pagination, data: bookings });
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get user dashboard stats
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        // ✅ MAJOR PERFORMANCE FIX: Replaced 7+ DB calls with a single, efficient aggregation pipeline.
        const [stats] = await Booking.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $facet: {
                    "bookingCounts": [
                        { $group: { _id: '$status', count: { $sum: 1 } } },
                        { $group: { _id: null, counts: { $push: { k: '$_id', v: '$count' } } } },
                        { $project: { _id: 0, statusCounts: { $arrayToObject: '$counts' } } }
                    ],
                    "totalSpent": [
                        { $match: { status: 'confirmed' } },
                        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
                    ],
                    "recentBookings": [
                        { $sort: { createdAt: -1 } },
                        { $limit: 5 },
                        { $lookup: { from: 'movies', localField: 'movie', foreignField: '_id', as: 'movie' } },
                        { $lookup: { from: 'theaters', localField: 'theater', foreignField: '_id', as: 'theater' } },
                        { $unwind: '$movie' },
                        { $unwind: '$theater' },
                        { $project: { movie: { title: 1, poster: 1 }, theater: { name: 1, 'address.city': 1 }, createdAt: 1, finalAmount: 1, status: 1 } }
                    ],
                    "upcomingBookings": [
                        { $match: { status: 'confirmed', showDate: { $gte: new Date() } } },
                        { $sort: { showDate: 1 } },
                        { $limit: 3 },
                        { $lookup: { from: 'movies', localField: 'movie', foreignField: '_id', as: 'movie' } },
                        { $lookup: { from: 'theaters', localField: 'theater', foreignField: '_id', as: 'theater' } },
                        { $lookup: { from: 'shows', localField: 'show', foreignField: '_id', as: 'show' } },
                        { $unwind: '$movie' },
                        { $unwind: '$theater' },
                        { $unwind: '$show' },
                        { $project: { movie: { title: 1, poster: 1 }, theater: { name: 1, 'address.city': 1 }, show: { date: 1, time: 1 }, showDate: 1 } }
                    ]
                }
            }
        ]);

        const statusCounts = stats.bookingCounts[0]?.statusCounts || {};
        
        res.status(200).json({
            success: true,
            data: {
                totalBookings: (statusCounts.confirmed || 0) + (statusCounts.cancelled || 0) + (statusCounts.pending || 0),
                confirmedBookings: statusCounts.confirmed || 0,
                cancelledBookings: statusCounts.cancelled || 0,
                pendingBookings: statusCounts.pending || 0,
                totalSpent: stats.totalSpent[0]?.total || 0,
                recentBookings: stats.recentBookings || [],
                upcomingBookings: stats.upcomingBookings || []
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// --- ADMIN ROUTES ---

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    // This route is well-written, no changes needed.
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

        res.status(200).json({ success: true, count: users.length, pagination, data: users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
    // This route is fine, but for simplicity, can be improved later if needed.
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('bookings');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const totalBookings = await Booking.countDocuments({ user: user._id });
        const totalSpentResult = await Booking.aggregate([
            { $match: { user: user._id, status: 'confirmed' } },
            { $group: { _id: null, totalSpent: { $sum: '$finalAmount' } } }
        ]);
        const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].totalSpent : 0;

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                stats: { totalBookings, totalSpent }
            }
        });
    } catch (error) {
        console.error('Get single user error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
    // This route is well-written, no changes needed.
    try {
        const { role } = req.body;
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid role (user or admin)' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.role = role;
        await user.save();

        res.status(200).json({ success: true, message: `User role updated to ${role}`, data: formatUserResponse(user) });
    } catch (error) {
        console.error('Update user role error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(500).json({ success: false, message: 'Server error during role update' });
    }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
        }
        
        // ⚠️ DATA INTEGRITY NOTE: This deletes the user, but their bookings remain in the database.
        // To fix this, you must add a cascading delete middleware to your User model.
        // See the explanation below this code block.
        await user.deleteOne();

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(500).json({ success: false, message: 'Server error during user deletion' });
    }
});

module.exports = router;