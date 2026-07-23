import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../auth.css';

function RegisterStudentPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    grade: '',
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
    alert(`Đăng ký học sinh thành công: ${formData.email}`);
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

          <form onSubmit={handleSubmit} className="reg-form">
            <p className="reg-section-label">Thông tin cá nhân</p>

            <input
              id="student-fullname"
              type="text"
              name="fullName"
              className="reg-input"
              placeholder="Họ tên"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <div className="reg-row">
              <input
                id="student-grade"
                type="text"
                name="grade"
                className="reg-input"
                placeholder="Lớp"
                value={formData.grade}
                onChange={handleChange}
              />
              <input
                id="student-school"
                type="text"
                name="school"
                className="reg-input"
                placeholder="Trường"
                value={formData.school}
                onChange={handleChange}
              />
            </div>

            <div className="reg-row">
              <input
                id="student-dob"
                type="date"
                name="dob"
                className="reg-input"
                placeholder="Ngày sinh"
                value={formData.dob}
                onChange={handleChange}
              />
              <input
                id="student-address"
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
              id="student-email"
              type="email"
              name="email"
              className="reg-input"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              id="student-password"
              type="password"
              name="password"
              className="reg-input"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              id="student-confirm-password"
              type="password"
              name="confirmPassword"
              className="reg-input"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button id="btn-register-student" type="submit" className="reg-btn">
              Đăng ký
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