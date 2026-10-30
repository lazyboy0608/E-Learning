import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiBookOpen, 
  FiClock, 
  FiUsers, 
  FiCheckCircle, 
  FiFileText,
  FiAlertTriangle,
  FiHelpCircle,
  FiCalendar,
  FiLayers
} from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { practiceApi } from '../../../api/practiceApi';

const PracticeDetailPage = () => {
  const { practiceId } = useParams();
  const navigate = useNavigate();

  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPractice();
  }, [practiceId]);

  const fetchPractice = async () => {
    try {
      setLoading(true);
      const res = await practiceApi.getPracticeDetails(practiceId);
      setPractice(res.data);
    } catch (error) {
      console.error('Failed to fetch practice details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await practiceApi.deletePractice(practiceId);
      navigate('/teacher/practice');
    } catch (error) {
      console.error('Failed to delete practice:', error);
      alert('Không thể xóa bài ôn tập. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
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

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return { label: 'Dễ', bg: '#f0fdf4', color: '#16a34a' };
      case 'hard':
        return { label: 'Khó', bg: '#fef2f2', color: '#dc2626' };
      default:
        return { label: 'Trung bình', bg: '#fffbeb', color: '#d97706' };
    }
  };

  // Chuẩn hóa danh sách Options (Hỗ trợ cả Array, Object {"A": "val"}, hoặc JSON string)
  const getNormalizedOptions = (q) => {
    try {
      let rawOptions = q.data?.options;
      if (!rawOptions) return [];
      
      if (typeof rawOptions === 'string') {
        try {
          rawOptions = JSON.parse(rawOptions);
        } catch {
          return [];
        }
      }

      if (Array.isArray(rawOptions)) {
        return rawOptions.map((opt, idx) => {
          if (typeof opt === 'object' && opt !== null) {
            const key = opt.id || opt.key || String.fromCharCode(65 + idx);
            const text = opt.text || opt.content || opt.label || JSON.stringify(opt);
            return { key, text, index: idx };
          }
          return {
            key: String.fromCharCode(65 + idx),
            text: String(opt),
            index: idx
          };
        });
      }

      if (typeof rawOptions === 'object' && rawOptions !== null) {
        return Object.entries(rawOptions).map(([key, val], idx) => ({
          key: String(key).toUpperCase(),
          text: typeof val === 'object' ? JSON.stringify(val) : String(val),
          index: idx
        }));
      }

      return [];
    } catch (e) {
      console.error('Error normalizing options:', e);
      return [];
    }
  };

  // Kiểm tra phương án có phải đáp án đúng không
  const isOptionCorrect = (opt, q) => {
    try {
      let correct = q.data?.correct_answers ?? q.data?.correct_answer;
      if (!correct) return false;

      if (typeof correct === 'string') {
        try {
          correct = JSON.parse(correct);
        } catch {
          correct = [correct];
        }
      }

      if (!Array.isArray(correct)) {
        correct = [correct];
      }

      const optKeyUpper = String(opt.key).toUpperCase();
      const optIdxStr = String(opt.index);

      return correct.some(c => {
        const cStr = String(c).toUpperCase();
        return cStr === optKeyUpper || cStr === optIdxStr || c === opt.index || c === opt.text;
      });
    } catch {
      return false;
    }
  };

  // Chuẩn hóa hiển thị đáp án điền từ
  const getFillBlankAnswers = (q) => {
    try {
      let answers = q.data?.correct_answers ?? q.data?.correct_answer;
      if (!answers) return '';
      if (typeof answers === 'string') return answers;
      if (Array.isArray(answers)) return answers.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(', ');
      if (typeof answers === 'object') return Object.values(answers).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(', ');
      return String(answers);
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <TeacherLayout pageTitle="Chi tiết bài ôn tập">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div style={{
            display: 'inline-block',
            width: '42px',
            height: '42px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#64748b', fontSize: '15px' }}>Đang tải thông tin bài ôn tập...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </TeacherLayout>
    );
  }

  if (!practice) {
    return (
      <TeacherLayout pageTitle="Không tìm thấy bài ôn tập">
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
            Không tìm thấy bài ôn tập
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            Bài ôn tập có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
          <button
            onClick={() => navigate('/teacher/practice')}
            style={{
              padding: '10px 24px',
              backgroundColor: '#059669',
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

  const questionsList = practice.questions || [];
  const totalQuestions = questionsList.length;

  return (
    <TeacherLayout pageTitle={practice.title}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px', boxSizing: 'border-box' }}>
        
        {/* Nút Quay Lại */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/teacher/practice')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <FiArrowLeft />
            Quay lại danh sách bài ôn tập
          </button>
        </div>

        {/* HEADER CARD: THÔNG TIN BÀI ÔN TẬP */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: '28px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
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
                  backgroundColor: practice.is_active ? '#10b981' : '#94a3b8'
                }}></span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: practice.is_active ? '#059669' : '#64748b'
                }}>
                  {practice.is_active ? 'Đang hoạt động' : 'Tạm khóa'}
                </span>
                <span style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {practice.subject?.name || 'Môn học'}
                </span>
              </div>

              <h1 style={{
                fontSize: '26px',
                fontWeight: '800',
                color: '#0f172a',
                margin: '0 0 12px 0',
                lineHeight: '1.3'
              }}>
                {practice.title}
              </h1>

              {practice.description && (
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  {practice.description}
                </p>
              )}

              {/* Thông tin chi tiết dạng badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCalendar style={{ color: '#94a3b8' }} />
                  <span>Ngày tạo: <strong>{practice.created_at ? new Date(practice.created_at).toLocaleDateString('vi-VN') : '-'}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiBookOpen style={{ color: '#94a3b8' }} />
                  <span>Số câu hỏi: <strong style={{ color: '#059669' }}>{totalQuestions}</strong> câu</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiUsers style={{ color: '#94a3b8' }} />
                  <span>Áp dụng: </span>
                  {practice.classes && practice.classes.length > 0 ? (
                    <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap' }}>
                      {practice.classes.map(c => (
                        <span key={c.id} style={{
                          backgroundColor: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#334155'
                        }}>
                          {c.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <strong style={{ color: '#64748b' }}>Tất cả học sinh</strong>
                  )}
                </div>
              </div>
            </div>

            {/* Cột phải: Các nút hành động */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Nút Thêm/Quản lý câu hỏi */}
              <button
                type="button"
                onClick={() => navigate(`/teacher/practice/${practiceId}/questions`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
              >
                <FiPlus size={16} />
                Thêm câu hỏi mới
              </button>

              {/* Nút Chỉnh sửa */}
              <button
                type="button"
                onClick={() => navigate(`/teacher/practice/${practiceId}/edit`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              >
                <FiEdit size={16} />
                Chỉnh sửa
              </button>

              {/* Nút Xóa */}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#ffffff',
                  color: '#ef4444',
                  borderRadius: '10px',
                  border: '1px solid #fecaca',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <FiTrash2 size={16} />
                Xóa
              </button>
            </div>
          </div>
        </div>

        {/* 3 THẺ THỐNG KÊ TỔNG QUAN */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {/* Khối 1: Số câu hỏi */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiBookOpen />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '2px' }}>
                Tổng số câu hỏi
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {totalQuestions} <span style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8' }}>câu</span>
              </div>
            </div>
          </div>

          {/* Khối 2: Lớp học áp dụng */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiUsers />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '2px' }}>
                Lớp học áp dụng
              </div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#2563eb', lineHeight: 1.1 }}>
                {practice.classes?.length || 0} <span style={{ fontSize: '14px', fontWeight: '500', color: '#94a3b8' }}>lớp</span>
              </div>
            </div>
          </div>

          {/* Khối 3: Trạng thái */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiCheckCircle />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '2px' }}>
                Trạng thái bài ôn tập
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: practice.is_active ? '#059669' : '#64748b', marginTop: '4px' }}>
                {practice.is_active ? 'Đang hoạt động' : 'Tạm khóa'}
              </div>
            </div>
          </div>
        </div>

        {/* DANH SÁCH CÂU HỎI */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                Danh sách câu hỏi ôn tập ({totalQuestions})
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Học sinh sẽ luyện tập các câu hỏi này không bị giới hạn thời gian thi.
              </p>
            </div>

            <button
              onClick={() => navigate(`/teacher/practice/${practiceId}/edit`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <FiLayers />
              Chọn câu hỏi từ ngân hàng
            </button>
          </div>

          {questionsList.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '60px 24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 16px auto'
              }}>
                <FiFileText />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                Bài ôn tập chưa có câu hỏi nào
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                Bạn có thể tạo câu hỏi mới hoặc chọn từ ngân hàng câu hỏi có sẵn để học sinh bắt đầu ôn luyện.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={() => navigate(`/teacher/practice/${practiceId}/questions`)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Tạo câu hỏi mới
                </button>
                <button
                  onClick={() => navigate(`/teacher/practice/${practiceId}/edit`)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Chọn từ ngân hàng
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questionsList.map((item, index) => {
                const q = item.question || item;
                if (!q) return null;

                const typeInfo = getQuestionTypeBadge(q.type);
                const diffInfo = getDifficultyBadge(q.difficulty);
                const options = getNormalizedOptions(q);

                return (
                  <div
                    key={q.id || index}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      padding: '24px',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {/* Header câu hỏi */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '700'
                        }}>
                          Câu {index + 1}
                        </span>

                        <span style={{
                          backgroundColor: typeInfo.bg,
                          color: typeInfo.color,
                          border: `1px solid ${typeInfo.border}`,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {typeInfo.label}
                        </span>

                        {q.difficulty && (
                          <span style={{
                            backgroundColor: diffInfo.bg,
                            color: diffInfo.color,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {diffInfo.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nội dung câu hỏi */}
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '16px',
                      lineHeight: '1.5'
                    }}>
                      {q.content}
                    </div>

                    {/* Media ảnh nếu có */}
                    {q.media_image && (
                      <div style={{ marginBottom: '16px' }}>
                        <img 
                          src={q.media_image} 
                          alt="Minh họa" 
                          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                        />
                      </div>
                    )}

                    {/* Chi tiết đáp án MCQ */}
                    {q.type === 'mcq' && options.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '10px',
                        marginBottom: '14px'
                      }}>
                        {options.map((opt) => {
                          const isCorrect = isOptionCorrect(opt, q);
                          return (
                            <div
                              key={opt.key}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: isCorrect ? '2px solid #10b981' : '1px solid #e2e8f0',
                                backgroundColor: isCorrect ? '#ecfdf5' : '#f8fafc',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                color: isCorrect ? '#065f46' : '#334155',
                                fontWeight: isCorrect ? '600' : '400'
                              }}
                            >
                              <span style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: isCorrect ? '#10b981' : '#e2e8f0',
                                color: isCorrect ? '#ffffff' : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '700',
                                flexShrink: 0
                              }}>
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                              {isCorrect && (
                                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                                  ✓ Đáp án đúng
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Chi tiết đáp án điền từ */}
                    {q.type === 'fill_blank' && (
                      <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        marginBottom: '14px'
                      }}>
                        <strong style={{ color: '#047857' }}>Đáp án điền từ: </strong>
                        <span style={{ color: '#334155' }}>
                          {getFillBlankAnswers(q)}
                        </span>
                      </div>
                    )}

                    {/* Lời giải chi tiết nếu có */}
                    {q.explanation && (
                      <div style={{
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fef3c7',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <FiHelpCircle style={{ marginTop: '2px', flexShrink: 0, fontSize: '15px' }} />
                        <div>
                          <strong>Lời giải chi tiết: </strong>
                          <span>{q.explanation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL XÁC NHẬN XÓA BÀI ÔN TẬP */}
        {confirmDelete && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
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
                fontSize: '26px',
                margin: '0 auto 16px auto'
              }}>
                <FiTrash2 />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                Xác nhận xóa bài ôn tập?
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                Bạn có chắc chắn muốn xóa bài ôn tập <strong style={{ color: '#0f172a' }}>"{practice.title}"</strong> không? Hành động này không thể hoàn tác.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    flex: 1,
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: deleteLoading ? 'not-allowed' : 'pointer'
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

export default PracticeDetailPage;