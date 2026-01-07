import api from './api';

/**
 * Debug Service (Development Only)
 * ⚠️ These endpoints should only be used in development
 */
const debugService = {
  /**
   * Get all users
   * @returns {Array} List of users
   */
  getAllUsers: async () => {
    const response = await api.get('/debug/users');
    return response.data;
  },

  /**
   * Delete all users ⚠️ DANGEROUS
   * @returns {Object} { deletedCount, totalUsers, errors }
   */
  deleteAllUsers: async () => {
    const response = await api.delete('/debug/users/all');
    return response.data;
  },

  /**
   * Get seed info
   * @returns {Object} { userCount, roleCount, firstUser }
   */
  getSeedInfo: async () => {
    const response = await api.get('/debug/seedinfo');
    return response.data;
  },

  /**
   * Generate token for user
   * @param {string} email - User email
   * @returns {Object} { token }
   */
  generateToken: async (email) => {
    const response = await api.post(`/debug/token/${email}`);
    return response.data;
  },
};

export default debugService;
