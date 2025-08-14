const express = require('express');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all shows
// @route   GET /api/shows
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { movie, theater, city, date, page = 1, limit = 20 } = req.query;
        
        let query = {};
        
        // Filter by movie
        if (movie) {
            query.movie = movie;
        }
        
        // Filter by theater
        if (theater) {
            query.theater = theater;
        }
        
        // Filter by date
        if (date) {
            const searchDate = new Date(date);
            const nextDate = new Date(searchDate);
            nextDate.setDate(nextDate.getDate() + 1);
            
            query.date = {
                $gte: searchDate,
                $lt: nextDate
            };
        } else {
            // Only show future shows by default
            query.date = { $gte: new Date() };
        }

        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const total = await Show.countDocuments(query);

        let shows = await Show.find(query)
            .populate('movie', 'title poster duration rating language genre')
            .populate('theater', 'name address screens facilities')
            .sort({ date: 1, time: 1 })
            .skip(startIndex)
            .limit(parseInt(limit));

        // Filter by city if provided
        if (city) {
            shows = shows.filter(show => 
                show.theater.address.city.toLowerCase().includes(city.toLowerCase())
            );
        }

        const pagination = {};
        const endIndex = parseInt(page) * parseInt(limit);

        if (endIndex < total) {
            pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
        }

        if (startIndex > 0) {
            pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };
        }

        res.status(200).json({
            success: true,
            count: shows.length,
            pagination,
            data: shows
        });
    } catch (error) {
        console.error('Get shows error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get single show with seat availability
// @route   GET /api/shows/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const show = await Show.findById(req.params.id)
            .populate('movie', 'title poster duration rating language genre director cast')
            .populate('theater', 'name address contact screens facilities');

        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        res.status(200).json({
            success: true,
            data: show
        });
    } catch (error) {
        console.error('Get single show error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get shows for a specific movie and city
// @route   GET /api/shows/movie/:movieId/city/:city
// @access  Public
router.get('/movie/:movieId/city/:city', async (req, res) => {
    try {
        const { movieId, city } = req.params;
        const { date } = req.query;

        let dateQuery = { $gte: new Date() };
        if (date) {
            const searchDate = new Date(date);
            const nextDate = new Date(searchDate);
            nextDate.setDate(nextDate.getDate() + 1);
            
            dateQuery = {
                $gte: searchDate,
                $lt: nextDate
            };
        }

        const shows = await Show.find({
            movie: movieId,
            date: dateQuery
        })
        .populate('theater', 'name address screens')
        .populate('movie', 'title duration')
        .sort({ date: 1, time: 1 });

        // Filter by city
        const cityShows = shows.filter(show => 
            show.theater.address.city.toLowerCase().includes(city.toLowerCase())
        );

        // Group shows by theater
        const theaterGroups = cityShows.reduce((groups, show) => {
            const theaterId = show.theater._id.toString();
            if (!groups[theaterId]) {
                groups[theaterId] = {
                    theater: show.theater,
                    shows: []
                };
            }
            groups[theaterId].shows.push({
                _id: show._id,
                date: show.date,
                time: show.time,
                language: show.language,
                format: show.format,
                screen: show.screen,
                pricing: show.pricing,
                availableSeats: show.availableSeats,
                totalSeats: show.totalSeats
            });
            return groups;
        }, {});

        res.status(200).json({
            success: true,
            data: Object.values(theaterGroups)
        });
    } catch (error) {
        console.error('Get shows by movie and city error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create new show
// @route   POST /api/shows
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const {
            movie,
            theater,
            screen,
            date,
            time,
            language,
            format,
            pricing
        } = req.body;

        // Validate movie exists
        const movieExists = await Movie.findById(movie);
        if (!movieExists) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        // Validate theater exists
        const theaterExists = await Theater.findById(theater);
        if (!theaterExists) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        // Find the screen in theater
        const theaterScreen = theaterExists.screens.find(s => s.screenNumber === screen.screenId);
        if (!theaterScreen) {
            return res.status(404).json({
                success: false,
                message: 'Screen not found in theater'
            });
        }

        // Check if show already exists at same time
        const existingShow = await Show.findOne({
            theater,
            'screen.screenId': screen.screenId,
            date: new Date(date),
            time
        });

        if (existingShow) {
            return res.status(400).json({
                success: false,
                message: 'Show already exists at this time in this screen'
            });
        }

        // Generate seats based on theater screen layout
        const seats = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        
        for (let rowIndex = 0; rowIndex < theaterScreen.seatLayout.rows; rowIndex++) {
            const rowLetter = rows[rowIndex];
            for (let seatNum = 1; seatNum <= theaterScreen.seatLayout.seatsPerRow; seatNum++) {
                // Determine seat type based on row
                let seatType = 'Regular';
                if (rowIndex < 2) {
                    seatType = 'Premium';
                } else if (rowIndex >= theaterScreen.seatLayout.rows - 2) {
                    seatType = 'VIP';
                }

                seats.push({
                    seatNumber: `${rowLetter}${seatNum}`,
                    row: rowLetter,
                    seatType,
                    isBooked: false,
                    isBlocked: false
                });
            }
        }

        // Set booking end time (30 minutes before show)
        const showDateTime = new Date(`${date}T${time}`);
        const bookingEndTime = new Date(showDateTime.getTime() - 30 * 60000);

        const show = await Show.create({
            movie,
            theater,
            screen: {
                screenId: screen.screenId,
                name: theaterScreen.name
            },
            date: new Date(date),
            time,
            language,
            format: format || '2D',
            pricing: pricing || [
                { seatType: 'Regular', price: 150, availableSeats: Math.floor(seats.length * 0.6) },
                { seatType: 'Premium', price: 200, availableSeats: Math.floor(seats.length * 0.2) },
                { seatType: 'VIP', price: 300, availableSeats: Math.floor(seats.length * 0.2) }
            ],
            seats,
            totalSeats: seats.length,
            availableSeats: seats.length,
            bookingEndTime
        });

        const populatedShow = await Show.findById(show._id)
            .populate('movie', 'title duration')
            .populate('theater', 'name address');

        res.status(201).json({
            success: true,
            message: 'Show created successfully',
            data: populatedShow
        });
    } catch (error) {
        console.error('Create show error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during show creation'
        });
    }
});

// @desc    Update show
// @route   PUT /api/shows/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        let show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        // Don't allow updates if bookings exist
        if (show.bookedSeats > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot update show with existing bookings'
            });
        }

        show = await Show.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('movie', 'title').populate('theater', 'name');

        res.status(200).json({
            success: true,
            message: 'Show updated successfully',
            data: show
        });
    } catch (error) {
        console.error('Update show error:', error);
        
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
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
            message: 'Server error during show update'
        });
    }
});

// @desc    Delete show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        // Don't allow deletion if bookings exist
        if (show.bookedSeats > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete show with existing bookings'
            });
        }

        await show.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Show deleted successfully'
        });
    } catch (error) {
        console.error('Delete show error:', error);
        
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Show not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during show deletion'
        });
    }
});

module.exports = router;
