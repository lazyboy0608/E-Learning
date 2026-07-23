import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';

function LoginStudentPage() {
    const { login: authLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authLogin(email, password, 'student');

            if (!result.success) {
                setError(result.message || 'Tài khoản không hợp lệ. Vui lòng đăng nhập bằng tài khoản học sinh.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-box">
            <h2>Đăng Nhập Hệ Thống (Học Sinh)</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleLoginSubmit}>
                <input
                    type="email"
                    placeholder="Email học sinh"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                </button>
            </form>
        </div>
    );
}

export default LoginStudentPage;
