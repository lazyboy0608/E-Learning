import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/authService';
import '../../../features/auth/auth.css';

/**
 * Component RegisterStudentPage - Xử lý đăng ký cho Học sinh
 */
function RegisterStudentPage() {
  const navigate = useNavigate();
  
  // 1. Tạo các state tương ứng với form đăng ký
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

    // Kiểm tra mật khẩu và mật khẩu xác nhận không khớp
    if (password !== password_confirmation) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      // Gọi hàm register từ authService (với role là student)
      await authService.register(name, email, phone, password, password_confirmation, 'student');
      
      setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
      
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate('/login/student');
      }, 2000);
    } catch (err) {
      // Bắt thông điệp lỗi từ Laravel
      if (err.response && err.response.status === 422) {
        const validationErrors = err.response.data.errors;
        const firstErrorKey = Object.keys(validationErrors)[0];
        setError(validationErrors[firstErrorKey][0]);
      } else {
        setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
            id="btn-change-role-register-student"
            className="auth-back-link"
            onClick={() => navigate('/register')}
          >
            ← Thay đổi vai trò
          </button>

          <h1 className="reg-title">Bạn đang đăng ký dưới vai trò học sinh</h1>

          {/* Hiển thị thông báo lỗi hoặc thành công */}
          {error && <div className="auth-alert auth-alert-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          {success && <div className="auth-alert auth-alert-success" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

          <form onSubmit={handleRegister} className="reg-form">
            <p className="reg-section-label">Thông tin tài khoản</p>

            <input
              id="student-fullname"
              type="text"
              name="name"
              className="reg-input"
              placeholder="Họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              id="student-email"
              type="email"
              name="email"
              className="reg-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              id="student-phone"
              type="text"
              name="phone"
              className="reg-input"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <input
              id="student-password"
              type="password"
              name="password"
              className="reg-input"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              id="student-confirm-password"
              type="password"
              name="password_confirmation"
              className="reg-input"
              placeholder="Xác nhận mật khẩu"
              value={password_confirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />

            <button 
              id="btn-register-student" 
              type="submit" 
              className="reg-btn"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <p className="auth-footer-text">
            Đã có tài khoản?{' '}
            <a
              href="#"
              className="auth-link"
              onClick={(event) => { event.preventDefault(); navigate('/login/student'); }}
            >
              Đăng nhập ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterStudentPage;
