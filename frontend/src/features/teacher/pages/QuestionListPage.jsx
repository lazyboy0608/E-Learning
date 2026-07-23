import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiFileText, FiInbox } from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import questionApi from '../../../api/questionApi';

const QuestionListPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionApi.getClassQuestions();
      if (response.success) {
        setQuestions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

    try {
      await questionApi.deleteClassQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Xóa thất bại. Vui lòng thử lại sau.');
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const matchesSearch = question.content?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || question.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [questions, searchQuery, filterType]);

  const getTypeBadge = (type) => {
    const badges = {
      mcq: 'bg-blue-100 text-blue-700',
      fill_blank: 'bg-green-100 text-green-700',
      matching: 'bg-purple-100 text-purple-700',
      table_fill: 'bg-orange-100 text-orange-700',
    };
    return badges[type] || 'bg-gray-100 text-gray-700';
  };

  const getTypeLabel = (type) => {
    const labels = {
      mcq: 'Lựa chọn',
      fill_blank: 'Điền vào chỗ trống',
      matching: 'Nối dòng',
      table_fill: 'Điền bảng',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <TeacherLayout pageTitle="Quản lý câu hỏi">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải danh sách câu hỏi...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout pageTitle="Quản lý câu hỏi">
      <div style={{ display: 'block', width: '100%', maxWidth: '1152px', margin: '0 auto', padding: '24px', boxSizing: 'border-box', textAlign: 'left' }}>

        {/* Tầng 1: Tiêu đề */}
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }} className="justify-between">
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0' }}>Quản lý câu hỏi</h1>
          <button
            onClick={() => navigate('/teacher/questions/create')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', shadow: '0 1px 2px 0 rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}
          >
            <FiPlus style={{ fontSize: '18px' }} />
            Tạo câu hỏi mới
          </button>
        </div>

        {/* Tầng 2: Bộ lọc */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: '1', position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Tìm kiếm theo nội dung câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', color: '#374151', boxSizing: 'border-box' }}
            />
            <FiSearch style={{ position: 'absolute', left: '12px', top: '11px', color: '#9ca3af', fontSize: '16px' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', shrink: '0' }}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ minWidth: '180px', padding: '8px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer' }}
            >
              <option value="all">Tất cả loại câu hỏi</option>
              <option value="mcq">Lựa chọn</option>
              <option value="fill_blank">Điền vào chỗ trống</option>
              <option value="matching">Nối dòng</option>
              <option value="table_fill">Điền bảng</option>
            </select>
          </div>
        </div>

        {/* Tầng 3: Bảng dữ liệu */}
        <div style={{ display: 'block', width: '100%' }}>
          {questions.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', padding: '48px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <FiFileText style={{ fontSize: '60px', color: '#d1d5db', marginLeft: 'auto', marginRight: 'auto', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Chưa có câu hỏi nào</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Bạn chưa tạo câu hỏi nào trên hệ thống này.</p>
              <button
                onClick={() => navigate('/teacher/questions/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                style={{ padding: '10px 20px' }}
              >
                Tạo câu hỏi đầu tiên
              </button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', padding: '48px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <FiInbox style={{ fontSize: '60px', color: '#d1d5db', marginLeft: 'auto', marginRight: 'auto', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>Không tìm thấy kết quả</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Không có câu hỏi nào khớp với tiêu chí tìm kiếm của bạn.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nội dung</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Độ khó</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredQuestions.map((question) => (
                      <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate font-medium">
                          {question.content}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeBadge(question.type)}`}>
                            {getTypeLabel(question.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {question.difficulty || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/teacher/questions/${question.id}/edit`)}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Chỉnh sửa câu hỏi"
                            >
                              <FiEdit2 className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDelete(question.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa câu hỏi"
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
};

export default QuestionListPage;
