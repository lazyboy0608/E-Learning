import axios from 'axios';
import { disconnectEcho } from '../realtime/echo';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Sử dụng đồng bộ chính xác 2 key này với AuthContext
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Request interceptor - Luôn bốc Token mới nhất của tài khoản vừa đăng nhập
apiClient.interceptors.request.use(
  (config) => {
    // Quét cả key mới lẫn key cũ để đảm bảo không sót token
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Xử lý dọn sạch bộ nhớ khi token hết hạn (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Phiên đăng nhập hết hạn hoặc không hợp lệ.");

      // Xóa sạch cả bộ key mới lẫn bộ key cũ để chặn đứng rò rỉ session
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Huỷ Echo instance để tránh dùng token cũ sau khi login lại
      disconnectEcho();
    }
    return Promise.reject(error);
  }
);

export default apiClient;