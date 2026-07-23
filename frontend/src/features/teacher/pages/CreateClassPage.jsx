import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import classApi from '../../../api/classApi';

const CreateClassPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    class_code: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      const response = await classApi.createClass(formData);
      if (response.success || response) {
        alert('Tạo lớp học mới thành công!');
        navigate('/teacher/classes');
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      alert(error.response?.data?.message || 'Không thể tạo lớp học');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TeacherLayout pageTitle="Tạo lớp mới">
      {/* Container căn giữa trang */}
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

        {/* Khung Form trắng bao quanh */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', textAlign: 'left' }}>
          
          {/* Header của form */}
          <div style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '16px 24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0' }}>Tạo lớp học mới</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Thiết lập thông tin cơ bản cho lớp học của bạn</p>
          </div>

          {/* Nội dung Form nhập liệu */}
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
                onChange={(e) => setFormData({ ...formData, class_code: e.target.value })}
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
                  display: 'block'
                }}
              />
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '8px 0 0 0', leadingHeight: '1.5' }}>
                Mã lớp được sử dụng để học sinh tham gia lớp. Để trống để tự động tạo mã ngẫu nhiên.
              </p>
            </div>

            {/* Mô tả */}
            <div style={{ display: 'block', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả về lớp học (tùy chọn)"
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

            {/* Thanh điều hướng nút bấm bằng cấu trúc Table chống sập */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', background: 'transparent', margin: '0', padding: '0' }}>
                <tbody>
                  <tr>
                    <td style={{ border: 'none', padding: '0' }}></td>
                    <td style={{ border: 'none', padding: '0', width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      
                      {/* Nút Hủy */}
                      <button
                        type="button"
                        onClick={() => navigate('/teacher/classes')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '0 20px',
                          height: '40px',
                          marginRight: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          backgroundColor: '#ffffff',
                          color: '#374151',
                          fontWeight: '500',
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          float: 'none',
                          verticalAlign: 'middle'
                        }}
                      >
                        <FiX size={16} /> Hủy
                      </button>

                      {/* Nút Tạo Lớp */}
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '0 24px',
                          height: '40px',
                          border: 'none',
                          borderRadius: '8px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontWeight: '500',
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          float: 'none',
                          verticalAlign: 'middle',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <FiSave size={16} /> {submitting ? 'Đang tạo...' : 'Tạo lớp'}
                      </button>

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </form>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateClassPage;