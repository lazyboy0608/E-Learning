import React, { useState } from 'react';
import { classApi } from '../../api/classApi';

const JoinClassForm = ({ onJoined }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await classApi.joinClass(code.trim());
      if (response.success) {
        setSuccess(response.message || 'Bạn đã tham gia lớp học thành công.');
        setCode('');
        if (typeof onJoined === 'function') onJoined();
      } else {
        setError(response.message || 'Không thể tham gia lớp học.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Lỗi khi tham gia lớp học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '18px', boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)' }}>
      <h2 style={{ marginBottom: '12px', fontSize: '22px', fontWeight: 700 }}>Tham gia lớp với mã lớp</h2>
      <p style={{ marginBottom: '18px', color: '#6B7280' }}>
        Nhập mã lớp do giáo viên cung cấp, ví dụ: <strong>TOAN1A2026</strong>.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Nhập mã lớp"
            style={{
              flex: '1 1 240px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #D1D5DB',
              fontSize: '16px',
            }}
          />
          <button
            type="submit"
            disabled={!code.trim() || loading}
            style={{
              padding: '14px 20px',
              borderRadius: '12px',
              background: '#2563EB',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              minWidth: '140px',
            }}
          >
            {loading ? 'Đang tham gia...' : 'Tham gia lớp'}
          </button>
        </div>
      </form>
      {error && <p style={{ marginTop: '14px', color: '#B91C1C' }}>{error}</p>}
      {success && <p style={{ marginTop: '14px', color: '#15803D' }}>{success}</p>}
    </div>
  );
};

export default JoinClassForm;
