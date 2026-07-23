import { useState, useEffect } from 'react';

export function TableFillQuestion({ question, onAnswer, answer = null, showResult = false, result = null, userAnswer = null }) {
  const { headers = [], rows = [], cols = 2, left_column = [], right_column = [] } = question.data || {};

  // Ưu tiên dùng mảng rows thực tế nếu có (chuẩn mới),
  // nếu không thì fallback về left_column (dữ liệu cũ)
  const rowCount = rows.length > 0 ? rows.length : (left_column.length || 2);

  const [answers, setAnswers] = useState(answer || userAnswer || {});

  useEffect(() => {
    if (answer) setAnswers(answer);
    else if (userAnswer) setAnswers(userAnswer);
  }, [answer, userAnswer]);

  const handleChange = (rowIndex, value) => {
    if (showResult) return;
    const newAnswers = { ...answers, [rowIndex]: value };
    setAnswers(newAnswers);
    onAnswer(newAnswers);
  };

  // Lấy đáp án đúng của một hàng:
  // - Chuẩn mới: cột cuối cùng của rows[rowIndex]
  // - Chuẩn cũ fallback: right_column[rowIndex]
  const getCorrectAnswer = (rowIndex) => {
    if (rows.length > 0 && rows[rowIndex]) {
      return String(rows[rowIndex][cols - 1] ?? '');
    }
    return String(right_column[rowIndex] ?? '');
  };

  // Lấy nội dung hiển thị tĩnh của một ô trong hàng (không phải cột cuối)
  const getCellValue = (rowIndex, colIndex) => {
    if (rows.length > 0 && rows[rowIndex]) {
      return String(rows[rowIndex][colIndex] ?? '');
    }
    // Fallback: cột 0 là left_column
    if (colIndex === 0) return String(left_column[rowIndex] ?? '');
    return '';
  };

  const isRowCorrect = (rowIndex) => {
    const userVal = (answers[rowIndex] || '').toLowerCase().trim();
    const correctVal = getCorrectAnswer(rowIndex).toLowerCase().trim();
    return userVal !== '' && userVal === correctVal;
  };

  const getInputStyle = (rowIndex) => {
    const base = {
      width: '100%',
      padding: '9px 14px',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.15s',
      boxSizing: 'border-box',
    };
    if (!showResult) {
      return { ...base, border: '1.5px solid #d1d5db' };
    }
    if (isRowCorrect(rowIndex)) {
      return { ...base, border: '1.5px solid #16a34a', backgroundColor: '#f0fdf4', color: '#166534' };
    }
    return { ...base, border: '1.5px solid #dc2626', backgroundColor: '#fef2f2', color: '#991b1b' };
  };

  const correctCount = showResult
    ? Array.from({ length: rowCount }, (_, i) => i).filter(i => isRowCorrect(i)).length
    : 0;
  const allCorrect = correctCount === rowCount;

  // Số cột thực tế để render: nếu có rows dùng cols, không thì render 2 cột (nhãn + input)
  const colCount = rows.length > 0 ? cols : 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {question.content && (
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px', lineHeight: '1.6' }}>
          {question.content}
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

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '340px' }}>
          {/* Header */}
          {headers.length > 0 && (
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '12px 18px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#374151',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                {Array.from({ length: colCount }).map((_, colIndex) => {
                  const isLastCol = colIndex === colCount - 1;

                  if (isLastCol) {
                    // Cột cuối: ô điền đáp án
                    return (
                      <td key={colIndex} style={{ padding: '10px 14px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {showResult ? (
                            <>
                              <div style={{
                                padding: '9px 14px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                textAlign: 'center',
                                backgroundColor: isRowCorrect(rowIndex) ? '#f0fdf4' : '#fef2f2',
                                border: `1.5px solid ${isRowCorrect(rowIndex) ? '#16a34a' : '#dc2626'}`,
                                color: isRowCorrect(rowIndex) ? '#166534' : '#991b1b',
                              }}>
                                {answers[rowIndex] || '(trống)'}
                              </div>
                              {/* Hiện đáp án đúng bên dưới nếu sai */}
                              {!isRowCorrect(rowIndex) && getCorrectAnswer(rowIndex) && (
                                <div style={{
                                  fontSize: '12px',
                                  color: '#16a34a',
                                  fontWeight: '600',
                                  textAlign: 'center',
                                  padding: '2px 8px',
                                  backgroundColor: '#f0fdf4',
                                  borderRadius: '4px',
                                }}>
                                  Đáp án: {getCorrectAnswer(rowIndex)}
                                </div>
                              )}
                            </>
                          ) : (
                            <input
                              type="text"
                              value={answers[rowIndex] || ''}
                              onChange={e => handleChange(rowIndex, e.target.value)}
                              placeholder="Nhập đáp án..."
                              style={getInputStyle(rowIndex)}
                              onFocus={e => {
                                if (!showResult) {
                                  e.currentTarget.style.borderColor = '#2563eb';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                                }
                              }}
                              onBlur={e => {
                                if (!showResult) {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.boxShadow = 'none';
                                }
                              }}
                            />
                          )}
                        </div>
                      </td>
                    );
                  }

                  // Các cột trước cột cuối: hiển thị giá trị tĩnh (chỉ đọc)
                  return (
                    <td key={colIndex} style={{
                      padding: '12px 18px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px',
                      fontWeight: colIndex === 0 ? '600' : '400',
                      color: colIndex === 0 ? '#374151' : '#4b5563',
                      whiteSpace: 'nowrap',
                    }}>
                      {getCellValue(rowIndex, colIndex)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Result summary */}
      {showResult && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: allCorrect ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${allCorrect ? '#bbf7d0' : '#fecaca'}`,
          fontSize: '13px',
          fontWeight: '600',
          color: allCorrect ? '#166534' : '#991b1b',
        }}>
          {allCorrect
            ? 'Tất cả các ô đều chính xác!'
            : `Đúng ${correctCount}/${rowCount} ô — hãy xem lại các ô màu đỏ và đáp án gợi ý bên dưới.`}
        </div>
      )}

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

export default TableFillQuestion;
