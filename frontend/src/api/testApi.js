import apiClient from "./client";

export const testApi = {
  // Test CRUD
  getTests: async (params = {}) => {
    const response = await apiClient.get("/tests", { params });
    return response.data;
  },

  getAvailableTests: async () => {
    const response = await apiClient.get("/tests/available");
    return response.data;
  },

  getSystemTests: async () => {
    const response = await apiClient.get("/tests/system");
    return response.data;
  },

  getTestDetails: async (testId) => {
    const response = await apiClient.get(`/tests/${testId}`);
    return response.data;
  },

  accessByCode: async (code) => {
    const response = await apiClient.get(`/tests/access/${code}`);
    return response.data;
  },

  createTest: async (data) => {
    const response = await apiClient.post("/tests", data);
    return response.data;
  },

  updateTest: async (testId, data) => {
    const response = await apiClient.put(`/tests/${testId}`, data);
    return response.data;
  },

  deleteTest: async (testId) => {
    const response = await apiClient.delete(`/tests/${testId}`);
    return response.data;
  },

  // Test Taking
  startTest: async (testId) => {
    const response = await apiClient.post(`/tests/${testId}/start`);
    return response.data;
  },

  submitTest: async (testId, attemptId, answers) => {
    const response = await apiClient.post(`/tests/${testId}/submit`, {
      attempt_id: attemptId,
      answers,
    });
    return response.data;
  },

  // Test Results
  getMyAttempts: async () => {
    const response = await apiClient.get("/tests/attempts");
    return response.data;
  },

  getTestResults: async (attemptId) => {
    const response = await apiClient.get(`/tests/attempts/${attemptId}`);
    return response.data;
  },

  getAllTestAttempts: async (testId) => {
    const response = await apiClient.get(`/tests/${testId}/attempts`);
    return response.data;
  },

  getTestReview: async (attemptId) => {
    const response = await apiClient.get(`/tests/attempts/${attemptId}/review`);
    return response.data;
  },

  // Save Answer
  saveAnswer: async (attemptId, questionId, answer) => {
    const response = await apiClient.post(
      "/tests/save-answer",

      {
        attempt_id: attemptId,

        question_id: questionId,

        answer,
      },
    );

    return response.data;
  },

  reportTabSwitch: async (attemptId) => {
    const response = await apiClient.post(`/tests/attempts/${attemptId}/tab-switch`);
    return response.data;
  },
};

export default testApi;
