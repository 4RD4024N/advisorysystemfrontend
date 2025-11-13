import api from './api';

/**
 * Authentication Service
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} data - { email, password, fullName }
   */
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login user and get JWT token
   * @param {Object} credentials - { email, password }
   * @returns {Object} { token }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current token
   */
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;
