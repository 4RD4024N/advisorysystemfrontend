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
   * @note v3.1: Advisors will only see their assigned students
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
   * Get my students (Advisor only)
   * @returns {Promise<Object>} { totalStudents, students }
   * @note v3.1: Returns students assigned to the logged-in advisor
   */
  getMyStudents: async () => {
    const response = await api.get('/students/my-students');
    return response.data;
  },

  /**
   * Get student details
   * @param {string} id - Student ID
   * @returns {Promise<Object>} Student details with comments
   * @note v3.1: Advisors can only view their assigned students (403 if not)
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
   * @note v3.1: Advisors can only send to their assigned students (403 if not)
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
   * @returns {Promise<Object>} { message, successCount, failedCount, errors }
   * @note v3.1: Advisors can only send to their assigned students. Returns errors array for unauthorized students.
   */
  sendBulkNotification: async (data) => {
    const response = await api.post('/students/send-bulk-notification', data);
    return response.data;
  },

  /**
   * Send notification to all students (Admin only)
   * @param {Object} data - Notification data
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @returns {Promise<Object>} Success message
   * @note v3.1: ADMIN ONLY - Advisors will receive 403 Forbidden
   */
  sendNotificationToAll: async (data) => {
    const response = await api.post('/students/send-notification-to-all', data);
    return response.data;
  },

  /**
   * Get students without advisor (Admin only)
   * @returns {Promise<Array>} List of students without advisor
   * @note v3.1: ADMIN ONLY - Advisors will receive 403 Forbidden
   */
  getStudentsWithoutAdvisor: async () => {
    const response = await api.get('/students/without-advisor');
    return response.data;
  },

  /**
   * Get students with pending submissions
   * @returns {Promise<Array>} List of students with pending submissions
   * @note v3.1: Advisors will only see their assigned students with pending submissions
   */
  getStudentsWithPendingSubmissions: async () => {
    const response = await api.get('/students/with-pending-submissions');
    return response.data;
  }
};

export default studentService;
