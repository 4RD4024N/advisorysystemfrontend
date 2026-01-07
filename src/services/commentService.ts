import api from './api';

/**
 * Comment Service
 */
const commentService = {
  /**
   * Get comments by version ID
   * @param {number} versionId - Version ID
   * @returns {Array} List of comments
   */
  getCommentsByVersion: async (versionId) => {
    const response = await api.get(`/comments/version/${versionId}`);
    return response.data;
  },

  /**
   * Create a new comment
   * @param {Object} data - { documentVersionId, content }
   * @returns {Object} { id, createdAt }
   */
  createComment: async (data) => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  /**
   * Delete a comment
   * @param {number} commentId - Comment ID
   * @returns {Object} { message }
   */
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

export default commentService;
