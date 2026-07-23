import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

// Styles dùng chung
const optionBase = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  textAlign: 'left',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1.5px solid #e5e7eb',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  transition: 'all 0.15s',
  marginBottom: '0',
};

const getOptionStyle = (option, selectedAnswers, showResult, correctAnswers) => {
  const isSelected = selectedAnswers.includes(option.id);
  const isCorrectOption = correctAnswers.includes(option.id);

  if (!showResult) {
    if (isSelected) {
      return { ...optionBase, borderColor: '#2563eb', backgroundColor: '#eff6ff' };
    }
    return { ...optionBase };
  }

  // showResult mode
  if (isCorrectOption && isSelected) return { ...optionBase, borderColor: '#16a34a', backgroundColor: '#f0fdf4' };
  if (!isCorrectOption && isSelected) return { ...optionBase, borderColor: '#dc2626', backgroundColor: '#fef2f2' };
  if (isCorrectOption && !isSelected) return { ...optionBase, borderColor: '#d97706', backgroundColor: '#fffbeb' };
  return { ...optionBase, opacity: 0.6 };
};

const getCircleStyle = (option, selectedAnswers, showResult, correctAnswers) => {
  const isSelected = selectedAnswers.includes(option.id);
  const isCorrectOption = correctAnswers.includes(option.id);

  const base = {
    width: '32px', height: '32px', borderRadius: '50%',
    border: '2px solid',
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '13px',
    transition: 'all 0.15s',
  };

  if (!showResult) {
    if (isSelected) return { ...base, borderColor: '#2563eb', backgroundColor: '#2563eb', color: '#fff' };
    return { ...base, borderColor: '#d1d5db', backgroundColor: '#fff', color: '#6b7280' };
  }

  if (isCorrectOption && isSelected) return { ...base, borderColor: '#16a34a', backgroundColor: '#16a34a', color: '#fff' };
  if (!isCorrectOption && isSelected) return { ...base, borderColor: '#dc2626', backgroundColor: '#dc2626', color: '#fff' };
  if (isCorrectOption && !isSelected) return { ...base, borderColor: '#d97706', backgroundColor: '#fffbeb', color: '#d97706' };
  return { ...base, borderColor: '#d1d5db', backgroundColor: '#f9fafb', color: '#9ca3af' };
};

export function McqQuestion({ question, onAnswer, answer = null, showResult = false, result = null }) {
  const [selectedAnswers, setSelectedAnswers] = useState(
    Array.isArray(answer) ? answer : (answer ? [answer] : [])
  );
  const { options = [], correct_answers: correctAnswers = [] } = question.data || {};
  const isMultiple = correctAnswers.length > 1;

  useEffect(() => {
    setSelectedAnswers(Array.isArray(answer) ? answer : (answer ? [answer] : []));
  }, [answer]);

  const handleToggle = (optionId) => {
    if (showResult) return;
    let newSelected;
    if (isMultiple) {
      newSelected = selectedAnswers.includes(optionId)
        ? selectedAnswers.filter(id => id !== optionId)
        : [...selectedAnswers, optionId];
    } else {
      newSelected = selectedAnswers.includes(optionId) ? [] : [optionId];
    }
    setSelectedAnswers(newSelected);
    onAnswer(newSelected.length === 1 ? newSelected[0] : newSelected);
  };

  const correctAnswerDisplay = result?.correct_answer_display
    ?? (Array.isArray(correctAnswers) ? correctAnswers.map(a => a.toUpperCase()).join(', ') : '');

  const getResultIcon = (option) => {
    const isSelected = selectedAnswers.includes(option.id);
    const isCorrectOption = correctAnswers.includes(option.id);
    if (isCorrectOption && isSelected) return <FiCheck style={{ color: '#16a34a', flexShrink: 0 }} />;
    if (!isCorrectOption && isSelected) return <FiX style={{ color: '#dc2626', flexShrink: 0 }} />;
    if (isCorrectOption && !isSelected) return <FiAlertCircle style={{ color: '#d97706', flexShrink: 0 }} />;
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Question content */}
      {question.content && (
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '20px', lineHeight: '1.6' }}>
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
        <audio
          controls
          src={question.media_audio}
          style={{ width: '100%', marginBottom: '16px' }}
        />
      )}

      {/* Type hint */}
      {isMultiple && !showResult && (
        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', fontStyle: 'italic' }}>
          Có thể chọn nhiều đáp án
        </p>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleToggle(option.id)}
            disabled={showResult}
            style={getOptionStyle(option, selectedAnswers, showResult, correctAnswers)}
            onMouseEnter={e => {
              if (!showResult && !selectedAnswers.includes(option.id)) {
                e.currentTarget.style.borderColor = '#93c5fd';
                e.currentTarget.style.backgroundColor = '#f8faff';
              }
            }}
            onMouseLeave={e => {
              if (!showResult && !selectedAnswers.includes(option.id)) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }
            }}
          >
            <span style={getCircleStyle(option, selectedAnswers, showResult, correctAnswers)}>
              {option.id.toUpperCase()}
            </span>
            <span style={{ fontSize: '15px', color: '#111827', fontWeight: '500', flex: 1 }}>
              {option.text}
            </span>
            {showResult && getResultIcon(option)}
          </button>
        ))}
      </div>

      {/* Correct answer display */}
      {showResult && correctAnswerDisplay && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '13px', color: '#166534', margin: 0 }}>
            <strong>Đáp án đúng:</strong> {correctAnswerDisplay}
          </p>
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

export default McqQuestion;
