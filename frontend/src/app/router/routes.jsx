import { Routes, Route } from 'react-router-dom';
import HomePage from '../../features/home/pages/HomePage';
import LoginRolePage from '../../features/auth/pages/LoginRolePage';
import LoginStudentPage from '../../components/auth/pages/LoginStudentPage';
import LoginTeacherPage from '../../components/auth/pages/LoginTeacherPage';
import RegisterRolePage from '../../features/auth/pages/RegisterRolePage';
import RegisterStudentPage from '../../components/auth/pages/RegisterStudentPage';
import RegisterTeacherPage from '../../components/auth/pages/RegisterTeacherPage';
import AdminLoginPage from '../../components/auth/pages/AdminLoginPage';
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage';
import TeacherListPage from '../../features/admin/pages/TeacherListPage';
import StudentListPage from '../../features/admin/pages/StudentListPage';
import FeedbackPage from '../../features/admin/pages/FeedbackPage';
import SettingsPage from '../../features/admin/pages/SettingsPage';
import EditUserPage from '../../features/admin/pages/EditUserPage';
import AdminTestListPage from '../../features/admin/pages/TestListPage';
import AdminTestDetailPage from '../../features/admin/pages/TestDetailPage';
import AdminCreateTestPage from '../../features/admin/pages/CreateTestPage';
import AdminCreateQuestionPage from '../../features/admin/pages/AdminCreateQuestionPage';
import StudentDashboardPage from '../../features/student/pages/StudentDashboardPage';
import StudentGradesPage from '../../features/student/pages/StudentGradesPage';
import StudentSupportPage from '../../features/student/pages/StudentSupportPage';
import StudentSettingsPage from '../../features/student/pages/StudentSettingsPage';
import StudentClassDetailPage from '../../features/student/pages/StudentClassDetailPage';
import StudentClassListPage from '../../features/student/pages/StudentClassListPage';
import SystemTestsPage from '../../features/student/pages/SystemTestsPage';
import TestListPage from '../../features/student/pages/TestListPage';
import TestSessionPage from '../../features/student/pages/TestSessionPage';
import TestResultPage from '../../features/student/pages/TestResultPage';
import TeacherDashboardPage from '../../features/teacher/pages/TeacherDashboardPage';
import TeacherTestListPage from '../../features/teacher/pages/TestListPage';
import CreateTestPage from '../../features/teacher/pages/CreateTestPage';
import TestResultsPage from '../../features/teacher/pages/TestResultsPage';
import TestDetailPage from '../../features/teacher/pages/TestDetailPage';
import AdminQuestionListPage from '../../features/admin/pages/AdminQuestionListPage';
import QuestionListPage from '../../features/teacher/pages/QuestionListPage';
import CreateQuestionPage from '../../features/teacher/pages/CreateQuestionPage';
import EditQuestionPage from '../../features/teacher/pages/EditQuestionPage';
import AdminEditQuestionPage from '../../features/admin/pages/AdminEditQuestionPage';
import ClassListPage from '../../features/teacher/pages/ClassListPage';
import CreateClassPage from '../../features/teacher/pages/CreateClassPage';
import ClassDetailPage from '../../features/teacher/pages/ClassDetailPage';
import TeacherPracticeListPage from '../../features/teacher/pages/PracticeListPage';
import CreatePracticePage from '../../features/teacher/pages/CreatePracticePage';
import PracticeQuestionPage from '../../features/teacher/pages/PracticeQuestionPage';
import TeacherSettingsPage from '../../features/teacher/pages/TeacherSettingsPage';
import PracticeSessionPage from '../../features/student/pages/PracticeSessionPage';
import PracticeListPage from '../../features/student/pages/PracticeListPage';
import PracticeCompletePage from '../../features/student/pages/PracticeCompletePage';
import ProtectedRoute from "../../components/auth/ProtectedRoute";

export function AppRoutes() {
  return (
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginRolePage />} />
        <Route path="/login/student" element={<LoginStudentPage />} />
        <Route path="/login/teacher" element={<LoginTeacherPage />} />
        <Route path="/register" element={<RegisterRolePage />} />
        <Route path="/register/student" element={<RegisterStudentPage />} />
        <Route path="/register/teacher" element={<RegisterTeacherPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TeacherListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tests"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTestListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tests/create"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCreateTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tests/:testId"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTestDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tests/:testId/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCreateTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminQuestionListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions/create"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCreateQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions/:questionId/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminEditQuestionPage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentGradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/support"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentSupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/classes"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentClassListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/classes/:classId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentClassDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tests"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TestListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/system-tests"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <SystemTestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tests/:testId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TestSessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tests/results/:attemptId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TestResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/practices/:practiceId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <PracticeSessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/practice"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <PracticeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/practice/complete"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <PracticeCompletePage />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/tests"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherTestListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/tests/:testId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TestDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/tests/create"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreateTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/tests/:testId/edit"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreateTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/tests/:testId/results"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TestResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/questions"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <QuestionListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/questions/create"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreateQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/questions/:questionId/edit"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <EditQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ClassListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes/create"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreateClassPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes/:classId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ClassDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/practice"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherPracticeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/practice/create"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreatePracticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/practice/:practiceId/edit"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <CreatePracticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/practice/:practiceId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherPracticeListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/practice/:practiceId/questions"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <PracticeQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherSettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}
