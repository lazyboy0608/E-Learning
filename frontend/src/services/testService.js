import api from './api';

export const testService = {
    // Lấy danh sách đề thi
    async getAll() {
        const response = await api.get('/tests');
        return response.data;
    },

    // Lấy đề thi khả dụng cho học sinh
    async getAvailable() {
        const response = await api.get('/tests/available');
        return response.data;
    },

    // Lấy chi tiết đề thi
    async getById(id) {
        const response = await api.get(`/tests/${id}`);
        return response.data;
    },

    // Tạo đề thi mới
    async create(testData) {
        const response = await api.post('/tests', testData);
        return response.data;
    },

    // Bắt đầu làm bài
    async start(id) {
        const response = await api.post(`/tests/${id}/start`);
        return response.data;
    },

    // Nộp bài
    async submit(id, answers) {
        const response = await api.post(`/tests/${id}/submit`, { answers });
        return response.data;
    },

    // Lấy kết quả làm bài
    async getResults(attemptId) {
        const response = await api.get(`/tests/attempts/${attemptId}`);
        return response.data;
    },

    // Xem lịch sử làm bài cá nhân
    async getMyAttempts() {
        const response = await api.get('/tests/attempts');
        return response.data;
    }
};
