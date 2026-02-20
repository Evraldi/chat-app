import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 && error.config.url !== '/auth/login') {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (username, password) =>
    api.post('/auth/register', { username, password }),

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.success && response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    } else if (response.data.token) {
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

export const roomService = {
  getAllRooms: () =>
    api.get('/rooms'),

  createRoom: (name) =>
    api.post('/rooms', { name }),
};

export const messageService = {
  getMessages: (room) =>
    api.get(`/messages?room=${room}`),

  createMessage: (username, text, room) =>
    api.post('/messages', { username, text, room }),

  deleteAllMessages: (room) =>
    api.delete(`/messages?room=${room}`),
};

export const profileService = {
  getProfile: (userId) => api.get(`/profile/${userId}`),
  updateProfile: (profileData) => api.put('/profile', profileData)
};

export default api;
