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
  PaymentRequest 
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (name: string, email: string, password: string, phone: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', {
      name,
      email,
      password,
      phone,
    }),

  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    }),

  getProfile: () =>
    api.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<ApiResponse<User>>('/auth/updateprofile', data),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put<ApiResponse<{ token: string }>>('/auth/updatepassword', {
      currentPassword,
      newPassword,
    }),
};

// Movies API
export const moviesApi = {
  getMovies: (params?: {
    page?: number;
    limit?: number;
    genre?: string;
    language?: string;
    city?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.genre) queryParams.append('genre', params.genre);
    if (params?.language) queryParams.append('language', params.language);
    
    return api.get<ApiResponse<Movie[]>>(`/movies?${queryParams.toString()}`);
  },

  getMovie: (id: string) =>
    api.get<ApiResponse<Movie>>(`/movies/${id}`),

  searchMovies: (searchTerm: string) =>
    api.get<ApiResponse<Movie[]>>(`/movies/search/${searchTerm}`),

  getMoviesByCity: (city: string) =>
    api.get<ApiResponse<Movie[]>>(`/movies/city/${city}`),
};

// Theaters API
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

  getTheatersByCity: (city: string) =>
    api.get<ApiResponse<Theater[]>>(`/theaters/city/${city}`),

  getTheatersForMovie: (movieId: string, city?: string, date?: string) => {
    const queryParams = new URLSearchParams();
    if (city) queryParams.append('city', city);
    if (date) queryParams.append('date', date);
    
    return api.get<ApiResponse<Theater[]>>(`/theaters/movie/${movieId}?${queryParams.toString()}`);
  },
};

// Shows API
export const showsApi = {
  getShows: (params?: {
    movie?: string;
    theater?: string;
    city?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.movie) queryParams.append('movie', params.movie);
    if (params?.theater) queryParams.append('theater', params.theater);
    if (params?.city) queryParams.append('city', params.city);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return api.get<ApiResponse<Show[]>>(`/shows?${queryParams.toString()}`);
  },

  getShow: (id: string) =>
    api.get<ApiResponse<Show>>(`/shows/${id}`),

  getShowsForMovieAndCity: (movieId: string, city: string, date?: string) => {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    
    return api.get<ApiResponse<TheaterGroup[]>>(`/shows/movie/${movieId}/city/${city}?${queryParams.toString()}`);
  },
};

// Bookings API
export const bookingsApi = {
  getBookings: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return api.get<ApiResponse<Booking[]>>(`/bookings?${queryParams.toString()}`);
  },

  getBooking: (id: string) =>
    api.get<ApiResponse<Booking>>(`/bookings/${id}`),

  createBooking: (data: BookingRequest) =>
    api.post<ApiResponse<Booking>>('/bookings', data),

  confirmBooking: (id: string, data: PaymentRequest) =>
    api.put<ApiResponse<Booking>>(`/bookings/${id}/confirm`, data),

  cancelBooking: (id: string, reason?: string) =>
    api.put<ApiResponse<{ bookingId: string; refundAmount: number; message: string }>>(`/bookings/${id}/cancel`, {
      reason,
    }),
};

// Users API
export const usersApi = {
  getProfile: () =>
    api.get<ApiResponse<User>>('/users/profile'),

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
