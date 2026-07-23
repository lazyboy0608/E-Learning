import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiFileText, FiCopy, FiSearch, FiEye, FiInbox, FiUser } from 'react-icons/fi';
import AdminLayout from '../../../components/admin/AdminLayout';
import { testApi } from '../../../api/testApi';

export function AdminTestListPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await testApi.getTests();
      setTests(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueSubjects = useMemo(() => {
    const subjectsMap = new Map();
    tests.forEach(test => {
      if (test.subject?.id && test.subject?.name) {
        subjectsMap.set(test.subject.id.toString(), test.subject.name);
      } else if (test.subject_id && test.subject_name) {
        subjectsMap.set(test.subject_id.toString(), test.subject_name);
      }
    });
    return Array.from(subjectsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [tests]);

  const handleEdit = (testId) => {
    navigate(`/admin/tests/${testId}/edit`);
  };

  const handleView = (testId) => {
    navigate(`/admin/tests/${testId}`);
  };

  const handleToggleStatus = async (test) => {
    try {
      setUpdatingStatusId(test.id);
      const nextActiveState = !test.is_active;
      
      if (testApi.updateTest) {
        await testApi.updateTest(test.id, { ...test, is_active: nextActiveState });
      }

      setTests(prev => prev.map(t => t.id === test.id ? { ...t, is_active: nextActiveState } : t));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Không thể cập nhật trạng thái bài kiểm tra. Vui lòng thử lại.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài kiểm tra này không? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeletingId(testId);
      await testApi.deleteTest(testId);
      setTests(prev => prev.filter(t => t.id !== testId));
    } catch (error) {
      console.error('Failed to delete test:', error);
      alert('Xóa bài kiểm tra thất bại. Vui lòng thử lại sau.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    alert('Đã sao chép mã truy cập bài kiểm tra vào bộ nhớ tạm!');
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Không giới hạn';
    if (minutes >= 60) return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`;
    return `${minutes} phút`;
  };

  const getAccessTypeLabel = (type) => {
    switch (type) {
      case 'public_code': return 'Mã công khai';
      case 'class_only': return 'Chỉ lớp học';
      case 'both': return 'Cả hai';
      default: return type;
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = (test.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                            (test.test_code?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const currentSubjectId = test.subject?.id?.toString() || test.subject_id?.toString() || '';
      const matchesSubject = subjectFilter === '' || currentSubjectId === subjectFilter;
      
      const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && test.is_active) || 
                            (statusFilter === 'inactive' && !test.is_active);
      
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [tests, searchQuery, subjectFilter, statusFilter]);

  if (loading) {
    return (
      <AdminLayout title="Quản lý bài kiểm tra">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải danh sách bài kiểm tra...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý bài kiểm tra">
      <div style={{ display: 'block', width: '100%', maxWidth: '1152px', margin: '0 auto', padding: '24px', boxSizing: 'border-box', textAlign: 'left' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }} className="justify-between">
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0' }}>Quản lý bài kiểm tra</h1>
          <button
            onClick={() => navigate('/admin/tests/create')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', shadow: '0 1px 2px 0 rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}
          >
            <FiPlus style={{ fontSize: '18px' }} />
            Tạo bài kiểm tra mới
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: '1', position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc mã đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', color: '#374151', boxSizing: 'border-box' }}
            />
            <FiSearch style={{ position: 'absolute', left: '12px', top: '11px', color: '#9ca3af', fontSize: '16px' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '150px', padding: '8px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'block', width: '100%' }}>
          {tests.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', padding: '48px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <FiFileText style={{ fontSize: '60px', color: '#d1d5db', marginLeft: 'auto', marginRight: 'auto', marginBottom: '16px', display: 'block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Chưa có bài kiểm tra nào</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Chưa có bài kiểm tra nào trên hệ thống.</p>
              <button
                onClick={() => navigate('/admin/tests/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                style={{ padding: '10px 20px' }}
              >
                Tạo bài đầu tiên
              </button>
            </div>
          ) : filteredTests.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', padding: '48px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <FiInbox style={{ fontSize: '60px', color: '#d1d5db', marginLeft: 'auto', marginRight: 'auto', marginBottom: '16px', display: 'block' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Không tìm thấy kết quả</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Không có bài kiểm tra nào khớp với tiêu chí tìm kiếm.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề bài thi</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Môn học</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người tạo</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Số câu hỏi</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình thức</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredTests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900 text-sm">{test.title}</div>
                          {test.test_code && (
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <span>Mã đề:</span>
                              <code className="bg-gray-100 px-1.5 py-0.2 rounded font-mono text-blue-600 font-bold text-[11px]">
                                {test.test_code}
                              </code>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {test.subject?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <FiUser style={{ color: '#9ca3af' }} />
                            <span className="text-gray-600">{test.creator?.name || test.created_by || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center font-semibold">
                          {test.questions_count || test.questions?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getAccessTypeLabel(test.access_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(test)}
                            disabled={updatingStatusId === test.id}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
                              test.is_active
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${updatingStatusId === test.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Click để đổi trạng thái đóng/mở đề"
                          >
                            {test.is_active ? 'Đang mở đề' : 'Đang đóng đề'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleView(test.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <FiEye className="text-base" />
                            </button>
                            {test.test_code && (
                              <button
                                onClick={() => handleCopyCode(test.test_code)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Sao chép mã"
                              >
                                <FiCopy className="text-base" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(test.id)}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <FiEdit className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDelete(test.id)}
                              disabled={deletingId === test.id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                              title="Xóa"
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
    </AdminLayout>
  );
}

export default AdminTestListPage;
