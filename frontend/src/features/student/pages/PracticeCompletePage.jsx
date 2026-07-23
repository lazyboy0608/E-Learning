import { useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import StudentLayout from '../../../components/student/StudentLayout';

const pageContainerStyle = {
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  padding: '24px',
  boxSizing: 'border-box',
};

const PracticeCompletePage = () => {
  const navigate = useNavigate();

  return (
    <StudentLayout pageTitle="Hoàn thành luyện tập">
      <div style={pageContainerStyle}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '48px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#f0fdf4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <FiCheckCircle style={{ fontSize: '40px', color: '#16a34a' }} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
            Chúc mừng!
          </h2>
          <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 32px 0', lineHeight: '1.6' }}>
            Bạn đã hoàn thành buổi luyện tập.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/student/practice')}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '12px 20px',
                backgroundColor: '#ffffff',
                color: '#374151',
                fontWeight: '600',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
              }}
              className="hover:bg-gray-50"
            >
              Quay lại
            </button>
            <button
              onClick={() => navigate('/student/practice')}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '12px 20px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
              className="hover:bg-purple-700"
            >
              Luyện tập tiếp
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default PracticeCompletePage;
