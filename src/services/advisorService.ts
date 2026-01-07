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

  /**
   * Get my advisor (Student)
   * @returns {Object} { hasAdvisor: boolean, advisor: {...} | null }
   */
  getMyAdvisor: async () => {
    const response = await api.get('/advisors/my-advisor');
    return response.data;
  },

  /**
   * Get my students (Advisor)
   * @returns {Object} { totalStudents: number, students: [...] }
   */
  getMyStudents: async () => {
    const response = await api.get('/students/my-students');
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
