import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { disconnectEcho } from '../realtime/echo';

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Utility export for force clearing auth state (without React state reset)
export const forceClearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete apiClient.defaults.headers.common['Authorization'];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Khởi tạo phiên làm việc: Kiểm tra HttpOnly Cookie qua /api/me kết hợp cache UX
  const initAuth = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch {
          // Bỏ qua lỗi parse
        }
      }

      // Xác minh phiên làm việc thực tế với backend qua HttpOnly Cookie
      const response = await apiClient.get('/me');
      if (response.data?.success && response.data?.data) {
        const verifiedUser = response.data.data;
        setUser(verifiedUser);
        setIsAuthenticated(true);
        localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
      }
    } catch (error) {
      // Nếu 401 hoặc lỗi xác thực -> xóa sạch trạng thái đăng nhập
      console.log('Chưa đăng nhập hoặc phiên làm việc đã kết thúc.');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();

    const handleStorageChange = (e) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        initAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initAuth]);

  const clearAuthStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (email, password, role = 'teacher') => {
    try {
      clearAuthStorage();
      setUser(null);
      setIsAuthenticated(false);

      // Gửi request login (Backend trả về 2 HttpOnly Cookies: access_token, refresh_token)
      const response = await apiClient.post('/login', {
        email,
        password,
        role,
      });

      const payload = response.data?.data || response.data;
      const token = payload?.token || payload?.access_token || response.data?.token;
      const userData = payload?.user || payload?.teacher || response.data?.user || response.data?.teacher || payload;

      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));

      const actualRole = userData?.role || role;

      setUser(userData);
      setIsAuthenticated(true);

      if (actualRole === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (actualRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Đăng nhập không thành công',
      };
    }
  };

  const register = async (data) => {
    try {
      clearAuthStorage();

      const response = await apiClient.post('/register', data);
      const payload = response.data?.data || response.data;
      const token = payload?.token || payload?.access_token || response.data?.token;
      const userData = payload?.user || payload?.teacher || response.data?.user || response.data?.teacher || payload;

      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem('token', token);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Register API error:', error);
      clearAuthStorage();
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Đăng ký không thành công',
      };
    }
  };

  const logout = async () => {
    disconnectEcho();

    try {
      // Backend sẽ thu hồi token trong DB và xóa 2 cookies HttpOnly
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuthStorage();
      navigate('/login', { replace: true });
    }
  };

  const updateUser = (userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    clearAuthStorage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;