import apiClient from './client';

export const userApi = {
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  getTeachers: async () => {
    const response = await apiClient.get('/users/teachers');
    return response.data;
  },

  getStudents: async () => {
    const response = await apiClient.get('/users/students');
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getTeacherStats: async () => {
    const response = await apiClient.get('/teacher/dashboard/stats');
    return response.data;
  },
};

export default userApi;
