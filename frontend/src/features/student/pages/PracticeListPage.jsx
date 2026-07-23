import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiBookOpen, FiPlay } from 'react-icons/fi';
import StudentLayout from '../../../components/student/StudentLayout';
import { practiceApi } from '../../../api/practiceApi';

const pageContainerStyle = {
  display: 'block',
  width: '100%',
  maxWidth: '1152px',
  margin: '0 auto',
  padding: '24px',
  boxSizing: 'border-box',
  textAlign: 'left',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  width: '100%',
  boxSizing: 'border-box',
};

const purpleButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '10px 20px',
  backgroundColor: '#7c3aed',
  color: '#ffffff',
  fontWeight: '600',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  whiteSpace: 'nowrap',
};

const PracticeListPage = () => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPractices();
  }, []);

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const response = await practiceApi.getStudentPractices();
      if (response.success) {
        setPractices(response.data || []);
      } else {
        setError(response.message || 'Không thể tải danh sách bài ôn tập.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách bài ôn tập.');
    } finally {
      setLoading(false);
    }
  };

  const groupedByClass = practices.reduce((acc, practice) => {
    const cls = practice.class_name || 'Khác';
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(practice);
    return acc;
  }, {});

  if (loading) {
    return (
      <StudentLayout pageTitle="Bài tập ôn tập" pageSubtitle="Chọn bài ôn tập theo lớp học của bạn">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải danh sách bài ôn tập...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Bài tập ôn tập" pageSubtitle="Chọn bài ôn tập theo lớp học của bạn">
      <div style={pageContainerStyle}>
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Danh sách bài ôn tập</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Các bài ôn tập do giáo viên gán cho lớp học của bạn
          </p>
        </div>

        {error ? (
          <div style={{ ...cardStyle, padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
          </div>
        ) : practices.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '48px 24px', textAlign: 'center' }}>
            <FiBookOpen style={{ fontSize: '60px', color: '#d1d5db', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Chưa có bài ôn tập</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Các bài ôn tập sẽ xuất hiện ở đây khi giáo viên gán cho lớp học của bạn.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(groupedByClass).map(([className, classPractices]) => (
              <div key={className} style={{ ...cardStyle, padding: '24px' }}>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <FiBook style={{ color: '#7c3aed' }} />
                  {className}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {classPractices.map((practice) => (
                    <div
                      key={practice.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '10px',
                        border: '1px solid #f3f4f6',
                        backgroundColor: '#fafafa',
                        flexWrap: 'wrap',
                      }}
                      className="hover:border-purple-200 hover:bg-purple-50/40 transition-colors"
                    >
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                          {practice.title}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                          {practice.subject?.name || 'Không rõ môn'} · {practice.questions_count || 0} câu
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/student/practices/${practice.id}`)}
                        style={purpleButtonStyle}
                        className="hover:bg-purple-700"
                      >
                        <FiPlay style={{ fontSize: '14px' }} />
                        Làm bài
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default PracticeListPage;
