import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../../components/admin/AdminLayout';
import '../../../components/admin/admin.css';
import { userApi } from '../../../api/userApi';

const TeacherListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const result = await userApi.getTeachers();
        setTeachers(result.data || []);
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayRole = (role) => {
    if (role === 'admin') return 'Quản trị';
    if (role === 'teacher') return 'Giáo viên';
    return role;
  };

  return (
    <AdminLayout title="Danh sách giáo viên">
      <div className="admin-page-container">
        <div className="admin-page-header">
          <div className="admin-search-container">
            <FiSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm giáo viên..."
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Role</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Không có giáo viên nào.</td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.id}</td>
                    <td>{teacher.name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.phone || '-'}</td>
                    <td><span className="role-badge">{displayRole(teacher.role)}</span></td>
                    <td className="action-cell">
                      <button className="btn-edit" title="Sửa" onClick={() => navigate(`/admin/users/edit/${teacher.id}`)}>
                        <FiEdit2 size={16} /> Sửa
                      </button>
                      <button className="btn-delete" title="Xóa">
                        <FiTrash2 size={16} /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="admin-pagination">
            <span className="pagination-info">Hiển thị 1 đến {filteredTeachers.length} của {filteredTeachers.length} mục</span>
            <div className="pagination-controls">
              <button className="page-btn disabled">Trước</button>
              <button className="page-btn active">1</button>
              <button className="page-btn disabled">Tiếp</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeacherListPage;
