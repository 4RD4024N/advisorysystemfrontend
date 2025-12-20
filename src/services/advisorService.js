import api from './api';

/**
 * Advisor Service
 */
const advisorService = {
  /**
   * Get all advisors (v3.0)
   * @returns {Object} { totalAdvisors, advisors: [...] }
   */
  getAllAdvisors: async () => {
    const response = await api.get('/advisors');
    return response.data;
  },

  /**
   * ⚠️ DEPRECATED - Assign advisor to document (old system)
   * Use assignAdvisorToStudent instead in v2.1
   * @param {Object} data - { documentId, advisorUserId }
   * @returns {Object} { message }
   */
  assignAdvisor: async (data) => {
    const response = await api.post('/advisors/assign', data);
    return response.data;
  },

  /**
   * ✨ v3.0 - Assign/Update advisor to student (Admin only)
   * Handles both new assignment and update automatically
   * @param {string} studentId - Student user ID
   * @param {string} advisorId - Advisor user ID
   * @returns {Object} { message, studentId, studentName, advisorId, advisorName, isUpdate }
   */
  assignAdvisorToStudent: async (studentId, advisorId) => {
    const response = await api.post('/advisors/assign', {
      studentId,
      advisorId
    });
    return response.data;
  },

  // ==================== NEW STUDENT-ADVISOR REQUEST SYSTEM ====================

  /**
   * Get my advisor (Student)
   * @returns {Object} { hasAdvisor: boolean, advisor: {...} | null }
   */
  getMyAdvisor: async () => {
    const response = await api.get('/advisors/my-advisor');
    return response.data;
  },

  /**
   * Get available advisors list for students to request
   * @returns {Array} List of available advisors
   */
  getAvailableAdvisors: async () => {
    const response = await api.get('/advisors/available');
    return response.data;
  },

  /**
   * Send advisor assignment request (Student)
   * @param {string} advisorId - Advisor user ID
   * @returns {Object} { message }
   */
  requestAdvisor: async (advisorId) => {
    const response = await api.post('/advisors/request', { advisorId });
    return response.data;
  },

  /**
   * Get pending advisor requests (Advisor)
   * @returns {Array} List of pending requests
   */
  getPendingRequests: async () => {
    const response = await api.get('/advisors/pending-requests');
    return response.data;
  },

  /**
   * Accept advisor request (Advisor)
   * @param {string} requestId - Request ID
   * @returns {Object} { message }
   */
  acceptRequest: async (requestId) => {
    const response = await api.post(`/advisors/accept-request/${requestId}`);
    return response.data;
  },

  /**
   * Reject advisor request (Advisor)
   * @param {string} requestId - Request ID
   * @returns {Object} { message }
   */
  rejectRequest: async (requestId) => {
    const response = await api.post(`/advisors/reject-request/${requestId}`);
    return response.data;
  },

  /**
   * Get my students (Advisor)
   * @returns {Object} { totalStudents: number, students: [...] }
   */
  getMyStudents: async () => {
    const response = await api.get('/advisors/my-students');
    return response.data;
  },

  /**
   * ✨ v3.0 - Remove student's advisor assignment (Admin)
   * @param {string} studentId - Student ID
   * @returns {Object} { message, studentId, studentName }
   */
  removeAdvisorFromStudent: async (studentId) => {
    const response = await api.delete(`/advisors/remove/${studentId}`);
    return response.data;
  },
};

export default advisorService;
