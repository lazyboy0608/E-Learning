import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../../../components/admin/AdminLayout';
import '../../../components/admin/admin.css';
import { userApi } from '../../../api/userApi';

const StudentListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const result = await userApi.getStudents();
        setStudents(result.data || []);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Danh sách học sinh">
      <div className="admin-page-container">
        <div className="admin-page-header">
          <div className="admin-search-container">
            <FiSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
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
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Không có học sinh nào.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone || '-'}</td>
                    <td><span className="role-badge">Học sinh</span></td>
                    <td className="action-cell">
                      <button className="btn-edit" title="Sửa" onClick={() => navigate(`/admin/users/edit/${student.id}`)}>
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
            <span className="pagination-info">Hiển thị 1 đến {filteredStudents.length} của {filteredStudents.length} mục</span>
            <div className="pagination-controls">
              <button className="page-btn disabled">Trước</button>
              <button className="page-btn active">1</button>
              <button className="page-btn disabled">Tiếp</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout >
  );
};

export default StudentListPage;
