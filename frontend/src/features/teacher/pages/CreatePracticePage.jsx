import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSearch, FiArrowLeft, FiSave, FiBookOpen, FiCheckSquare, FiSquare } from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import { practiceApi } from '../../../api/practiceApi';
import { questionApi } from '../../../api/questionApi';
import { subjectApi } from '../../../api/subjectApi';
import { classApi } from '../../../api/classApi';

export function CreatePracticePage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();
  const isEditing = !!practiceId;

  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    class_ids: [],
    description: '',
    question_ids: [],
  });

  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [practiceId]);

  const fetchData = async () => {
    try {
      const [questionsRes, subjectsRes, classesRes] = await Promise.all([
        questionApi.getClassQuestions({ per_page: 1000 }),
        subjectApi.getSubjects(),
        classApi.getClasses(),
      ]);

      setAvailableQuestions(questionsRes.data || questionsRes || []);
      setSubjects(subjectsRes.data || subjectsRes || []);
      const classesData = classesRes?.data || classesRes;
      setClasses(Array.isArray(classesData) ? classesData : []);

      if (isEditing) {
        const practiceRes = await practiceApi.getPracticeDetails(practiceId);

        console.log('PRACTICE DATA:', practiceRes.data);

        const practice = practiceRes.data;
        
        setFormData({
          title: practice.title || '',
          subject_id: practice.subject_id?.toString() || '',
          class_ids: practice.class_ids || [],
          description: practice.description || '',
          question_ids: practice.question_ids || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleToggleQuestion = (questionId) => {
    setFormData((prev) => {
      const newIds = prev.question_ids.includes(questionId)
        ? prev.question_ids.filter(id => id !== questionId)
        : [...prev.question_ids, questionId];
      
      return { ...prev, question_ids: newIds };
    });
  };

  const toggleClass = (classId) => {
    setFormData(prev => {
      const newClassIds = prev.class_ids.includes(classId)
        ? prev.class_ids.filter(id => id !== classId)
        : [...prev.class_ids, classId];
  
      return {
        ...prev,
        class_ids: newClassIds,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài ôn tập.');
      return;
    }

    if (!formData.subject_id) {
      alert('Vui lòng chọn môn học.');
      return;
    }

    try {
      setSaving(true);
      const submitData = {
        title: formData.title.trim(),
        subject_id: formData.subject_id ? parseInt(formData.subject_id, 10) : null,
        class_ids: Array.isArray(formData.class_ids) ? formData.class_ids.map(id => Number(id)) : [],
        description: formData.description?.trim() || null,
        question_ids: Array.isArray(formData.question_ids) ? formData.question_ids : [],
      };

      if (isEditing) {
        await practiceApi.updatePractice(practiceId, submitData);
      } else {
        await practiceApi.createPractice(submitData);
      }

      navigate('/teacher/practice');
    } catch (error) {
      console.error('Failed to save practice:', error);
      const message = error.response?.data?.message
        || (error.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(', ') : 'Lưu thất bại. Vui lòng thử lại.');
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = availableQuestions.filter(q => {
    const subjectMatches = !formData.subject_id || q.subject?.id?.toString() === formData.subject_id.toString();
    const searchMatches = q.content?.toLowerCase().includes(searchQuery.toLowerCase()) || q.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return subjectMatches && searchMatches;
  });

  const getQuestionTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'mcq':
        return { label: 'Trắc nghiệm', class: 'bg-blue-50 text-blue-700 border-blue-100' };
      case 'fill_blank':
        return { label: 'Điền từ', class: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'matching':
        return { label: 'Nối đáp án', class: 'bg-purple-50 text-purple-700 border-purple-100' };
      default:
        return { label: 'Tự luận', class: 'bg-slate-50 text-slate-700 border-slate-100' };
    }
  };

  if (loading) {
    return (
      <TeacherLayout pageTitle="Đang tải...">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-slate-500 font-medium text-sm">Đang nạp dữ liệu...</p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout pageTitle={isEditing ? "Chỉnh sửa bài ôn tập" : "Tạo bài ôn tập mới"}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', padding: '0 16px 64px 16px', boxSizing: 'border-box' }}>
        
        {/* HEADER ACTION BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
              {isEditing ? 'Chỉnh sửa bài ôn tập' : 'Tạo bài ôn tập mới'}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#94a3b8' }}>
              Thiết lập thông tin và chọn câu hỏi cho bài ôn tập.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/teacher/practice')}
              style={{ height: '40px', backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '12px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px' }}
            >
              <FiArrowLeft /> Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ height: '40px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', opacity: saving ? 0.5 : 1, shadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              <FiSave /> {saving ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo bài ôn tập')}
            </button>
          </div>
        </div>

        {/* THÔNG TIN CƠ BẢN */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <span style={{ width: '4px', height: '16px', backgroundColor: '#059669', borderRadius: '4px', display: 'inline-block' }}></span>
            Thông tin bài ôn tập
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tiêu đề */}
            <div>
              <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>Tiêu đề bài ôn tập *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="VD: Ôn tập Toán lớp 2 - Chương 1"
                style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Môn học */}
            <div>
              <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>Môn học *</label>
              <select
                name="subject_id"
                required
                value={formData.subject_id}
                onChange={handleInputChange}
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', padding: '10px 16px', boxSizing: 'border-box' }}
              >
                <option value="">Chọn môn học</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <div>
                <label
                  style={{
                    display: "block",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#64748b",
                    letterSpacing: "0.05em",
                    marginBottom: "6px",
                  }}
                >
                  Lớp áp dụng
                </label>
                {classes.map((cls) => (
                  <label key={cls.id}>
                    <input
                      type="checkbox"
                      checked={(formData.class_ids || []).includes(cls.id)}
                      onChange={() => toggleClass(cls.id)}
                    />
                    {cls.name}
                  </label>
                ))}
              </div>

            {/* Mô tả */}
            <div>
              <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>Mô tả (tùy chọn)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Nhập mô tả ngắn về bài ôn tập..."
                style={{ width: '100%', padding: '10px 16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* DANH SÁCH CÂU HỎI */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '16px', backgroundColor: '#059669', borderRadius: '4px', display: 'inline-block' }}></span>
              Chọn câu hỏi
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 10px', borderRadius: '99px', marginLeft: '6px' }}>
                Đã chọn {formData.question_ids.length} câu
              </span>
            </h2>
            
            {/* Input tìm kiếm */}
            <div style={{ position: 'relative', width: '280px', flex: 'none' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8', fontSize: '14px' }} />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/teacher/questions/create')}
              style={{ height: '36px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 14px', flexShrink: 0, boxShadow: '0 1px 3px rgba(5,150,105,0.3)' }}
            >
              <FiPlus /> Thêm câu hỏi
            </button>
          </div>

          {/* Danh sách câu hỏi */}
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => {
                const isSelected = formData.question_ids.includes(question.id);
                const badge = getQuestionTypeBadge(question.type);
                return (
                  <div
                    key={question.id}
                    onClick={() => handleToggleQuestion(question.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid #a7f3d0' : '1px solid #f1f5f9',
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: '1', minWidth: '0' }}>
                      <div style={{ fontSize: '20px', marginTop: '2px', display: 'flex', flexShrink: 0 }}>
                        {isSelected ? <FiCheckSquare style={{ color: '#059669' }} /> : <FiSquare style={{ color: '#cbd5e1' }} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge.class}`} style={{ display: 'inline-block' }}>
                            {badge.label}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                            {question.subject?.name || 'Môn học'}
                          </span>
                        </div>
                        <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#334155', lineHeight: '1.5', wordBreak: 'break-word' }}>
                          {question.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 16px', border: '1px dashed #e2e8f0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
                <FiBookOpen style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '8px' }} />
                <p style={{ margin: '0', fontSize: '13px', color: '#94a3b8' }}>Không tìm thấy câu hỏi phù hợp.</p>
              </div>
            )}
          </div>
        </div>

      </form>
    </TeacherLayout>
  );
}

export default CreatePracticePage;
