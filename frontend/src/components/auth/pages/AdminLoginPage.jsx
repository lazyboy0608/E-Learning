import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Component AdminLoginPage - Xử lý đăng nhập cho Quản trị viên
 */
function AdminLoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authLogin(email, password, "admin");

      if (!result.success) {
        setError(result.message || "Email hoặc mật khẩu không đúng.");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 422) {
          const validationErrors = err.response.data.errors;
          const firstErrorKey = Object.keys(validationErrors)[0];
          setError(validationErrors[firstErrorKey][0]);
        } else if (err.response.status === 401) {
          setError(err.response.data.message || "Email hoặc mật khẩu không đúng.");
        } else {
          setError("Lỗi đăng nhập. Vui lòng thử lại.");
        }
      } else {
        setError("Lỗi kết nối máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#f6f9ff' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 24px 80px rgba(0, 100, 200, 0.12)' }}>
        <button onClick={() => navigate('/')} style={{ border: 'none', background: 'none', color: '#0084FF', fontWeight: 600, cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
          ← Quay về trang chủ
        </button>
        
        <h1 style={{ fontSize: '1.6rem', marginBottom: '8px', color: '#0f1f3d' }}>Đăng nhập quản trị viên</h1>
        <p style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>Khu vực dành riêng cho quản lý hệ thống.</p>
        
        {error && (
            <div style={{ color: '#d32f2f', backgroundColor: '#fdecea', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Email Quản trị</label>
            <input 
                type="email" 
                placeholder="admin@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #d1dff7', outline: 'none' }} 
                required 
            />
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Mật khẩu</label>
            <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #d1dff7', outline: 'none' }} 
                required 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
                padding: '14px', 
                border: 'none', 
                borderRadius: '12px', 
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0084FF, #0070d9)', 
                color: '#fff', 
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                transition: 'all 0.2s'
            }}>
            {loading ? "Đang xác thực..." : "Đăng Nhập Quản Trị"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
