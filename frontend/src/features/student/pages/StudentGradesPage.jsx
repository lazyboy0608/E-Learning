import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiCheckCircle, FiXCircle, FiClock, FiFilter, FiSearch, FiCornerDownRight, FiBarChart2, FiInbox } from 'react-icons/fi';
import StudentLayout from '../../../components/student/StudentLayout';
import { testApi } from '../../../api/testApi';

const formatDate = (val) => {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  }}>
    <div style={{
      width: '52px', height: '52px', borderRadius: '14px',
      backgroundColor: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: '22px', color }}>{icon}</span>
    </div>
    <div>
      <div style={{ fontSize: '26px', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{label}</div>
    </div>
  </div>
);

const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  const bg = score >= 80 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2';
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      backgroundColor: bg,
      color,
      fontWeight: '700',
      fontSize: '14px',
    }}>
      {score?.toFixed(0) ?? 0}%
    </span>
  );
};

export function StudentGradesPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | passed | failed
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    testApi.getMyAttempts().then(res => {
      const data = (res?.data || []).filter(a => a.status === 'submitted' || a.status === 'expired');
      setAttempts(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => {
    const set = new Set(attempts.map(a => a.subject).filter(Boolean));
    return [...set];
  }, [attempts]);

  const filtered = useMemo(() => {
    return attempts.filter(a => {
      const matchSearch = !search || (a.test_title || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || (filterStatus === 'passed' ? (a.score ?? 0) >= 50 : (a.score ?? 0) < 50);
      const matchSubject = filterSubject === 'all' || a.subject === filterSubject;
      return matchSearch && matchStatus && matchSubject;
    });
  }, [attempts, search, filterStatus, filterSubject]);

  // Stats
  const total = attempts.length;
  const avgScore = total > 0 ? attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / total : 0;
  const passed = attempts.filter(a => (a.score ?? 0) >= 50).length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  return (
    <StudentLayout pageTitle="Kết quả học tập" pageSubtitle="Lịch sử toàn bộ bài kiểm tra của bạn">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>
            Kết quả học tập
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Tổng hợp điểm số và lịch sử làm bài của bạn
          </p>
        </div>

        {/* Stat Cards */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <StatCard icon={<FiBarChart2 />} label="Tổng bài đã làm" value={total} color="#2563eb" />
            <StatCard icon={<FiAward />} label="Điểm trung bình" value={`${avgScore.toFixed(1)}%`} color="#7c3aed" />
            <StatCard icon={<FiCheckCircle />} label="Bài đạt (≥50%)" value={passed} color="#16a34a" />
            <StatCard icon={<FiBarChart2 />} label="Tỷ lệ đạt" value={`${passRate}%`} color="#d97706" />
          </div>
        )}

        {/* Filters */}
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', background: '#f3f4f6', borderRadius: '8px', padding: '8px 12px' }}>
            <FiSearch style={{ color: '#9ca3af' }} />
            <input
              id="grades-search"
              type="text"
              placeholder="Tìm theo tên bài..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', color: '#374151' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiFilter style={{ color: '#6b7280' }} />
            <select
              id="grades-filter-status"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', background: '#fff', cursor: 'pointer' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="passed">Đạt (≥50%)</option>
              <option value="failed">Chưa đạt (&lt;50%)</option>
            </select>
          </div>

          {subjects.length > 0 && (
            <select
              id="grades-filter-subject"
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#374151', background: '#fff', cursor: 'pointer' }}
            >
              <option value="all">Tất cả môn học</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#6b7280' }}>
            {filtered.length} kết quả
          </span>
        </div>

        {/* Table / List */}
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải lịch sử...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <FiInbox style={{ fontSize: '52px', color: '#d1d5db', display: 'block', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', margin: '0 0 4px 0' }}>
                {attempts.length === 0 ? 'Chưa có lịch sử làm bài' : 'Không tìm thấy kết quả phù hợp'}
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                {attempts.length === 0
                  ? 'Hãy bắt đầu làm một bài kiểm tra để thấy kết quả ở đây!'
                  : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'}
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 80px 100px 100px 110px',
                gap: '12px',
                padding: '12px 24px',
                background: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                <span>Bài kiểm tra</span>
                <span>Môn học</span>
                <span style={{ textAlign: 'center' }}>Lần</span>
                <span style={{ textAlign: 'center' }}>Kết quả</span>
                <span style={{ textAlign: 'center' }}>Điểm</span>
                <span style={{ textAlign: 'right' }}>Hành động</span>
              </div>

              {/* Rows */}
              {filtered.map((attempt, idx) => (
                <div
                  key={attempt.attempt_id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 80px 100px 100px 110px',
                    gap: '12px',
                    padding: '16px 24px',
                    borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  className="hover:bg-gray-50"
                >
                  {/* Name + Date */}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                      {attempt.test_title || 'Bài kiểm tra'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock style={{ fontSize: '11px' }} />
                      {formatDate(attempt.submitted_at || attempt.started_at)}
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {attempt.subject || '—'}
                  </div>

                  {/* Attempt No */}
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#374151', fontWeight: '600' }}>
                    #{attempt.attempt_no || 1}
                  </div>

                  {/* Correct/Total */}
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#374151' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <FiCheckCircle style={{ color: '#16a34a', fontSize: '13px' }} />
                      {attempt.correct_count ?? '—'}/{attempt.total_questions ?? '—'}
                    </span>
                  </div>

                  {/* Score badge */}
                  <div style={{ textAlign: 'center' }}>
                    <ScoreBadge score={attempt.score ?? 0} />
                  </div>

                  {/* Action */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      id={`view-result-${attempt.attempt_id}`}
                      onClick={() => navigate(`/student/tests/results/${attempt.attempt_id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '7px 14px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        fontWeight: '600',
                        fontSize: '13px',
                        borderRadius: '8px',
                        border: '1px solid #bfdbfe',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                      }}
                      className="hover:bg-blue-100"
                    >
                      <FiCornerDownRight style={{ fontSize: '12px' }} />
                      Chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentGradesPage;
