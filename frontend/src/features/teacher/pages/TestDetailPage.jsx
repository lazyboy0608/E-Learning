import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiCopy, 
  FiCheck,
  FiCheckCircle, 
  FiBarChart2,
  FiPower,
  FiFileText,
  FiClock,
  FiBookOpen,
  FiHash,
  FiAlertTriangle,
  FiHelpCircle
} from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { testApi } from '../../../api/testApi';

const TestDetailPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      setLoading(true);
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
      setDeleteLoading(true);
      await testApi.deleteTest(testId);
      navigate('/teacher/tests');
    } catch (error) {
      console.error('Failed to delete test:', error);
      alert('Không thể xóa bài kiểm tra. Vui lòng thử lại.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getQuestionTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'mcq':
        return { label: 'Trắc nghiệm', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'fill_blank':
        return { label: 'Điền khuyết', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'matching':
        return { label: 'Nối đáp án', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'table_fill':
        return { label: 'Điền bảng', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      default:
        return { label: type || 'Câu hỏi', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  if (loading) {
    return (
      <TeacherLayout pageTitle="Chi tiết bài kiểm tra">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div style={{
            display: 'inline-block',
            width: '42px',
            height: '42px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#64748b', fontSize: '15px' }}>Đang tải thông tin đề kiểm tra...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </TeacherLayout>
    );
  }

  if (!test) {
    return (
      <TeacherLayout pageTitle="Lỗi">
        <div style={{
          maxWidth: '500px',
          margin: '60px auto',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          padding: '40px 24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <FiAlertTriangle style={{ fontSize: '48px', color: '#ef4444', margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Không tìm thấy bài kiểm tra
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            Đề kiểm tra có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
          <button
            onClick={() => navigate('/teacher/tests')}
            style={{
              padding: '10px 24px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Quay lại danh sách
          </button>
        </div>
      </TeacherLayout>
    );
  }

  // TÍNH TOÁN TỔNG ĐIỂM CHUẨN XÁC (Tránh lỗi ghép chuỗi String "02.502.25...")
  const totalQuestions = test.questions?.length || 0;
  const rawTotalScore = test.questions?.reduce((sum, q) => {
    const scoreVal = parseFloat(q.pivot?.score);
    return sum + (isNaN(scoreVal) ? 1 : scoreVal);
  }, 0) || 0;
  const totalScore = Number.isInteger(rawTotalScore) ? rawTotalScore : parseFloat(rawTotalScore.toFixed(2));

  return (
    <TeacherLayout pageTitle={test.title}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 8px' }}>
        
        {/* Nút quay lại */}
        <div style={{ marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => navigate('/teacher/tests')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#475569',
              fontWeight: '500',
              fontSize: '14px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '0'
            }}
          >
            <FiArrowLeft /> Quay lại danh sách bài kiểm tra
          </button>
        </div>

        {/* Khung Header Thông Tin Đề Thi */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            {/* Cột trái: Tên đề và các thông tin cơ bản */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: test.is_active ? '#10b981' : '#94a3b8'
                }}></span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: test.is_active ? '#059669' : '#64748b'
                }}>
                  {test.is_active ? 'Đang hoạt động' : 'Tạm khóa / Chưa mở'}
                </span>
              </div>

              <h1 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#0f172a',
                margin: '0 0 12px 0',
                lineHeight: '1.3'
              }}>
                {test.title}
              </h1>

              {/* Thông tin chi tiết dạng badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#475569' }}>
                {/* Mã đề thi */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiHash style={{ color: '#94a3b8' }} />
                  <span>Mã đề:</span>
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    backgroundColor: '#f1f5f9',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    color: '#1e293b'
                  }}>
                    {test.test_code || '---'}
                  </span>
                  {test.test_code && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(test.test_code)}
                      title="Sao chép mã đề"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedCode ? '#10b981' : '#2563eb',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {copiedCode ? <FiCheck size={14} /> : <FiCopy size={14} />}
                    </button>
                  )}
                </div>

                {/* Môn học */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiBookOpen style={{ color: '#94a3b8' }} />
                  <span>Môn học: <strong style={{ color: '#1e293b' }}>{test.subject?.name || 'Chung'}</strong></span>
                </div>

                {/* Thời gian */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiClock style={{ color: '#94a3b8' }} />
                  <span>Thời gian: <strong style={{ color: '#1e293b' }}>{test.duration ? `${test.duration} phút` : 'Tự do'}</strong></span>
                </div>
              </div>
            </div>

            {/* Cột phải: Các nút hành động */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              {/* Nút Xem kết quả / Bảng điểm */}
              <button
                type="button"
                onClick={() => navigate(`/teacher/tests/${testId}/results`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  backgroundColor: '#f5f3ff',
                  color: '#6d28d9',
                  border: '1px solid #ddd6fe',
                  borderRadius: '9px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ede9fe'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
              >
                <FiBarChart2 size={16} /> Bảng điểm
              </button>

              {/* Nút Bật / Tắt hoạt động */}
              <button
                type="button"
                onClick={handleToggleActive}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  backgroundColor: test.is_active ? '#ecfdf5' : '#f8fafc',
                  color: test.is_active ? '#065f46' : '#64748b',
                  border: test.is_active ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                  borderRadius: '9px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <FiPower size={15} />
                {test.is_active ? 'Đang mở' : 'Đang đóng'}
              </button>

              {/* Nút Chỉnh sửa */}
              <button
                type="button"
                onClick={() => navigate(`/teacher/tests/${testId}/edit`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  borderRadius: '9px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <FiEdit size={15} /> Chỉnh sửa
              </button>

              {/* Nút Xóa */}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '9px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <FiTrash2 size={15} /> Xóa
              </button>
            </div>
          </div>
        </div>

        {/* 3 Khối Thống Kê Tổng Quan (Overview Stat Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '28px'
        }}>
          {/* Khối 1: Số câu hỏi */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              <FiFileText />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Tổng số câu hỏi</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
                {totalQuestions} <span style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8' }}>câu</span>
              </div>
            </div>
          </div>

          {/* Khối 2: Tổng điểm (ĐÃ SỬA CHUẨN XÁC) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              <FiCheckCircle />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Tổng điểm đề thi</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#059669' }}>
                {totalScore} <span style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8' }}>điểm</span>
              </div>
            </div>
          </div>

          {/* Khối 3: Lượt làm bài */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              <FiBarChart2 />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Lượt đã nộp bài</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#7c3aed' }}>
                {test.attempts_count || 0} <span style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8' }}>lượt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danh Sách Câu Hỏi Trong Đề Thi */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          marginBottom: '40px'
        }}>
          {/* Header danh sách */}
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc'
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Danh sách câu hỏi trong đề ({totalQuestions})
            </h2>
            <button
              type="button"
              onClick={() => navigate(`/teacher/tests/${testId}/edit`)}
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#2563eb',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              + Quản lý câu hỏi trong đề
            </button>
          </div>

          {/* Danh sách các câu hỏi */}
          {totalQuestions === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <FiHelpCircle style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '12px' }} />
              <p style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Đề kiểm tra này hiện chưa có câu hỏi nào.</p>
              <button
                onClick={() => navigate(`/teacher/tests/${testId}/edit`)}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Thêm câu hỏi ngay
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px 20px' }}>
              {test.questions?.map((question, index) => {
                const typeBadge = getQuestionTypeBadge(question.type);
                const score = parseFloat(question.pivot?.score) || 1;

                return (
                  <div
                    key={question.id}
                    style={{
                      padding: '18px 20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      marginBottom: '14px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.backgroundColor = '#fafafa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#f1f5f9';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        {/* Tags hàng trên: Câu số - Loại câu - Điểm */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            padding: '3px 10px',
                            borderRadius: '6px'
                          }}>
                            Câu {index + 1}
                          </span>

                          <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: typeBadge.bg,
                            color: typeBadge.color,
                            border: `1px solid ${typeBadge.border}`,
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            {typeBadge.label}
                          </span>

                          <span style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            {score} điểm
                          </span>
                        </div>

                        {/* Nội dung câu hỏi */}
                        <p style={{
                          fontSize: '15px',
                          color: '#1e293b',
                          fontWeight: '500',
                          lineHeight: '1.6',
                          margin: '0 0 8px 0',
                          wordBreak: 'break-word'
                        }}>
                          {question.content}
                        </p>

                        {/* Giải thích nếu có */}
                        {question.explanation && (
                          <div style={{
                            fontSize: '13px',
                            color: '#64748b',
                            backgroundColor: '#f8fafc',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            borderLeft: '3px solid #3b82f6',
                            marginTop: '8px'
                          }}>
                            <strong>Lời giải:</strong> {question.explanation}
                          </div>
                        )}
                      </div>

                      {/* Nút sửa câu hỏi */}
                      <div>
                        <button
                          type="button"
                          onClick={() => navigate(`/teacher/questions/${question.id}/edit`)}
                          title="Chỉnh sửa câu hỏi này"
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.color = '#2563eb';
                            e.currentTarget.style.borderColor = '#93c5fd';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.color = '#64748b';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          <FiEdit size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Xác Nhận Xóa Đề Thi (Hiện đại, có backdrop blur) */}
        {confirmDelete && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '420px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #f1f5f9',
              textAlign: 'center'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '24px'
              }}>
                <FiAlertTriangle />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' }}>
                Xác nhận xóa đề kiểm tra?
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                Bạn có chắc muốn xóa đề thi <strong style={{ color: '#0f172a' }}>"{test.title}"</strong>? Lịch sử làm bài và điểm số của học sinh liên quan có thể bị ảnh hưởng.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleteLoading}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                    opacity: deleteLoading ? 0.7 : 1
                  }}
                >
                  {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};

export default TestDetailPage;
