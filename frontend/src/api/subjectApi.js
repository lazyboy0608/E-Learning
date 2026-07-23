import apiClient from './client';

export const subjectApi = {
  getSubjects: async (params = {}) => {
    const response = await apiClient.get('/subjects', { params });
    return response.data;
  },
};

export default subjectApi;
