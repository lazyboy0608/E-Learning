import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiSearch, 
  FiUsers, 
  FiFileText, 
  FiEdit2, 
  FiTrash2, 
  FiCopy, 
  FiArrowRight, 
  FiAlertTriangle,
  FiX,
  FiBookOpen,
  FiCheck
} from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import classApi from '../../../api/classApi';

// Mảng các dải màu gradient giáo dục sinh động cho từng thẻ lớp học
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Xanh dương
  'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Xanh lá ngọc
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Tím thạch anh
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Cam hổ phách
  'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)', // Xanh cyan
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Hồng đào
];

const ClassListPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Modal Xóa Lớp (Hình 1)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State Modal Tham Gia Lớp Bằng Mã
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  // State Copy mã lớp thành công
  const [copiedClassId, setCopiedClassId] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classApi.getClasses();
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
      setDeleteLoading(true);
      await classApi.deleteClass(selectedClass.id);
      setClasses(prev => prev.filter(c => c.id !== selectedClass.id));
      setShowDeleteModal(false);
      setSelectedClass(null);
    } catch (error) {
      console.error('Failed to delete class:', error);
      alert('Xóa lớp thất bại. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCopyCode = (classId, classCode) => {
    if (!classCode) return;
    navigator.clipboard.writeText(classCode);
    setCopiedClassId(classId);
    setTimeout(() => {
      setCopiedClassId(null);
    }, 2000);
  };

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;

    setJoinLoading(true);
    try {
      const response = await classApi.joinClass(joinCode.trim());
      if (response.success || response) {
        alert('Tham gia lớp học thành công!');
        setShowJoinModal(false);
        setJoinCode('');
        fetchClasses();
      } else {
        alert(response.message || 'Tham gia lớp thất bại.');
      }
    } catch (error) {
      console.error('Failed to join class:', error);
      alert(error.response?.data?.message || 'Không thể tham gia lớp học. Kiểm tra lại mã lớp.');
    } finally {
      setJoinLoading(false);
    }
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.class_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TeacherLayout pageTitle="Quản lý lớp học">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 8px' }}>
        
        {/* Header Thanh Công Cụ (Toolbar) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #f1f5f9'
        }}>
          {/* Ô tìm kiếm */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <FiSearch style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '18px'
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên lớp, mã lớp..."
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '42px',
                paddingRight: '16px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Các nút Thao tác */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowJoinModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 18px',
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <FiPlus size={16} />
              Tham gia lớp
            </button>

            <button
              onClick={handleCreateClass}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px',
                padding: '0 20px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FiPlus size={18} />
              Tạo lớp mới
            </button>
          </div>
        </div>

        {/* Trạng thái Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '16px', color: '#64748b', fontSize: '15px' }}>Đang tải danh sách lớp học...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredClasses.length === 0 ? (
          /* Trạng thái Trống (Empty State) */
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              backgroundColor: '#eff6ff',
              color: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '32px'
            }}>
              <FiBookOpen />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
              {searchQuery ? 'Không tìm thấy lớp học phù hợp' : 'Bạn chưa quản lý lớp học nào'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
              {searchQuery 
                ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách.' 
                : 'Bắt đầu tạo lớp học đầu tiên để quản lý học sinh, giao bài tập và tài liệu giảng dạy.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateClass}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  background: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <FiPlus size={16} /> Tạo lớp học đầu tiên
              </button>
            )}
          </div>
        ) : (
          /* Danh sách Lớp Học - Grid Cards Hiện Đại */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '24px'
          }}>
            {filteredClasses.map((classItem, index) => {
              const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
              const studentCount = classItem.students?.length ?? classItem.students_count ?? (classItem.users?.filter(u => u.pivot?.role === 'student' || u.role === 'student')?.length ?? 0);
              const materialCount = classItem.materials?.length || classItem.documents?.length || 0;
              const isCopied = copiedClassId === classItem.id;

              return (
                <div
                  key={classItem.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                  }}
                >
                  {/* Dải Banner Màu Gradient Đầu Card */}
                  <div style={{
                    background: gradient,
                    height: '80px',
                    position: 'relative',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                  }}>
                    {/* Badge Mã Lớp */}
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>MÃ: {classItem.class_code || '---'}</span>
                      {classItem.class_code && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(classItem.id, classItem.class_code);
                          }}
                          title="Sao chép mã lớp"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                        >
                          {isCopied ? <FiCheck size={14} color="#a7f3d0" /> : <FiCopy size={13} />}
                        </button>
                      )}
                    </div>

                    {isCopied && (
                      <span style={{
                        position: 'absolute',
                        right: '16px',
                        top: '16px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}>
                        Đã copy!
                      </span>
                    )}
                  </div>

                  {/* Thân Card */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Tên Lớp */}
                    <h3
                      onClick={() => handleViewClass(classItem.id)}
                      title={classItem.name}
                      style={{
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#0f172a',
                        cursor: 'pointer',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#0f172a'}
                    >
                      {classItem.name}
                    </h3>

                    {/* Mô tả lớp (nếu có) */}
                    <p style={{
                      margin: '0 0 16px 0',
                      fontSize: '13px',
                      color: '#64748b',
                      lineHeight: '1.5',
                      minHeight: '38px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {classItem.description || 'Chưa có mô tả cho lớp học này.'}
                    </p>

                    {/* Badge Chỉ Số (Thành viên & Tài liệu) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      border: '1px solid #f1f5f9'
                    }}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#e0f2fe',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px'
                        }}>
                          <FiUsers />
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Học sinh</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                            {studentCount}
                          </div>
                        </div>
                      </div>

                      <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px'
                        }}>
                          <FiFileText />
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Tài liệu</div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                            {materialCount}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => handleViewClass(classItem.id)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          height: '38px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                          e.currentTarget.style.color = '#2563eb';
                        }}
                      >
                        Vào lớp <FiArrowRight size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditClass(classItem.id)}
                        title="Chỉnh sửa thông tin lớp"
                        style={{
                          width: '38px',
                          height: '38px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#ffffff',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.color = '#2563eb';
                          e.currentTarget.style.borderColor = '#93c5fd';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.color = '#475569';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                      >
                        <FiEdit2 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(classItem)}
                        title="Xóa lớp học"
                        style={{
                          width: '38px',
                          height: '38px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#ffffff',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#fecaca';
                        }}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================
            MODAL XÁC NHẬN XÓA LỚP HỌC (Hình 1 - Khắc phục lớp phủ đen)
            ======================================================== */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.45)', // Làm mờ nhẹ nền, không bị đen kịt
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #f1f5f9',
              textAlign: 'center',
              animation: 'modalSlideIn 0.25s ease-out'
            }}>
              {/* Icon cảnh báo tròn đỏ nổi bật */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                fontSize: '26px'
              }}>
                <FiAlertTriangle />
              </div>

              {/* Tiêu đề & Nội dung */}
              <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' }}>
                Xác nhận xóa lớp học?
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                Bạn có chắc chắn muốn xóa lớp <strong style={{ color: '#0f172a' }}>"{selectedClass?.name}"</strong>? Toàn bộ danh sách học sinh và tài liệu liên kết sẽ bị gỡ bỏ. Hành động này không thể hoàn tác.
              </p>

              {/* Nhóm nút Hủy & Xác nhận xóa */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                    transition: 'all 0.2s',
                    opacity: deleteLoading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                >
                  {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL THAM GIA LỚP BẰNG MÃ (Đồng bộ phong cách hiện đại)
            ======================================================== */}
        {showJoinModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #f1f5f9',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Tham gia lớp học
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <FiX size={18} />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                Nhập mã phòng học (do giáo viên hoặc quản trị viên cung cấp) để tham gia giảng dạy hoặc quản lý lớp.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Mã lớp học <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="VD: TOAN12A hoặc ABC123"
                  maxLength={20}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    boxSizing: 'border-box',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                  }}
                  style={{
                    padding: '0 16px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleJoinClass}
                  disabled={!joinCode.trim() || joinLoading}
                  style={{
                    padding: '0 20px',
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    opacity: (!joinCode.trim() || joinLoading) ? 0.6 : 1
                  }}
                >
                  {joinLoading ? 'Đang kiểm tra...' : 'Tham gia'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};

export default ClassListPage;
