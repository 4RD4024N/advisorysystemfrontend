import api from './api';

/**
 * Student Service
 * Handles all student-related API calls (Admin/Advisor only)
 */
const studentService = {
  /**
   * Get all students
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search by email or username (optional)
   * @param {number} params.page - Page number (optional, default: 1)
   * @param {number} params.pageSize - Items per page (optional, default: 20)
   * @returns {Promise<Object>} Paginated response { students, totalCount, page, pageSize, totalPages }
   */
  getAllStudents: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/students?${queryString}` : '/students';
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get student details
   * @param {string} id - Student ID
   * @returns {Promise<Object>} Student details with comments
   */
  getStudentDetails: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Send notification to a specific student
   * @param {string} studentId - Student ID
   * @param {Object} data - Notification data
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @returns {Promise<Object>} Success message
   */
  sendNotification: async (studentId, data) => {
    const response = await api.post(`/students/${studentId}/send-notification`, data);
    return response.data;
  },

  /**
   * Send notification to multiple students
   * @param {Object} data - Notification data
   * @param {Array<string>} data.studentIds - Array of student IDs
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @returns {Promise<Object>} Success message
   */
  sendBulkNotification: async (data) => {
    const response = await api.post('/students/send-bulk-notification', data);
    return response.data;
  },

  /**
   * Send notification to all students
   * @param {Object} data - Notification data
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @returns {Promise<Object>} Success message
   */
  sendNotificationToAll: async (data) => {
    const response = await api.post('/students/send-notification-to-all', data);
    return response.data;
  },

  /**
   * Get students without advisor
   * @returns {Promise<Array>} List of students without advisor
   */
  getStudentsWithoutAdvisor: async () => {
    const response = await api.get('/students/without-advisor');
    return response.data;
  },

  /**
   * Get students with pending submissions
   * @returns {Promise<Array>} List of students with pending submissions
   */
  getStudentsWithPendingSubmissions: async () => {
    const response = await api.get('/students/with-pending-submissions');
    return response.data;
  }
};

export default studentService;
