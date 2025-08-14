const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all bookings for user
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('movie', 'title poster duration')
            .populate('theater', 'name address')
            .populate('show', 'date time language format screen')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('movie', 'title poster duration director cast')
            .populate('theater', 'name address contact')
            .populate('show', 'date time language format screen')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Make sure user owns booking or is admin
        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this booking'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get single booking error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { showId, seats } = req.body;

        if (!showId || !seats || seats.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide show ID and selected seats'
            });
        }

        // Get show details
        const show = await Show.findById(showId)
            .populate('movie')
            .populate('theater');

        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        // Check if seats are available
        const seatNumbers = seats.map(seat => seat.seatNumber);
        const unavailableSeats = show.seats.filter(seat => 
            seatNumbers.includes(seat.seatNumber) && 
            (seat.isBooked || seat.isBlocked)
        );

        if (unavailableSeats.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Seats ${unavailableSeats.map(s => s.seatNumber).join(', ')} are not available`
            });
        }

        // Calculate total amount
        let totalAmount = 0;
        const bookingSeats = [];

        seats.forEach(seatData => {
            const showSeat = show.seats.find(seat => seat.seatNumber === seatData.seatNumber);
            if (showSeat) {
                const pricing = show.pricing.find(p => p.seatType === showSeat.seatType);
                const seatPrice = pricing ? pricing.price : 150;
                totalAmount += seatPrice;
                
                bookingSeats.push({
                    seatNumber: showSeat.seatNumber,
                    row: showSeat.row,
                    seatType: showSeat.seatType,
                    price: seatPrice
                });
            }
        });

        // Calculate additional charges
        const convenienceFee = Math.round(totalAmount * 0.02); // 2% convenience fee
        const taxes = Math.round(totalAmount * 0.18); // 18% GST
        const finalAmount = totalAmount + convenienceFee + taxes;

        // Create booking
        const booking = await Booking.create({
            user: req.user.id,
            show: showId,
            movie: show.movie._id,
            theater: show.theater._id,
            seats: bookingSeats,
            totalSeats: seats.length,
            totalAmount,
            convenienceFee,
            taxes,
            finalAmount,
            showDate: show.date,
            showTime: show.time,
            status: 'pending'
        });

        // Block seats for 10 minutes
        const blockTime = new Date(Date.now() + 10 * 60 * 1000);
        
        for (let seatNumber of seatNumbers) {
            const seatIndex = show.seats.findIndex(seat => seat.seatNumber === seatNumber);
            if (seatIndex !== -1) {
                show.seats[seatIndex].isBlocked = true;
                show.seats[seatIndex].blockedTill = blockTime;
                show.seats[seatIndex].bookedBy = req.user.id;
            }
        }

        await show.save();

        // Populate booking details
        const populatedBooking = await Booking.findById(booking._id)
            .populate('movie', 'title poster duration')
            .populate('theater', 'name address')
            .populate('show', 'date time language format screen');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully. Complete payment within 10 minutes.',
            data: populatedBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during booking creation'
        });
    }
});

// @desc    Confirm booking (simulate payment)
// @route   PUT /api/bookings/:id/confirm
// @access  Private
router.put('/:id/confirm', protect, async (req, res) => {
    try {
        const { paymentMethod, transactionId } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Make sure user owns booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to confirm this booking'
            });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Booking is not in pending state'
            });
        }

        // Get show to update seat status
        const show = await Show.findById(booking.show);

        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        // Update seat status from blocked to booked
        const seatNumbers = booking.seats.map(seat => seat.seatNumber);
        
        for (let seatNumber of seatNumbers) {
            const seatIndex = show.seats.findIndex(seat => seat.seatNumber === seatNumber);
            if (seatIndex !== -1) {
                show.seats[seatIndex].isBooked = true;
                show.seats[seatIndex].isBlocked = false;
                show.seats[seatIndex].blockedTill = null;
                show.seats[seatIndex].bookedBy = req.user.id;
            }
        }

        // Update show statistics
        show.bookedSeats += booking.totalSeats;
        show.availableSeats -= booking.totalSeats;

        await show.save();

        // Update booking
        booking.status = 'confirmed';
        booking.paymentDetails.paymentMethod = paymentMethod || 'card';
        booking.paymentDetails.paymentStatus = 'completed';
        booking.paymentDetails.transactionId = transactionId || `TXN${Date.now()}`;
        booking.paymentDetails.paidAmount = booking.finalAmount;
        booking.paymentDetails.paidAt = new Date();

        await booking.save();

        // Add booking to user's booking history
        await User.findByIdAndUpdate(req.user.id, {
            $push: { bookings: booking._id }
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('movie', 'title poster duration')
            .populate('theater', 'name address')
            .populate('show', 'date time language format screen');

        res.status(200).json({
            success: true,
            message: 'Booking confirmed successfully',
            data: populatedBooking
        });
    } catch (error) {
        console.error('Confirm booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during booking confirmation'
        });
    }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Make sure user owns booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        // Check if show date is not past
        if (new Date(booking.showDate) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel booking for past shows'
            });
        }

        // Get show to free up seats
        const show = await Show.findById(booking.show);

        if (show) {
            const seatNumbers = booking.seats.map(seat => seat.seatNumber);
            
            for (let seatNumber of seatNumbers) {
                const seatIndex = show.seats.findIndex(seat => seat.seatNumber === seatNumber);
                if (seatIndex !== -1) {
                    show.seats[seatIndex].isBooked = false;
                    show.seats[seatIndex].isBlocked = false;
                    show.seats[seatIndex].blockedTill = null;
                    show.seats[seatIndex].bookedBy = null;
                }
            }

            // Update show statistics
            show.bookedSeats -= booking.totalSeats;
            show.availableSeats += booking.totalSeats;

            await show.save();
        }

        // Calculate refund amount (90% of paid amount)
        const refundAmount = Math.round(booking.paymentDetails.paidAmount * 0.9);

        // Update booking
        booking.status = 'cancelled';
        booking.cancellationDetails.cancelledAt = new Date();
        booking.cancellationDetails.cancelledBy = req.user.id;
        booking.cancellationDetails.reason = reason || 'User cancelled';
        booking.cancellationDetails.refundAmount = refundAmount;
        booking.cancellationDetails.refundStatus = 'pending';
        booking.paymentDetails.paymentStatus = 'refunded';

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: {
                bookingId: booking.bookingId,
                refundAmount,
                message: 'Refund will be processed within 5-7 business days'
            }
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during booking cancellation'
        });
    }
});

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;

        const total = await Booking.countDocuments();
        
        const bookings = await Booking.find()
            .populate('user', 'name email phone')
            .populate('movie', 'title')
            .populate('theater', 'name address.city')
            .populate('show', 'date time')
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
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
