import api from './api';

/**
 * Notification Service
 * Handles all notification-related API calls
 */
const notificationService = {
  /**
   * Get user's notifications
   * @param {Object} params - Query parameters
   * @param {boolean} params.isRead - Filter by read status (optional)
   * @param {number} params.limit - Maximum number of notifications (default: 50)
   * @returns {Promise<Array>} List of notifications
   */
  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.isRead !== undefined) {
      queryParams.append('isRead', params.isRead);
    }
    if (params.limit) {
      queryParams.append('limit', params.limit);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get unread notification count
   * @returns {Promise<Object>} { unreadCount: number }
   */
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    // API returns { unreadCount: N } according to latest docs
    return response.data;
  },

  /**
   * Mark notification as read
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} Success message
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Success message
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Create notification (Admin only)
   * @param {Object} data - Notification data
   * @param {string} data.userId - Target user ID
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {number} data.type - Notification type (0-5)
   * @param {number} data.relatedEntityId - Related entity ID (optional)
   * @param {string} data.relatedEntityType - Related entity type (optional)
   * @returns {Promise<Object>} Created notification
   */
  createNotification: async (data) => {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  /**
   * Notification types enum
   */
  NotificationType: {
    DEADLINE_APPROACHING: 0,
    NEW_COMMENT: 1,
    ADVISOR_ASSIGNED: 2,
    DOCUMENT_UPLOADED: 3,
    SUBMISSION_STATUS_CHANGED: 4,
    GENERAL: 5
  }
};

export default notificationService;
