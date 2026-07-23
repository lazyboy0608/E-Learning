import apiClient from "./client";

export const feedbackApi = {
  // Học sinh/Giáo viên gửi phản hồi
  sendFeedback: async (data) => {
    const response = await apiClient.post("/feedbacks", data);
    return response.data;
  },

  // Học sinh/Giáo viên xem phản hồi của mình
  getMyFeedbacks: async (params = {}) => {
    const response = await apiClient.get("/feedbacks/mine", { params });
    return response.data;
  },

  // Admin lấy tất cả phản hồi
  getAllFeedbacks: async (params = {}) => {
    const response = await apiClient.get("/admin/feedbacks", { params });
    return response.data;
  },

  // Admin trả lời phản hồi
  replyFeedback: async (id, reply) => {
    const response = await apiClient.post(`/admin/feedbacks/${id}/reply`, { reply });
    return response.data;
  },

  // Admin cập nhật trạng thái
  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/feedbacks/${id}/status`, { status });
    return response.data;
  },
};
