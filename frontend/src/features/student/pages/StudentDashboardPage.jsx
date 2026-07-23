import React, { useEffect, useState } from 'react';
import StudentLayout from '../../../components/student/StudentLayout';
import StudentStats from '../../../components/student/StudentStats';
import ClassCard from '../../../components/student/ClassCard';
import AssignmentCard from '../../../components/student/AssignmentCard';
import { classService } from '../../../services/classService';
import { testService } from '../../../services/testService';
import JoinClassModal from '../../../components/student/JoinClassModal';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StudentDashboardPage = () => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ classes: 0, tests: 0, completed: 0, averageGrade: null, recent: null, allAttempts: [] });
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [classesData, testsData, attemptsData] = await Promise.all([
        classService.getAll(),
        testService.getAvailable(),
        testService.getMyAttempts()
      ]);

      const classesList = classesData.data || [];
      const availableTests = testsData.data || [];
      const attempts = attemptsData.data || [];

      setClasses(classesList);
      setAssignments(availableTests);

      const classesCount = classesList.length;
      const testsCount = availableTests.length;

      const submittedAttempts = attempts.filter(a => a.score !== null && a.score !== undefined);
      const avgPercent = submittedAttempts.length > 0
        ? submittedAttempts.reduce((s, a) => s + (Number(a.score) || 0), 0) / submittedAttempts.length
        : null;
      const completedCount = attempts.filter(a => a.status === 'submitted').length;

      const recentAttempt = attempts.length > 0
        ? attempts.slice().sort((a, b) => new Date(b.submitted_at || b.started_at) - new Date(a.submitted_at || a.started_at))[0]
        : null;

      setStats({
        classes: classesCount,
        tests: testsCount,
        completed: completedCount,
        averageGrade: avgPercent,
        recent: recentAttempt,
        allAttempts: attempts,
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinModalJoined = () => {
    fetchDashboardData();
  };

  const getPracticeFrequencyData = (attempts) => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        displayDate: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        count: 0
      });
    }

    attempts.forEach(attempt => {
      const attemptDate = (attempt.submitted_at || attempt.started_at || '').split(' ')[0];
      const match = days.find(day => day.date === attemptDate);
      if (match) {
        match.count++;
      }
    });

    return days;
  };

  const getScoreTrendData = (attempts) => {
    const sorted = [...attempts]
      .filter(a => a.score !== null && a.score !== undefined)
      .sort((a, b) => new Date(a.started_at) - new Date(b.started_at));
    
    const last10 = sorted.slice(-10);

    return last10.map((attempt, index) => ({
      index: index + 1,
      name: `Lần ${index + 1}`,
      title: attempt.test_title || attempt.test?.title || 'Bài thi',
      score: Math.round(Number(attempt.score) || 0)
    }));
  };

  return (
    <StudentLayout pageTitle="Màn hình chính">
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
      ) : (
        <>
          <StudentStats stats={stats} />

          {/* Phân tích học tập cá nhân */}
          {stats.completed > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
                  Xu hướng điểm số (% đúng)
                </h3>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getScoreTrendData(stats.allAttempts || [])} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip formatter={(value, name, props) => [`${value}%`, props.payload.title]} />
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} name="Điểm" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
                  Tần suất luyện tập (7 ngày qua)
                </h3>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getPracticeFrequencyData(stats.allAttempts || [])} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4ec28a" radius={[4, 4, 0, 0]} name="Số lượt làm bài" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Các lớp học của tôi</h2>
              <button type="button" className="join-class-trigger" onClick={() => setShowJoinModal(true)}>
                Tham gia lớp học
              </button>
            </div>
            <div className="dashboard-grid">
              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <ClassCard key={classItem.id} classData={{
                    ...classItem,
                    color: classItem.color || '#4ec28a',
                    avatar: classItem.name ? classItem.name.charAt(0).toUpperCase() : 'C',
                    teacher: classItem.teacher?.name || 'Giáo viên'
                  }} />
                ))
              ) : (
                <p>Bạn chưa tham gia lớp học nào.</p>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Bài tập cần làm</h2>
            <div className="dashboard-list">
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))
              ) : (
                <p>Không có bài tập nào cần hoàn thành.</p>
              )}
            </div>
          </div>
        </>
      )}

      <JoinClassModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoined={handleJoinModalJoined}
      />
    </StudentLayout>
  );
};

export default StudentDashboardPage;
