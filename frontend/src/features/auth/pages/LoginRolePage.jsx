import { useNavigate } from 'react-router-dom';
import '../auth.css';

function LoginRolePage() {
  const navigate = useNavigate();

  const handleRoleChange = () => {
    const role = document.getElementById('role-select').value;

    if (role === 'teacher') {
      navigate('/login/teacher');
    } else {
      navigate('/login/student');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <header className="hp-header">
        <div className="hp-header-inner">
          <div className="hp-logo">
            <span className="hp-logo-icon">📚</span>
            <span className="hp-logo-text">E-Learning</span>
          </div>

          <div className="hp-auth-btns" style={{ marginLeft: 'auto' }}>
            <button
              id="btn-home"
              className="hp-btn hp-btn-outline"
              onClick={() => navigate('/')}
            >
              Trang chủ
            </button>
            <button id="btn-register-login1" className="hp-btn hp-btn-solid" onClick={() => navigate('/register')}>
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      <div className="login1-page-body">
        <div className="auth-container login1-container">
          <div className="auth-card login1-card">
            <h1 className="auth-title">Chào mừng đến với<br />hệ thống E-learning</h1>
            <p className="auth-subtitle">Chọn vai trò của bạn để tiếp tục</p>

            <div className="auth-field" style={{ marginTop: '0.5rem' }}>
              <label className="auth-label" htmlFor="role-select">Vai trò của bạn</label>
              <select
                id="role-select"
                className="auth-select"
                defaultValue="student"
              >
                <option value="student">Tôi là học sinh</option>
                <option value="teacher">Tôi là giáo viên</option>
              </select>
            </div>

            <button id="btn-continue" className="auth-btn auth-btn-primary" onClick={handleRoleChange}>
              Tiếp tục →
            </button>
          </div>

          <div className="login1-visual">
            <div className="l1-visual-shape" />
            <div className="l1-visual-content">
              <div className="l1-visual-icon">🎓</div>
              <h2 className="l1-visual-title">Bắt đầu hành trình học tập của bạn</h2>
              <ul className="l1-visual-list">
                <li>✅ Hơn 500+ khóa học chất lượng</li>
                <li>✅ Giáo viên chuyên nghiệp</li>
                <li>✅ Chứng chỉ được công nhận</li>
                <li>✅ Học mọi lúc, mọi nơi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginRolePage;