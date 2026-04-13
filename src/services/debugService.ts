import api from './api';

const isDev = import.meta.env.DEV;

function guardDev(methodName: string): void {
  if (!isDev) {
    throw new Error(`[debugService] ${methodName} is only available in development mode.`);
  }
}

/**
 * Debug Service (Development Only)
 * ⚠️ These endpoints are disabled in production builds
 */
const debugService = {
  /**
   * Get all users
   * @returns {Array} List of users
   */
  getAllUsers: async () => {
    guardDev('getAllUsers');
    const response = await api.get('/debug/users');
    return response.data;
  },

  /**
   * Delete all users ⚠️ DANGEROUS
   * @returns {Object} { deletedCount, totalUsers, errors }
   */
  deleteAllUsers: async () => {
    guardDev('deleteAllUsers');
    const response = await api.delete('/debug/users/all');
    return response.data;
  },

  /**
   * Get seed info
   * @returns {Object} { userCount, roleCount, firstUser }
   */
  getSeedInfo: async () => {
    guardDev('getSeedInfo');
    const response = await api.get('/debug/seedinfo');
    return response.data;
  },

  /**
   * Generate token for user
   * @param {string} email - User email
   * @returns {Object} { token }
   */
  generateToken: async (email) => {
    guardDev('generateToken');
    const response = await api.post(`/debug/token/${email}`);
    return response.data;
  },
};

export default debugService;
