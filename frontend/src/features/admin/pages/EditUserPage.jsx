import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import '../../../components/admin/admin.css';
import { userApi } from '../../../api/userApi';

const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isStudent = id?.startsWith('S');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await userApi.getUser(id);
        const user = result.data || result;
        setForm({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || '',
        });
      } catch (err) {
        setError('Không thể tải thông tin người dùng.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await userApi.updateUser(id, form);
      navigate(-1);
    } catch (err) {
      setError('Lưu thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={`Sửa thông tin ${isStudent ? 'học sinh' : 'giáo viên'}`}>
      <div className="admin-form-card">
        <div className="admin-form-header">
          Sửa thông tin {isStudent ? 'học sinh' : 'giáo viên'}
        </div>
        <div className="admin-form-body">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

              <div className="admin-form-group">
                <label className="admin-form-label">Họ và tên:</label>
                <input
                  type="text"
                  name="name"
                  className="admin-form-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email:</label>
                <input
                  type="email"
                  name="email"
                  className="admin-form-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Số điện thoại:</label>
                <input
                  type="text"
                  name="phone"
                  className="admin-form-input"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Quyền:</label>
                <select
                  name="role"
                  className="admin-form-select"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="teacher">Giáo viên</option>
                  <option value="student">Học sinh</option>
                </select>
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => navigate(-1)}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-submit" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Sửa'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditUserPage;
