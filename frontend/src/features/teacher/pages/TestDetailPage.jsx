import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiCopy, 
  FiCheckCircle, 
  FiXCircle,
  FiBarChart2,
  FiEye,
  FiPower
} from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { testApi } from '../../../api/testApi';
import { questionApi } from '../../../api/questionApi';

const TestDetailPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await testApi.getTestDetails(testId);
      setTest(response.data);
    } catch (error) {
      console.error('Failed to fetch test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await testApi.updateTest(testId, { is_active: !test.is_active });
      setTest(prev => ({ ...prev, is_active: !prev.is_active }));
    } catch (error) {
      console.error('Failed to update test:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await testApi.deleteTest(testId);
      navigate('/teacher/tests');
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  if (loading) {
    return (
      <TeacherLayout pageTitle="Chi tiết bài kiểm tra">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </TeacherLayout>
    );
  }

  if (!test) {
    return (
      <TeacherLayout pageTitle="Lỗi">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-500 mb-4">Không tìm thấy bài kiểm tra.</p>
          <button
            onClick={() => navigate('/teacher/tests')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </TeacherLayout>
    );
  }

  const totalQuestions = test.questions?.length || 0;
  const totalScore = test.questions?.reduce((sum, q) => sum + (q.pivot?.score || 1), 0) || 0;

  return (
    <TeacherLayout pageTitle={test.title}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/teacher/tests')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <FiArrowLeft />
            Quay lại
          </button>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{test.title}</h1>
                <p className="text-gray-500">
                  Mã bài kiểm tra: <span className="font-mono font-medium">{test.test_code}</span>
                </p>
                <p className="text-gray-500 mt-1">
                  Môn học: {test.subject?.name || 'Không rõ'}
                </p>
                <p className="text-gray-500">
                  Thời gian: {test.duration ? `${test.duration} phút` : 'Không giới hạn'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleToggleActive}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    test.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiPower />
                  {test.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                </button>
                <button
                  onClick={() => navigate(`/teacher/tests/${testId}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  <FiEdit />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  <FiTrash2 />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{totalQuestions}</div>
            <div className="text-gray-500">Câu hỏi</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{totalScore}</div>
            <div className="text-gray-500">Tổng điểm</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">{test.attempts_count || 0}</div>
            <div className="text-gray-500">Lượt làm bài</div>
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Danh sách câu hỏi</h2>
          </div>

          {totalQuestions === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có câu hỏi nào</p>
              <button
                onClick={() => navigate('/teacher/questions/create')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tạo câu hỏi
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {test.questions?.map((question, index) => (
                <div key={question.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          Câu {index + 1}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {question.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {question.pivot?.score || 1} điểm
                        </span>
                      </div>
                      <p className="text-gray-800 mb-2">{question.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/teacher/questions/${question.id}/edit`)}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <FiEdit />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirm Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Xác nhận xóa</h3>
              <p className="text-gray-500 mb-6">
                Bạn có chắc muốn xóa bài kiểm tra này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TestDetailPage;
