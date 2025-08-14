const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
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
    screen: {
        screenId: {
            type: String,
            required: [true, 'Screen ID is required']
        },
        name: {
            type: String,
            required: [true, 'Screen name is required']
        }
    },
    date: {
        type: Date,
        required: [true, 'Show date is required'],
        validate: {
            validator: function(value) {
                return value >= new Date().setHours(0, 0, 0, 0);
            },
            message: 'Show date cannot be in the past'
        }
    },
    time: {
        type: String,
        required: [true, 'Show time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
    },
    language: {
        type: String,
        required: [true, 'Show language is required'],
        enum: [
            'Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 
            'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'
        ]
    },
    format: {
        type: String,
        enum: ['2D', '3D', 'IMAX', '4DX'],
        default: '2D'
    },
    pricing: [{
        seatType: {
            type: String,
            enum: ['Regular', 'Premium', 'Recliner', 'VIP'],
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: [50, 'Seat price must be at least 50']
        },
        availableSeats: {
            type: Number,
            required: true,
            min: [0, 'Available seats cannot be negative']
        }
    }],
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
        isBooked: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        blockedTill: {
            type: Date,
            default: null
        },
        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    }],
    totalSeats: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    },
    bookedSeats: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    bookingStartTime: {
        type: Date,
        default: Date.now
    },
    bookingEndTime: {
        type: Date,
        required: true
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

// Update the updatedAt field before saving
showSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
showSchema.index({ movie: 1, theater: 1, date: 1 });
showSchema.index({ date: 1, time: 1 });
showSchema.index({ theater: 1, date: 1 });

// Virtual for show datetime
showSchema.virtual('datetime').get(function() {
    const showDate = new Date(this.date);
    const [hours, minutes] = this.time.split(':');
    showDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return showDate;
});

module.exports = mongoose.model('Show', showSchema);
