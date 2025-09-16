import axios from 'axios';
import auth from './firebase';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User-related API calls
export const userApi = {
  // Create a new user profile (after Firebase auth)
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.error || 'Error creating user' };
    }
  },

  // Get the current user's profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.error || 'Error fetching user profile' };
    }
  },

  // Update the current user's profile
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.error || 'Error updating user profile' };
    }
  },

  // Delete the current user
  deleteUser: async () => {
    try {
      const response = await api.delete('/users');
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.error || 'Error deleting user' };
    }
  }
};

export default api;
