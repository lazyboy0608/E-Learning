import apiClient from './client';

export const questionApi = {
  // System Questions (Admin)
  getSystemQuestions: async (params = {}) => {
    const response = await apiClient.get('/admin/questions', { params });
    return response.data;
  },

  createSystemQuestion: async (data) => {
    const response = await apiClient.post('/admin/questions', data);
    return response.data;
  },

  updateSystemQuestion: async (id, data) => {
    const response = await apiClient.put(`/admin/questions/${id}`, data);
    return response.data;
  },

  deleteSystemQuestion: async (id) => {
    const response = await apiClient.delete(`/admin/questions/${id}`);
    return response.data;
  },

  // Class Questions (Teacher)
  getClassQuestions: async (params = {}) => {
    const response = await apiClient.get('/teacher/questions', { params });
    return response.data;
  },

  createClassQuestion: async (data) => {
    const response = await apiClient.post('/teacher/questions', data);
    return response.data;
  },

  updateClassQuestion: async (id, data) => {
    const response = await apiClient.put(`/teacher/questions/${id}`, data);
    return response.data;
  },

  deleteClassQuestion: async (id) => {
    const response = await apiClient.delete(`/teacher/questions/${id}`);
    return response.data;
  },

  // Public endpoints
  getQuestion: async (id) => {
    const response = await apiClient.get(`/questions/${id}`);
    return response.data;
  },

  checkAnswer: async (id, answer) => {
    const response = await apiClient.post(`/questions/${id}/check`, { answer });
    return response.data;
  },
};

export default questionApi;
