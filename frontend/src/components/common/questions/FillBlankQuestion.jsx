import { useState, useEffect } from 'react';

export function FillBlankQuestion({ question, onAnswer, answer = null, showResult = false, userAnswer = null }) {
  const { correct_answers = [], case_sensitive = false } = question.data || {};
  const [answers, setAnswers] = useState(userAnswer || answer || Array(correct_answers.length).fill(''));

  useEffect(() => {
    setAnswers(userAnswer ?? answer ?? Array(correct_answers.length).fill(''));
  }, [userAnswer, answer, correct_answers.length]);

  const handleChange = (index, value) => {
    if (showResult) return;
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    const allEmpty = newAnswers.every((v) => v.trim() === '');
    onAnswer(allEmpty ? null : newAnswers);
  };

  const isCorrect = (userAnswer, correctAnswer) => {
    if (case_sensitive) {
      return userAnswer.trim() === correctAnswer.trim();
    }
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  };

  const contentParts = question.content?.split('___') || [question.content];

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-800">
        {contentParts.map((part, index) => (
          <span key={index}>
            {part}
            {index < contentParts.length - 1 && (
              <span className="inline-flex items-center gap-1 mx-1">
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => handleChange(index, e.target.value)}
                  disabled={showResult}
                  className={`px-3 py-1 border-2 rounded text-center min-w-24 ${
                    showResult
                      ? isCorrect(answers[index], correct_answers[index])
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {showResult && (
                  <span className="text-green-600 text-sm">
                    ({correct_answers[index]})
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </p>

      {question.media_image && (
        <img src={question.media_image} alt="" className="max-w-md rounded-lg" />
      )}

      {question.media_audio && (
        <audio controls src={question.media_audio} className="w-full" />
      )}

      {showResult && (
        <div className="mt-4">
          {answers.every((a, i) => isCorrect(a, correct_answers[i])) ? (
            <div className="text-green-600 font-medium">Chính xác!</div>
          ) : (
            <div className="text-red-600 font-medium">
              Còn thiếu hoặc sai. Hãy kiểm tra lại các ô màu đỏ.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FillBlankQuestion;
