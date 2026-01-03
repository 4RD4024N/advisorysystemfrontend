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
  },

  // 📚 Ders Seçimi API'leri (Yeni Backend)
  
  // Ders seçimi için mevcut dersler (schedule bilgisiyle)
  getAvailableCourses: async (semester = null) => {
    const url = semester ? `/course-selection/available?semester=${semester}` : '/course-selection/available';
    const response = await api.get(url);
    return response.data;
  },

  // Derse kayıt ol
  enrollCourse: async (courseId, sectionCode, semester) => {
    const response = await api.post('/course-selection/enroll', {
      courseId,
      sectionCode,
      semester
    });
    return response.data;
  },

  // Dersten çık
  unenrollCourse: async (courseId) => {
    const response = await api.delete(`/course-selection/unenroll/${courseId}`);
    return response.data;
  },

  // Öğrencinin ders programını getir
  getMySchedule: async (semester = null) => {
    const url = semester ? `/student-courses/my-schedule?semester=${semester}` : '/student-courses/my-schedule';
    const response = await api.get(url);
    return response.data;
  }
};

export default courseService;
