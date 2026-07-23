import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../components/admin/AdminLayout';
import MatchingBuilder from '../../../components/teacher/questions/MatchingBuilder';
import subjectApi from '../../../api/subjectApi';
import questionApi from '../../../api/questionApi';

const AdminEditQuestionPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [blankAnswers, setBlankAnswers] = React.useState({});

  const [formData, setFormData] = React.useState({
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

  const [subjects, setSubjects] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleBack = () => {
    navigate('/admin/questions');
  };

  React.useEffect(() => {
    fetchSubjects();
    fetchQuestion();
  }, [questionId]);

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

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await questionApi.getQuestion(questionId);

      if (response && response.success) {
        const qData = response.data;
        setFormData({
          subject_id: qData.subject_id?.toString() || '',
          type: qData.type || 'mcq',
          content: qData.content || '',
          explanation: qData.explanation || '',
          difficulty: qData.difficulty || 'medium',
          options: qData.data?.options?.map((opt) => opt.text) || ['', '', '', ''],
          correct_answers: qData.data?.correct_answers || (qData.data?.correct_answer ? [qData.data.correct_answer] : []),
          matching_data: qData.data?.left && qData.data?.right
            ? { left: qData.data.left, right: qData.data.right, correct_matches: qData.data.correct_matches || {} }
            : { left: ['', ''], right: ['', ''], correct_matches: {} },
          table_data: qData.data?.headers && qData.data?.rows
            ? { headers: qData.data.headers, rows: qData.data.rows }
            : (qData.data?.table_data || { headers: ['Tiêu đề 1', 'Tiêu đề 2'], rows: [['', '']] }),
        });

        if (qData.type === 'fill_blank' && Array.isArray(qData.data?.correct_answers)) {
          const mapped = {};
          qData.data.correct_answers.forEach((ans, i) => { mapped[i] = ans; });
          setBlankAnswers(mapped);
        }
      }
    } catch (err) {
      setError('Không thể tải thông tin câu hỏi.');
    } finally {
      setLoading(false);
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

  const addOption = () => {
    setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    const removedId = String.fromCharCode(97 + index);
    const newCorrect = (formData.correct_answers || []).filter(id => id !== removedId);
    setFormData({ ...formData, options: newOptions, correct_answers: newCorrect });
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

  const handleMatchingDataChange = (newData) => {
    setFormData(prev => ({ ...prev, matching_data: newData }));
  };

  const getBlankCount = () => (formData.content.match(/__BLANK_\d+__/g) || []).length;

  const handleBlankAnswerChange = (index, value) => {
    setBlankAnswers(prev => ({ ...prev, [index]: value }));
  };

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
    const newHeaders = [...formData.table_data.headers, `Tieu de ${formData.table_data.headers.length + 1}`];
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

    if (!formData.subject_id) {
      setError('Vui lòng chọn Môn học / Lớp học cho câu hỏi này.');
      return;
    }

    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung đề bài câu hỏi.');
      return;
    }

    if (formData.type === 'mcq' && formData.options.length < 2) {
      setError('Cần ít nhất 2 phương án lựa chọn.');
      return;
    }

    if (formData.type === 'mcq' && formData.options.some(o => !o.trim())) {
      setError('Vui lòng nhập đầy đủ nội dung cho tất cả các đáp án lựa chọn.');
      return;
    }

    if (formData.type === 'mcq' && (!formData.correct_answers || formData.correct_answers.length === 0)) {
      setError('Vui lòng chọn ít nhất một đáp án đúng.');
      return;
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
      let questionDataStructure = {};

      if (formData.type === 'mcq') {
        questionDataStructure = {
          options: formData.options.map((option, index) => ({
            id: String.fromCharCode(97 + index),
            text: option,
          })),
          correct_answers: formData.correct_answers || [],
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

      const payload = {
        subject_id: Number(formData.subject_id),
        type: formData.type,
        content: formData.content,
        explanation: formData.explanation,
        difficulty: formData.difficulty || 'medium',
        data: questionDataStructure,
      };

      await questionApi.updateSystemQuestion(questionId, payload);
      alert('Cập nhật thay đổi câu hỏi thành công!');
      navigate('/admin/questions');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình lưu dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

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
            {formData.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', lineHeight: 1, flexShrink: 0 }}
                title="Xoá phương án"
              >
                x
              </button>
            )}
          </div>
        );
      })}
      <div style={{ marginTop: '8px' }}>
        <button
          type="button"
          onClick={addOption}
          style={{ padding: '6px 14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#2563eb', fontWeight: '500' }}
        >
          + Thêm phương án
        </button>
      </div>
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
    <AdminLayout title="Chỉnh sửa câu hỏi">
      <div className="question-page-wrapper">
        <button onClick={handleBack} className="question-back-btn">
          &larr; Quay lại danh sách câu hỏi
        </button>

        <div className="question-form-card">
          <h2 className="question-form-title">Chỉnh sửa câu hỏi</h2>

          {error && <div className="question-error">{error}</div>}

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
              Đang tải dữ liệu câu hỏi...
            </div>
          )}

          {!loading && (
            <>
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
              <div style={{ marginBottom: 0 }}>
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
              <div style={{ marginBottom: 0 }}>
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
              <button type="button" onClick={handleBack} className="question-btn-cancel">
                Hủy bỏ
              </button>
              <button type="submit" disabled={loading} className="question-btn-submit">
                {loading ? 'Đang xử lý...' : 'Cập nhật thay đổi'}
              </button>
            </div>
          </form>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEditQuestionPage;
