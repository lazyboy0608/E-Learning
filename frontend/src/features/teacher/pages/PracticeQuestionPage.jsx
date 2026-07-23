import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import TeacherLayout from '../../../components/teacher/TeacherLayout';
import MatchingBuilder from '../../../components/teacher/questions/MatchingBuilder';
import questionApi from '../../../api/questionApi';
import subjectApi from '../../../api/subjectApi';
import { practiceApi } from '../../../api/practiceApi';

const PracticeQuestionPage = () => {
  const { practiceId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!practiceId;

  // State cho Fill Blank - quan ly cac o trong
  const [blankAnswers, setBlankAnswers] = useState({});
  const contentRef = useRef(null);

  const [formData, setFormData] = useState({
    subject_id: '',
    type: 'mcq',
    content: '',
    explanation: '',
    difficulty: 'medium',
    options: ['', '', '', ''],
    correct_answers: [],
    matching_data: { left: ['', ''], right: ['', ''], correct_matches: {} },
    table_data: {
      headers: ['Tiêu đề 1', 'Tiêu đề 2'],
      rows: [['', '']]
    },
  });
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const resp = await subjectApi.getSubjects();
      if (resp && resp.success) {
        setSubjects(resp.data);
      }
    } catch (err) {
      console.error('Không lấy được danh sách môn học:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const toggleCorrectAnswer = (optionId) => {
    setFormData(prev => {
      const current = prev.correct_answers || [];
      const newCorrect = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      return { ...prev, correct_answers: newCorrect };
    });
  };

  // --- Logic cho Matching voi MatchingBuilder ---
  const handleMatchingDataChange = (newData) => {
    setFormData(prev => ({
      ...prev,
      matching_data: newData,
    }));
  };

  // --- Logic cho Fill Blank - chen o trong vao de bai ---
  const insertBlank = () => {
    const blankCount = (formData.content.match(/__BLANK_\d+__/g) || []).length;
    const placeholder = `__BLANK_${blankCount}__`;
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = formData.content.substring(0, start);
      const after = formData.content.substring(end);
      const newContent = before + placeholder + after;
      setFormData(prev => ({ ...prev, content: newContent }));
      setBlankAnswers(prev => ({ ...prev, [blankCount]: '' }));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    } else {
      setFormData(prev => ({ ...prev, content: prev.content + placeholder }));
      setBlankAnswers(prev => ({ ...prev, [blankCount]: '' }));
    }
  };

  const handleBlankAnswerChange = (index, value) => {
    setBlankAnswers(prev => ({ ...prev, [index]: value }));
  };

  const getBlankCount = () => (formData.content.match(/__BLANK_\d+__/g) || []).length;

  const renderContentWithBlanks = () => {
    const blankCount = getBlankCount();
    if (blankCount === 0) return null;

    return (
      <div className="question-blanks-panel">
        <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '10px', fontWeight: 600 }}>
          Nhập đáp án cho từng ô trống (theo thứ tự xuất hiện từ trái sang phải):
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: blankCount }, (_, i) => (
            <div key={i} className="question-blank-row">
              <span className="question-blank-index">{i + 1}</span>
              <input
                type="text"
                value={blankAnswers[i] || ''}
                onChange={(e) => handleBlankAnswerChange(i, e.target.value)}
                placeholder={`Đáp án ô ${i + 1}`}
                className="question-blank-input"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- Logic động cho câu hỏi Điền bảng (Table Fill) ---
  const handleHeaderChange = (index, value) => {
    const newHeaders = [...formData.table_data.headers];
    newHeaders[index] = value;
    setFormData({
      ...formData,
      table_data: { ...formData.table_data, headers: newHeaders }
    });
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newRows = [...formData.table_data.rows];
    newRows[rowIndex][colIndex] = value;
    setFormData({
      ...formData,
      table_data: { ...formData.table_data, rows: newRows }
    });
  };

  const addTableColumn = () => {
    const newHeaders = [...formData.table_data.headers, `Tiêu đề ${formData.table_data.headers.length + 1}`];
    const newRows = formData.table_data.rows.map(row => [...row, '']);
    setFormData({
      ...formData,
      table_data: { headers: newHeaders, rows: newRows }
    });
  };

  const addTableRow = () => {
    const emptyRow = Array(formData.table_data.headers.length).fill('');
    setFormData({
      ...formData,
      table_data: { ...formData.table_data, rows: [...formData.table_data.rows, emptyRow] }
    });
  };

  const removeTableRow = (rowIndex) => {
    const newRows = formData.table_data.rows.filter((_, i) => i !== rowIndex);
    setFormData({
      ...formData,
      table_data: { ...formData.table_data, rows: newRows }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Kiểm tra nhanh các trường bắt buộc ở Frontend
    if (!formData.subject_id) {
      setError('Vui lòng lựa chọn Môn học / Lớp học cho câu hỏi này.');
      return;
    }

    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung đề bài câu hỏi.');
      return;
    }

    if (formData.type === 'mcq' && formData.options.some(o => !o.trim())) {
      setError('Vui lòng nhập đầy đủ nội dung cho cả 4 đáp án lựa chọn.');
      return;
    }

    if (formData.type === 'mcq' && (!formData.correct_answers || formData.correct_answers.length === 0)) {
      setError('Vui lòng chọn ít nhất một đáp án đúng.');
      return;
    }

    if (formData.type === 'matching') {
      const { left, right, correct_matches } = formData.matching_data;
      if (left.some(l => !l.trim()) || right.some(r => !r.trim())) {
        setError('Vui lòng nhập đầy đủ nội dung các cặp ghép nối.');
        return;
      }
      if (Object.keys(correct_matches).length !== left.length) {
        setError('Vui lòng nối đủ tất cả các cặp ghép.');
        return;
      }
    }

    if (formData.type === 'fill_blank') {
      const blankCount = getBlankCount();
      if (blankCount === 0) {
        setError('Vui lòng thêm ít nhất một ô trống vào đề bài bằng nút "Chèn ô trống".');
        return;
      }
      const unfilled = Array.from({ length: blankCount }, (_, i) => i)
        .filter(i => !blankAnswers[i]?.trim());
      if (unfilled.length > 0) {
        setError(`Vui lòng nhập đáp án cho tất cả các ô trống (thiếu ${unfilled.length} ô).`);
        return;
      }
    }

    setLoading(true);

    try {
      // 2. Tự động đóng gói object 'data' tương ứng với từng loại câu hỏi
      let questionDataStructure = {};

      if (formData.type === 'mcq') {
        questionDataStructure = {
          options: formData.options.map((option, index) => ({
            id: String.fromCharCode(97 + index),
            text: option,
          })),
          correct_answer: formData.correct_answers?.[0] || '',
        };
      } else if (formData.type === 'fill_blank') {
        const blankCount = getBlankCount();
        const answers = Array.from({ length: blankCount }, (_, i) => blankAnswers[i] || '');
        questionDataStructure = {
          correct_answers: answers,
        };
      } else if (formData.type === 'matching') {
        questionDataStructure = {
          left: formData.matching_data.left,
          right: formData.matching_data.right,
          correct_matches: formData.matching_data.correct_matches,
        };
      } else if (formData.type === 'table_fill') {
        questionDataStructure = {
          headers: formData.table_data.headers,
          rows: formData.table_data.rows,
          cols: formData.table_data.headers.length,
        };
      }

      // 3. Gom tất cả thành Payload hoàn chỉnh chuẩn Laravel yêu cầu
      const payload = {
        subject_id: Number(formData.subject_id),
        type: formData.type,
        content: formData.content,
        explanation: formData.explanation,
        difficulty: formData.difficulty || 'medium',
        data: questionDataStructure
      };

      // 4. Gọi API để tạo câu hỏi
      await questionApi.createClassQuestion(payload);
      alert('Tạo câu hỏi học tập mới thành công!');
      
      // Reset form sau khi tạo thành công
      setFormData({
        subject_id: formData.subject_id,
        type: 'mcq',
        content: '',
        explanation: '',
        difficulty: 'medium',
        options: ['', '', '', ''],
        correct_answers: [],
        matching_data: { left: ['', ''], right: ['', ''], correct_matches: {} },
        table_data: {
          headers: ['Tiêu đề 1', 'Tiêu đề 2'],
          rows: [['', '']]
        },
      });
      setBlankAnswers({});
      
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình kết nối và lưu dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER GIAO DIỆN CÁC LOẠI CÂU HỎI ---

  const renderMcqFields = () => (
    <div className="question-answer-card blue">
      <div className="question-answer-title">Các lựa chọn đáp án</div>
      <div className="question-answer-hint">Tích chọn tất cả đáp án đúng (cho phép chọn nhiều)</div>
      {formData.options.map((option, index) => {
        const optionId = String.fromCharCode(97 + index);
        const isCorrect = formData.correct_answers?.includes(optionId);
        return (
          <div key={index} className="question-option-row">
            <input
              type="checkbox"
              id={`mcq-opt-${index}`}
              checked={isCorrect || false}
              onChange={() => toggleCorrectAnswer(optionId)}
              className="question-option-check"
            />
            <span className={`question-option-badge${isCorrect ? ' correct' : ''}`}>
              {optionId.toUpperCase()}
            </span>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Nội dung lựa chọn ${index + 1}`}
              className="question-option-input"
              required
            />
          </div>
        );
      })}
      <div className="question-option-note">
        Tích chọn ô vuông bên trái để xác định đáp án đúng. Có thể chọn nhiều hơn một đáp án.
      </div>
    </div>
  );

  const renderFillBlankFields = () => (
    <div className="question-answer-card amber">
      <div className="question-answer-title">Hướng dẫn điền từ</div>
      <div className="question-answer-hint">
        Nhấn nút &quot;Chèn ô trống&quot; phía trên để thêm ô điền đáp án vào đề bài. Mỗi ô trống cần nhập đáp án bên dưới theo thứ tự xuất hiện.
      </div>
      {renderContentWithBlanks()}
    </div>
  );

  const renderMatchingFields = () => (
    <div className="question-answer-card purple">
      <MatchingBuilder
        data={formData.matching_data}
        onChange={handleMatchingDataChange}
        onSave={(data) => { handleMatchingDataChange(data); }}
        onCancel={() => {
          handleMatchingDataChange({ left: ['', ''], right: ['', ''], correct_matches: {} });
        }}
      />
    </div>
  );

  const renderTableFillFields = () => (
    <div className="question-answer-card">
      <div className="question-answer-title">Dữ liệu bảng</div>
      <div className="question-answer-hint">Nhấn &quot;Thêm Cột&quot; hoặc &quot;Thêm Hàng&quot; để mở rộng bảng. Nhấn &quot;x&quot; để xóa một hàng.</div>
      <div style={{ overflowX: 'auto', marginTop: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {formData.table_data.headers.map((header, i) => (
                <th key={i} style={{ border: '1px solid #e2e8f0', padding: '8px', textAlign: 'center' }}>
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => handleHeaderChange(i, e.target.value)}
                    style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none', fontWeight: '600', fontSize: '13px' }}
                  />
                </th>
              ))}
              <th style={{ border: '1px solid #e2e8f0', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {formData.table_data.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} style={{ border: '1px solid #e2e8f0', padding: '4px' }}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      placeholder="..."
                      style={{ width: '100%', padding: '6px 8px', border: 'none', outline: 'none', fontSize: '13px' }}
                    />
                  </td>
                ))}
                <td style={{ border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  {formData.table_data.rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTableRow(rowIndex)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}
                    >
                      x
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button type="button" onClick={addTableColumn} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#4b5563', fontWeight: '500' }}>+ Thêm Cột</button>
          <button type="button" onClick={addTableRow} style={{ padding: '6px 12px', backgroundColor: '#0084ff', border: '1px solid #0084ff', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>+ Thêm Hàng</button>
        </div>
      </div>
    </div>
  );

  return (
    <TeacherLayout pageTitle="Thêm câu hỏi ôn tập">
      <div className="question-page-wrapper">
        <button
          onClick={() => navigate('/teacher/practice')}
          className="question-back-btn"
        >
          <FiArrowLeft /> Quay lại danh sách bài ôn tập
        </button>

        <div className="question-form-card">
          <h2 className="question-form-title">
            Thêm câu hỏi vào bài ôn tập
          </h2>

          {error && (
            <div className="question-error">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="question-field">
              <label className="question-label">Môn học / Lớp phụ trách</label>
              <select
                value={formData.subject_id}
                onChange={(e) => handleChange('subject_id', e.target.value)}
                className="question-select"
                required
              >
                <option value="">-- Chọn môn học ứng với câu hỏi --</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div className="question-row">
              <div className="question-field" style={{ marginBottom: 0 }}>
                <label className="question-label">Loại hình câu hỏi</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="question-select"
                >
                  <option value="mcq">Trắc nghiệm nhiều lựa chọn</option>
                  <option value="fill_blank">Điền từ vào chỗ trống</option>
                  <option value="matching">Ghép nối vế (Nối dòng)</option>
                  <option value="table_fill">Điền thông tin vào ô bảng</option>
                </select>
              </div>
              <div className="question-field" style={{ marginBottom: 0 }}>
                <label className="question-label">Độ khó câu hỏi</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="question-select"
                >
                  <option value="easy">Dễ (Nhận biết)</option>
                  <option value="medium">Trung bình (Thông hiểu)</option>
                  <option value="hard">Khó (Vận dụng nâng cao)</option>
                </select>
              </div>
            </div>

            <div className="question-field">
              <label className="question-label">Nội dung đề bài câu hỏi</label>
              {formData.type === 'fill_blank' && (
                <button
                  type="button"
                  onClick={insertBlank}
                  className="question-insert-btn"
                >
                  + Chèn ô trống
                </button>
              )}
              <textarea
                ref={contentRef}
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder={formData.type === 'fill_blank'
                  ? "Nhấn nút 'Chèn ô trống' phía trên để thêm ô điền đáp án..."
                  : "Nhập câu hỏi hoặc yêu cầu đề bài tại đây..."}
                rows={4}
                className="question-textarea"
                required
              />
            </div>

            {formData.type === 'mcq' && renderMcqFields()}
            {formData.type === 'fill_blank' && renderFillBlankFields()}
            {formData.type === 'matching' && renderMatchingFields()}
            {formData.type === 'table_fill' && renderTableFillFields()}

            <div className="question-field">
              <label className="question-label">Lời giải thích chi tiết (Không bắt buộc)</label>
              <textarea
                value={formData.explanation}
                onChange={(e) => handleChange('explanation', e.target.value)}
                placeholder="Nhập lời giải hoặc ghi chú đáp án giúp học sinh hiểu bài sau khi thi xong..."
                rows={3}
                className="question-textarea"
              />
            </div>

            <div className="question-actions">
              <button
                type="button"
                onClick={() => navigate('/teacher/practice')}
                className="question-btn-cancel"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="question-btn-submit"
              >
                {loading ? 'Đang xử lý...' : 'Thêm câu hỏi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default PracticeQuestionPage;
