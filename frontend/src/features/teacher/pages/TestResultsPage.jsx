import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiBarChart2,
  FiAward,
  FiUsers,
  FiEye,
  FiBookOpen,
  FiHash
} from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { testApi } from '../../../api/testApi';

const TestResultsPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resultsRes, testRes] = await Promise.all([
        testApi.getAllTestAttempts(testId),
        testApi.getTestDetails(testId)
      ]);
      setResults(resultsRes.data || []);
      setTestInfo(testRes.data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const [resultsRes, testRes] = await Promise.all([
        testApi.getAllTestAttempts(testId),
        testApi.getTestDetails(testId)
      ]);
      setResults(resultsRes.data || []);
      setTestInfo(testRes.data);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Tính toán tổng điểm tối đa của đề thi (thang điểm thật)
  const testMaxScore = useMemo(() => {
    if (!testInfo?.questions || testInfo.questions.length === 0) return 10;
    const rawTotal = testInfo.questions.reduce((sum, q) => {
      const s = parseFloat(q.pivot?.score);
      return sum + (isNaN(s) ? 1 : s);
    }, 0);
    return Number.isInteger(rawTotal) ? rawTotal : parseFloat(rawTotal.toFixed(2));
  }, [testInfo]);

  // Hàm tính điểm thật học sinh đạt được
  const getEarnedScore = (result) => {
    if (result.earned_points !== undefined && result.earned_points !== null) {
      const val = parseFloat(result.earned_points);
      return Number.isInteger(val) ? val : parseFloat(val.toFixed(2));
    }
    const percent = parseFloat(result.score) || 0;
    const earned = (percent / 100) * testMaxScore;
    return Number.isInteger(earned) ? earned : parseFloat(earned.toFixed(2));
  };

  // Màu sắc và badge dựa trên tỷ lệ điểm
  const getScoreTheme = (percent) => {
    if (percent >= 90) {
      return { text: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Xuất sắc' };
    }
    if (percent >= 80) {
      return { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Giỏi' };
    }
    if (percent >= 65) {
      return { text: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Khá' };
    }
    if (percent >= 50) {
      return { text: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Trung bình' };
    }
    return { text: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Cần cố gắng' };
  };

  // Avatar gradient sinh động dựa trên tên
  const getAvatarGradient = (name = 'A') => {
    const gradients = [
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  // Lọc và sắp xếp danh sách kết quả
  const filteredResults = useMemo(() => {
    let list = [...results];

    // Tìm kiếm theo tên hoặc email
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => 
        r.user?.name?.toLowerCase().includes(q) || 
        r.user?.email?.toLowerCase().includes(q)
      );
    }

    // Lọc theo mức điểm
    if (scoreFilter !== 'all') {
      list = list.filter(r => {
        const p = parseFloat(r.score) || 0;
        if (scoreFilter === 'excellent') return p >= 90;
        if (scoreFilter === 'good') return p >= 80 && p < 90;
        if (scoreFilter === 'fair') return p >= 65 && p < 80;
        if (scoreFilter === 'pass') return p >= 50 && p < 65;
        if (scoreFilter === 'fail') return p < 50;
        return true;
      });
    }

    // Sắp xếp
    list.sort((a, b) => {
      const scoreA = getEarnedScore(a);
      const scoreB = getEarnedScore(b);
      if (sortBy === 'score_desc') return scoreB - scoreA;
      if (sortBy === 'score_asc') return scoreA - scoreB;
      if (sortBy === 'attempt_desc') return (b.attempt_no || 1) - (a.attempt_no || 1);
      // 'newest'
      const timeA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
      const timeB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
      return timeB - timeA;
    });

    return list;
  }, [results, searchTerm, scoreFilter, sortBy, testMaxScore]);

  // Thống kê tổng quan
  const stats = useMemo(() => {
    const totalAttempts = results.length;
    if (totalAttempts === 0) {
      return { avgRealScore: 0, avgPercent: 0, maxRealScore: 0, passedCount: 0, passRate: 0 };
    }

    const earnedScores = results.map(r => getEarnedScore(r));
    const percentScores = results.map(r => parseFloat(r.score) || 0);

    const sumEarned = earnedScores.reduce((acc, s) => acc + s, 0);
    const sumPercent = percentScores.reduce((acc, p) => acc + p, 0);

    const avgEarned = sumEarned / totalAttempts;
    const avgPercent = sumPercent / totalAttempts;
    const maxEarned = Math.max(...earnedScores);
    const passedCount = percentScores.filter(p => p >= 50).length;
    const passRate = (passedCount / totalAttempts) * 100;

    return {
      avgRealScore: Number.isInteger(avgEarned) ? avgEarned : parseFloat(avgEarned.toFixed(2)),
      avgPercent: avgPercent.toFixed(1),
      maxRealScore: Number.isInteger(maxEarned) ? maxEarned : parseFloat(maxEarned.toFixed(2)),
      passedCount,
      passRate: passRate.toFixed(0)
    };
  }, [results, testMaxScore]);

  // Xuất file CSV bảng điểm
  const handleExportCSV = () => {
    if (results.length === 0) {
      alert('Không có dữ liệu bài nộp để xuất.');
      return;
    }

    const headers = ['STT', 'Họ và tên', 'Email', 'Lần thi', 'Điểm số thực', 'Thang điểm', 'Tỷ lệ %', 'Thời gian nộp', 'Chuyển tab', 'Trạng thái'];
    const rows = results.map((r, idx) => {
      const earned = getEarnedScore(r);
      const percent = (parseFloat(r.score) || 0).toFixed(1);
      const submitTime = r.submitted_at ? new Date(r.submitted_at).toLocaleString('vi-VN') : 'Chưa nộp';
      const status = r.status === 'submitted' ? 'Đã nộp' : 'Đang làm';
      return [
        idx + 1,
        `"${r.user?.name || ''}"`,
        `"${r.user?.email || ''}"`,
        `"Lần ${r.attempt_no || 1}"`,
        earned,
        testMaxScore,
        `${percent}%`,
        `"${submitTime}"`,
        r.tab_switch_count || 0,
        `"${status}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_diem_${testInfo?.title || 'bai_thi'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <TeacherLayout pageTitle="Bảng điểm bài kiểm tra">
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
          <p style={{ marginTop: '16px', color: '#64748b', fontSize: '15px' }}>Đang tải bảng điểm kết quả...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout pageTitle={testInfo ? `Bảng điểm: ${testInfo.title}` : 'Bảng điểm'}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', boxSizing: 'border-box' }}>
        
        {/* TOP BAR / BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate(`/teacher/tests/${testId}`)}
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
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <FiArrowLeft />
              Quay lại chi tiết đề
            </button>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Bảng điểm học sinh</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Làm mới dữ liệu"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <FiRefreshCw style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Đang tải...' : 'Làm mới'}
            </button>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#059669',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
              }}
            >
              <FiDownload />
              Xuất CSV
            </button>
          </div>
        </div>

        {/* HEADER CARD */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {testInfo?.subject?.name || 'Môn học'}
                </span>
                <span style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Mã đề: {testInfo?.test_code || '---'}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' }}>
                {testInfo ? `Bảng điểm: ${testInfo.title}` : 'Bảng điểm bài kiểm tra'}
              </h1>
              
              {/* Meta pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiBookOpen style={{ color: '#94a3b8' }} />
                  <span>Tổng số: <strong>{testInfo?.questions?.length || 0}</strong> câu hỏi</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiAward style={{ color: '#059669' }} />
                  <span>Thang điểm tối đa: <strong style={{ color: '#059669' }}>{testMaxScore}</strong> điểm</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiClock style={{ color: '#94a3b8' }} />
                  <span>Thời gian làm bài: <strong>{testInfo?.duration ? `${testInfo.duration} phút` : 'Tự do'}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/teacher/tests/${testId}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                color: '#334155',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <FiEye />
              Xem chi tiết đề thi
            </button>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Card 1: Số lượt nộp bài */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
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
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiUsers />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '2px' }}>
                Tổng lượt làm bài
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {results.length}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                {new Set(results.map(r => r.user_id)).size} học sinh tham gia
              </div>
            </div>
          </div>

          {/* Card 2: Điểm trung bình (ĐIỂM THẬT) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
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
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiBarChart2 />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '2px' }}>
                Điểm trung bình
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#059669', lineHeight: 1.1 }}>
                  {stats.avgRealScore}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
                  / {testMaxScore}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginTop: '4px' }}>
                Quy đổi: {stats.avgPercent}%
              </div>
            </div>
          </div>

          {/* Card 3: Điểm cao nhất (ĐIỂM THẬT) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
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
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiAward />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '2px' }}>
                Điểm cao nhất
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#7c3aed', lineHeight: 1.1 }}>
                  {stats.maxRealScore}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8' }}>
                  / {testMaxScore}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Thang điểm tối đa: {testMaxScore}
              </div>
            </div>
          </div>

          {/* Card 4: Tỷ lệ đạt */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
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
                Tỷ lệ đạt (≥ 50%)
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#d97706', lineHeight: 1.1 }}>
                {stats.passRate}%
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                {stats.passedCount} / {results.length} bài đạt chuẩn
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR: SEARCH & FILTERS */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Ô tìm kiếm */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
            <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Cụm bộ lọc */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Lọc điểm */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Mức điểm:</span>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tất cả ({results.length})</option>
                <option value="excellent">Xuất sắc (≥ 90%)</option>
                <option value="good">Giỏi (80% - 89%)</option>
                <option value="fair">Khá (65% - 79%)</option>
                <option value="pass">Trung bình (50% - 64%)</option>
                <option value="fail">Cần cố gắng (&lt; 50%)</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">Mới nộp nhất</option>
                <option value="score_desc">Điểm cao nhất</option>
                <option value="score_asc">Điểm thấp nhất</option>
                <option value="attempt_desc">Nhiều lần thi nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* RESULTS TABLE */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Học sinh
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Thời gian nộp
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Lần thi
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Điểm số thật
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Chuyển tab
                </th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '360px', margin: '0 auto' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#f1f5f9',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '26px',
                        margin: '0 auto 16px auto'
                      }}>
                        <FiUser />
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0' }}>
                        {results.length === 0 ? 'Chưa có lượt nộp bài nào' : 'Không tìm thấy kết quả phù hợp'}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                        {results.length === 0 
                          ? 'Học sinh chưa tham gia làm bài kiểm tra này. Vui lòng kiểm tra lại sau.'
                          : 'Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc mức điểm.'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => {
                  const earnedScore = getEarnedScore(result);
                  const percent = parseFloat(result.score) || 0;
                  const theme = getScoreTheme(percent);
                  const studentName = result.user?.name || 'Học sinh';

                  return (
                    <tr 
                      key={result.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                    >
                      {/* Học sinh */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: getAvatarGradient(studentName),
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '15px',
                            flexShrink: 0,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                              {studentName}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                              {result.user?.email || 'Chưa có email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Thời gian nộp */}
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiClock style={{ color: '#94a3b8', fontSize: '14px' }} />
                          <span>
                            {result.submitted_at 
                              ? new Date(result.submitted_at).toLocaleString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              : 'Chưa nộp bài'
                            }
                          </span>
                        </div>
                      </td>

                      {/* Lần thi */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          Lần {result.attempt_no || 1}
                        </span>
                      </td>

                      {/* Điểm số thật (CORE REQUIREMENT) */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: theme.bg,
                            border: `1px solid ${theme.border}`,
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            gap: '4px'
                          }}>
                            <span style={{ fontSize: '17px', fontWeight: '800', color: theme.text }}>
                              {earnedScore}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                              / {testMaxScore}
                            </span>
                          </div>

                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#64748b',
                            backgroundColor: '#f8fafc',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0'
                          }}>
                            {percent.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Chuyển tab */}
                      <td style={{ padding: '16px 20px' }}>
                        {result.tab_switch_count > 0 ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: '1px solid #fecaca'
                          }}>
                            <FiAlertTriangle />
                            {result.tab_switch_count} lần
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '14px', paddingLeft: '8px' }}>-</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: result.status === 'submitted' ? '#ecfdf5' : '#fffbeb',
                          color: result.status === 'submitted' ? '#047857' : '#b45309',
                          border: `1px solid ${result.status === 'submitted' ? '#a7f3d0' : '#fde68a'}`
                        }}>
                          {result.status === 'submitted' ? (
                            <>
                              <FiCheckCircle style={{ color: '#059669' }} />
                              Đã nộp
                            </>
                          ) : (
                            <>
                              <FiClock style={{ color: '#d97706' }} />
                              Đang làm
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Table footer with summary counts */}
          {filteredResults.length > 0 && (
            <div style={{
              padding: '14px 20px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
              color: '#64748b'
            }}>
              <span>
                Hiển thị <strong>{filteredResults.length}</strong> / <strong>{results.length}</strong> lượt làm bài
              </span>
              <span>
                Thang điểm bài thi: <strong style={{ color: '#059669' }}>{testMaxScore} điểm</strong>
              </span>
            </div>
          )}
        </div>

      </div>
    </TeacherLayout>
  );
};

export default TestResultsPage;