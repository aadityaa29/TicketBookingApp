// This defines the data structure for the registration form
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface User {
  _id: string; // ✅ FIX: Changed from 'id' to '_id' to match MongoDB
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  languages: string[];
  duration: number;
  releaseDate: string;
  director: string;
  cast: {
    name: string;
    character?: string;
  }[];
  poster: string;
  banner?: string;
  trailer?: string;
  rating: 'U' | 'U/A' | 'A' | 'S';
  imdbRating: number;
  userRating: {
    average: number;
    count: number;
  };
  isActive: boolean;
  bookingOpenDate: string;
  tags: string[];
  createdAt: string;
}

export interface Theater {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  contact: {
    phone: string;
    email?: string;
  };
  screens: Screen[];
  facilities: string[];
  isActive: boolean;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
}

export interface Screen {
  screenNumber: string;
  name: string;
  totalSeats: number;
  seatLayout: {
    rows: number;
    seatsPerRow: number;
  };
  seatTypes: {
    type: 'Regular' | 'Premium' | 'Recliner' | 'VIP';
    price: number;
    rows: string[];
  }[];
  facilities: string[];
}

export interface Show {
  _id: string;
  movie: Movie;
  theater: Theater;
  screen: {
    screenId: string;
    name: string;
  };
  date: string;
  time: string;
  showLanguage: string; // ✅ FIX: Changed from 'languages' to match your Show model
  format: '2D' | '3D' | 'IMAX' | '4DX';
  pricing: {
    seatType: 'Regular' | 'Premium' | 'Recliner' | 'VIP';
    price: number;
    availableSeats: number;
  }[];
  seats: Seat[];
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  bookingStartTime: string;
  bookingEndTime: string;
  createdAt: string;
}

export interface Seat {
  seatNumber: string;
  row: string;
  seatType: 'Regular' | 'Premium' | 'Recliner' | 'VIP';
  isBooked: boolean;
  isBlocked: boolean;
  blockedTill?: string;
  bookedBy?: string;
}

export interface Booking {
  _id: string;
  bookingId: string;
  user: User;
  show: Show;
  movie: Movie;
  theater: Theater;
  seats: {
    seatNumber: string;
    row: string;
    seatType: string;
    price: number;
  }[];
  totalSeats: number;
  totalAmount: number;
  convenienceFee: number;
  taxes: number;
  finalAmount: number;
  bookingDate: string;
  showDate: string;
  showTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  paymentDetails: {
    paymentId: string;
    paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId: string;
    paidAmount: number;
    paidAt?: string;
  };
  cancellationDetails?: {
    cancelledAt?: string;
    cancelledBy?: string;
    reason?: string;
    refundAmount?: number;
    refundStatus?: 'pending' | 'processed' | 'completed' | 'failed';
  };
  qrCode?: string;
  isUsed: boolean;
  usedAt?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  // ✅ FIX: Changed register to accept a single object to match the AuthContext implementation.
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
}

export interface TheaterGroup {
  theater: Theater;
  shows: {
    _id: string;
    date: string;
    time: string;
    languages: string;
    format: string;
    screen: {
      screenId: string;
      name: string;
    };
    pricing: {
      seatType: string;
      price: number;
      availableSeats: number;
    }[];
    availableSeats: number;
    totalSeats: number;
  }[];
}

export interface BookingRequest {
  showId: string;
  seats: {
    seatNumber: string;
  }[];
}

export interface PaymentRequest {
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  transactionId?: string;
}
