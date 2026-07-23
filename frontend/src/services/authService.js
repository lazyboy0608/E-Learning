import api from './api';

export const authService = {
    /**
     * Logic Đăng Ký Tài Khoản Học Sinh
     */
    async register(name, email, phone, password, password_confirmation, role = 'student') {
        const response = await api.post('/register', {
            name,
            email,
            phone,
            password,
            password_confirmation,
            role
        });
        return response.data;
    },

    /**
     * Logic Đăng Xuất Hệ Thống
     */
    async logout() {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Lỗi khi hủy token trên hệ thống:", error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
        }
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};