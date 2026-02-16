import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (username, password) =>
    api.post('/auth/register', { username, password }),

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    // Check if the response has token in the expected format
    if (response.data.success && response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    } else if (response.data.token) {
      // Alternative format - directly in response.data
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Room services
export const roomService = {
  getAllRooms: () =>
    api.get('/rooms'),

  createRoom: (name) =>
    api.post('/rooms', { name }),
};

// Message services
export const messageService = {
  getMessages: (room) =>
    api.get(`/messages?room=${room}`),

  createMessage: (username, text, room) =>
    api.post('/messages', { username, text, room }),

  deleteAllMessages: (room) =>
    api.delete(`/messages?room=${room}`),
};

// Profile service
export const profileService = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  updateProfile: (profileData) => api.put('/profile', profileData)
};

export default api;
