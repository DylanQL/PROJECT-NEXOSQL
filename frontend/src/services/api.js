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

  // Get query usage statistics
  getQueryStats: async () => {
    try {
      const response = await api.get("/users/query-stats");
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error fetching query stats",
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
      return { data: response.data.data, error: null };
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

// AI-related API calls
export const aiApi = {
  // Process a natural language query
  processQuery: async (connectionId, question, chatId = null, threadId = null) => {
    try {
      const response = await api.post("/ai/query", {
        connectionId,
        question,
        chatId,
        threadId,
      });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error processing query",
      };
    }
  },

  // Get schema information for a connection
  getSchemaInfo: async (connectionId) => {
    try {
      const response = await api.get(`/ai/schema/${connectionId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error.response?.data?.error || "Error fetching schema information",
      };
    }
  },

  // Cancel a message by thread ID
  cancelMessage: async (hiloConversacion) => {
    try {
      const response = await api.post(`/ai/cancel/${hiloConversacion}`);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error cancelling message",
      };
    }
  },
};

// Chat-related API calls
export const chatApi = {
  // Get all chats for a specific connection
  getChatsByConnection: async (connectionId) => {
    try {
      const response = await api.get(`/chats/connection/${connectionId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error fetching chats",
      };
    }
  },

  // Create a new chat
  createChat: async (connectionId, title = "Nueva consulta") => {
    try {
      console.log('Creating chat API call:', { connectionId, title });
      const response = await api.post(`/chats/connection/${connectionId}`, {
        title,
      });
      console.log('Chat creation response:', response.data);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Chat creation error:', error.response?.data || error.message);
      return {
        data: null,
        error: error.response?.data?.error || error.message || "Error creating chat",
      };
    }
  },

  // Get a specific chat with its messages
  getChatById: async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error fetching chat",
      };
    }
  },

  // Update chat title
  updateChatTitle: async (chatId, title) => {
    try {
      const response = await api.put(`/chats/${chatId}/title`, { title });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error updating chat title",
      };
    }
  },

  // Delete a chat
  deleteChat: async (chatId) => {
    try {
      const response = await api.delete(`/chats/${chatId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error deleting chat",
      };
    }
  },

  // Add a message to a chat
  addMessage: async (chatId, type, content, metadata = null, isError = false) => {
    try {
      const response = await api.post(`/chats/${chatId}/messages`, {
        type,
        content,
        metadata,
        isError,
      });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error adding message",
      };
    }
  },

  // Migrate chats from localStorage
  migrateLocalStorageChats: async (chatsData) => {
    try {
      const response = await api.post("/chats/migrate", { chatsData });
      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error.response?.data?.error || "Error migrating chats",
      };
    }
  },
};

export default api;
