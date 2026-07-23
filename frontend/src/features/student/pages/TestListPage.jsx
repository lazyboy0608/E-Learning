import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiFileText, FiCheckCircle, FiPlay, FiCornerDownRight, FiInbox } from 'react-icons/fi';
import { testApi } from '../../../api/testApi';
import StudentLayout from '../../../components/student/StudentLayout';

export function TestListPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, attemptsRes] = await Promise.all([
        testApi.getAvailableTests(),
        testApi.getMyAttempts(),
      ]);
      setTests(testsRes?.data || []);
      setAttempts(attemptsRes?.data || []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo một Map để tra cứu nhanh lượt làm bài theo test_id, tối ưu hóa hiệu năng render
  const attemptMap = useMemo(() => {
    return attempts.reduce((acc, attempt) => {
      // Nếu có nhiều lượt, ưu tiên giữ lại lượt có trạng thái mới nhất/tiến trình tốt nhất
      if (!acc[attempt.test_id] || attempt.status === 'in_progress') {
        acc[attempt.test_id] = attempt;
      }
      return acc;
    }, {});
  }, [attempts]);

  const handleStartTest = (testId) => {
    navigate(`/student/tests/${testId}`);
  };

  const handleViewResults = (attemptId) => {
    navigate(`/student/tests/results/${attemptId}`);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Không giới hạn thời gian';
    if (minutes >= 60) return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`;
    return `${minutes} phút`;
  };

  const getStatusBadge = (test) => {
    const attempt = attemptMap[test.id];
    if (attempt?.status === 'submitted' || attempt?.status === 'expired') {
      return <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-700 rounded-full">Đã hoàn thành</span>;
    }
    if (attempt?.status === 'in_progress') {
      return <span className="text-xs font-medium px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full animate-pulse">Đang làm dở</span>;
    }

    if (!test.expires_at) {
      return <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">Chưa làm</span>;
    }

    const expires = new Date(test.expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return <span className="text-xs font-medium px-2.5 py-1 bg-red-100 text-red-700 rounded-full">Đã hết hạn</span>;
    }
    if (daysLeft <= 3) {
      return <span className="text-xs font-medium px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full">Còn {daysLeft} ngày</span>;
    }
    return <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">Chưa làm</span>;
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Danh sách bài kiểm tra" pageSubtitle="Quản lý các bài kiểm tra của bạn">
        <div className="max-w-6xl mx-auto p-6 space-y-6 animate-pulse">
          {/* Title Skeleton */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <div className="w-64 h-7 bg-gray-200 rounded"></div>
              <div className="w-80 h-4 bg-gray-100 rounded mt-2"></div>
            </div>
            <div className="w-48 h-10 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Tab Skeleton */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex border-b border-gray-200 px-4 py-3 gap-6">
              <div className="w-40 h-5 bg-gray-200 rounded"></div>
              <div className="w-40 h-5 bg-gray-100 rounded"></div>
            </div>
            
            {/* List Item Skeletons */}
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-48 h-5 bg-gray-200 rounded"></div>
                      <div className="w-24 h-5 bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="w-32 h-4 bg-gray-100 rounded"></div>
                    <div className="flex gap-4">
                      <div className="w-24 h-4 bg-gray-100 rounded"></div>
                      <div className="w-32 h-4 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="w-32 h-10 bg-gray-200 rounded-lg self-end sm:self-center"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const primaryButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <StudentLayout pageTitle="Danh sách bài kiểm tra" pageSubtitle="Quản lý các bài kiểm tra của bạn">
      <div style={{ display: 'block', width: '100%', maxWidth: '1152px', margin: '0 auto', padding: '24px', boxSizing: 'border-box', textAlign: 'left' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }} className="justify-between">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Danh sách bài kiểm tra</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Quản lý các bài kiểm tra được giao cho bạn</p>
          </div>
          <button
            onClick={() => navigate('/student/system-tests')}
            style={primaryButtonStyle}
            className="hover:bg-blue-700"
          >
            <FiFileText style={{ fontSize: '16px' }} />
            Bài kiểm tra hệ thống
          </button>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 16px', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('available')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 16px',
                fontSize: '14px',
                fontWeight: activeTab === 'available' ? '600' : '500',
                color: activeTab === 'available' ? '#2563eb' : '#6b7280',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'available' ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              className={activeTab === 'available' ? '' : 'hover:text-gray-800'}
            >
              Bài kiểm tra khả dụng ({tests.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 16px',
                fontSize: '14px',
                fontWeight: activeTab === 'history' ? '600' : '500',
                color: activeTab === 'history' ? '#2563eb' : '#6b7280',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'history' ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              className={activeTab === 'history' ? '' : 'hover:text-gray-800'}
            >
              Lịch sử làm bài ({attempts.length})
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {activeTab === 'available' && (
              tests.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', padding: '48px 24px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <FiFileText style={{ fontSize: '60px', color: '#d1d5db', margin: '0 auto 16px', display: 'block' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Chưa có bài kiểm tra</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Hiện tại chưa có bài kiểm tra nào được giao cho bạn.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tests.map((test) => {
                    const currentAttempt = attemptMap[test.id];

                    return (
                      <div key={test.id} style={cardStyle} className="hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>{test.title}</h3>
                              {getStatusBadge(test)}
                            </div>
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0', fontWeight: '500' }}>
                              {test.subject?.name || 'Chưa phân môn'}
                            </p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <FiFileText className="text-gray-400" />
                                {test.questions_count || test.questions?.length || test.test_questions?.length || 0} câu hỏi
                              </span>
                              <span className="flex items-center gap-1.5">
                                <FiClock className="text-gray-400" />
                                {formatDuration(test.duration)}
                              </span>
                            </div>

                            {(test.access_type === 'public_code' || test.access_type === 'both') && test.test_code && (
                              <div className="mt-3 text-sm flex items-center gap-1.5">
                                <span className="text-gray-500">Mã đề:</span>
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-blue-600 font-bold text-[11px]">
                                  {test.test_code}
                                </code>
                              </div>
                            )}
                          </div>

                          <div className="flex sm:flex-col justify-end items-end gap-2">
                            {currentAttempt?.status === 'submitted' || currentAttempt?.status === 'expired' ? (
                              <button
                                onClick={() => handleViewResults(currentAttempt.attempt_id || currentAttempt.id)}
                                style={{ ...primaryButtonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                                className="hover:bg-gray-200"
                              >
                                <FiCheckCircle /> Xem kết quả
                              </button>
                            ) : currentAttempt?.status === 'in_progress' ? (
                              <button
                                onClick={() => handleStartTest(test.id)}
                                style={{ ...primaryButtonStyle, backgroundColor: '#d97706' }}
                                className="hover:bg-yellow-700"
                              >
                                <FiPlay style={{ fontSize: '14px' }} /> Tiếp tục làm
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartTest(test.id)}
                                style={primaryButtonStyle}
                                className="hover:bg-blue-700"
                              >
                                <FiPlay style={{ fontSize: '14px' }} /> Bắt đầu làm
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === 'history' && (
              attempts.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', padding: '48px 24px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <FiInbox style={{ fontSize: '60px', color: '#d1d5db', margin: '0 auto 16px', display: 'block' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Chưa có lịch sử</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Bạn chưa thực hiện bài kiểm tra nào.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {attempts.map((attempt) => (
                    <div key={attempt.attempt_id || attempt.id} style={cardStyle} className="hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                            {attempt.test_title || attempt.test?.title}
                          </h3>
                          <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                            {attempt.subject || attempt.test?.subject?.name || 'Môn học khác'}
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600 font-medium">Lần làm thứ {attempt.attempt_no || 1}</span>
                          </p>

                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <FiClock className="text-gray-400" />
                              {attempt.started_at ? new Date(attempt.started_at).toLocaleDateString('vi-VN') : 'Không rõ ngày'}
                            </span>
                            <span className={`flex items-center gap-1.5 font-medium ${
                              attempt.status === 'submitted' || attempt.status === 'expired' ? 'text-green-600' :
                              attempt.status === 'in_progress' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {attempt.status === 'submitted' && <FiCheckCircle />}
                              {attempt.status === 'in_progress' && <FiClock />}
                              {attempt.status === 'expired' && <FiCheckCircle />}
                              {attempt.status === 'submitted' || attempt.status === 'expired' ? 'Đã nộp bài' :
                               attempt.status === 'in_progress' ? 'Đang làm dở' : 'Quá hạn / Huỷ'}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3">
                          {(attempt.status === 'submitted' || attempt.status === 'expired') && (
                            <div className="text-left sm:text-right">
                              <div className={`text-2xl font-black ${
                                (attempt.score || 0) >= 80 ? 'text-green-600' :
                                (attempt.score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {typeof attempt.score === 'number' ? `${attempt.score.toFixed(0)}%` : '0%'}
                              </div>
                              <div className="text-xs text-gray-500 font-medium mt-0.5">
                                Đúng {attempt.correct_count || 0}/{attempt.total_questions || 0} câu
                              </div>
                            </div>
                          )}

                          {attempt.status === 'submitted' || attempt.status === 'expired' ? (
                            <button
                              onClick={() => handleViewResults(attempt.attempt_id || attempt.id)}
                              style={primaryButtonStyle}
                              className="hover:bg-blue-700"
                            >
                              <FiCornerDownRight /> Xem chi tiết
                            </button>
                          ) : attempt.status === 'in_progress' ? (
                            <button
                              onClick={() => handleStartTest(attempt.test_id)}
                              style={{ ...primaryButtonStyle, backgroundColor: '#d97706' }}
                              className="hover:bg-yellow-700"
                            >
                              Làm tiếp bài
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export default TestListPage;