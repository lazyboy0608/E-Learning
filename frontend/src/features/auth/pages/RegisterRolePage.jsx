import { useNavigate } from "react-router-dom";
import "../auth.css";

function RegisterRolePage() {
  const navigate = useNavigate();

  const handleRoleChange = () => {
    const role = document.getElementById("register-role-select").value;

    if (role === "teacher") {
      navigate("/register/teacher");
    } else {
      navigate("/register/student");
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <header className="hp-header">
        <div className="hp-header-inner">
          <div className="hp-logo">
            <span className="hp-logo-icon">📚</span>
            <span className="hp-logo-text">SmartEdu</span>
          </div>

          <div className="hp-auth-btns" style={{ marginLeft: "auto" }}>
            <button
              id="btn-home-register"
              className="hp-btn hp-btn-outline"
              onClick={() => navigate("/")}
            >
              Trang chủ
            </button>
            <button
              id="btn-login-from-register"
              className="hp-btn hp-btn-solid"
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </header>

      <div className="register1-page-body">
        <div className="auth-container register1-container">
          <div className="auth-card register1-card">
            <h1 className="auth-title">
              Tạo tài khoản
              <br />
              SmartEdu
            </h1>
            <p className="auth-subtitle">
              Chọn vai trò của bạn để bắt đầu đăng ký
            </p>

            <div className="auth-field" style={{ marginTop: "0.5rem" }}>
              <label className="auth-label" htmlFor="register-role-select">
                Vai trò của bạn
              </label>
              <select
                id="register-role-select"
                className="auth-select"
                defaultValue="student"
              >
                <option value="student">Tôi là học sinh</option>
                <option value="teacher">Tôi là giáo viên</option>
              </select>
            </div>

            <button
              id="btn-register-continue"
              className="auth-btn auth-btn-primary"
              onClick={handleRoleChange}
            >
              Tiếp tục →
            </button>
          </div>

          <div className="register1-visual">
            <div className="r1-visual-shape" />
            <div className="r1-visual-content">
              <div className="r1-visual-icon">🚀</div>
              <h2 className="r1-visual-title">
                Bắt đầu hành trình học tập của bạn
              </h2>
              <ul className="r1-visual-list">
                <li>✅ Đăng ký nhanh chóng, sử dụng miễn phí</li>
                <li>✅ Kho bài tập &amp; Đề thi chuẩn GDPT</li>
                <li>✅ Học theo lộ trình từng khối lớp</li>
                <li>✅ Kết nối trực tiếp cùng thầy cô giáo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterRolePage;
