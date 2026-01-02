import api from './api';

const courseService = {
  // Get all course requirements
  getAllRequirements: async () => {
    const response = await api.get('/course/requirements');
    return response.data;
  },

  // Add course requirement (Admin only)
  addRequirement: async (requirementData) => {
    const response = await api.post('/course/requirements', requirementData);
    return response.data;
  },

  // Get my completed courses
  getMyCourses: async () => {
    const response = await api.get('/course/my-courses');
    return response.data;
  },

  // Add course to my record
  addMyCourse: async (courseData) => {
    const response = await api.post('/course/my-courses', courseData);
    return response.data;
  },

  // Update course completion
  updateCourseCompletion: async (id, updateData) => {
    const response = await api.patch(`/course/my-courses/${id}`, updateData);
    return response.data;
  },

  // Get all courses from database (for course catalog and schedule)
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data;
  }
};

export default courseService;
