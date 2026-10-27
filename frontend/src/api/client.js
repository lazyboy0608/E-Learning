import axios from 'axios';
import { disconnectEcho } from '../realtime/echo';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // BẮT BUỘC để trình duyệt tự động gửi và nhận HttpOnly Cookie (access_token, refresh_token)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Request interceptor: Vẫn đính kèm Bearer token nếu có (hỗ trợ backward compatibility)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Quản lý hàng đợi khi thực hiện Refresh Token để tránh gọi nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Bắt mã lỗi TOKEN_EXPIRED (401) để tự động Silent Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorCode = error.response?.data?.error_code;

    // Nếu lỗi 401 do TOKEN_EXPIRED và request chưa từng retry
    if (status === 401 && errorCode === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      // Tránh lặp vô hạn nếu chính request refresh-token bị lỗi 401
      if (originalRequest.url?.includes('/refresh-token') || originalRequest.url?.includes('/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đưa request hiện tại vào hàng đợi chờ refresh hoàn tất
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token (trình duyệt tự đính kèm cookie refresh_token qua withCredentials: true)
        const refreshResponse = await apiClient.post('/refresh-token');
        const newToken = refreshResponse.data?.data?.token || refreshResponse.data?.data?.access_token;

        if (newToken) {
          localStorage.setItem(TOKEN_KEY, newToken);
          localStorage.setItem('token', newToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        processQueue(null, newToken);
        isRefreshing = false;

        // Thực hiện lại request ban đầu với session mới
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        console.warn('Phiên làm việc đã hết hạn hoàn toàn, đang điều hướng đăng nhập lại.');

        // Xóa sạch bộ nhớ cục bộ
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        disconnectEcho();

        // Chuyển hướng về trang đăng nhập nếu không đang ở đó
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Các lỗi 401 khác (TOKEN_MISSING, REFRESH_TOKEN_MISSING, REFRESH_FAILED)
    if (status === 401 && !originalRequest.url?.includes('/login')) {
      const isAuthEndpoint = originalRequest.url?.includes('/refresh-token') || originalRequest.url?.includes('/me');
      if (isAuthEndpoint) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        disconnectEcho();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;