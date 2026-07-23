import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiArrowLeft, FiClock } from 'react-icons/fi';
import { testApi } from '../../../api/testApi';
import { QuestionRenderer } from '../../../components/student/QuestionRenderer';

const pageContainerStyle = {
  width: '100%',
  maxWidth: '768px',
  margin: '0 auto',
  padding: '24px',
  boxSizing: 'border-box',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  width: '100%',
  boxSizing: 'border-box',
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN');
};

const getSubjectName = (result) => {
  if (!result?.subject) return 'Không rõ';
  if (typeof result.subject === 'string') return result.subject;
  return result.subject?.name || 'Không rõ';
};

export function TestResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!result) {
      fetchResult();
    } else {
      fetchReview();
    }
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const response = await testApi.getTestResults(attemptId);
      setResult(response.data);
      fetchReview();
    } catch (error) {
      console.error('Failed to fetch result:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async () => {
    try {
      const response = await testApi.getTestReview(attemptId);
      setReview(response.data);
    } catch (error) {
      console.error('Failed to fetch review:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return '#f0fdf4';
    if (score >= 60) return '#fffbeb';
    return '#fef2f2';
  };

  const getScoreBorderColor = (score) => {
    if (score >= 80) return '#bbf7d0';
    if (score >= 60) return '#fde68a';
    return '#fecaca';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return 'Xuất sắc!';
    if (score >= 80) return 'Rất tốt!';
    if (score >= 70) return 'Khá!';
    if (score >= 60) return 'Trung bình';
    if (score >= 50) return 'Cần cố gắng thêm';
    return 'Chưa đạt';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '12px', backgroundColor: '#f5f6fa' }}>
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải kết quả...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', backgroundColor: '#f5f6fa' }}>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Không tìm thấy kết quả.</p>
        <button
          onClick={() => navigate('/student/tests')}
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  const score = result.score ?? 0;
  const correctCount = review?.questions?.filter((q) => q.is_correct).length || 0;
  const totalCount = review?.questions?.length || result.total_questions || 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{
          maxWidth: '768px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <button
            onClick={() => navigate('/student/tests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#f3f4f6',
              cursor: 'pointer',
            }}
            className="hover:bg-gray-200"
          >
            <FiArrowLeft style={{ fontSize: '18px', color: '#4b5563' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>Kết quả bài kiểm tra</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0 0' }}>{result.test_title}</p>
          </div>
        </div>
      </header>

      <div style={pageContainerStyle}>
        {result.status === 'expired' && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#92400e', fontWeight: '600', fontSize: '14px', margin: 0 }}>
              Bài kiểm tra đã hết giờ. Bạn không thể làm lại bài này.
            </p>
          </div>
        )}

        <div style={{
          ...cardStyle,
          padding: '32px 24px',
          marginBottom: '20px',
          textAlign: 'center',
          backgroundColor: getScoreBgColor(score),
          borderColor: getScoreBorderColor(score),
        }}>
          <div style={{ fontSize: '56px', fontWeight: '800', color: getScoreColor(score), lineHeight: 1, marginBottom: '8px' }}>
            {result.earned_points ?? score.toFixed(0)}
          </div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#4b5563', marginBottom: '4px' }}>
            {score.toFixed(1)}% điểm
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '20px' }}>
            {getScoreMessage(score)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
              <FiCheckCircle style={{ color: '#16a34a' }} />
              <span><strong>{correctCount}</strong> câu đúng</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
              <FiXCircle style={{ color: '#dc2626' }} />
              <span><strong>{totalCount - correctCount}</strong> câu sai</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
              <FiClock style={{ color: '#6b7280' }} />
              <span>Lần thi thứ <strong>{result.attempt_no || 1}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
            Thông tin bài kiểm tra
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
            <div>
              <span style={{ color: '#6b7280' }}>Môn học:</span>
              <span style={{ marginLeft: '8px', fontWeight: '600', color: '#111827' }}>{getSubjectName(result)}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Tổng số câu:</span>
              <span style={{ marginLeft: '8px', fontWeight: '600', color: '#111827' }}>{totalCount}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Bắt đầu:</span>
              <span style={{ marginLeft: '8px', fontWeight: '600', color: '#111827' }}>{formatDateTime(result.started_at)}</span>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Nộp bài:</span>
              <span style={{ marginLeft: '8px', fontWeight: '600', color: '#111827' }}>{formatDateTime(result.submitted_at)}</span>
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: '20px' }} className="print-card">
          <style>{`
            @media print {
              header, .no-print, button {
                display: none !important;
              }
              body, html {
                background-color: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .print-container {
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .print-card {
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                background-color: #ffffff !important;
                padding: 0 !important;
                margin-bottom: 20px !important;
              }
            }
          `}</style>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }} className="no-print">
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>Xem lại đáp án</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                className="hover:bg-blue-700"
              >
                In kết quả (PDF)
              </button>
              <button
                onClick={() => setShowReview(!showReview)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: showReview ? '#eff6ff' : '#f3f4f6',
                  color: showReview ? '#2563eb' : '#374151',
                  fontWeight: '600',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                className="hover:opacity-80"
              >
                {showReview ? 'Ẩn đi' : 'Hiển thị'}
              </button>
            </div>
          </div>

          {/* Khi ở chế độ in, luôn hiển thị review đáp án */}
          {(showReview || window.matchMedia('print').matches) && review?.questions && (
            <div>
              {review.questions.map((question, index) => (
                <div
                  key={question.id}
                  style={{
                    padding: '24px',
                    borderBottom: index < review.questions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                  className="print-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {question.is_correct ? (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiCheckCircle style={{ color: '#16a34a' }} />
                      </div>
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiXCircle style={{ color: '#dc2626' }} />
                      </div>
                    )}
                    <span style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>Câu {index + 1}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: question.is_correct ? '#16a34a' : '#dc2626' }}>
                      {question.is_correct ? 'Đúng' : 'Sai'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
                      {question.earned_points ?? (question.is_correct ? 1 : 0)}/{question.max_score ?? 1} điểm
                    </span>
                  </div>

                  <QuestionRenderer
                    question={question}
                    onAnswer={() => {}}
                    showResult={true}
                    result={{
                      is_correct: question.is_correct,
                      correct_answer: question.correct_answer,
                      explanation: question.explanation,
                    }}
                    userAnswer={question.user_answer}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }} className="no-print">
          <button
            onClick={() => navigate('/student/tests')}
            style={{
              flex: 1,
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
            Quay lại danh sách
          </button>
          <button
            onClick={() => navigate('/student/practice')}
            style={{
              flex: 1,
              padding: '12px 20px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
            className="hover:bg-blue-700"
          >
            Luyện tập thêm
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestResultPage;
