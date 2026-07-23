import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiFileText, FiSearch, FiEye, FiInbox, FiBook } from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { practiceApi } from '../../../api/practiceApi';

export function TeacherPracticeListPage() {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // State cho tìm kiếm và lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    fetchPractices();
  }, []);

  const fetchPractices = async () => {
    try {
      const response = await practiceApi.getTeacherPractices();
      if (response.success) {
        setPractices(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch practices:', error);
      setPractices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (practiceId) => {
    navigate(`/teacher/practice/${practiceId}/edit`);
  };

  const handleView = (practiceId) => {
    navigate(`/teacher/practice/${practiceId}`);
  };

  const handleViewQuestions = (practiceId) => {
    navigate(`/teacher/practice/${practiceId}/questions`);
  };

  const handleDelete = async (practiceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài ôn tập này không? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeletingId(practiceId);
      await practiceApi.deletePractice(practiceId);
      setPractices(prev => prev.filter(p => p.id !== practiceId));
    } catch (error) {
      console.error('Failed to delete practice:', error);
      alert('Xóa bài ôn tập thất bại. Vui lòng thử lại sau.');
    } finally {
      setDeletingId(null);
    }
  };

  // Trích xuất danh sách môn học ĐỘNG từ dữ liệu
  const uniqueSubjects = useMemo(() => {
    const subjectsMap = new Map();
    practices.forEach(practice => {
      if (practice.subject?.id && practice.subject?.name) {
        subjectsMap.set(practice.subject.id.toString(), practice.subject.name);
      }
    });
    return Array.from(subjectsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [practices]);

  // Tiến trình lọc dữ liệu tối ưu bằng useMemo
  const filteredPractices = useMemo(() => {
    return practices.filter(practice => {
      const matchesSearch = (practice.title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const currentSubjectId = practice.subject?.id?.toString() || '';
      const matchesSubject = subjectFilter === '' || currentSubjectId === subjectFilter;
      
      return matchesSearch && matchesSubject;
    });
  }, [practices, searchQuery, subjectFilter]);

  if (loading) {
    return (
      <TeacherLayout pageTitle="Quản lý bài ôn tập">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải danh sách bài ôn tập...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout pageTitle="Quản lý bài ôn tập">
      {/* Container tổng thể bọc cứng cấu trúc block */}
      <div style={{ display: 'block', width: '100%', maxWidth: '1152px', margin: '0 auto', padding: '24px', boxSizing: 'border-box', textAlign: 'left' }}>
        
        {/* ==================== TẦNG 1: KHỐI TIÊU ĐỀ ==================== */}
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }} className="justify-between">
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0' }}>Quản lý bài ôn tập</h1>
          <button
            onClick={() => navigate('/teacher/practice/create')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#059669', color: '#ffffff', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', shadow: '0 1px 2px 0 rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}
          >
            <FiPlus style={{ fontSize: '18px' }} />
            Tạo bài ôn tập mới
          </button>
        </div>

        {/* ==================== TẦNG 2: KHỐI BỘ LỌC ĐỘC LẬP ==================== */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Ô tìm kiếm chiếm tối đa diện tích bên trái */}
          <div style={{ flex: '1', position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', color: '#374151', boxSizing: 'border-box' }}
            />
            <FiSearch style={{ position: 'absolute', left: '12px', top: '11px', color: '#9ca3af', fontSize: '16px' }} />
          </div>
          
          {/* Dropdown lọc theo môn học */}
          <div style={{ display: 'flex', gap: '12px', shrink: '0' }}>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              style={{ minWidth: '140px', padding: '8px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer' }}
            >
              <option value="">Tất cả môn học</option>
              {uniqueSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ==================== TẦNG 3: KHỐI BẢNG DỮ LIỆU ==================== */}
        <div style={{ display: 'block', width: '100%' }}>
          {practices.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', padding: '48px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <FiBook style={{ fontSize: '60px', color: '#d1d5db', marginLeft: 'auto', marginRight: 'auto', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Chưa có bài ôn tập nào</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Bạn chưa tạo bài ôn tập nào trên hệ thống này.</p>
              <button
                onClick={() => navigate('/teacher/practice/create')}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                style={{ padding: '10px 20px' }}
              >
                Tạo bài đầu tiên
              </button>
            </div>
          ) : filteredPractices.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', padding: '48px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <FiInbox style={{ fontSize: '60px', color: '#d1d5db', marginLeft: 'auto', marginRight: 'auto', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Không tìm thấy kết quả</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Không có bài ôn tập nào khớp với tiêu chí tìm kiếm của bạn.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề bài ôn tập</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Môn học</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Số câu hỏi</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Số lượt làm</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredPractices.map((practice) => (
                      <tr key={practice.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900 text-sm">{practice.title || 'Bài ôn tập'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Ngày tạo: {practice.created_at ? new Date(practice.created_at).toLocaleDateString('vi-VN') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {practice.subject?.name || practice.subject_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center font-semibold">
                          {practice.questions_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                          {practice.attempts_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(practice.id)}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Chỉnh sửa bài ôn tập"
                            >
                              <FiEdit className="text-base" />
                            </button>
                            <button
                              onClick={() => handleView(practice.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <FiEye className="text-base" />
                            </button>
                            <button
                              onClick={() => handleViewQuestions(practice.id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Quản lý câu hỏi"
                            >
                              <FiFileText className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDelete(practice.id)}
                              disabled={deletingId === practice.id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                              title="Xóa bài ôn tập"
                            >
                              <FiTrash2 className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </TeacherLayout>
  );
}

export default TeacherPracticeListPage;
