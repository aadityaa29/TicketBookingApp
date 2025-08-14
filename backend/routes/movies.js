const express = require('express');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
router.get('/', async (req, res) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Movie.find(JSON.parse(queryStr));

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Movie.countDocuments(JSON.parse(queryStr));

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const movies = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: movies.length,
            pagination,
            data: movies
        });
    } catch (error) {
        console.error('Get movies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        res.status(200).json({
            success: true,
            data: movie
        });
    } catch (error) {
        console.error('Get single movie error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const movie = await Movie.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Movie created successfully',
            data: movie
        });
    } catch (error) {
        console.error('Create movie error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during movie creation'
        });
    }
});

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        let movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Movie updated successfully',
            data: movie
        });
    } catch (error) {
        console.error('Update movie error:', error);
        
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during movie update'
        });
    }
});

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        await movie.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        console.error('Delete movie error:', error);
        
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during movie deletion'
        });
    }
});

// @desc    Search movies
// @route   GET /api/movies/search/:searchTerm
// @access  Public
router.get('/search/:searchTerm', async (req, res) => {
    try {
        const searchTerm = req.params.searchTerm;
        
        const movies = await Movie.find(
            { $text: { $search: searchTerm } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });

        res.status(200).json({
            success: true,
            count: movies.length,
            data: movies
        });
    } catch (error) {
        console.error('Search movies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during search'
        });
    }
});

// @desc    Get movies by city
// @route   GET /api/movies/city/:city
// @access  Public
router.get('/city/:city', async (req, res) => {
    try {
        const city = req.params.city;
        
        // Get shows in the specified city
        const shows = await Show.find({
            date: { $gte: new Date() }
        }).populate({
            path: 'theater',
            match: { 'address.city': { $regex: city, $options: 'i' } },
            select: 'name address'
        }).populate('movie');

        // Filter out shows where theater is null (didn't match city filter)
        const validShows = shows.filter(show => show.theater !== null);

        // Extract unique movies
        const movieIds = [...new Set(validShows.map(show => show.movie._id.toString()))];
        const movies = await Movie.find({ _id: { $in: movieIds }, isActive: true });

        res.status(200).json({
            success: true,
            count: movies.length,
            data: movies
        });
    } catch (error) {
        console.error('Get movies by city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
