import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(17, 24, 39, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px',
  boxSizing: 'border-box',
};

const contentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '480px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
};

const cancelButtonStyle = {
  flex: 1,
  padding: '12px 18px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  cursor: 'pointer',
};

const confirmButtonStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 18px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff',
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};

export function TestSubmitModal({ isOpen, onClose, onSubmit, totalQuestions, answeredCount, isSubmitting }) {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;
  const unansweredPercentage = totalQuestions > 0
    ? Math.round((unansweredCount / totalQuestions) * 100)
    : 0;
  const allAnswered = unansweredCount === 0;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '20px 24px',
          borderBottom: '1px solid #f3f4f6',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              backgroundColor: allAnswered ? '#dcfce7' : '#fef3c7',
            }}>
              {allAnswered ? (
                <FiCheck style={{ fontSize: '22px', color: '#16a34a' }} />
              ) : (
                <FiAlertTriangle style={{ fontSize: '22px', color: '#d97706' }} />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                Xác nhận nộp bài
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                Bạn có chắc chắn muốn nộp bài kiểm tra này không?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
            className="hover:bg-gray-200 hover:text-gray-800"
            aria-label="Đóng"
          >
            <FiX size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                <FiCheck style={{ color: '#16a34a' }} />
                Câu hỏi đã trả lời
              </span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{answeredCount}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563' }}>
                <FiX style={{ color: '#9ca3af' }} />
                Câu hỏi chưa trả lời
              </span>
              <span style={{
                fontSize: '16px',
                fontWeight: '700',
                color: unansweredCount > 0 ? '#d97706' : '#16a34a',
              }}>
                {unansweredCount}
              </span>
            </div>
          </div>

          {unansweredCount > 0 ? (
            <div style={{
              padding: '12px 14px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              marginBottom: '4px',
            }}>
              <p style={{ fontSize: '13px', color: '#92400e', margin: 0, lineHeight: '1.6' }}>
                <strong>Lưu ý:</strong> Bạn còn <strong>{unansweredCount}</strong> câu hỏi chưa trả lời
                ({unansweredPercentage}% bài thi). Các câu chưa trả lời sẽ không được chấm điểm.
              </p>
            </div>
          ) : (
            <div style={{
              padding: '12px 14px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              marginBottom: '4px',
            }}>
              <p style={{ fontSize: '13px', color: '#166534', margin: 0, lineHeight: '1.6' }}>
                Bạn đã trả lời tất cả các câu hỏi. Sẵn sàng để nộp bài!
              </p>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '16px 24px',
          borderTop: '1px solid #f3f4f6',
          backgroundColor: '#f9fafb',
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ ...cancelButtonStyle, opacity: isSubmitting ? 0.5 : 1 }}
            className="hover:bg-gray-50"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            style={{ ...confirmButtonStyle, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            className="hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⟳</span>
                Đang nộp...
              </>
            ) : (
              <>
                <FiCheck />
                Xác nhận nộp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestSubmitModal;
