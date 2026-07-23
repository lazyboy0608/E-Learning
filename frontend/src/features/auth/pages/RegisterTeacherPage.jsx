import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../auth.css';

function RegisterTeacherPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    school: '',
    dob: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    alert(`Đăng ký giáo viên thành công: ${formData.email}`);
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

          <form onSubmit={handleSubmit} className="reg-form">
            <p className="reg-section-label">Thông tin cá nhân</p>

            <input
              id="teacher-fullname"
              type="text"
              name="fullName"
              className="reg-input"
              placeholder="Họ tên"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <input
              id="teacher-school"
              type="text"
              name="school"
              className="reg-input"
              placeholder="Trường"
              value={formData.school}
              onChange={handleChange}
            />

            <div className="reg-row">
              <input
                id="teacher-dob"
                type="date"
                name="dob"
                className="reg-input"
                placeholder="Ngày sinh"
                value={formData.dob}
                onChange={handleChange}
              />
              <input
                id="teacher-address"
                type="text"
                name="address"
                className="reg-input"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <p className="reg-section-label">Thông tin tài khoản</p>

            <input
              id="teacher-email"
              type="email"
              name="email"
              className="reg-input"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              id="teacher-password"
              type="password"
              name="password"
              className="reg-input"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              id="teacher-confirm-password"
              type="password"
              name="confirmPassword"
              className="reg-input"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button id="btn-register-teacher" type="submit" className="reg-btn">
              Đăng ký
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