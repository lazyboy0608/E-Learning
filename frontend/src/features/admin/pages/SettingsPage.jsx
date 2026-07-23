import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiSave } from 'react-icons/fi';
import AdminLayout from '../../../components/admin/AdminLayout';
import { authApi } from '../../../api/authApi';
import { userApi } from '../../../api/userApi';
import { useAuth } from '../../../contexts/AuthContext';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authApi.getMe();
        const data = res.data || res;
        setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      } catch {
        setForm({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await userApi.updateUser(user.id, form);
      updateUser({ ...user, ...form });
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch {
      setMessage({ type: 'error', text: 'Lưu thất bại. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Cài đặt tài khoản">
        <div className="text-center py-20 text-gray-500">Đang tải...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Cài đặt tài khoản">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <form
          onSubmit={handleSubmit}
          style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#111827' }}>Thông tin cá nhân</h2>
          <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>Cập nhật thông tin tài khoản của bạn.</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 24, fontWeight: 700,
              }}
            >
              {(form.name || user?.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Họ và tên</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: 12, top: 11, color: '#9ca3af' }} />
                <input
                  name="name" value={form.name} onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 12, top: 11, color: '#9ca3af' }} />
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Số điện thoại</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={{ position: 'absolute', left: 12, top: 11, color: '#9ca3af' }} />
                <input
                  name="phone" value={form.phone} onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {message.text && (
            <div style={{
              marginTop: 16, padding: '10px 14px', borderRadius: 8,
              background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: 14,
            }}>
              {message.text}
            </div>
          )}

          <button
            type="submit" disabled={saving}
            style={{
              marginTop: 24, width: '100%', padding: '12px',
              background: '#059669', color: 'white', border: 'none',
              borderRadius: 10, fontWeight: 600, fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <FiSave />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
