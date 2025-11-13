import api from './api';

/**
 * Submission Service
 */
const submissionService = {
  /**
   * Get my submissions (Student)
   * @returns {Array} List of submissions
   */
  getMySubmissions: async () => {
    const response = await api.get('/submissions/my');
    return response.data;
  },

  /**
   * Create a new submission (Advisor/Admin)
   * @param {Object} data - { studentId, dueDate }
   * @returns {Object} { id }
   */
  createSubmission: async (data) => {
    const response = await api.post('/submissions', data);
    return response.data;
  },

  /**
   * Update submission status
   * @param {number} submissionId - Submission ID
   * @param {string} status - Status ("Pending" or "Completed")
   * @returns {Object} { status }
   */
  updateStatus: async (submissionId, status) => {
    const response = await api.patch(`/submissions/${submissionId}/status`, { status });
    return response.data;
  },
};

export default submissionService;
