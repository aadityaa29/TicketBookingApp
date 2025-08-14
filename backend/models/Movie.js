const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Movie title is required'],
        trim: true,
        maxLength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Movie description is required'],
        maxLength: [1000, 'Description cannot be more than 1000 characters']
    },
    genre: [{
        type: String,
        required: true,
        enum: [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 
            'Romance', 'Thriller', 'Sci-Fi', 'Fantasy', 'Animation',
            'Crime', 'Documentary', 'Family', 'Mystery', 'War'
        ]
    }],
    // ✅ RENAMED to avoid conflict with MongoDB's reserved 'language' field
    languages: [{
        type: String,
        required: true,
        enum: [
            'Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 
            'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'
        ]
    }],
    duration: {
        type: Number,
        required: [true, 'Movie duration is required'],
        min: [60, 'Duration must be at least 60 minutes']
    },
    releaseDate: {
        type: Date,
        required: [true, 'Release date is required']
    },
    director: {
        type: String,
        required: [true, 'Director name is required'],
        trim: true
    },
    cast: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        character: {
            type: String,
            trim: true
        }
    }],
    poster: {
        type: String,
        required: [true, 'Movie poster is required'],
        match: [/^https?:\/\/.+/, 'Poster must be a valid URL']
    },
    banner: {
        type: String,
        default: '',
        match: [/^$|^https?:\/\/.+/, 'Banner must be a valid URL']
    },
    trailer: {
        type: String,
        default: '',
        match: [/^$|^https?:\/\/.+/, 'Trailer must be a valid URL']
    },
    rating: {
        type: String,
        enum: ['U', 'U/A', 'A', 'S'],
        required: [true, 'Movie rating is required']
    },
    imdbRating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [10, 'Rating cannot be more than 10'],
        default: 0
    },
    userRating: {
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
    isActive: {
        type: Boolean,
        default: true
    },
    bookingOpenDate: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String,
        trim: true
    }],
}, {
    // ✅ ADDED for cleaner timestamps and to include virtuals in output
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ✅ ADDED a virtual property for a user-friendly duration format
movieSchema.virtual('durationInHours').get(function() {
    if (!this.duration) return '';
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    return `${hours}h ${minutes}m`;
});

// ✅ IMPROVED Text index for full-text search optimization
movieSchema.index({
    title: 'text',
    description: 'text',
    genre: 'text',
    languages: 'text', // Now safe to include
    director: 'text',
    'cast.name': 'text'
});

// ✅ ADDED indexes for faster filtering and sorting
movieSchema.index({ releaseDate: -1 }); // For sorting by newest movies
movieSchema.index({ genre: 1 });        // For filtering by genre
movieSchema.index({ isActive: 1 });      // For finding currently active movies

// 🗑️ REMOVED manual updatedAt middleware, as `timestamps: true` handles it.

module.exports = mongoose.model('Movie', movieSchema);