import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiCopy, 
  FiPower,
  FiUser,
  FiClock,
  FiFileText,
  FiHash
} from 'react-icons/fi';
import AdminLayout from '../../../components/admin/AdminLayout';
import { testApi } from '../../../api/testApi';

const AdminTestDetailPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await testApi.getTestDetails(testId);
      setTest(response.data);
    } catch (error) {
      console.error('Failed to fetch test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await testApi.updateTest(testId, { is_active: !test.is_active });
      setTest(prev => ({ ...prev, is_active: !prev.is_active }));
    } catch (error) {
      console.error('Failed to update test:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await testApi.deleteTest(testId);
      navigate('/admin/tests');
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    alert('Đã sao chép mã truy cập!');
  };

  const getAccessTypeLabel = (type) => {
    switch (type) {
      case 'public_code': return 'Mã công khai';
      case 'class_only': return 'Chỉ lớp học';
      case 'both': return 'Cả hai';
      default: return type;
    }
  };

  const getQuestionTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'mcq':
        return { label: 'Trắc nghiệm', class: 'bg-blue-100 text-blue-700' };
      case 'fill_blank':
        return { label: 'Điền từ', class: 'bg-emerald-100 text-emerald-700' };
      case 'matching':
        return { label: 'Nối đáp án', class: 'bg-purple-100 text-purple-700' };
      default:
        return { label: 'Tự luận', class: 'bg-slate-100 text-slate-700' };
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết bài kiểm tra">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!test) {
    return (
      <AdminLayout title="Lỗi">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
          <FiFileText style={{ fontSize: '60px', color: '#d1d5db' }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Không tìm thấy bài kiểm tra.</p>
          <button
            onClick={() => navigate('/admin/tests')}
            style={{ padding: '10px 24px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            Quay lại danh sách
          </button>
        </div>
      </AdminLayout>
    );
  }

  const totalQuestions = test.questions?.length || 0;
  const totalScore = test.questions?.reduce((sum, q) => sum + (q.pivot?.score || 1), 0) || 0;

  return (
    <AdminLayout title={test.title}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/tests')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          <FiArrowLeft />
          Quay lại danh sách
        </button>

        {/* Test Info Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{test.title}</h1>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {test.test_code && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                    <FiHash style={{ color: '#94a3af' }} />
                    <span>Mã bài:</span>
                    <code style={{ backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', color: '#2563eb', fontWeight: '600' }}>
                      {test.test_code}
                    </code>
                    <button
                      onClick={() => handleCopyCode(test.test_code)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: '12px' }}
                    >
                      Sao chép
                    </button>
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                  <FiFileText style={{ color: '#94a3af' }} />
                  <span>Môn học: {test.subject?.name || 'Không rõ'}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                  <FiClock style={{ color: '#94a3af' }} />
                  <span>Thời gian: {test.duration ? `${test.duration} phút` : 'Không giới hạn'}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                  <span>Hình thức:</span>
                  <span style={{ fontWeight: '500' }}>{getAccessTypeLabel(test.access_type)}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                  <FiUser style={{ color: '#94a3af' }} />
                  <span>Người tạo: {test.creator?.name || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleToggleActive}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  padding: '10px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '14px',
                  border: 'none', cursor: 'pointer',
                  backgroundColor: test.is_active ? '#dcfce7' : '#f3f4f6',
                  color: test.is_active ? '#16a34a' : '#64748b'
                }}
              >
                <FiPower style={{ fontSize: '16px' }} />
                {test.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
              </button>
              
              <button
                onClick={() => navigate(`/admin/tests/${testId}/edit`)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '14px',
                  backgroundColor: '#dbeafe', color: '#2563eb', border: 'none', cursor: 'pointer'
                }}
              >
                <FiEdit style={{ fontSize: '16px' }} />
                Chỉnh sửa
              </button>
              
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '14px',
                  backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer'
                }}
              >
                <FiTrash2 style={{ fontSize: '16px' }} />
                Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb', marginBottom: '4px' }}>{totalQuestions}</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Câu hỏi</div>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a', marginBottom: '4px' }}>{totalScore}</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Tổng điểm</div>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#9333ea', marginBottom: '4px' }}>{test.attempts_count || 0}</div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Lượt làm bài</div>
          </div>
        </div>

        {/* Questions List */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0' }}>Danh sách câu hỏi</h2>
          </div>

          {totalQuestions === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
              <FiFileText style={{ fontSize: '48px', color: '#d1d5db', margin: '0 auto 16px' }} />
              <p style={{ margin: '0 0 16px 0' }}>Chưa có câu hỏi nào</p>
              <button
                onClick={() => navigate('/admin/tests/create')}
                style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                Thêm câu hỏi
              </button>
            </div>
          ) : (
            <div>
              {test.questions?.map((question, index) => {
                const badge = getQuestionTypeBadge(question.type);
                return (
                  <div key={question.id} style={{ padding: '20px', borderBottom: index < totalQuestions - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ flex: '1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                          <span style={{ backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                            Câu {index + 1}
                          </span>
                          <span className={badge.class} style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                            {badge.label}
                          </span>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>
                            {question.pivot?.score || 1} điểm
                          </span>
                        </div>
                        <p style={{ margin: '0', fontSize: '15px', color: '#374151', lineHeight: '1.6' }}>
                          {question.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirm Modal */}
        {confirmDelete && (
          <div style={{ position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '50' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Xác nhận xóa</h3>
              <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
                Bạn có chắc muốn xóa bài kiểm tra này? Hành động này không thể hoàn tác.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ flex: '1', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#374151' }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  style={{ flex: '1', padding: '10px', backgroundColor: '#dc2626', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTestDetailPage;
