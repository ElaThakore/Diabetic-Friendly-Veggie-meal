import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds timeout for large audio files
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Memory API functions
export const memoryApi = {
  // Get all memory prompts
  getPrompts: async () => {
    try {
      const response = await api.get('/memory/prompts');
      return response.data;
    } catch (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }
  },

  // Get a random memory prompt
  getRandomPrompt: async () => {
    try {
      const response = await api.get('/memory/prompts/random');
      return response.data;
    } catch (error) {
      console.error('Error fetching random prompt:', error);
      throw error;
    }
  },

  // Create a new memory entry
  createEntry: async (entryData) => {
    try {
      const response = await api.post('/memory/entries', entryData);
      return response.data;
    } catch (error) {
      console.error('Error creating memory entry:', error);
      throw error;
    }
  },

  // Get all memory entries
  getEntries: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get('/memory/entries', {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching memory entries:', error);
      throw error;
    }
  },

  // Get a specific memory entry
  getEntry: async (entryId) => {
    try {
      const response = await api.get(`/memory/entries/${entryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching memory entry:', error);
      throw error;
    }
  },

  // Update a memory entry
  updateEntry: async (entryId, entryData) => {
    try {
      const response = await api.put(`/memory/entries/${entryId}`, entryData);
      return response.data;
    } catch (error) {
      console.error('Error updating memory entry:', error);
      throw error;
    }
  },

  // Delete a memory entry
  deleteEntry: async (entryId) => {
    try {
      const response = await api.delete(`/memory/entries/${entryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting memory entry:', error);
      throw error;
    }
  },

  // Get memory statistics
  getStats: async () => {
    try {
      const response = await api.get('/memory/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching memory stats:', error);
      throw error;
    }
  }
};

// Utility function to convert blob to base64
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Utility function to convert base64 to blob
export const base64ToBlob = (base64, contentType = 'audio/wav') => {
  try {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return null;
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('API connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
};

export default api;