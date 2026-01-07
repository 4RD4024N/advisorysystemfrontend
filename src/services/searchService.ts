import api from './api';

/**
 * Search Service
 */
const searchService = {
  /**
   * Search documents
   * @param {Object} params - { query, tags, startDate, endDate, page, pageSize }
   * @returns {Object} { totalCount, page, pageSize, totalPages, documents }
   */
  searchDocuments: async (params = {}) => {
    const response = await api.get('/search/documents', { params });
    return response.data;
  },

  /**
   * Get popular tags
   * @param {number} top - Number of top tags to retrieve (default: 10)
   * @returns {Array} List of { tag, count }
   */
  getPopularTags: async (top = 10) => {
    const response = await api.get('/search/tags/popular', { params: { top } });
    return response.data;
  },
};

export default searchService;
