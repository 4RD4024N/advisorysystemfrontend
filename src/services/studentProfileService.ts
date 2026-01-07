import api from './api';

const studentProfileService = {
  // Get my profile
  getMyProfile: async () => {
    try {
      const response = await api.get('/studentprofile/me');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Profile doesn't exist yet
      }
      throw error;
    }
  },

  // Create or update profile
  saveProfile: async (profileData) => {
    const response = await api.post('/studentprofile', profileData);
    return response.data;
  },

  // Get profile by student ID (Admin/Advisor only)
  getProfileByStudentId: async (studentId) => {
    const response = await api.get(`/studentprofile/${studentId}`);
    return response.data;
  },

  // Check if prerequisites are met
  checkPrerequisites: async () => {
    const response = await api.get('/studentprofile/check-prerequisites');
    return response.data;
  }
};

export default studentProfileService;
