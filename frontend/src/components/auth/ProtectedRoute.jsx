import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { loading } = useAuth();
  const location = useLocation();

  // Read user directly from localStorage to always get the latest data
  const storedUser = (() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      if (token && userStr) return JSON.parse(userStr);
    } catch {}
    return null;
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!storedUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(storedUser.role)) {
    let redirectPath = '/login';
    if (storedUser.role === 'admin') redirectPath = '/admin/dashboard';
    else if (storedUser.role === 'teacher') redirectPath = '/teacher/dashboard';
    else if (storedUser.role === 'student') redirectPath = '/student/dashboard';

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
