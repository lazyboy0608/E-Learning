import React, { useEffect, useState } from 'react';
import StudentLayout from '../../../components/student/StudentLayout';
import JoinClassForm from '../../../components/student/JoinClassForm';
import ClassList from '../../../components/student/ClassList';
import { classApi } from '../../../api/classApi';

const StudentClassListPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await classApi.getClasses();
      if (response.success) {
        setClasses(response.data || []);
      } else {
        setError(response.message || 'Không thể tải danh sách lớp.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách lớp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <StudentLayout pageTitle="Lớp học của tôi" pageSubtitle="Tìm kiếm và tham gia lớp học mới bằng mã lớp">  
      <div style={{ display: 'grid', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '18px', boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '22px', fontWeight: 700 }}>Danh sách lớp học</h2>
            {loading ? (
              <p style={{ color: '#6B7280' }}>Đang tải lớp học...</p>
            ) : error ? (
              <p style={{ color: '#B91C1C' }}>{error}</p>
            ) : (
              <ClassList classes={classes} />
            )}
          </div>

          <div>
            <JoinClassForm onJoined={loadClasses} />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentClassListPage;
