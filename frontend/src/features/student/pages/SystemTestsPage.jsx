import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiFileText, FiPlay, FiRotateCw, FiArrowLeft } from 'react-icons/fi';
import { testApi } from '../../../api/testApi';
import StudentLayout from '../../../components/student/StudentLayout';

const pageContainerStyle = {
  display: 'block',
  width: '100%',
  maxWidth: '1152px',
  margin: '0 auto',
  padding: '24px',
  boxSizing: 'border-box',
  textAlign: 'left',
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  width: '100%',
  boxSizing: 'border-box',
};

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

export function SystemTestsPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemTests();
  }, []);

  const fetchSystemTests = async () => {
    try {
      const [testsRes, attemptsRes] = await Promise.all([
        testApi.getSystemTests(),
        testApi.getMyAttempts(),
      ]);
      setTests(testsRes?.data || []);
      setAttempts(attemptsRes?.data || []);
    } catch (error) {
      console.error('Failed to fetch system tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmittedCount = (testId) =>
    attempts.filter((a) => a.test_id === testId && a.status === 'submitted').length;

  const getActiveAttempt = (testId) =>
    attempts.find((a) => a.test_id === testId && a.status === 'in_progress');

  const getLatestAttemptId = (testId) => {
    const submitted = attempts.filter((a) => a.test_id === testId && a.status === 'submitted');
    if (submitted.length === 0) return null;
    return submitted[submitted.length - 1].attempt_id || submitted[submitted.length - 1].id;
  };

  const handleStartTest = (testId) => {
    navigate(`/student/tests/${testId}`);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Không giới hạn thời gian';
    if (minutes >= 60) return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`;
    return `${minutes} phút`;
  };

  if (loading) {
    return (
      <StudentLayout pageTitle="Làm bài test hệ thống" pageSubtitle="Bài kiểm tra hệ thống dành cho tất cả học sinh">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải bài test hệ thống...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout pageTitle="Làm bài test hệ thống" pageSubtitle="Bài kiểm tra hệ thống dành cho tất cả học sinh">
      <div style={pageContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6', gap: '16px', flexWrap: 'wrap' }} className="justify-between">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Làm bài test hệ thống</h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Các bài kiểm tra do admin tạo, phù hợp cho tất cả học sinh thực hành
            </p>
          </div>
          <button
            onClick={() => navigate('/student/tests')}
            style={{ ...primaryButtonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
            className="hover:bg-gray-200"
          >
            <FiArrowLeft style={{ fontSize: '16px' }} />
            Quay lại danh sách
          </button>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '24px' }}>
            {tests.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <FiFileText style={{ fontSize: '60px', color: '#d1d5db', margin: '0 auto 16px', display: 'block' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Chưa có bài test hệ thống</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Hiện tại chưa có bài kiểm tra hệ thống nào.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tests.map((test) => {
                  const isExpired = test.expires_at && new Date(test.expires_at) < new Date();
                  const submittedCount = getSubmittedCount(test.id);
                  const activeAttempt = getActiveAttempt(test.id);
                  const canRetake = test.max_attempts > 1 && submittedCount < (test.max_attempts || 999);

                  return (
                    <div key={test.id} style={cardStyle} className="hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>{test.title}</h3>
                            {submittedCount > 0 && (
                              <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-700 rounded-full">Đã hoàn thành</span>
                            )}
                            {isExpired && (
                              <span className="text-xs font-medium px-2.5 py-1 bg-red-100 text-red-700 rounded-full">Đã hết hạn</span>
                            )}
                            {activeAttempt && !isExpired && (
                              <span className="text-xs font-medium px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full animate-pulse">Đang làm dở</span>
                            )}
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
                        </div>

                        <div className="flex sm:flex-col justify-end items-end gap-2">
                          {isExpired ? (
                            <button
                              disabled
                              style={{ ...primaryButtonStyle, backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
                            >
                              Đã khóa đề
                            </button>
                          ) : activeAttempt ? (
                            <button
                              onClick={() => handleStartTest(test.id)}
                              style={{ ...primaryButtonStyle, backgroundColor: '#d97706' }}
                              className="hover:bg-yellow-700"
                            >
                              <FiPlay style={{ fontSize: '14px' }} />
                              Tiếp tục làm
                            </button>
                          ) : submittedCount > 0 && canRetake ? (
                            <div className="flex sm:flex-col items-end gap-2">
                              <button
                                onClick={() => navigate(`/student/tests/${getLatestAttemptId(test.id)}/results`)}
                                style={{ ...primaryButtonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                                className="hover:bg-gray-200"
                              >
                                Xem kết quả
                              </button>
                              <button
                                onClick={() => handleStartTest(test.id)}
                                style={primaryButtonStyle}
                                className="hover:bg-blue-700"
                              >
                                <FiRotateCw style={{ fontSize: '14px' }} />
                                Làm lại
                              </button>
                            </div>
                          ) : submittedCount > 0 ? (
                            <button
                              onClick={() => navigate(`/student/tests/${getLatestAttemptId(test.id)}/results`)}
                              style={{ ...primaryButtonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                              className="hover:bg-gray-200"
                            >
                              Xem kết quả
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartTest(test.id)}
                              style={primaryButtonStyle}
                              className="hover:bg-blue-700"
                            >
                              <FiPlay style={{ fontSize: '14px' }} />
                              Bắt đầu làm
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export default SystemTestsPage;
