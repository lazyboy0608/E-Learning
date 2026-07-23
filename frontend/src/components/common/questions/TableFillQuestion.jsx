import { useState, useEffect } from 'react';

export function TableFillQuestion({ question, onAnswer, answer = null, showResult = false, userAnswer = null }) {
  const { rows = 2, cols = 2, correct_answers = {} } = question.data || {};
  const [answers, setAnswers] = useState(userAnswer || answer || {});

  useEffect(() => {
    setAnswers(userAnswer || answer || {});
  }, [userAnswer, answer]);

  const handleChange = (row, col, value) => {
    if (showResult) return;
    const key = `${row}-${col}`;
    const newAnswers = { ...answers };
    if (value.trim() === '') {
      delete newAnswers[key];
    } else {
      newAnswers[key] = value;
    }
    setAnswers(newAnswers);
    onAnswer(newAnswers);
  };

  const isCorrect = (row, col) => {
    const key = `${row}-${col}`;
    const userAnswer = answers[key] || '';
    const correctAnswer = correct_answers[row]?.[col] || '';
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  };

  return (
    <div className="space-y-4">
      {question.content && (
        <p className="text-lg font-medium text-gray-800">{question.content}</p>
      )}

      {question.media_image && (
        <img src={question.media_image} alt="" className="max-w-md rounded-lg" />
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  return (
                    <td key={colIndex} className="border border-gray-200" style={{ padding: '16px' }}>
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="text"
                          value={answers[key] || ''}
                          onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                          disabled={showResult}
                          className={`w-full px-4 py-2.5 border rounded-lg text-center transition-all ${
                            showResult
                              ? isCorrect(rowIndex, colIndex)
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-300 focus:border-blue-500 focus:outline-none'
                          }`}
                        />
                        {showResult && (
                          <span className="text-green-600 text-xs text-center font-medium">
                            ({correct_answers[rowIndex]?.[colIndex]})
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showResult && (
        <div className="mt-4">
          {Object.keys(correct_answers).every(row =>
            Object.keys(correct_answers[row]).every(col =>
              isCorrect(parseInt(row), parseInt(col))
            )
          ) ? (
            <div className="text-green-600 font-medium">Chính xác!</div>
          ) : (
            <div className="text-red-600 font-medium">
              Còn một số ô chưa đúng. Hãy kiểm tra lại.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TableFillQuestion;
