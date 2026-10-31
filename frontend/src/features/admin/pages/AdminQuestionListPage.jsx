import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiFileText, 
  FiDatabase, 
  FiCheckSquare, 
  FiEdit3, 
  FiLayers, 
  FiRefreshCw, 
  FiAlertTriangle,
  FiHash,
  FiBookOpen
} from 'react-icons/fi';
import AdminLayout from '../../../components/admin/AdminLayout';
import Pagination from '../../../components/common/Pagination';
import questionApi from '../../../api/questionApi';

const ITEMS_PER_PAGE = 10;

const AdminQuestionListPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Bộ lọc & Phân trang
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal xác nhận xóa
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionApi.getSystemQuestions({ per_page: 1000 });
      if (response.success) {
        setQuestions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch system questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await questionApi.getSystemQuestions({ per_page: 1000 });
      if (response.success) {
        setQuestions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to refresh questions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingQuestion) return;

    try {
      setDeleteLoading(true);
      await questionApi.deleteSystemQuestion(deletingQuestion.id);
      setQuestions(prev => prev.filter(q => q.id !== deletingQuestion.id));
      setDeletingQuestion(null);
    } catch (error) {
      console.error('Failed to delete system question:', error);
      alert('Không thể xóa câu hỏi hệ thống. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reset trang 1 khi lọc hoặc tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (e) => {
    setFilterDifficulty(e.target.value);
    setCurrentPage(1);
  };

  // Dữ liệu sau khi lọc
  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const matchesSearch = question.content?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || question.type === filterType;
      const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  }, [questions, searchQuery, filterType, filterDifficulty]);

  // Phân trang 10 câu hỏi/trang
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  // Thống kê tổng quan
  const stats = useMemo(() => {
    const total = questions.length;
    const mcq = questions.filter(q => q.type === 'mcq').length;
    const fillBlank = questions.filter(q => q.type === 'fill_blank' || q.type === 'table_fill').length;
    const matching = questions.filter(q => q.type === 'matching').length;
    return { total, mcq, fillBlank, matching };
  }, [questions]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'mcq':
        return { label: 'Trắc nghiệm', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'fill_blank':
        return { label: 'Điền khuyết', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'matching':
        return { label: 'Nối dòng', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'table_fill':
        return { label: 'Điền bảng', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      default:
        return { label: type || 'Câu hỏi', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return { label: 'Dễ', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      case 'hard':
        return { label: 'Khó', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'medium':
        return { label: 'Trung bình', bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
      default:
        return { label: difficulty || '-', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
    }
  };

  return (
    <AdminLayout title="Quản lý câu hỏi hệ thống">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', boxSizing: 'border-box' }}>
        
        {/* ==================== TẦNG 1: HEADER & NÚT TẠO MỚI ==================== */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Hệ thống SmartEdu
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
              Ngân hàng câu hỏi hệ thống
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Kho dữ liệu câu hỏi dùng chung toàn hệ thống, phục vụ giáo viên biên soạn đề thi và bài ôn tập.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Làm mới danh sách"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <FiRefreshCw style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Đang tải...' : 'Làm mới'}
            </button>

            <button
              onClick={() => navigate('/admin/questions/create')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#059669',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#059669'; }}
            >
              <FiPlus size={18} />
              Tạo câu hỏi mới
            </button>
          </div>
        </div>

        {/* ==================== TẦNG 2: 4 THẺ THỐNG KÊ (STAT CARDS) ==================== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Card 1: Tổng số câu hỏi */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiDatabase />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Tổng câu hỏi hệ thống</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                {stats.total} <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>câu</span>
              </div>
            </div>
          </div>

          {/* Card 2: Trắc nghiệm (MCQ) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiCheckSquare />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Trắc nghiệm (MCQ)</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#2563eb', lineHeight: 1.1 }}>
                {stats.mcq} <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>câu</span>
              </div>
            </div>
          </div>

          {/* Card 3: Điền từ & Điền bảng */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiEdit3 />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Điền khuyết / Điền bảng</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#7c3aed', lineHeight: 1.1 }}>
                {stats.fillBlank} <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>câu</span>
              </div>
            </div>
          </div>

          {/* Card 4: Nối dòng & Khác */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              <FiLayers />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Nối dòng / Dạng khác</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#d97706', lineHeight: 1.1 }}>
                {stats.matching} <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>câu</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== TẦNG 3: TOOLBAR TÌM KIẾM & BỘ LỌC ==================== */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          {/* Ô tìm kiếm */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '450px' }}>
            <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo nội dung câu hỏi..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Cụm bộ lọc */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Lọc loại câu hỏi */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Loại:</span>
              <select
                value={filterType}
                onChange={handleTypeChange}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tất cả loại câu hỏi</option>
                <option value="mcq">Trắc nghiệm</option>
                <option value="fill_blank">Điền khuyết</option>
                <option value="matching">Nối dòng</option>
                <option value="table_fill">Điền bảng</option>
              </select>
            </div>

            {/* Lọc độ khó */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Độ khó:</span>
              <select
                value={filterDifficulty}
                onChange={handleDifficultyChange}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tất cả độ khó</option>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================== TẦNG 4: BẢNG DỮ LIỆU CÂU HỎI & PHÂN TRANG ==================== */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                display: 'inline-block',
                width: '36px',
                height: '36px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#059669',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '14px', color: '#64748b', fontSize: '14px' }}>Đang tải danh sách câu hỏi hệ thống...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                margin: '0 auto 16px auto'
              }}>
                <FiFileText />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                {questions.length === 0 ? 'Chưa có câu hỏi hệ thống nào' : 'Không tìm thấy câu hỏi phù hợp'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                {questions.length === 0 
                  ? 'Bắt đầu tạo câu hỏi đầu tiên vào ngân hàng câu hỏi dùng chung.'
                  : 'Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc loại câu hỏi/độ khó.'
                }
              </p>
              {questions.length === 0 && (
                <button
                  onClick={() => navigate('/admin/questions/create')}
                  style={{
                    padding: '8px 18px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Tạo câu hỏi đầu tiên
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '80px' }}>
                        Mã ID
                      </th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Nội dung câu hỏi
                      </th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '140px' }}>
                        Loại
                      </th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', width: '120px' }}>
                        Độ khó
                      </th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', width: '120px' }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQuestions.map((question) => {
                      const typeBadge = getTypeBadge(question.type);
                      const diffBadge = getDifficultyBadge(question.difficulty);

                      return (
                        <tr
                          key={question.id}
                          style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                        >
                          {/* Mã ID */}
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: '700',
                              fontSize: '12px',
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              #{question.id}
                            </span>
                          </td>

                          {/* Nội dung câu hỏi */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{
                              fontWeight: '600',
                              color: '#0f172a',
                              fontSize: '14px',
                              lineHeight: '1.5',
                              maxWidth: '520px',
                              wordBreak: 'break-word'
                            }}>
                              {question.content}
                            </div>
                            {question.subject?.name && (
                              <div style={{ marginTop: '4px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: '#2563eb',
                                  backgroundColor: '#eff6ff',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {question.subject.name}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Loại câu hỏi */}
                          <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: typeBadge.bg,
                              color: typeBadge.color,
                              border: `1px solid ${typeBadge.border}`
                            }}>
                              {typeBadge.label}
                            </span>
                          </td>

                          {/* Độ khó */}
                          <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: diffBadge.bg,
                              color: diffBadge.color,
                              border: `1px solid ${diffBadge.border}`
                            }}>
                              {diffBadge.label}
                            </span>
                          </td>

                          {/* Cụm thao tác */}
                          <td style={{ padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/questions/${question.id}/edit`)}
                                title="Chỉnh sửa câu hỏi"
                                style={{
                                  padding: '8px',
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '8px',
                                  color: '#334155',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                              >
                                <FiEdit2 size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingQuestion(question)}
                                title="Xóa câu hỏi"
                                style={{
                                  padding: '8px',
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '8px',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                              >
                                <FiTrash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* THANH PHÂN TRANG (10 câu hỏi / trang) */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredQuestions.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => setCurrentPage(page)}
                themeColor="emerald"
              />
            </>
          )}
        </div>

        {/* ==================== MODAL XÁC NHẬN XÓA CÂU HỎI ==================== */}
        {deletingQuestion && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                margin: '0 auto 16px auto'
              }}>
                <FiTrash2 />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                Xác nhận xóa câu hỏi hệ thống?
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                Bạn có chắc chắn muốn xóa câu hỏi <strong style={{ color: '#0f172a' }}>"#{deletingQuestion.id} - {deletingQuestion.content?.slice(0, 50)}..."</strong> không? Hành động này không thể hoàn tác.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setDeletingQuestion(null)}
                  style={{
                    flex: 1,
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: deleteLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminQuestionListPage;