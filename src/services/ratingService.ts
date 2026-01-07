import api from './api';

const ratingService = {
  // Create or update rating (Advisor/Admin only)
  createOrUpdateRating: async (ratingData) => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },

  // Get ratings for document version
  getRatingsByVersion: async (versionId) => {
    const response = await api.get(`/ratings/version/${versionId}`);
    return response.data;
  },

  // Get all ratings by advisor (Admin or advisor themselves)
  getRatingsByAdvisor: async (advisorId) => {
    const response = await api.get(`/ratings/by-advisor/${advisorId}`);
    return response.data;
  },

  // Get ratings for my documents (Student)
  getMyDocumentRatings: async () => {
    const response = await api.get('/ratings/my-documents');
    return response.data;
  },

  // Delete rating (Admin or rating author)
  deleteRating: async (id) => {
    const response = await api.delete(`/ratings/${id}`);
    return response.data;
  }
};

export default ratingService;
