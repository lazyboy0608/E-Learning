import api from './api';

export const classService = {
    // Lấy danh sách lớp học của giáo viên/học sinh
    async getAll() {
        const response = await api.get('/classes');
        return response.data;
    },

    // Lấy chi tiết một lớp học
    async getById(id) {
        const response = await api.get(`/classes/${id}`);
        return response.data;
    },

    // Tạo lớp học mới (Giáo viên)
    async create(classData) {
        const response = await api.post('/classes', classData);
        return response.data;
    },

    // Cập nhật lớp học
    async update(id, classData) {
        const response = await api.put(`/classes/${id}`, classData);
        return response.data;
    },

    // Xóa lớp học
    async delete(id) {
        const response = await api.delete(`/classes/${id}`);
        return response.data;
    },

    // Tham gia lớp học (Học sinh)
    async join(code) {
        const response = await api.post('/classes/join', { class_code: code });
        return response.data;
    }
};
