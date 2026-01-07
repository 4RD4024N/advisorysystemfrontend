import api from './api';

/**
 * Submission Service
 */
const submissionService = {
  /**
   * Get my submissions (Student) / Get students' submissions (Advisor/Admin)
   * @returns {Array} List of submissions
   * @note v3.1: Advisors will only see submissions from their assigned students
   */
  getMySubmissions: async () => {
    const response = await api.get('/submissions/my');
    return response.data;
  },

  /**
   * Create a new submission (Advisor/Admin)
   * @param {Object} data - { studentId, documentId, dueDate, notes }
   * @returns {Object} { id }
   * @note v3.1: Advisors can only create submissions for their assigned students (403 if not)
   * @note Notes field is optional - if provided, it will be included in the notification
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
