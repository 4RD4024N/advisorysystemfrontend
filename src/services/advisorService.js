import api from './api';

/**
 * Advisor Service
 */
const advisorService = {
  /**
   * Get all advisors
   * @returns {Array} List of advisors
   */
  getAllAdvisors: async () => {
    const response = await api.get('/advisors');
    return response.data;
  },

  /**
   * Assign advisor to document
   * @param {Object} data - { documentId, advisorUserId }
   * @returns {Object} { message }
   */
  assignAdvisor: async (data) => {
    const response = await api.post('/advisors/assign', data);
    return response.data;
  },
};

export default advisorService;
