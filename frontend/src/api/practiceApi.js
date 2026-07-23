import apiClient from './client';

export const practiceApi = {
  // Teacher Practice Management
  getTeacherPractices: async () => {
    const response = await apiClient.get('/teacher/practices');
    return response.data;
  },

  getPracticeDetails: async (id) => {
    const response = await apiClient.get(`/teacher/practices/${id}`);
    return response.data;
  },

  createPractice: async (data) => {
    const response = await apiClient.post('/teacher/practices', data);
    return response.data;
  },

  updatePractice: async (id, data) => {
    const response = await apiClient.put(`/teacher/practices/${id}`, data);
    return response.data;
  },

  deletePractice: async (id) => {
    const response = await apiClient.delete(`/teacher/practices/${id}`);
    return response.data;
  },

  // Student endpoints
  getQuestion: async (id) => {
    const response = await apiClient.get(`/practice/questions/${id}`);
    return response.data;
  },

  getRandomQuestions: async (params = {}) => {
    const response = await apiClient.get('/practice/questions/random', { params });
    return response.data;
  },

  getPracticeQuestions: async (practiceId) => {
    const response = await apiClient.get(`/practices/${practiceId}/questions`);
    return response.data;
  },

  submitAnswer: async (data) => {
    const response = await apiClient.post('/practice/check', data);
    return response.data;
  },

  getProgress: async () => {
    const response = await apiClient.get('/practice/progress');
    return response.data;
  },

  getStudentPractices: async () => {
    const response = await apiClient.get('/student/practices');
    return response.data;
  },
};

export default practiceApi;
