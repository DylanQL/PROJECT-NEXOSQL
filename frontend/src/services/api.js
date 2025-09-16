import axios from "axios";
import auth from "./firebase";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      // Add Firebase UID as a custom header for development mode
      config.headers["x-firebase-uid"] = user.uid;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// User-related API calls
export const userApi = {
  // Create a new user profile (after Firebase auth)
  createUser: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error creating user",
      };
    }
  },

  // Get the current user's profile
  getUserProfile: async () => {
    try {
      const response = await api.get("/users/profile");
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error fetching user profile",
      };
    }
  },

  // Update the current user's profile
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put("/users/profile", userData);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error updating user profile",
      };
    }
  },

  // Delete the current user
  deleteUser: async () => {
    try {
      const response = await api.delete("/users");
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error deleting user",
      };
    }
  },
};

// Database Engine related API calls
export const motorDBApi = {
  // Get all database engines
  getAllMotores: async () => {
    try {
      const response = await api.get("/motores");
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error fetching database engines",
      };
    }
  },

  // Get a specific database engine
  getMotorById: async (id) => {
    try {
      const response = await api.get(`/motores/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error fetching database engine",
      };
    }
  },
};

// Database Connection related API calls
export const conexionDBApi = {
  // Get all user connections
  getUserConnections: async () => {
    try {
      const response = await api.get("/conexiones");
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error fetching user connections",
      };
    }
  },

  // Get a specific connection
  getConnectionById: async (id) => {
    try {
      const response = await api.get(`/conexiones/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error fetching connection",
      };
    }
  },

  // Create a new connection
  createConnection: async (connectionData) => {
    try {
      const response = await api.post("/conexiones", connectionData);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error creating connection",
      };
    }
  },

  // Update a connection
  updateConnection: async (id, connectionData) => {
    try {
      const response = await api.put(`/conexiones/${id}`, connectionData);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error updating connection",
      };
    }
  },

  // Delete a connection
  deleteConnection: async (id) => {
    try {
      const response = await api.delete(`/conexiones/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error deleting connection",
      };
    }
  },

  // Test a database connection
  testConnection: async (connectionData) => {
    try {
      const response = await api.post("/conexiones/test", connectionData);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error testing connection",
      };
    }
  },
};

export default api;
