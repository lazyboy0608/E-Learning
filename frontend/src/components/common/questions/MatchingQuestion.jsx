import { useState, useEffect, useRef } from "react";

const stripNumberPrefix = (text) => {
  if (typeof text !== "string") return text;
  return text.replace(/^\s*\d+\.\s*/, "");
};

export function MatchingQuestion({
  question,
  onAnswer,
  showResult = false,
  answer = {},
}) {
  const { left = [], right = [], correct_matches = {} } = question.data || {};
  const [matches, setMatches] = useState(answer ?? {});
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [shuffledRight, setShuffledRight] = useState([]);
  const [lines, setLines] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    setMatches(answer ?? {});
  }, [answer]);

  useEffect(() => {
    if (right && right.length > 0) {
      // In common view, we do not shuffle the items by default, but map them to hold original index
      const itemsWithOriginalIndex = right.map((item, index) => ({ item, index }));
      setShuffledRight(itemsWithOriginalIndex);
    } else {
      setShuffledRight([]);
    }
  }, [right]);

  const handleMatch = (leftId, rightId) => {
    if (showResult) return;
    
    // Strict 1-to-1 matching: remove any other left item matched to the same rightId
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

  const isCorrectMatch = (leftId, rightId) => {
    return correct_matches[leftId] === rightId;
  };

  const updateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];

    Object.entries(matches).forEach(([leftIdx, rightIdx]) => {
      if (rightIdx === undefined || rightIdx === null) return;
      const leftDotEl = containerRef.current.querySelector(`[data-left-dot="${leftIdx}"]`);
      const rightDotEl = containerRef.current.querySelector(`[data-right-dot="${rightIdx}"]`);

      if (leftDotEl && rightDotEl) {
        const leftRect = leftDotEl.getBoundingClientRect();
        const rightRect = rightDotEl.getBoundingClientRect();

        const x1 = leftRect.left + leftRect.width / 2 - containerRect.left;
        const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
        
        const x2 = rightRect.left + rightRect.width / 2 - containerRect.left;
        const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;

        let color = '#3b82f6';
        if (showResult) {
          color = isCorrectMatch(parseInt(leftIdx), rightIdx) ? '#10b981' : '#ef4444';
        }

        newLines.push({
          x1,
          y1,
          x2,
          y2,
          color,
        });
      }
    });

    setLines(newLines);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    updateLines();

    const observer = new ResizeObserver(() => {
      updateLines();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [matches, showResult, shuffledRight]);

  const getCardClass = (index, side) => {
    const isSelected = selectedLeft === index;
    const isMatched = side === 'left' ? matches[index] !== undefined : Object.values(matches).includes(index);
    
    if (!showResult) {
      if (side === 'left') {
        if (isSelected) return 'border-blue-400 bg-blue-50/40 shadow-blue-100/30';
        if (isMatched) return 'border-blue-100 bg-blue-50/5';
        return 'border-gray-200/60 hover:border-blue-200 hover:bg-gray-50/50';
      } else {
        const leftIdxForThisRight = Object.keys(matches).find(k => matches[k] === index);
        if (leftIdxForThisRight !== undefined) {
          return 'border-blue-100 bg-blue-50/5';
        }
        return 'border-gray-200/60 hover:border-blue-200 hover:bg-gray-50/50';
      }
    }

    if (side === 'left') {
      const rightIdx = matches[index];
      if (rightIdx === undefined) return 'border-gray-100 opacity-60';
      return isCorrectMatch(index, rightIdx)
        ? 'border-green-300 bg-green-50/30'
        : 'border-red-300 bg-red-50/30';
    } else {
      const leftIdx = Object.keys(matches).find(k => matches[k] === index);
      if (leftIdx === undefined) return 'border-gray-100 opacity-60';
      return isCorrectMatch(parseInt(leftIdx), index)
        ? 'border-green-300 bg-green-50/30'
        : 'border-red-300 bg-red-50/30';
    }
  };

  const getDotClass = (index, side) => {
    const isSelected = selectedLeft === index;
    const isMatched = side === 'left' ? matches[index] !== undefined : Object.values(matches).includes(index);

    if (!showResult) {
      if (side === 'left' && isSelected) {
        return 'border-blue-500 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      }
      return isMatched
        ? 'border-blue-500 bg-blue-500'
        : 'border-gray-300 bg-white group-hover:border-blue-400';
    }

    if (side === 'left') {
      const rightIdx = matches[index];
      if (rightIdx === undefined) return 'border-gray-300 bg-white';
      return isCorrectMatch(index, rightIdx)
        ? 'border-green-500 bg-green-500'
        : 'border-red-500 bg-red-500';
    } else {
      const leftIdx = Object.keys(matches).find(k => matches[k] === index);
      if (leftIdx === undefined) return 'border-gray-300 bg-white';
      return isCorrectMatch(parseInt(leftIdx), index)
        ? 'border-green-500 bg-green-500'
        : 'border-red-500 bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {question.content && (
        <p className="text-lg font-medium text-gray-800">{question.content}</p>
      )}

      {question.media_image && (
        <img
          src={question.media_image}
          alt=""
          className="max-w-md rounded-lg"
        />
      )}

      <div ref={containerRef} className="relative grid grid-cols-2 gap-12 p-2">
        {/* SVG connection lines overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10, overflow: 'visible' }}>
          {lines.map((line, idx) => (
            <g key={idx}>
              <path
                d={`M ${line.x1} ${line.y1} C ${(line.x1 + line.x2) / 2} ${line.y1}, ${(line.x1 + line.x2) / 2} ${line.y2}, ${line.x2} ${line.y2}`}
                fill="none"
                stroke={line.color}
                strokeWidth="6"
                strokeOpacity="0.15"
              />
              <path
                d={`M ${line.x1} ${line.y1} C ${(line.x1 + line.x2) / 2} ${line.y1}, ${(line.x1 + line.x2) / 2} ${line.y2}, ${line.x2} ${line.y2}`}
                fill="none"
                stroke={line.color}
                strokeWidth="3"
                className="transition-all duration-300"
              />
              <circle cx={line.x1} cy={line.y1} r="4" fill={line.color} />
              <circle cx={line.x2} cy={line.y2} r="4" fill={line.color} />
            </g>
          ))}
        </svg>

        {/* Left Column */}
        <div className="space-y-4" style={{ zIndex: 20 }}>
          <h4 className="font-semibold text-gray-700 text-sm tracking-wider uppercase">Cột trái</h4>
          {left.map((item, index) => (
            <div
              key={index}
              data-left-id={index}
              onClick={() => {
                if (!showResult) {
                  if (matches[index] !== undefined) {
                    const newMatches = { ...matches };
                    delete newMatches[index];
                    setMatches(newMatches);
                    onAnswer(newMatches);
                    setSelectedLeft(null);
                  } else {
                    setSelectedLeft(selectedLeft === index ? null : index);
                  }
                }
              }}
              className={`relative pr-12 pl-6 py-3.5 bg-white border rounded-xl cursor-pointer transition-all duration-200 flex items-center select-none shadow-sm group ${getCardClass(index, 'left')}`}
            >
              <span className="flex-1 w-full text-center text-gray-800 font-medium leading-relaxed">{stripNumberPrefix(item)}</span>
              <span
                data-left-dot={index}
                className={`w-3 h-3 rounded-full border-2 absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${getDotClass(index, 'left')}`}
              />
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4" style={{ zIndex: 20 }}>
          <h4 className="font-semibold text-gray-700 text-sm tracking-wider uppercase">Cột phải</h4>
          {shuffledRight.map(({ item, index: originalIndex }, shuffledIndex) => (
            <div
              key={shuffledIndex}
              data-right-id={originalIndex}
              onClick={() => {
                if (showResult) return;

                let targetLeft = selectedLeft;
                if (targetLeft === null) {
                  const leftItems = Array.isArray(left) ? left : [];
                  targetLeft = leftItems.findIndex((_, idx) => matches[idx] === undefined);
                  if (targetLeft === -1) return;
                } else {
                  setSelectedLeft(null);
                }

                handleMatch(targetLeft, originalIndex);
              }}
              className={`relative pl-12 pr-6 py-3.5 bg-white border rounded-xl cursor-pointer transition-all duration-200 flex items-center select-none shadow-sm group ${getCardClass(originalIndex, 'right')}`}
            >
              <span
                data-right-dot={originalIndex}
                className={`w-3 h-3 rounded-full border-2 absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${getDotClass(originalIndex, 'right')}`}
              />
              <span className="flex-1 w-full text-center text-gray-800 font-medium leading-relaxed">{stripNumberPrefix(item)}</span>
            </div>
          ))}
        </div>
      </div>

      {showResult && (
        <div className="mt-4">
          {Object.keys(matches).every((k) =>
            isCorrectMatch(parseInt(k), matches[k]),
          ) ? (
            <div className="text-green-600 font-medium">Chính xác!</div>
          ) : (
            <div className="text-red-600 font-medium">
              Còn một số cặp chưa đúng. Hãy kiểm tra lại.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MatchingQuestion;
