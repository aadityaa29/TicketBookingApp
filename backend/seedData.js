const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load models
const User = require('./models/User');
const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
const Show = require('./models/Show');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketbooking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const sampleMovies = [
  {
    title: "Avatar: The Way of Water",
    description: "Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family, the trouble that follows them, and the lengths they go to keep each other safe.",
    genre: ["Action", "Adventure", "Sci-Fi"],
    language: ["English", "Hindi"],
    duration: 192,
    releaseDate: new Date("2022-12-16"),
    director: "James Cameron",
    cast: [
      { name: "Sam Worthington", character: "Jake Sully" },
      { name: "Zoe Saldana", character: "Neytiri" },
      { name: "Sigourney Weaver", character: "Kiri" }
    ],
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    banner: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    rating: "U/A",
    imdbRating: 7.6,
    isActive: true,
    tags: ["3D", "IMAX", "Dolby Atmos"]
  },
  {
    title: "Black Panther: Wakanda Forever",
    description: "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T'Challa's death.",
    genre: ["Action", "Adventure", "Drama"],
    language: ["English", "Hindi"],
    duration: 161,
    releaseDate: new Date("2022-11-11"),
    director: "Ryan Coogler",
    cast: [
      { name: "Letitia Wright", character: "Shuri" },
      { name: "Angela Bassett", character: "Ramonda" },
      { name: "Tenoch Huerta", character: "Namor" }
    ],
    poster: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    rating: "U/A",
    imdbRating: 6.7,
    isActive: true,
    tags: ["IMAX", "Dolby Atmos"]
  },
  {
    title: "Top Gun: Maverick",
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN's elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.",
    genre: ["Action", "Drama"],
    language: ["English", "Hindi"],
    duration: 130,
    releaseDate: new Date("2022-05-27"),
    director: "Joseph Kosinski",
    cast: [
      { name: "Tom Cruise", character: "Pete 'Maverick' Mitchell" },
      { name: "Miles Teller", character: "Bradley 'Rooster' Bradshaw" },
      { name: "Jennifer Connelly", character: "Penny Benjamin" }
    ],
    poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    rating: "U/A",
    imdbRating: 8.3,
    isActive: true,
    tags: ["IMAX", "Dolby Atmos"]
  }
];

const sampleTheaters = [
  {
    name: "PVR Phoenix MarketCity",
    address: {
      street: "Phoenix MarketCity, LBS Marg",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400070"
    },
    location: {
      type: "Point",
      coordinates: [72.8905, 19.0869]
    },
    contact: {
      phone: "9999123456"
    },
    screens: [
      {
        screenNumber: "1",
        name: "Screen 1",
        totalSeats: 180,
        seatLayout: {
          rows: 15,
          seatsPerRow: 12
        },
        seatTypes: [
          {
            type: "Regular",
            price: 200,
            rows: ["A", "B", "C", "D", "E", "F", "G", "H"]
          },
          {
            type: "Premium",
            price: 300,
            rows: ["I", "J", "K", "L"]
          },
          {
            type: "VIP",
            price: 450,
            rows: ["M", "N", "O"]
          }
        ],
        facilities: ["AC", "Dolby Atmos", "3D"]
      },
      {
        screenNumber: "2",
        name: "Screen 2",
        totalSeats: 150,
        seatLayout: {
          rows: 12,
          seatsPerRow: 12
        },
        seatTypes: [
          {
            type: "Regular",
            price: 180,
            rows: ["A", "B", "C", "D", "E", "F", "G", "H"]
          },
          {
            type: "Premium",
            price: 280,
            rows: ["I", "J", "K", "L"]
          }
        ],
        facilities: ["AC", "3D"]
      }
    ],
    facilities: ["Parking", "Food Court", "ATM", "Restroom"],
    isActive: true
  },
  {
    name: "INOX R-City Mall",
    address: {
      street: "R-City Mall, Ghatkopar West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400086"
    },
    location: {
      type: "Point",
      coordinates: [72.9081, 19.0895]
    },
    contact: {
      phone: "9999654321"
    },
    screens: [
      {
        screenNumber: "1",
        name: "Insignia Screen 1",
        totalSeats: 200,
        seatLayout: {
          rows: 16,
          seatsPerRow: 12
        },
        seatTypes: [
          {
            type: "Regular",
            price: 220,
            rows: ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
          },
          {
            type: "Premium",
            price: 320,
            rows: ["J", "K", "L", "M"]
          },
          {
            type: "Recliner",
            price: 500,
            rows: ["N", "O", "P"]
          }
        ],
        facilities: ["AC", "IMAX", "Dolby Atmos", "4K"]
      }
    ],
    facilities: ["Parking", "Food Court", "ATM", "Restroom", "Wheelchair Accessible"],
    isActive: true
  }
];

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theater.deleteMany({});
    await Show.deleteMany({});

    console.log('Existing data cleared');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@bookmyshow.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin'
    });

    console.log('Admin user created');

    // Create movies
    const movies = await Movie.create(sampleMovies);
    console.log(`${movies.length} movies created`);

    // Create theaters
    const theaters = await Theater.create(sampleTheaters);
    console.log(`${theaters.length} theaters created`);

    // Create shows for next 7 days
    const shows = [];
    const showTimes = ['10:00', '13:30', '17:00', '20:30'];
    
    for (let i = 0; i < 7; i++) {
      const showDate = new Date();
      showDate.setDate(showDate.getDate() + i);
      
      for (const movie of movies) {
        for (const theater of theaters) {
          for (const screen of theater.screens) {
            for (const time of showTimes) {
              // Create seats array
              const seats = [];
              const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
              
              for (let rowIndex = 0; rowIndex < screen.seatLayout.rows; rowIndex++) {
                const rowLetter = rows[rowIndex];
                for (let seatNum = 1; seatNum <= screen.seatLayout.seatsPerRow; seatNum++) {
                  // Determine seat type based on screen configuration
                  let seatType = 'Regular';
                  const seatTypeConfig = screen.seatTypes.find(st => 
                    st.rows.includes(rowLetter)
                  );
                  if (seatTypeConfig) {
                    seatType = seatTypeConfig.type;
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
              const showDateTime = new Date(`${showDate.toISOString().split('T')[0]}T${time}`);
              const bookingEndTime = new Date(showDateTime.getTime() - 30 * 60000);

              const show = {
                movie: movie._id,
                theater: theater._id,
                screen: {
                  screenId: screen.screenNumber,
                  name: screen.name
                },
                date: showDate,
                time,
                language: movie.language[0],
                format: screen.facilities.includes('3D') ? '3D' : '2D',
                pricing: screen.seatTypes.map(st => ({
                  seatType: st.type,
                  price: st.price,
                  availableSeats: seats.filter(seat => seat.seatType === st.type).length
                })),
                seats,
                totalSeats: seats.length,
                availableSeats: seats.length,
                bookedSeats: 0,
                bookingEndTime
              };

              shows.push(show);
            }
          }
        }
      }
    }

    await Show.create(shows);
    console.log(`${shows.length} shows created`);

    console.log('Sample data seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@bookmyshow.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  seedData();
});
