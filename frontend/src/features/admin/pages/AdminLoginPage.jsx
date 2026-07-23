import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, forceClearAuthSession } from '../../contexts/AuthContext';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    setError('');

    // Clear any existing auth state before login (handles case where user changed URL without logout)
    if (isAuthenticated && user) {
      forceClearAuthSession();
      window.location.href = '/admin/login';
      setLoading(false);
      return;
    }

    const result = await login(email, password, 'admin');

    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Email hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#f6f9ff' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 24px 80px rgba(0, 100, 200, 0.12)' }}>
        <button onClick={() => navigate('/')} style={{ border: 'none', background: 'none', color: '#0084FF', fontWeight: 600, cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
          ← Quay về trang chủ
        </button>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '8px', color: '#0f1f3d' }}>Đăng nhập quản trị viên</h1>
        <p style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>Khu vực quản trị hoạt động riêng cho role Admin.</p>
        {error && (
          <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626', marginBottom: '16px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'grid', gap: '12px' }}>
          <input type="email" placeholder="Email" style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #d1dff7' }} />
          <input type="password" placeholder="Mật khẩu" style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #d1dff7' }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            style={{ padding: '12px 14px', border: 'none', borderRadius: '12px', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0084FF, #0070d9)', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;