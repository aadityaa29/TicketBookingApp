const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Theater name is required'],
        trim: true,
        maxLength: [100, 'Name cannot be more than 100 characters']
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
        },
        pincode: {
            type: String,
            required: [true, 'Pincode is required'],
            match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        }
    },
    contact: {
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^[0-9]{10}$/, 'Please provide a valid phone number']
        },
        email: {
            type: String,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email'
            ]
        }
    },
    screens: [{
        screenNumber: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        totalSeats: {
            type: Number,
            required: true,
            min: [20, 'Screen must have at least 20 seats']
        },
        seatLayout: {
            rows: {
                type: Number,
                required: true,
                min: [5, 'Screen must have at least 5 rows']
            },
            seatsPerRow: {
                type: Number,
                required: true,
                min: [4, 'Each row must have at least 4 seats']
            }
        },
        seatTypes: [{
            type: {
                type: String,
                enum: ['Regular', 'Premium', 'Recliner', 'VIP'],
                required: true
            },
            price: {
                type: Number,
                required: true,
                min: [50, 'Seat price must be at least 50']
            },
            rows: [{
                type: String,
                required: true
            }]
        }],
        facilities: [{
            type: String,
            enum: ['AC', '3D', 'Dolby Atmos', 'IMAX', '4K', 'Recliner Seats']
        }]
    }],
    facilities: [{
        type: String,
        enum: [
            'Parking', 'Food Court', 'Wheelchair Accessible', 
            'Restroom', 'ATM', 'Cafe', 'Gift Shop'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot be more than 5']
        },
        count: {
            type: Number,
            default: 0
        }
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
theaterSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for location-based queries
theaterSchema.index({ location: '2dsphere' });

// Index for text search
theaterSchema.index({
    name: 'text',
    'address.city': 'text',
    'address.state': 'text'
});

module.exports = mongoose.model('Theater', theaterSchema);
