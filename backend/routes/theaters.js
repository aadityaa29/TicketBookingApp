const express = require('express');
const Theater = require('../models/Theater');
const Show = require('../models/Show');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all theaters
// @route   GET /api/theaters
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
        query = Theater.find(JSON.parse(queryStr));

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
        const total = await Theater.countDocuments(JSON.parse(queryStr));

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const theaters = await query;

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
            count: theaters.length,
            pagination,
            data: theaters
        });
    } catch (error) {
        console.error('Get theaters error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get single theater
// @route   GET /api/theaters/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);

        if (!theater) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        res.status(200).json({
            success: true,
            data: theater
        });
    } catch (error) {
        console.error('Get single theater error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create new theater
// @route   POST /api/theaters
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const theater = await Theater.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Theater created successfully',
            data: theater
        });
    } catch (error) {
        console.error('Create theater error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during theater creation'
        });
    }
});

// @desc    Update theater
// @route   PUT /api/theaters/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        let theater = await Theater.findById(req.params.id);

        if (!theater) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        theater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Theater updated successfully',
            data: theater
        });
    } catch (error) {
        console.error('Update theater error:', error);
        
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
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
            message: 'Server error during theater update'
        });
    }
});

// @desc    Delete theater
// @route   DELETE /api/theaters/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);

        if (!theater) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        await theater.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Theater deleted successfully'
        });
    } catch (error) {
        console.error('Delete theater error:', error);
        
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during theater deletion'
        });
    }
});

// @desc    Get theaters by city
// @route   GET /api/theaters/city/:city
// @access  Public
router.get('/city/:city', async (req, res) => {
    try {
        const city = req.params.city;
        
        const theaters = await Theater.find({
            'address.city': { $regex: city, $options: 'i' },
            isActive: true
        }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: theaters.length,
            data: theaters
        });
    } catch (error) {
        console.error('Get theaters by city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get theaters showing a specific movie
// @route   GET /api/theaters/movie/:movieId
// @access  Public
router.get('/movie/:movieId', async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const city = req.query.city;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Build query for shows
        let showQuery = { 
            movie: movieId,
            date: { $gte: new Date(date) }
        };

        // Get shows for the movie
        const shows = await Show.find(showQuery).populate('theater');

        // Filter by city if provided
        let theaters = shows.map(show => show.theater);
        
        if (city) {
            theaters = theaters.filter(theater => 
                theater.address.city.toLowerCase().includes(city.toLowerCase())
            );
        }

        // Remove duplicates and get unique theaters
        const uniqueTheaterIds = [...new Set(theaters.map(theater => theater._id.toString()))];
        const uniqueTheaters = theaters.filter((theater, index, self) => 
            index === self.findIndex(t => t._id.toString() === theater._id.toString())
        );

        res.status(200).json({
            success: true,
            count: uniqueTheaters.length,
            data: uniqueTheaters
        });
    } catch (error) {
        console.error('Get theaters for movie error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get theaters within radius
// @route   GET /api/theaters/radius/:zipcode/:distance
// @access  Public
router.get('/radius/:zipcode/:distance', async (req, res) => {
    try {
        const { zipcode, distance } = req.params;

        // Get lat/lng from geocoder (you would need to implement geocoding)
        // For now, we'll use a simple proximity search
        
        const theaters = await Theater.find({
            'address.pincode': { $regex: zipcode.substring(0, 3) },
            isActive: true
        });

        res.status(200).json({
            success: true,
            count: theaters.length,
            data: theaters
        });
    } catch (error) {
        console.error('Get theaters by radius error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Search theaters
// @route   GET /api/theaters/search/:searchTerm
// @access  Public
router.get('/search/:searchTerm', async (req, res) => {
    try {
        const searchTerm = req.params.searchTerm;
        
        const theaters = await Theater.find(
            { $text: { $search: searchTerm } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });

        res.status(200).json({
            success: true,
            count: theaters.length,
            data: theaters
        });
    } catch (error) {
        console.error('Search theaters error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during search'
        });
    }
});

module.exports = router;
