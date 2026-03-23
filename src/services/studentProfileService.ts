import api from './api';

interface StudentProfilePayload {
  [key: string]: unknown;
}

const studentProfileService = {
  // Get my profile
  getMyProfile: async () => {
    try {
      const response = await api.get('/studentprofile/me');
      return response.data;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        return null; // Profile doesn't exist yet
      }
      throw error;
    }
  },

  // Create or update profile
  saveProfile: async (profileData: StudentProfilePayload) => {
    const response = await api.post('/studentprofile', profileData);
    return response.data;
  },

  // Get profile by student ID (Admin/Advisor only)
  getProfileByStudentId: async (studentId: string) => {
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
