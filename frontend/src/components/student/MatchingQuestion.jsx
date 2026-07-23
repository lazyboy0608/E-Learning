import { useState, useEffect, useRef, useMemo } from 'react';

const stripNumberPrefix = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/^\s*\d+\.\s*/, '');
};

// Shuffle một lần và giữ nguyên
const useShuffledRight = (right) => {
  return useMemo(() => {
    if (!right || right.length === 0) return [];
    const itemsWithOriginalIndex = right.map((item, index) => ({ item, index }));
    return [...itemsWithOriginalIndex].sort(() => Math.random() - 0.5);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export function MatchingQuestion({ question, onAnswer, answer = null, showResult = false, result = null }) {
  const { left = [], right = [], correct_matches = {} } = question.data || {};
  const [matches, setMatches] = useState(answer || {});
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [lines, setLines] = useState([]);
  const containerRef = useRef(null);

  // Shuffle chỉ 1 lần khi mount
  const shuffledRight = useShuffledRight(right);

  useEffect(() => {
    setMatches(answer || {});
  }, [answer]);

  const handleMatch = (leftId, rightId) => {
    if (showResult) return;
    const newMatches = {};
    Object.entries(matches).forEach(([k, v]) => {
      if (v !== rightId && parseInt(k) !== leftId) {
        newMatches[k] = v;
      }
    });
    newMatches[leftId] = rightId;
    setMatches(newMatches);
    onAnswer(newMatches);
    setSelectedLeft(null);
  };

  const removeMatch = (leftId) => {
    if (showResult) return;
    const newMatches = { ...matches };
    delete newMatches[leftId];
    setMatches(newMatches);
    onAnswer(newMatches);
    setSelectedLeft(null);
  };

  const isCorrectMatch = (leftId, rightId) => correct_matches[leftId] === rightId;

  const updateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];
    Object.entries(matches).forEach(([leftIdx, rightIdx]) => {
      if (rightIdx === undefined || rightIdx === null) return;
      const leftDotEl = containerRef.current.querySelector(`[data-left-dot="${leftIdx}"]`);
      const rightDotEl = containerRef.current.querySelector(`[data-right-dot="${rightIdx}"]`);
      if (leftDotEl && rightDotEl) {
        const l = leftDotEl.getBoundingClientRect();
        const r = rightDotEl.getBoundingClientRect();
        const x1 = l.left + l.width / 2 - containerRect.left;
        const y1 = l.top + l.height / 2 - containerRect.top;
        const x2 = r.left + r.width / 2 - containerRect.left;
        const y2 = r.top + r.height / 2 - containerRect.top;
        let color = '#2563eb';
        if (showResult) {
          color = isCorrectMatch(parseInt(leftIdx), rightIdx) ? '#16a34a' : '#dc2626';
        }
        newLines.push({ x1, y1, x2, y2, color });
      }
    });
    setLines(newLines);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    updateLines();
    const observer = new ResizeObserver(updateLines);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [matches, showResult, shuffledRight]);

  const getLeftCardStyle = (index) => {
    const isSelected = selectedLeft === index;
    const isMatched = matches[index] !== undefined;
    const base = {
      position: 'relative',
      padding: '10px 44px 10px 14px',
      backgroundColor: '#ffffff',
      border: '1.5px solid',
      borderRadius: '10px',
      cursor: showResult ? 'default' : 'pointer',
      transition: 'all 0.15s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      userSelect: 'none',
      minHeight: '48px',
    };
    if (!showResult) {
      if (isSelected) return { ...base, borderColor: '#2563eb', backgroundColor: '#eff6ff', boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' };
      if (isMatched) return { ...base, borderColor: '#93c5fd', backgroundColor: '#f8faff' };
      return { ...base, borderColor: '#e5e7eb' };
    }
    const rightIdx = matches[index];
    if (rightIdx === undefined) return { ...base, borderColor: '#e5e7eb', opacity: 0.5 };
    if (isCorrectMatch(index, rightIdx)) return { ...base, borderColor: '#16a34a', backgroundColor: '#f0fdf4' };
    return { ...base, borderColor: '#dc2626', backgroundColor: '#fef2f2' };
  };

  const getRightCardStyle = (originalIndex) => {
    const leftIdxForThis = Object.keys(matches).find(k => matches[k] === originalIndex);
    const isMatched = leftIdxForThis !== undefined;
    const base = {
      position: 'relative',
      padding: '10px 14px 10px 44px',
      backgroundColor: '#ffffff',
      border: '1.5px solid',
      borderRadius: '10px',
      cursor: showResult ? 'default' : 'pointer',
      transition: 'all 0.15s',
      display: 'flex',
      alignItems: 'center',
      userSelect: 'none',
      minHeight: '48px',
    };
    if (!showResult) {
      if (isMatched) return { ...base, borderColor: '#93c5fd', backgroundColor: '#f8faff' };
      return { ...base, borderColor: '#e5e7eb' };
    }
    if (!isMatched) return { ...base, borderColor: '#e5e7eb', opacity: 0.5 };
    if (isCorrectMatch(parseInt(leftIdxForThis), originalIndex)) return { ...base, borderColor: '#16a34a', backgroundColor: '#f0fdf4' };
    return { ...base, borderColor: '#dc2626', backgroundColor: '#fef2f2' };
  };

  const getDotStyle = (index, side) => {
    const base = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '12px', height: '12px',
      borderRadius: '50%',
      border: '2px solid',
      transition: 'all 0.15s',
    };
    const isMatched = side === 'left'
      ? matches[index] !== undefined
      : Object.values(matches).includes(index);

    if (!showResult) {
      if (side === 'left' && selectedLeft === index) {
        return { ...base, right: '14px', borderColor: '#2563eb', backgroundColor: '#2563eb', boxShadow: '0 0 0 4px rgba(37,99,235,0.2)' };
      }
      if (isMatched) return {
        ...base,
        [side === 'left' ? 'right' : 'left']: '14px',
        borderColor: '#2563eb', backgroundColor: '#2563eb',
      };
      return {
        ...base,
        [side === 'left' ? 'right' : 'left']: '14px',
        borderColor: '#d1d5db', backgroundColor: '#fff',
      };
    }

    // showResult
    const isCorrect = side === 'left'
      ? (matches[index] !== undefined && isCorrectMatch(index, matches[index]))
      : (() => {
          const leftIdx = Object.keys(matches).find(k => matches[k] === index);
          return leftIdx !== undefined && isCorrectMatch(parseInt(leftIdx), index);
        })();

    const color = isMatched ? (isCorrect ? '#16a34a' : '#dc2626') : '#d1d5db';
    return {
      ...base,
      [side === 'left' ? 'right' : 'left']: '14px',
      borderColor: color,
      backgroundColor: isMatched ? color : '#fff',
    };
  };

  const correctCount = Object.keys(matches).filter(k => isCorrectMatch(parseInt(k), matches[k])).length;
  const totalLeft = left.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {question.content && (
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px', lineHeight: '1.6' }}>
          {question.content}
        </p>
      )}

      {/* Instruction */}
      {!showResult && (
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', fontStyle: 'italic' }}>
          {selectedLeft !== null
            ? 'Chọn một mục ở cột phải để nối'
            : 'Nhấn vào mục ở cột trái để bắt đầu nối'}
        </p>
      )}

      <div ref={containerRef} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '4px 0' }}>
        {/* SVG lines */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10, overflow: 'visible' }}
        >
          {lines.map((line, idx) => (
            <g key={idx}>
              <path
                d={`M ${line.x1} ${line.y1} C ${(line.x1 + line.x2) / 2} ${line.y1}, ${(line.x1 + line.x2) / 2} ${line.y2}, ${line.x2} ${line.y2}`}
                fill="none"
                stroke={line.color}
                strokeWidth="5"
                strokeOpacity="0.12"
              />
              <path
                d={`M ${line.x1} ${line.y1} C ${(line.x1 + line.x2) / 2} ${line.y1}, ${(line.x1 + line.x2) / 2} ${line.y2}, ${line.x2} ${line.y2}`}
                fill="none"
                stroke={line.color}
                strokeWidth="2.5"
              />
            </g>
          ))}
        </svg>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 20 }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Cột A
          </div>
          {left.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (showResult) return;
                if (matches[index] !== undefined) {
                  removeMatch(index);
                } else {
                  setSelectedLeft(selectedLeft === index ? null : index);
                }
              }}
              style={getLeftCardStyle(index)}
            >
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827', flex: 1, paddingRight: '8px' }}>
                {stripNumberPrefix(item)}
              </span>
              <span data-left-dot={index} style={getDotStyle(index, 'left')} />
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 20 }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            Cột B
          </div>
          {shuffledRight.map(({ item, index: originalIndex }, shuffledIndex) => (
            <div
              key={shuffledIndex}
              onClick={() => {
                if (showResult) return;
                let targetLeft = selectedLeft;
                if (targetLeft === null) {
                  targetLeft = left.findIndex((_, idx) => matches[idx] === undefined);
                  if (targetLeft === -1) return;
                } else {
                  setSelectedLeft(null);
                }
                handleMatch(targetLeft, originalIndex);
              }}
              style={getRightCardStyle(originalIndex)}
            >
              <span data-right-dot={originalIndex} style={getDotStyle(originalIndex, 'right')} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827', flex: 1, paddingLeft: '8px' }}>
                {stripNumberPrefix(item)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Result summary */}
      {showResult && (
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: correctCount === totalLeft ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${correctCount === totalLeft ? '#bbf7d0' : '#fecaca'}`,
          fontSize: '13px',
          fontWeight: '600',
          color: correctCount === totalLeft ? '#166534' : '#991b1b',
        }}>
          {correctCount === totalLeft
            ? 'Tất cả các cặp đều chính xác!'
            : `Đúng ${correctCount}/${totalLeft} cặp — hãy xem lại các đường nối màu đỏ.`}
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

export default MatchingQuestion;
