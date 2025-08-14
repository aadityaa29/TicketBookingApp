# BookMyShow Clone - MERN Stack Ticket Booking App

A full-stack movie ticket booking application similar to BookMyShow, built with MongoDB, Express.js, React, and Node.js.

## Features

- **User Authentication**: JWT-based login and registration
- **Movie Listings**: Browse and search movies with filters
- **Theater Selection**: View available theaters and showtimes
- **Seat Selection**: Interactive seat booking with real-time availability
- **Booking Management**: Create, view, and cancel bookings
- **Payment Simulation**: Mock payment integration
- **Admin Panel**: Manage movies, theaters, and shows (Admin users)
- **Responsive Design**: BookMyShow-inspired UI that works on all devices

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Styled Components** - CSS-in-JS styling
- **Axios** - HTTP client
- **React Toastify** - Notifications

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/aadityaa29/TicketBookingApp.git
cd TicketBookingApp
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ticketbooking
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install --legacy-peer-deps

# Create environment file
echo "REACT_APP_API_BASE_URL=http://localhost:5000/api" > .env
```

## Running the Application

### 1. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows (if installed as service)
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 2. Seed the Database (First time only)
```bash
cd backend
npm run seed
```

This will create sample data including:
- Movies (Avatar, Black Panther, Top Gun)
- Theaters (PVR, INOX)
- Shows for the next 7 days
- Admin user account

**Default Admin Credentials:**
- Email: `admin@bookmyshow.com`
- Password: `admin123`

### 3. Start the Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

### 4. Start the Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Movies
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get single movie
- `GET /api/movies/search/:term` - Search movies
- `POST /api/movies` - Create movie (Admin only)

### Theaters
- `GET /api/theaters` - Get all theaters
- `GET /api/theaters/:id` - Get single theater
- `GET /api/theaters/city/:city` - Get theaters by city

### Shows
- `GET /api/shows` - Get all shows
- `GET /api/shows/:id` - Get single show
- `GET /api/shows/movie/:movieId/city/:city` - Get shows for movie in city
- `POST /api/shows` - Create show (Admin only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/confirm` - Confirm booking payment
- `PUT /api/bookings/:id/cancel` - Cancel booking

## Project Structure

```
TicketBookingApp/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Theater.js
│   │   ├── Show.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── theaters.js
│   │   ├── shows.js
│   │   ├── bookings.js
│   │   └── users.js
│   ├── .env
│   ├── server.js
│   ├── seedData.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Movies.tsx
│   │   │   ├── MovieDetails.tsx
│   │   │   ├── ShowSelection.tsx
│   │   │   ├── SeatSelection.tsx
│   │   │   ├── BookingConfirmation.tsx
│   │   │   └── Profile.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── styles/
│   │   │   └── GlobalStyles.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── .env
│   └── package.json
└── README.md
```

## Features to Implement

The current implementation includes the basic structure. You can extend it with:

### Frontend Components (Priority)
1. **Complete Registration Page** - Full registration form with validation
2. **Movie Details Page** - Detailed movie information, cast, reviews
3. **Show Selection** - Theater and showtime selection interface
4. **Seat Selection** - Interactive seat map with booking
5. **Payment Integration** - Real payment gateway integration
6. **Booking History** - User's past and upcoming bookings
7. **Search & Filters** - Advanced movie search and filtering

### Backend Enhancements
1. **Email Notifications** - Booking confirmations and reminders
2. **Image Upload** - Movie posters and user avatars
3. **Reviews & Ratings** - User reviews for movies and theaters
4. **Coupons & Offers** - Discount codes and promotional offers
5. **Real-time Updates** - WebSocket for seat availability
6. **Payment Gateway** - Stripe, Razorpay, or PayPal integration

### Additional Features
1. **Mobile App** - React Native version
2. **Admin Dashboard** - Complete admin interface
3. **Analytics** - Booking statistics and reports
4. **Multi-language** - Internationalization support
5. **PWA** - Progressive Web App features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in .env file

2. **CORS Errors**
   - Make sure backend is running on port 5000
   - Check REACT_APP_API_BASE_URL in frontend .env

3. **JWT Errors**
   - Clear localStorage and login again
   - Check JWT_SECRET in backend .env

4. **Module Not Found Errors**
   - Run `npm install` in both frontend and backend directories
   - Use `--legacy-peer-deps` flag for frontend

### Getting Help

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend server logs
3. Ensure all environment variables are set correctly
4. Make sure you've run the seed script to populate sample data

## Acknowledgments

- Inspired by BookMyShow's user interface and functionality
- Built with modern React and Node.js best practices
- Styled to match contemporary movie booking platforms
