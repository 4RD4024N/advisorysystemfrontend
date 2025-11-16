import api from './api';

/**
 * Health & Monitoring Service
 * Handles all health check and monitoring API calls
 */
const healthService = {
  /**
   * Basic health check (public endpoint)
   * @returns {Promise<Object>} Basic health status
   */
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  /**
   * Detailed health check (Admin only)
   * @returns {Promise<Object>} Detailed health information
   */
  getDetailedHealth: async () => {
    const response = await api.get('/health/detailed');
    return response.data;
  },

  /**
   * Database connectivity check (Admin only)
   * @returns {Promise<Object>} Database health status
   */
  checkDatabase: async () => {
    const response = await api.get('/health/database');
    return response.data;
  },

  /**
   * Get application metrics (Admin only)
   * @returns {Promise<Object>} Application metrics
   */
  getMetrics: async () => {
    const response = await api.get('/health/metrics');
    return response.data;
  },

  /**
   * Get system information (Admin only)
   * @returns {Promise<Object>} System information (CPU, memory, etc.)
   */
  getSystemInfo: async () => {
    const response = await api.get('/health/system');
    return response.data;
  }
};

export default healthService;
