import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiMessageSquare, FiCheckCircle, FiClock, FiFilter, FiX, FiSend, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from '../../../components/admin/AdminLayout';
import { feedbackApi } from '../../../api/feedbackApi';
import '../../../components/admin/admin.css';

const STATUS_LABELS = {
  pending:  { label: 'Chờ xử lý',  color: '#f59e0b', bg: '#fef3c7' },
  replied:  { label: 'Đã trả lời', color: '#2563eb', bg: '#dbeafe' },
  resolved: { label: 'Đã giải quyết', color: '#16a34a', bg: '#dcfce7' },
};

const TYPE_LABELS = {
  bug:        'Lỗi hệ thống',
  suggestion: 'Góp ý',
  complaint:  'Khiếu nại',
  other:      'Khác',
};

const StatusBadge = ({ status }) => {
  const s = STATUS_LABELS[status] || STATUS_LABELS.pending;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
      color: s.color,
      backgroundColor: s.bg,
    }}>
      {s.label}
    </span>
  );
};

// Modal trả lời phản hồi
const ReplyModal = ({ feedback, onClose, onSuccess }) => {
  const [reply, setReply] = useState(feedback.admin_reply || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      setError('Vui lòng nhập nội dung trả lời.');
      return;
    }
    try {
      setLoading(true);
      await feedbackApi.replyFeedback(feedback.id, reply.trim());
      onSuccess();
    } catch {
      setError('Gửi trả lời thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '560px',
        padding: '28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Trả lời phản hồi
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Thông tin phản hồi gốc */}
        <div style={{
          backgroundColor: '#f9fafb', borderRadius: '10px',
          padding: '14px', marginBottom: '16px',
          border: '1px solid #e5e7eb',
        }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            {feedback.user?.name || 'Người dùng'} — {TYPE_LABELS[feedback.type] || feedback.type}
          </p>
          <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
            {feedback.subject}
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#111827', lineHeight: '1.6' }}>
            {feedback.message}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
            Nội dung trả lời
          </label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: '1.5px solid #d1d5db', borderRadius: '10px',
              padding: '10px 14px', fontSize: '14px', lineHeight: '1.6',
              resize: 'vertical', outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'inherit',
            }}
            placeholder="Nhập nội dung trả lời cho người dùng..."
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          {error && (
            <p style={{ fontSize: '13px', color: '#ef4444', margin: '6px 0 0 0' }}>{error}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 20px', borderRadius: '8px',
                border: '1.5px solid #d1d5db', backgroundColor: '#fff',
                color: '#374151', fontSize: '14px', fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '9px 20px', borderRadius: '8px',
                border: 'none', backgroundColor: loading ? '#93c5fd' : '#2563eb',
                color: '#fff', fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <FiSend size={14} />
              {loading ? 'Đang gửi...' : 'Gửi trả lời'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [toast, setToast] = useState('');

  const fetchFeedbacks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, per_page: 15 };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await feedbackApi.getAllFeedbacks(params);
      setFeedbacks(res.data?.data || []);
      setMeta({
        current_page: res.data?.current_page || 1,
        last_page:    res.data?.last_page || 1,
        total:        res.data?.total || 0,
      });
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchFeedbacks(1), 400);
    return () => clearTimeout(timer);
  }, [fetchFeedbacks]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleReplySuccess = () => {
    setSelectedFeedback(null);
    fetchFeedbacks(meta.current_page);
    showToast('Đã gửi trả lời thành công.');
  };

  const handleStatusChange = async (id, status) => {
    try {
      await feedbackApi.updateStatus(id, status);
      fetchFeedbacks(meta.current_page);
      showToast('Đã cập nhật trạng thái.');
    } catch {
      showToast('Cập nhật thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <AdminLayout title="Quản lý phản hồi">
      {/* Toast thông báo */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 2000,
          backgroundColor: '#16a34a', color: '#fff',
          padding: '12px 20px', borderRadius: '10px',
          fontSize: '14px', fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          animation: 'fadeInDown 0.3s ease',
        }}>
          {toast}
        </div>
      )}

      <div className="admin-page-container">
        {/* Header + Bộ lọc */}
        <div className="admin-page-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="admin-search-container">
            <FiSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, nội dung, người gửi..."
              className="admin-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="feedback-search"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiFilter size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
            <select
              id="feedback-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: '8px',
                border: '1.5px solid #d1d5db', backgroundColor: '#fff',
                fontSize: '14px', color: '#374151',
                cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="replied">Đã trả lời</option>
              <option value="resolved">Đã giải quyết</option>
            </select>

            <button
              onClick={() => fetchFeedbacks(meta.current_page)}
              title="Làm mới"
              style={{
                padding: '8px', borderRadius: '8px', border: '1.5px solid #d1d5db',
                backgroundColor: '#fff', cursor: 'pointer', color: '#374151',
                display: 'flex', alignItems: 'center',
              }}
            >
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Bảng danh sách */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người gửi</th>
                <th>Loại</th>
                <th>Tiêu đề</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                    Đang tải...
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                    <FiMessageSquare size={32} style={{ display: 'block', margin: '0 auto 12px' }} />
                    Không có phản hồi nào.
                  </td>
                </tr>
              ) : (
                feedbacks.map((fb) => (
                  <tr key={fb.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>
                        {fb.user?.name || 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {fb.user?.email || ''}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#374151' }}>
                        {TYPE_LABELS[fb.type] || fb.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '14px', color: '#111827' }}>
                        {fb.subject}
                      </div>
                      <div style={{
                        fontSize: '12px', color: '#6b7280',
                        maxWidth: '260px', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {fb.message}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={fb.status} />
                    </td>
                    <td style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {new Date(fb.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="action-cell">
                      <button
                        className="btn-edit"
                        title="Trả lời"
                        onClick={() => setSelectedFeedback(fb)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FiMessageSquare size={14} /> Trả lời
                      </button>
                      {fb.status !== 'resolved' && (
                        <button
                          className="btn-delete"
                          title="Đánh dấu đã giải quyết"
                          onClick={() => handleStatusChange(fb.id, 'resolved')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FiCheckCircle size={14} /> Giải quyết
                        </button>
                      )}
                      {fb.status === 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(fb.id, 'pending')}
                          title="Chuyển về chờ xử lý"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '6px 12px', borderRadius: '6px',
                            border: '1px solid #d1d5db', backgroundColor: '#f9fafb',
                            color: '#6b7280', fontSize: '13px', cursor: 'pointer',
                          }}
                        >
                          <FiClock size={14} /> Mở lại
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {!loading && feedbacks.length > 0 && (
          <div className="admin-pagination">
            <span className="pagination-info">
              Tổng {meta.total} phản hồi — Trang {meta.current_page} / {meta.last_page}
            </span>
            <div className="pagination-controls">
              <button
                className={`page-btn ${meta.current_page <= 1 ? 'disabled' : ''}`}
                disabled={meta.current_page <= 1}
                onClick={() => fetchFeedbacks(meta.current_page - 1)}
              >
                Trước
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter(p => Math.abs(p - meta.current_page) <= 2)
                .map(page => (
                  <button
                    key={page}
                    className={`page-btn ${page === meta.current_page ? 'active' : ''}`}
                    onClick={() => fetchFeedbacks(page)}
                  >
                    {page}
                  </button>
                ))}
              <button
                className={`page-btn ${meta.current_page >= meta.last_page ? 'disabled' : ''}`}
                disabled={meta.current_page >= meta.last_page}
                onClick={() => fetchFeedbacks(meta.current_page + 1)}
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal trả lời */}
      {selectedFeedback && (
        <ReplyModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onSuccess={handleReplySuccess}
        />
      )}
    </AdminLayout>
  );
};

export default FeedbackPage;
