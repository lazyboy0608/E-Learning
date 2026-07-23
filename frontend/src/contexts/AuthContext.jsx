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

  const initAuth = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        console.log("=== THÔNG TIN USER KHI KHỞI TẠO ===", parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      setUser(null);
      setIsAuthenticated(false);
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
      // Clear existing auth state completely before login
      clearAuthStorage();
      setUser(null);
      setIsAuthenticated(false);

      const response = await apiClient.post('/login', {
        email,
        password,
        role,
      });

      const payload = response.data?.data || response.data;
      const token = payload?.token || response.data?.token;
      const userData = payload?.user || payload?.teacher || response.data?.user || response.data?.teacher || payload;

      if (!token) {
        throw new Error('Không tìm thấy Token trong dữ liệu Auth trả về');
      }

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const register = async (data) => {
    try {
      clearAuthStorage();

      const response = await apiClient.post('/register', data);
      const payload = response.data?.data || response.data;
      const token = payload?.token || response.data?.token;
      const userData = payload?.user || payload?.teacher || response.data?.user || response.data?.teacher || payload;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Register API error:', error);
      clearAuthStorage();
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    // Huỷ Echo instance trước để tránh dùng token cũ sau khi login lại
    disconnectEcho();

    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setUser(null);
      setIsAuthenticated(false);

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