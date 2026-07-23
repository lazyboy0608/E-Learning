import { useState, useEffect } from 'react';

// Hỗ trợ cả __BLANK_N__ (backend mới) và ___ (backend cũ)
const splitContent = (content) => {
  if (!content) return [''];
  // Thử split theo __BLANK_N__ trước
  if (/__BLANK_\d+__/.test(content)) {
    return content.split(/__BLANK_\d+__/);
  }
  // Fallback split theo ___
  return content.split('___');
};

export function FillBlankQuestion({ question, onAnswer, answer = null, showResult = false, result = null }) {
  const { correct_answers = [], case_sensitive = false } = question.data || {};
  const contentParts = splitContent(question.content);
  const blankCount = contentParts.length - 1;

  const normalizeAnswer = (ans) => {
    if (Array.isArray(ans)) return ans;
    if (ans === null || ans === undefined) return Array(blankCount).fill('');
    return Array(blankCount).fill('');
  };

  const [answers, setAnswers] = useState(normalizeAnswer(answer));

  useEffect(() => {
    if (Array.isArray(answer)) {
      setAnswers(answer);
    } else {
      setAnswers(Array(blankCount).fill(''));
    }
  }, [answer, blankCount]);

  const handleChange = (index, value) => {
    if (showResult) return;
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    const allEmpty = newAnswers.every(v => (v || '').trim() === '');
    onAnswer(allEmpty ? null : newAnswers);
  };

  const isBlankCorrect = (index) => {
    const userVal = (answers[index] || '').trim();
    const correctVal = (correct_answers[index] || '').trim();
    if (!userVal) return false;
    return case_sensitive
      ? userVal === correctVal
      : userVal.toLowerCase() === correctVal.toLowerCase();
  };

  const inputStyle = (index) => {
    const base = {
      display: 'inline-block',
      minWidth: '120px',
      width: '120px',
      padding: '4px 10px',
      fontSize: '15px',
      fontWeight: '500',
      textAlign: 'center',
      borderRadius: '6px',
      outline: 'none',
      transition: 'border-color 0.15s',
      verticalAlign: 'middle',
      margin: '0 4px',
    };
    if (!showResult) {
      return { ...base, border: '2px solid #d1d5db' };
    }
    if (isBlankCorrect(index)) {
      return { ...base, border: '2px solid #16a34a', backgroundColor: '#f0fdf4', color: '#166534' };
    }
    return { ...base, border: '2px solid #dc2626', backgroundColor: '#fef2f2', color: '#991b1b' };
  };

  const allCorrect = Array.from({ length: blankCount }, (_, i) => i).every(i => isBlankCorrect(i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Question instruction */}
      {blankCount === 0 && question.content && (
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px', lineHeight: '1.7' }}>
          {question.content}
        </p>
      )}

      {/* Inline fill blanks */}
      {blankCount > 0 && (
        <p style={{ fontSize: '16px', fontWeight: '500', color: '#111827', lineHeight: '2.2', marginBottom: '12px' }}>
          {contentParts.map((part, index) => (
            <span key={index}>
              {part}
              {index < contentParts.length - 1 && (
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 4px' }}>
                  <input
                    type="text"
                    value={answers[index] || ''}
                    onChange={e => handleChange(index, e.target.value)}
                    disabled={showResult}
                    placeholder={`(${index + 1})`}
                    style={inputStyle(index)}
                    onFocus={e => { if (!showResult) e.currentTarget.style.borderColor = '#2563eb'; }}
                    onBlur={e => { if (!showResult) e.currentTarget.style.borderColor = '#d1d5db'; }}
                  />
                  {/* Hiện đáp án đúng bên dưới ô khi sai */}
                  {showResult && !isBlankCorrect(index) && correct_answers[index] && (
                    <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', marginTop: '2px', whiteSpace: 'nowrap' }}>
                      {correct_answers[index]}
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </p>
      )}

      {question.media_image && (
        <img
          src={question.media_image}
          alt="Hình minh họa"
          style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e5e7eb' }}
        />
      )}

      {question.media_audio && (
        <audio controls src={question.media_audio} style={{ width: '100%', marginBottom: '16px' }} />
      )}

      {/* Summary feedback */}
      {showResult && blankCount > 0 && (
        <div style={{
          marginTop: '8px',
          padding: '10px 14px',
          borderRadius: '8px',
          backgroundColor: allCorrect ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${allCorrect ? '#bbf7d0' : '#fecaca'}`,
          fontSize: '13px',
          fontWeight: '600',
          color: allCorrect ? '#166534' : '#991b1b',
        }}>
          {allCorrect ? 'Tất cả đáp án đều chính xác!' : 'Một số đáp án chưa đúng — hãy kiểm tra các ô màu đỏ.'}
        </div>
      )}

      {/* Explanation */}
      {showResult && question.explanation && (
        <div style={{
          marginTop: '8px',
          padding: '12px 16px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
            <strong>Giải thích:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

export default FillBlankQuestion;
