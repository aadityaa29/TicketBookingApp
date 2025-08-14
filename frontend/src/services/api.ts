import axios from 'axios';
import { 
  ApiResponse, 
  User, 
  Movie, 
  Theater, 
  Show, 
  Booking, 
  TheaterGroup, 
  BookingRequest, 
  PaymentRequest,
  RegisterData // Make sure this is imported from your types file
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // This will trigger the logout function in your AuthContext if the token is invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Define the shape of the auth response data, which is just a token
type AuthResponse = {
  token: string;
};

// --- AUTH API ---
export const authApi = {
  // ✅ FIX: Changed to accept a single data object to match AuthContext
  register: (data: RegisterData) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  // ✅ FIX: The backend only returns a token, not the user object
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  // ✅ FIX: Corrected the endpoint to match your backend user routes
  getProfile: () =>
    api.get<ApiResponse<User>>('/users/profile'),
};

// --- MOVIES API ---
export const moviesApi = {
  getMovies: (params?: {
    page?: number;
    limit?: number;
    genre?: string;
    languages?: string; // Note: backend model uses 'languages'
    city?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.genre) queryParams.append('genre', params.genre);
    if (params?.languages) queryParams.append('languages', params.languages);
    
    let url = '/movies';
    if (params?.city) {
        url = `/movies/city/${params.city}`;
    }
    
    return api.get<ApiResponse<Movie[]>>(`${url}?${queryParams.toString()}`);
  },

  getMovie: (id: string) =>
    api.get<ApiResponse<Movie>>(`/movies/${id}`),

  searchMovies: (searchTerm: string) =>
    api.get<ApiResponse<Movie[]>>(`/movies/search?q=${searchTerm}`), // Changed to query param
};

// --- THEATERS API ---
export const theatersApi = {
  getTheaters: (params?: {
    page?: number;
    limit?: number;
    city?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.city) queryParams.append('city', params.city);
    
    return api.get<ApiResponse<Theater[]>>(`/theaters?${queryParams.toString()}`);
  },

  getTheater: (id: string) =>
    api.get<ApiResponse<Theater>>(`/theaters/${id}`),
};

// --- SHOWS API ---
export const showsApi = {
  getShowsForMovieAndCity: (movieId: string, city: string, date?: string) => {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    
    return api.get<ApiResponse<TheaterGroup[]>>(`/shows/movie/${movieId}/city/${city}?${queryParams.toString()}`);
  },

  getShow: (id: string) =>
    api.get<ApiResponse<Show>>(`/shows/${id}`),
};

// --- BOOKINGS API ---
export const bookingsApi = {
  createBooking: (data: BookingRequest) =>
    api.post<ApiResponse<Booking>>('/bookings', data),

  confirmBooking: (id: string, data: PaymentRequest) =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}/confirm`, data),

  cancelBooking: (id: string, reason?: string) =>
    api.put<ApiResponse<{ bookingId: string; refundAmount: number; message: string }>>(`/bookings/${id}/cancel`, {
      reason,
    }),
  
  getBooking: (id: string) =>
    api.get<ApiResponse<Booking>>(`/bookings/${id}`),
};

// --- USERS API (for authenticated user actions) ---
export const usersApi = {
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.put<ApiResponse<User>>('/users/profile', data),

  getBookings: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return api.get<ApiResponse<Booking[]>>(`/users/bookings?${queryParams.toString()}`);
  },

  getStats: () =>
    api.get<ApiResponse<{
      totalBookings: number;
      confirmedBookings: number;
      cancelledBookings: number;
      pendingBookings: number;
      totalSpent: number;
      recentBookings: Booking[];
      upcomingBookings: Booking[];
    }>>('/users/stats'),
};

export default api;
