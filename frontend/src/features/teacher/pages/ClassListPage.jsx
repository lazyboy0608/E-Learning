import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiUsers, FiFileText, FiEdit2, FiTrash2, FiCopy } from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import classApi from '../../../api/classApi';

const ClassListPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classApi.getClasses();
      console.log('Class list response:', response);
      const classesData = response?.data ?? response;

      if (Array.isArray(classesData)) {
        setClasses(classesData);
      } else if (response?.success && Array.isArray(response.data)) {
        setClasses(response.data);
      } else {
        console.warn('Unexpected class response format:', response);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    navigate('/teacher/classes/create');
  };

  const handleEditClass = (classId) => {
    navigate(`/teacher/classes/${classId}/edit`);
  };

  const handleViewClass = (classId) => {
    navigate(`/teacher/classes/${classId}`);
  };

  const handleDeleteClick = (classItem) => {
    setSelectedClass(classItem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClass) return;

    try {
      await classApi.deleteClass(selectedClass.id);
      setClasses(classes.filter(c => c.id !== selectedClass.id));
      setShowDeleteModal(false);
      setSelectedClass(null);
    } catch (error) {
      console.error('Failed to delete class:', error);
      alert('Xóa thất bại. Vui lòng thử lại.');
    }
  };

  const handleCopyCode = (classCode) => {
    navigator.clipboard.writeText(classCode);
    alert('Đã copy mã lớp!');
  };

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;

    setJoinLoading(true);
    try {
      const response = await classApi.joinClass(joinCode.trim());
      if (response.success) {
        alert('Tham gia lớp thành công!');
        setShowJoinModal(false);
        setJoinCode('');
        fetchClasses();
      } else {
        alert(response.message || 'Tham gia thất bại.');
      }
    } catch (error) {
      console.error('Failed to join class:', error);
      alert('Tham gia thất bại. Vui lòng thử lại.');
    } finally {
      setJoinLoading(false);
    }
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.class_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <TeacherLayout pageTitle="Quản lý lớp học">
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <div className="text-gray-500">
            Đang tải lớp học...
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout pageTitle="Quản lý lớp học">
      <div className="class-list-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm lớp học..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FiPlus />
              Tham gia lớp
            </button>
            <button
              onClick={handleCreateClass}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus />
              Tạo lớp mới
            </button>
          </div>
        </div>

        {/* Class List */}
        {filteredClasses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FiUsers className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Không tìm thấy lớp nào.' : 'Bạn chưa có lớp học nào.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateClass}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tạo lớp học đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((classItem) => (
              <div key={classItem.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">{classItem.name}</h3>
                      <p className="text-sm text-gray-500">
                        Mã lớp: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{classItem.class_code}</span>
                        <button
                          onClick={() => handleCopyCode(classItem.class_code)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          title="Copy mã lớp"
                        >
                          <FiCopy size={14} />
                        </button>
                      </p>
                    </div>
                    <div className="dropdown">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiTrash2 className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <FiUsers /> {classItem.users?.length || classItem.students_count || classItem.members?.length || 0} thành viên
                    </span>
                    <span className="flex items-center gap-1">
                      <FiFileText /> {classItem.materials?.length || classItem.documents?.length || 0} tài liệu
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewClass(classItem.id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 text-blue-600 rounded-lg hover:bg-blue-100 text-sm"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleEditClass(classItem.id)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(classItem)}
                      className="px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-semibold mb-4">Xác nhận xóa lớp</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa lớp "{selectedClass?.name}"? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Tham gia lớp học</h3>
              <p className="text-gray-600 mb-4">
                Nhập mã lớp để tham gia.
              </p>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="VD: ABC123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                maxLength={20}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleJoinClass}
                  disabled={!joinCode.trim() || joinLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {joinLoading ? 'Đang xử lý...' : 'Tham gia'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .badge-primary {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        .badge-secondary {
          background-color: #f3f4f6;
          color: #6b7280;
        }
      `}</style>
    </TeacherLayout>
  );
};

export default ClassListPage;
