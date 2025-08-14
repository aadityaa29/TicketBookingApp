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
    language: [{
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
        required: [true, 'Movie poster is required']
    },
    banner: {
        type: String,
        default: ''
    },
    trailer: {
        type: String,
        default: ''
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
movieSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for text search
movieSchema.index({
    title: 'text',
    description: 'text',
    genre: 'text',
    language: 'text',
    director: 'text',
    'cast.name': 'text'
});

module.exports = mongoose.model('Movie', movieSchema);
