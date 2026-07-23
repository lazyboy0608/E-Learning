import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../features/auth/auth.css";

/**
 * Component LoginStudentPage - Xử lý đăng nhập cho Học sinh
 */
function LoginStudentPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  // 1. Quản lý State cho Email và Password (Chuẩn ES6)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Hàm xử lý khi người dùng nhấn Đăng nhập
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authLogin(email, password, "student");

      if (result.success && result.user?.role === "student") {
        // AuthContext.login() already navigates to the correct dashboard
      } else {
        setError("Tài khoản không hợp lệ. Vui lòng đăng nhập bằng tài khoản học sinh.");
      }
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const validationErrors = err.response.data.errors;
        const firstErrorKey = Object.keys(validationErrors)[0];
        setError(validationErrors[firstErrorKey][0]);
      } else if (err.response && err.response.status === 401) {
        const msg = err.response.data.message;
        if (msg === "invalid credentials" || msg === "Invalid credentials") {
          setError("Mật khẩu nhập vào không chính xác. Vui lòng thử lại.");
        } else {
          setError(msg || "Tài khoản hoặc mật khẩu không đúng.");
        }
      } else {
        setError(err.message || "Đăng nhập thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-bg" />

      <div className="auth-container">
        <div className="auth-card">
          <button
            id="btn-change-role-student"
            className="auth-back-link"
            onClick={() => navigate("/login")}
          >
            ← Thay đổi vai trò
          </button>

          <h1 className="auth-title" style={{ marginTop: "0.75rem" }}>
            Học sinh đăng nhập
          </h1>
          <p className="auth-subtitle">
            Chào mừng trở lại! Nhập thông tin tài khoản của bạn.
          </p>

          {/* Hiển thị thông báo lỗi trực quan cho người dùng */}
          {error && (
            <div 
              className="auth-alert auth-alert-error" 
              style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <div className="auth-input-wrap">
                <input
                  id="student-email"
                  type="email"
                  name="email"
                  className="auth-input"
                  placeholder="Nhập email của bạn"
                  value={email}
                  // Cập nhật State chuẩn xác qua onChange
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-input-wrap">
                <input
                  id="student-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="auth-input"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  // Cập nhật State chuẩn xác qua onChange
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="auth-label-row">
              <a href="#" className="auth-forgot">
                Quên mật khẩu?
              </a>
            </div>

            <button
              id="btn-login-student"
              type="submit"
              className="auth-btn auth-btn-primary"
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "Đăng nhập"}
            </button>
          </form>

          <p className="auth-footer-text">
            Bạn chưa có tài khoản?{" "}
            <a 
              href="#" 
              className="auth-link"
              onClick={(e) => { e.preventDefault(); navigate('/register/student'); }}
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginStudentPage;
