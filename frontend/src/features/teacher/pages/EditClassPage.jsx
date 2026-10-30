import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiCheckCircle } from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import classApi from '../../../api/classApi';

const EditClassPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    class_code: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchClassDetail();
  }, [classId]);

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await classApi.getClassDetail(classId);
      const classData = response?.data ?? response;
      if (classData) {
        setFormData({
          name: classData.name || '',
          class_code: classData.class_code || '',
          description: classData.description || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch class detail:', error);
      alert('Không thể tải thông tin lớp học. Vui lòng thử lại.');
      navigate('/teacher/classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      const response = await classApi.updateClass(classId, {
        name: formData.name.trim(),
        class_code: formData.class_code ? formData.class_code.trim() : null,
        description: formData.description ? formData.description.trim() : null,
      });

      if (response.success || response) {
        setSuccessMessage('Cập nhật lớp học thành công!');
        setTimeout(() => {
          navigate('/teacher/classes');
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to update class:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật lớp học');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout pageTitle="Chỉnh sửa lớp học">
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '15px' }}>Đang tải thông tin lớp học...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout pageTitle="Chỉnh sửa lớp học">
      {/* Container căn giữa */}
      <div style={{ width: '100%', maxWidth: '720px', margin: '32px auto', padding: '0 16px', boxSizing: 'border-box' }}>
        
        {/* Nút quay lại */}
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <button
            type="button"
            onClick={() => navigate('/teacher/classes')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#4b5563',
              fontWeight: '500',
              fontSize: '14px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '0'
            }}
          >
            <FiArrowLeft /> Quay lại danh sách lớp
          </button>
        </div>

        {/* Thông báo thành công nếu có */}
        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <FiCheckCircle size={18} color="#10b981" /> {successMessage}
          </div>
        )}

        {/* Khung Form trắng bao quanh */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          textAlign: 'left'
        }}>
          
          {/* Header của form */}
          <div style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '18px 24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0' }}>Chỉnh sửa lớp học</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Cập nhật lại thông tin tên lớp, mã lớp hoặc mô tả</p>
          </div>

          {/* Form nhập liệu */}
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'block', margin: '0' }}>
            
            {/* Tên lớp */}
            <div style={{ display: 'block', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                Tên lớp <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Toán Lớp 2A"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 16px',
                  boxSizing: 'border-box',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  display: 'block'
                }}
              />
            </div>

            {/* Mã lớp */}
            <div style={{ display: 'block', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                Mã lớp
              </label>
              <input
                type="text"
                value={formData.class_code}
                onChange={(e) => setFormData({ ...formData, class_code: e.target.value.toUpperCase() })}
                placeholder="VD: LOP2A"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 16px',
                  boxSizing: 'border-box',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  display: 'block',
                  textTransform: 'uppercase'
                }}
              />
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0 0' }}>
                Mã lớp dùng để học sinh tìm kiếm và tham gia lớp.
              </p>
            </div>

            {/* Mô tả */}
            <div style={{ display: 'block', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                Mô tả lớp học
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả tóm tắt về lớp học (tùy chọn)..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  boxSizing: 'border-box',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  resize: 'none',
                  display: 'block',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Nút hành động */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/teacher/classes')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '0 20px',
                    height: '42px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <FiX size={16} /> Hủy
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '0 24px',
                    height: '42px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  <FiSave size={16} /> {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default EditClassPage;

