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

  /**
   * Decode JWT token and get user info
   */
  getUserInfo: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // JWT structure: header.payload.signature
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      return {
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        sub: decoded.sub
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  /**
   * Check if user has specific role
   * @param {string|array} roles - Role(s) to check (e.g., 'Admin' or ['Admin', 'Advisor'])
   */
  hasRole: (roles) => {
    const userInfo = authService.getUserInfo();
    if (!userInfo || !userInfo.role) return false;

    const userRoles = Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    return requiredRoles.some(role => userRoles.includes(role));
  },

  /**
   * Check if user is Admin
   */
  isAdmin: () => {
    return authService.hasRole('Admin');
  },

  /**
   * Check if user is Advisor
   */
  isAdvisor: () => {
    return authService.hasRole('Advisor');
  },

  /**
   * Check if user is Student
   */
  isStudent: () => {
    return authService.hasRole('Student');
  },

  /**
   * Refresh JWT token
   * Get a new token before the current one expires
   */
  refresh: async () => {
    const response = await api.post('/auth/refresh');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.expiresAt) {
        localStorage.setItem('tokenExpiry', response.data.expiresAt);
      }
    }
    return response.data;
  },

  /**
   * Validate JWT token
   * Check if current token is valid and get user info
   */
  validate: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  },
};

export default authService;
