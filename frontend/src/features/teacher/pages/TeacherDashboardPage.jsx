import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFileText, FiUsers, FiCheckCircle, FiTrendingUp, FiBookOpen, FiClock, FiHelpCircle } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import ClassCard from '../../../components/teacher/ClassCard';
import AssignmentCard from '../../../components/teacher/AssignmentCard';
import { testApi } from '../../../api/testApi';
import { classApi } from '../../../api/classApi';
import { userApi } from '../../../api/userApi';
import { questionApi } from '../../../api/questionApi';
import "./teacher.css";

const calculateExamStatus = (exam) => {
  if (!exam) return false;
  const now = new Date();
  const startTime = exam.start_time ? new Date(exam.start_time) : null;
  const endTime = exam.end_time ? new Date(exam.end_time) : null;

  if (startTime && now < startTime) return false; // Not started yet
  if (endTime && now > endTime) return false; // Already ended
  return true; // Open
};

const TeacherDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    totalQuestions: 0,
    totalStudents: 0,
    totalSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [testsRes, classesRes, statsRes] = await Promise.all([
        testApi.getTests(),
        classApi.getClasses(),
        userApi.getTeacherStats(),
      ]);

      const tests = (testsRes.data || []).map(test => ({
        ...test,
        is_active: calculateExamStatus(test)
      }));
      const classesData = classesRes.data || [];
      const statsData = statsRes.data || {};

      setStats({
        totalTests: statsData.tests_count ?? tests.length,
        totalQuestions: statsData.questions_count ?? 0,
        totalStudents: statsData.students_count ?? 0,
        totalSubmissions: statsData.total_attempts ?? 0,
      });

      setClasses(classesData);
      setAssignments(tests.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    navigate('/teacher/classes/create');
  };

  const handleManageQuestions = () => {
    navigate('/teacher/questions');
  };

  const handleCreateTest = () => {
    navigate('/teacher/tests/create');
  };

  // Định nghĩa CSS Inline thuần để cưỡng chế giao diện cân đối tuyệt đối
  const cardStyle = {
    height: '160px',
    minHeight: '160px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const rowTopStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%'
  };

  const rowBottomStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: 'auto',
    paddingTop: '8px',
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    fontSize: '12px'
  };

  return (
    <TeacherLayout pageTitle="Trang chủ giáo viên">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <>
          
          {/* Welcome */}
          <div className="mb-8 rounded-3xl bg-white shadow-lg" style={{ padding: '32px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', width: '100%' }}>
              
              {/* Bên trái: Lời chào (Đã xử lý giãn dòng, không lo dính chữ) */}
              <div style={{ flex: '1', minWidth: '250px', display: 'block', textAlign: 'left' }}>
                <p className="text-sm text-gray-500" style={{ display: 'block', margin: '0 0 8px 0', padding: '0', lineHeight: '1.5', lg: 'text-base' }}>
                  Xin chào
                </p>
                <h1 className="text-3xl font-bold text-gray-900" style={{ display: 'block', margin: '0 0 12px 0', padding: '0', lineHeight: '1.3', letterSpacing: '-0.02em' }}>
                  {user?.full_name || user?.name || 'Giáo viên'}
                </h1>
                <p className="text-gray-500" style={{ display: 'block', margin: '0', padding: '0', lineHeight: '1.5', fontSize: '15px' }}>
                  Tổng quan nhanh về lớp, học sinh và bài kiểm tra.
                </p>
              </div>
              
              {/* Bên phải: Khối tổng học sinh (Đẩy lên cao chuẩn hàng ngang) */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row',
                alignItems: 'center', 
                gap: '14px', 
                backgroundColor: '#f0f6ff', 
                padding: '14px 20px', 
                borderRadius: '18px',
                minWidth: '180px',
                height: '68px',
                boxSizing: 'border-box',
                marginTop: '4px' /* Định tiến nhẹ xuống để cân bằng với dòng Xin chào */
              }}>
                <FiUsers className="text-blue-600" style={{ fontSize: '26px', flexShrink: 0, display: 'block' }} />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', flex: '1' }}>
                  <p className="text-xs uppercase tracking-wide text-blue-600" 
                     style={{ display: 'block', margin: '0 0 4px 0', padding: '0', fontWeight: '600', lineHeight: '1', whiteSpace: 'nowrap' }}>
                    Tổng học sinh
                  </p>
                  <p className="text-2xl font-bold text-blue-900" 
                     style={{ display: 'block', margin: '0', padding: '0', lineHeight: '1' }}>
                    {stats.totalStudents}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Stats Cards - ÉP DÀN HÀNG NGANG CHỐNG TRÀN DỌC */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '20px', 
            marginBottom: '32px',
            width: '100%',
            boxSizing: 'border-box',
            marginTop: '16px',
          }}>
            
            {/* Thẻ 1: Tổng số bài kiểm tra */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg" 
                 style={{ flex: '1', minWidth: '220px', height: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', boxSizing: 'border-box'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>Tổng số bài kiểm tra</p>
                  <h3 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', lineHeight: '1' }}>{stats.totalTests ?? 0}</h3>
                </div>
                <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiFileText style={{ fontSize: '18px' }} />
                </div>
              </div>
              <p style={{ margin: 'auto 0 0 0', fontSize: '11px', opacity: 0.85, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiTrendingUp /> Tăng 12% tháng này
              </p>
            </div>

            {/* Thẻ 2: Tổng số câu hỏi */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl text-white shadow-lg" 
                 style={{ flex: '1', minWidth: '220px', height: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>Tổng số câu hỏi</p>
                  <h3 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', lineHeight: '1' }}>{stats.totalQuestions ?? 0}</h3>
                </div>
                <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiBookOpen style={{ fontSize: '18px' }} />
                </div>
              </div>
              <p style={{ margin: 'auto 0 0 0', fontSize: '11px', opacity: 0.85, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiTrendingUp /> Tăng 8% tháng này
              </p>
            </div>

            {/* Thẻ 3: Tổng số học sinh */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white shadow-lg" 
                 style={{ flex: '1', minWidth: '220px', height: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>Tổng số học sinh</p>
                  <h3 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', lineHeight: '1' }}>{stats.totalStudents ?? 0}</h3>
                </div>
                <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiUsers style={{ fontSize: '18px' }} />
                </div>
              </div>
              <p style={{ margin: 'auto 0 0 0', fontSize: '11px', opacity: 0.85, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiTrendingUp /> 3 học sinh mới
              </p>
            </div>

            {/* Thẻ 4: Số bài nộp */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg" 
                 style={{ flex: '1', minWidth: '220px', height: '145px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>Số bài nộp</p>
                  <h3 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', lineHeight: '1' }}>{stats.totalSubmissions ?? 0}</h3>
                </div>
                <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle style={{ fontSize: '18px' }} />
                </div>
              </div>
              <p style={{ margin: 'auto 0 0 0', fontSize: '11px', opacity: 0.85, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiTrendingUp /> 95% hoàn thành
              </p>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 button-group">
            <button
              onClick={handleCreateTest}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FiPlus className="text-xl text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800">Tạo bài kiểm tra mới</h4>
                <p className="text-sm text-gray-500">Tạo bộ bài kiểm tra nhanh chóng</p>
              </div>
            </button>

            <button
              onClick={handleCreateClass}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <FiUsers className="text-xl text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800">Tạo lớp học mới</h4>
                <p className="text-sm text-gray-500">Tạo lớp và thêm học sinh</p>
              </div>
            </button>

            <button
              onClick={handleManageQuestions}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <FiHelpCircle className="text-xl text-yellow-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-800">Quản lý câu hỏi</h4>
                <p className="text-sm text-gray-500">Xem và chỉnh sửa ngân hàng câu hỏi</p>
              </div>
            </button>
          </div>

          {/* Recent Classes Section */}
          <div style={{ width: '100%', marginTop: '8px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>Lớp học mới nhất</h2>
              <button
                onClick={() => navigate('/teacher/classes')}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: 0 }}
                className="hover:text-blue-800"
              >
                Xem tất cả →
              </button>
            </div>
            {classes.length > 0 ? (
              <div className="dashboard-grid">
                {classes.slice(0, 4).map((classItem, index) => (
                  <ClassCard
                    key={classItem.id || index}
                    classData={{
                      ...classItem,
                      color: classItem.color || ['#4ec28a', '#6366f1', '#ec4899', '#f59e0b'][index % 4],
                      avatar: classItem.name?.charAt(0)?.toUpperCase() || 'C',
                      teacher: classItem.teacher?.name || classItem.teacher?.full_name || user?.full_name || user?.name || 'Giáo viên'
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                padding: '48px 24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                width: '100%',
                boxSizing: 'border-box',
              }}>
                <FiUsers style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px', display: 'block' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 4px 0' }}>Bạn chưa có lớp học nào</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px 0' }}>Tạo lớp học để bắt đầu quản lý học sinh và giao bài.</p>
                <button
                  onClick={handleCreateClass}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  style={{ padding: '10px 20px' }}
                >
                  Tạo lớp đầu tiên
                </button>
              </div>
            )}
          </div>

          {/* Recent Assignments Section */}
          <div style={{ width: '100%', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>Bài kiểm tra mới nhất</h2>
              <button
                onClick={() => navigate('/teacher/tests')}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '14px', fontWeight: '500', cursor: 'pointer', padding: 0 }}
                className="hover:text-blue-800"
              >
                Xem tất cả →
              </button>
            </div>
            {assignments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="hover:shadow-md transition-all"
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/teacher/tests/${assignment.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiFileText className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{assignment.title}</h4>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <FiClock /> {assignment.duration ? `${assignment.duration} phút` : 'Không giới hạn'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {assignment.is_active ? 'Đang mở' : 'Đã đóng'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                padding: '48px 24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                width: '100%',
                boxSizing: 'border-box',
              }}>
                <FiFileText style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px', display: 'block' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 4px 0' }}>Bạn chưa tạo bài kiểm tra nào</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px 0' }}>Tạo bài kiểm tra để giao cho học sinh làm bài.</p>
                <button
                  onClick={handleCreateTest}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  style={{ padding: '10px 20px' }}
                >
                  Tạo bài đầu tiên
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </TeacherLayout>
  );
};

export default TeacherDashboardPage;