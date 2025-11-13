import api from './api';

/**
 * Statistics Service
 */
const statisticsService = {
  /**
   * Get student summary statistics
   * @returns {Object} { totalDocuments, totalVersions, pendingSubmissions, completedSubmissions }
   */
  getStudentSummary: async () => {
    const response = await api.get('/statistics/student/summary');
    return response.data;
  },

  /**
   * Get advisor summary statistics
   * @returns {Object} { assignedDocuments, totalComments, studentsCount }
   */
  getAdvisorSummary: async () => {
    const response = await api.get('/statistics/advisor/summary');
    return response.data;
  },

  /**
   * Get admin overview statistics
   * @returns {Object} { totalDocuments, totalVersions, totalSubmissions, totalComments, recentActivity }
   */
  getAdminOverview: async () => {
    const response = await api.get('/statistics/admin/overview');
    return response.data;
  },
};

export default statisticsService;
