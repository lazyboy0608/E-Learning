import React, { useState, useEffect, useRef } from 'react';
import { classApi } from '../../api/classApi';
import './JoinClassModal.css';

const JoinClassModal = ({ isOpen, onClose, onJoined }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedId(null);
      setLoading(false);
      setError('');
      setMessage('');
    }
  }, [isOpen]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setError('');
    setMessage('');
  };

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setSelectedId(null);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await classApi.searchClasses(trimmed);
        const items = response.data || [];
        setResults(items);
        setSelectedId(null);
      } catch (err) {
        console.error(err);
        setError('Không thể tìm kiếm lớp học. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleJoin = async () => {
    if (!selectedId) return;
    const selected = results.find((item) => item.id === selectedId);
    if (!selected?.class_code) return;

    setJoining(true);
    setError('');
    setMessage('');
    try {
      const response = await classApi.joinClass(selected.class_code);
      if (response.success) {
        setMessage(response.message || 'Bạn đã tham gia lớp học thành công.');
        if (typeof onJoined === 'function') onJoined();
        setTimeout(onClose, 800);
      } else {
        setError(response.message || 'Không thể tham gia lớp học.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tham gia lớp học. Vui lòng thử lại.');
    } finally {
      setJoining(false);
    }
  };

  if (!isOpen) return null;

  const selected = results.find((item) => item.id === selectedId);
  const selectedCode = selected?.class_code || '';

  return (
    <div className="join-class-overlay" onClick={handleOverlayClick}>
      <div className="join-class-modal">
        <div className="join-class-header">
          <h3 className="join-class-title">Tham gia lớp học</h3>
          <button type="button" className="join-class-close" onClick={onClose}>
            X
          </button>
        </div>
        <p className="join-class-subtitle">
          Nhập mã lớp do giáo viên cung cấp, ví dụ: <strong>TOAN1A2026</strong>.
        </p>

        <input
          className="join-class-input"
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Nhập mã lớp"
          autoFocus
        />

        <div className="join-class-results">
          {loading && <div className="join-class-status">Đang tìm kiếm...</div>}
          {!loading && query.trim() && results.length === 0 && (
            <div className="join-class-status">Không tìm thấy lớp học phù hợp.</div>
          )}
          {!loading &&
            results.map((item) => (
              <div
                key={item.id}
                className={`join-class-result-item ${item.id === selectedId ? 'selected' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <div className="join-class-result-code">{item.class_code || item.code}</div>
                <div className="join-class-result-name">{item.name}</div>
                <div className="join-class-result-teacher">
                  GV: {item.teacher?.name || item.creator?.name || 'Giáo viên'}
                </div>
              </div>
            ))}
        </div>

        {error && <p className="join-class-message error">{error}</p>}
        {message && <p className="join-class-message success">{message}</p>}

        <div className="join-class-actions">
          <button type="button" className="join-class-button secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="join-class-button primary"
            onClick={handleJoin}
            disabled={!selectedId || joining}
          >
            {joining ? 'Đang tham gia...' : 'Tham gia'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinClassModal;
