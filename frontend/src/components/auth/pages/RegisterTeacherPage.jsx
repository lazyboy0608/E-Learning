import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import '../../../features/auth/auth.css';

/**
 * Component RegisterTeacherPage - Xử lý đăng ký cho Giáo viên
 */
function RegisterTeacherPage() {
  const navigate = useNavigate();
  
  // 1. Quản lý State cho form đăng ký
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Hàm xử lý sự kiện onSubmit
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra mật khẩu xác nhận
    if (password !== password_confirmation) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      // Gọi hàm register từ authService với vai trò là teacher
      await authService.register(name, email, phone, password, password_confirmation, 'teacher');
      
      setSuccess('Đăng ký giáo viên thành công! Đang chuyển hướng...');
      
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate('/login/teacher');
      }, 2000);
    } catch (error) {
    console.log(error.response?.data);

    const responseData = error.response?.data;

    // Nếu có validation errors
    if (responseData?.errors) {
        const firstError = Object.values(responseData.errors)[0][0];
        setError(firstError);
    }
    // Nếu chỉ có message
    else if (responseData?.message) {
        setError(responseData.message);
    }
    // fallback
    else {
        setError("Đăng ký thất bại.");
    }
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-bg" />

      <div className="auth-container reg-container">
        <div className="auth-card reg-card">
          <button
            id="btn-change-role-register-teacher"
            className="auth-back-link"
            onClick={() => navigate('/register')}
          >
            ← Thay đổi vai trò
          </button>

          <h1 className="reg-title">Bạn đang đăng ký dưới vai trò giáo viên</h1>

          {/* Thông báo lỗi/thành công */}
          {error && <div className="auth-alert auth-alert-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          {success && <div className="auth-alert auth-alert-success" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

          <form onSubmit={handleRegister} className="reg-form">
            <p className="reg-section-label">Thông tin tài khoản</p>

            <input
              id="teacher-fullname"
              type="text"
              className="reg-input"
              placeholder="Họ tên đầy đủ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              id="teacher-email"
              type="email"
              className="reg-input"
              placeholder="Email công tác"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              id="teacher-phone"
              type="text"
              className="reg-input"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <input
              id="teacher-password"
              type="password"
              className="reg-input"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              id="teacher-confirm-password"
              type="password"
              className="reg-input"
              placeholder="Xác nhận mật khẩu"
              value={password_confirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />

            <button 
              id="btn-register-teacher" 
              type="submit" 
              className="reg-btn"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký giáo viên'}
            </button>
          </form>

          <p className="auth-footer-text">
            Đã có tài khoản?{' '}
            <a
              href="#"
              className="auth-link"
              onClick={(event) => { event.preventDefault(); navigate('/login/teacher'); }}
            >
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterTeacherPage;
