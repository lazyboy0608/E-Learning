import apiClient from './client';

export const classApi = {
  // Class CRUD
  getClasses: async (params = {}) => {
    const response = await apiClient.get('/classes', { params });
    return response.data;
  },

  searchClasses: async (query) => {
    const response = await apiClient.get('/classes/search', { params: { q: query } });
    return response.data;
  },

  searchClasses: async (query) => {
    const response = await apiClient.get('/classes/search', { params: { q: query } });
    return response.data;
  },

  getClassDetail: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}`);
    return response.data;
  },

  createClass: async (data) => {
    const response = await apiClient.post('/classes', data);
    return response.data;
  },

  updateClass: async (classId, data) => {
    const response = await apiClient.put(`/classes/${classId}`, data);
    return response.data;
  },

  deleteClass: async (classId) => {
    const response = await apiClient.delete(`/classes/${classId}`);
    return response.data;
  },

  // Join/Leave
  joinClass: async (classCode) => {
    const response = await apiClient.post('/classes/join', { class_code: classCode });
    return response.data;
  },

  leaveClass: async (classId) => {
    const response = await apiClient.post(`/classes/${classId}/leave`);
    return response.data;
  },

  // Students
  getStudents: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}/students`);
    return response.data;
  },

  addStudent: async (classId, userId) => {
    const response = await apiClient.post(`/classes/${classId}/students`, { user_id: userId });
    return response.data;
  },

  removeStudent: async (classId, userId) => {
    const response = await apiClient.delete(`/classes/${classId}/students/${userId}`);
    return response.data;
  },

  // Teachers
  getTeachers: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}/teachers`);
    return response.data;
  },

  addTeacher: async (classId, userId) => {
    const response = await apiClient.post(`/classes/${classId}/teachers`, { user_id: userId });
    return response.data;
  },

  removeTeacher: async (classId, userId) => {
    const response = await apiClient.delete(`/classes/${classId}/teachers/${userId}`);
    return response.data;
  },

  // Materials
  getMaterials: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}/materials`);
    return response.data;
  },

  addMaterial: async (classId, data) => {
    const response = await apiClient.post(`/classes/${classId}/materials`, data);
    return response.data;
  },

  removeMaterial: async (classId, materialId) => {
    const response = await apiClient.delete(`/classes/${classId}/materials/${materialId}`);
    return response.data;
  },

  // Tests
  getTests: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}/tests`);
    return response.data;
  },

  assignTest: async (classId, testId) => {
    const response = await apiClient.post(`/classes/${classId}/tests`, { test_id: testId });
    return response.data;
  },

  removeTest: async (classId, testId) => {
    const response = await apiClient.delete(`/classes/${classId}/tests/${testId}`);
    return response.data;
  },

  // Practices
  getPractices: async (classId) => {
    const response = await apiClient.get(`/classes/${classId}/practices`);
    return response.data;
  },

  assignPractice: async (classId, practiceId) => {
    const response = await apiClient.post(`/classes/${classId}/practices`, { practice_id: practiceId });
    return response.data;
  },

  removePractice: async (classId, practiceId) => {
    const response = await apiClient.delete(`/classes/${classId}/practices/${practiceId}`);
    return response.data;
  },

  // Scores
  getClassScores: async (classId, testId) => {
    const response = await apiClient.get(`/classes/${classId}/tests/${testId}/scores`);
    return response.data;
  },
};

export default classApi;
