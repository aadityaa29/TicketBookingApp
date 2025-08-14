const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    show: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show',
        required: [true, 'Show reference is required']
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Movie reference is required']
    },
    theater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: [true, 'Theater reference is required']
    },
    seats: [{
        seatNumber: {
            type: String,
            required: true
        },
        row: {
            type: String,
            required: true
        },
        seatType: {
            type: String,
            enum: ['Regular', 'Premium', 'Recliner', 'VIP'],
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: [50, 'Seat price must be at least 50']
        }
    }],
    totalSeats: {
        type: Number,
        required: true,
        min: [1, 'Must book at least 1 seat']
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [50, 'Total amount must be at least 50']
    },
    convenienceFee: {
        type: Number,
        default: 0,
        min: [0, 'Convenience fee cannot be negative']
    },
    taxes: {
        type: Number,
        default: 0,
        min: [0, 'Taxes cannot be negative']
    },
    finalAmount: {
        type: Number,
        required: true,
        min: [50, 'Final amount must be at least 50']
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    showDate: {
        type: Date,
        required: true
    },
    showTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        paymentId: {
            type: String,
            default: ''
        },
        paymentMethod: {
            type: String,
            enum: ['card', 'upi', 'netbanking', 'wallet'],
            default: 'card'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: {
            type: String,
            default: ''
        },
        paidAmount: {
            type: Number,
            default: 0
        },
        paidAt: {
            type: Date,
            default: null
        }
    },
    cancellationDetails: {
        cancelledAt: {
            type: Date,
            default: null
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        reason: {
            type: String,
            default: ''
        },
        refundAmount: {
            type: Number,
            default: 0
        },
        refundStatus: {
            type: String,
            enum: ['pending', 'processed', 'completed', 'failed'],
            default: 'pending'
        }
    },
    qrCode: {
        type: String,
        default: ''
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate booking ID before saving
bookingSchema.pre('save', async function(next) {
    if (!this.bookingId) {
        const timestamp = Date.now().toString();
        const randomNum = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.bookingId = `BMS${timestamp.slice(-6)}${randomNum}`;
    }
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ show: 1 });
bookingSchema.index({ status: 1 });

// Virtual for booking display
bookingSchema.virtual('displayId').get(function() {
    return this.bookingId;
});

module.exports = mongoose.model('Booking', bookingSchema);
