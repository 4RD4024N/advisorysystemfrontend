import api from './api';

/**
 * Course Schedule Service
 * Manages student course schedules and advisor viewing
 */
const courseScheduleService = {
  /**
   * Get student's course schedule
   * @param {number} studentId - Student ID (optional, defaults to current user)
   * @returns {Promise} Schedule data
   */
  getSchedule: async (studentId = null) => {
    const url = studentId ? `/schedules/${studentId}` : '/schedules/my-schedule';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get all available courses
   * @returns {Promise} List of courses
   */
  getAvailableCourses: async () => {
    const response = await api.get('/courses/available');
    return response.data;
  },

  /**
   * Add course to schedule
   * @param {Object} data - { courseId, day, startTime, duration }
   * @returns {Promise} Created schedule entry
   */
  addCourseToSchedule: async (data) => {
    const response = await api.post('/schedules', data);
    return response.data;
  },

  /**
   * Remove course from schedule
   * @param {number} scheduleId - Schedule entry ID
   * @returns {Promise} Deletion confirmation
   */
  removeCourseFromSchedule: async (scheduleId) => {
    const response = await api.delete(`/schedules/${scheduleId}`);
    return response.data;
  },

  /**
   * Update course in schedule
   * @param {number} scheduleId - Schedule entry ID
   * @param {Object} data - { day, startTime, duration }
   * @returns {Promise} Updated schedule entry
   */
  updateCourseInSchedule: async (scheduleId, data) => {
    const response = await api.put(`/schedules/${scheduleId}`, data);
    return response.data;
  },

  /**
   * Get advisor's students schedules (Advisor only)
   * @returns {Promise} List of students with their schedules
   */
  getAdvisorStudentsSchedules: async () => {
    const response = await api.get('/schedules/advisor/students');
    return response.data;
  },

  /**
   * Get schedule statistics
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise} Statistics (total courses, credits, ECTS, hours)
   */
  getScheduleStatistics: async (studentId = null) => {
    const url = studentId ? `/schedules/${studentId}/statistics` : '/schedules/my-statistics';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Check for schedule conflicts
   * @param {Object} data - { courseId, day, startTime }
   * @returns {Promise} Conflict check result
   */
  checkScheduleConflict: async (data) => {
    const response = await api.post('/schedules/check-conflict', data);
    return response.data;
  },

  /**
   * Export schedule to PDF/Excel
   * @param {string} format - 'pdf' or 'excel'
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise} File blob
   */
  exportSchedule: async (format = 'pdf', studentId = null) => {
    const url = studentId 
      ? `/schedules/${studentId}/export/${format}` 
      : `/schedules/export/${format}`;
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  },

  /**
   * Get course prerequisites
   * @param {number} courseId - Course ID
   * @returns {Promise} List of prerequisite courses
   */
  getCoursePrerequisites: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/prerequisites`);
    return response.data;
  },

  /**
   * Validate student can take course (check prerequisites)
   * @param {number} courseId - Course ID
   * @returns {Promise} Validation result
   */
  validateCourseEligibility: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/validate`);
    return response.data;
  }
};

export default courseScheduleService;
