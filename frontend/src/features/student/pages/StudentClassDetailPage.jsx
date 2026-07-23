import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiPlay, FiCornerDownRight, FiClock } from 'react-icons/fi';
import StudentLayout from '../../../components/student/StudentLayout';
import ClassTabs from '../../../components/student/ClassTabs';
import AnnouncementCard from '../../../components/student/AnnouncementCard';
import classApi from '../../../api/classApi';
import { testApi } from '../../../api/testApi';

const tabOptions = [
  { id: 'overview', label: 'Về môn học' },
  { id: 'practices', label: 'Bài tập ôn tập' },
  { id: 'tests', label: 'Bài kiểm tra' },
  { id: 'students', label: 'Danh sách lớp' },
];

const StudentClassDetailPage = () => {
  const { classId: classIdParam, id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [classData, setClassData] = useState(null);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const classId = Number(classIdParam || id);

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      const [classRes, attemptsRes] = await Promise.all([
        classApi.getClassDetail(classId),
        testApi.getMyAttempts().catch(() => ({ data: [] })),
      ]);
      if (classRes.success) setClassData(classRes.data);
      setMyAttempts(attemptsRes?.data || []);
    } catch (error) {
      console.error('Failed to fetch class data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo map: test_id → attempt tốt nhất (submitted/expired ưu tiên)
  const attemptMap = useMemo(() => {
    return myAttempts.reduce((acc, attempt) => {
      const prev = acc[attempt.test_id];
      if (!prev) {
        acc[attempt.test_id] = attempt;
      } else if (
        attempt.status === 'submitted' ||
        (attempt.status === 'expired' && prev.status === 'in_progress')
      ) {
        acc[attempt.test_id] = attempt;
      }
      return acc;
    }, {});
  }, [myAttempts]);

  const handleStartTest = (testId) => navigate(`/student/tests/${testId}`);
  const handleViewResult = (attemptId) => navigate(`/student/tests/results/${attemptId}`);
  const handleStartPractice = (practiceId) => navigate(`/student/practices/${practiceId}`);

  const className = classData?.name || `Lớp học #${classIdParam || id || ''}`;
  const testsData = classData?.tests || [];
  const practicesData = classData?.practices || [];
  const studentsData = classData?.users?.filter(u => u.pivot?.role === 'student') || [];

  if (loading) {
    return (
      <StudentLayout pageTitle={className}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout
      pageTitle={className}
      pageSubtitle="Chào mừng trở lại! Tiếp tục hành trình học tập của bạn."
    >
      <div className="class-detail-container">
        <ClassTabs
          tabs={tabOptions}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="class-detail-content">
          {activeTab === 'overview' && (
            <AnnouncementCard announcement={{ title: 'Thông báo', content: 'Chào mừng đến với lớp!' }} />
          )}

          {activeTab === 'practices' && (
            <div className="class-detail-grid">
              {practicesData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 col-span-full">Chưa có bài tập nào</div>
              ) : (
                practicesData.map((practiceItem) => (
                  <div key={practiceItem.id} className="class-detail-card practice-card">
                    <h3>{practiceItem.title}</h3>
                    <p className="practice-description">
                      Thời lượng: {practiceItem.duration ? `${practiceItem.duration} phút` : 'Không giới hạn'}
                    </p>
                    <p className="class-detail-meta">
                      Số câu hỏi: {practiceItem.questions_count || 0}
                    </p>
                    <div className="class-detail-action">
                      <button
                        type="button"
                        className="class-detail-button"
                        onClick={() => handleStartPractice(practiceItem.id)}
                      >
                        Bắt đầu
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'tests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {testsData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Chưa có bài kiểm tra nào</div>
              ) : (
                testsData.map((testItem) => {
                  const attempt = attemptMap[testItem.id];
                  const isDone = attempt?.status === 'submitted' || attempt?.status === 'expired';
                  const isInProgress = attempt?.status === 'in_progress';
                  const score = attempt?.score ?? 0;
                  const scoreColor = score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';

                  return (
                    <div
                      key={testItem.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap',
                        transition: 'box-shadow 0.15s',
                      }}
                      className="hover:shadow-md"
                    >
                      {/* Left: info */}
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0 }}>
                            {testItem.title}
                          </h3>
                          {isDone && (
                            <span style={{ fontSize: '11px', padding: '2px 8px', background: '#dcfce7', color: '#16a34a', borderRadius: '20px', fontWeight: '600' }}>
                              Đã hoàn thành
                            </span>
                          )}
                          {isInProgress && (
                            <span style={{ fontSize: '11px', padding: '2px 8px', background: '#fef9c3', color: '#ca8a04', borderRadius: '20px', fontWeight: '600' }}>
                              Đang làm dở
                            </span>
                          )}
                          {!attempt && (
                            <span style={{ fontSize: '11px', padding: '2px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontWeight: '600' }}>
                              Chưa làm
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {testItem.duration && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiClock style={{ fontSize: '11px' }} />
                              {testItem.duration} phút
                            </span>
                          )}
                          {testItem.questions_count > 0 && (
                            <span>{testItem.questions_count} câu hỏi</span>
                          )}
                        </div>
                      </div>

                      {/* Right: score + action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {isDone && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '22px', fontWeight: '800', color: scoreColor }}>
                              {score.toFixed(0)}%
                            </div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {attempt.correct_count ?? 0}/{attempt.total_questions ?? 0} câu
                            </div>
                          </div>
                        )}

                        {isDone ? (
                          <button
                            id={`class-view-result-${attempt.attempt_id}`}
                            onClick={() => handleViewResult(attempt.attempt_id || attempt.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '9px 16px', backgroundColor: '#eff6ff', color: '#2563eb',
                              fontWeight: '600', fontSize: '13px', borderRadius: '8px',
                              border: '1px solid #bfdbfe', cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                            className="hover:bg-blue-100"
                          >
                            <FiCornerDownRight style={{ fontSize: '12px' }} />
                            Xem kết quả
                          </button>
                        ) : isInProgress ? (
                          <button
                            id={`class-continue-test-${testItem.id}`}
                            onClick={() => handleStartTest(testItem.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '9px 16px', backgroundColor: '#fef3c7', color: '#92400e',
                              fontWeight: '600', fontSize: '13px', borderRadius: '8px',
                              border: '1px solid #fde68a', cursor: 'pointer',
                            }}
                          >
                            <FiClock style={{ fontSize: '12px' }} />
                            Làm tiếp
                          </button>
                        ) : (
                          <button
                            id={`class-start-test-${testItem.id}`}
                            onClick={() => handleStartTest(testItem.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '9px 16px', backgroundColor: '#2563eb', color: '#fff',
                              fontWeight: '600', fontSize: '13px', borderRadius: '8px',
                              border: 'none', cursor: 'pointer',
                            }}
                            className="hover:bg-blue-700"
                          >
                            <FiPlay style={{ fontSize: '12px' }} />
                            Bắt đầu
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="class-detail-table-wrap">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Họ và tên</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentClassDetailPage;
