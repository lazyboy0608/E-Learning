import { useState, useEffect } from 'react';

export function McqQuestion({ question, onAnswer, answer = null, showResult = false, result = null, userAnswer = null }) {
  const [selectedAnswer, setSelectedAnswer] = useState(answer || userAnswer || null);
  const { options = [], correct_answers: correctAnswers = [] } = question.data || {};
  const correctAnswer = correctAnswers[0] ?? null;

  useEffect(() => {
    setSelectedAnswer(answer || userAnswer || null);
  }, [answer, userAnswer]);

  const handleSelect = (optionId) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
    onAnswer(optionId);
  };

  const getOptionClass = (option) => {
    if (!showResult) {
      return selectedAnswer === option.id
        ? 'bg-blue-50/50'
        : 'hover:bg-blue-50/30';
    }

    if (option.id === correctAnswer) {
      return 'bg-green-50/50';
    }
    if (selectedAnswer === option.id && option.id !== correctAnswer) {
      return 'bg-red-50/50';
    }
    return '';
  };

  const getRadioClass = (option) => {
    if (!showResult) {
      return selectedAnswer === option.id
        ? 'border-blue-500 bg-blue-500 text-white'
        : 'border-gray-300 bg-white text-gray-500 group-hover:border-blue-400';
    }
    if (option.id === correctAnswer) {
      return 'border-green-500 bg-green-500 text-white';
    }
    if (selectedAnswer === option.id && option.id !== correctAnswer) {
      return 'border-red-500 bg-red-500 text-white';
    }
    return 'border-gray-300 bg-white text-gray-400';
  };

  return (
    <div className="space-y-4">
      {question.content && (
        <p className="text-lg font-medium text-gray-800">{question.content}</p>
      )}

      {question.media_image && (
        <img src={question.media_image} alt="" className="max-w-md rounded-lg" />
      )}

      {question.media_audio && (
        <audio controls src={question.media_audio} className="w-full" />
      )}

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={showResult}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 group ${getOptionClass(option)}`}
          >
            <span className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all text-sm font-semibold ${getRadioClass(option)}`}>
              {option.id.toUpperCase()}
            </span>
            <span className="text-gray-700 font-medium">{option.text}</span>
          </button>
        ))}
      </div>

      {showResult && (
        <div className="mt-4">
          {selectedAnswer === correctAnswer ? (
            <div className="text-green-600 font-medium">Chính xác!</div>
          ) : (
            <div className="text-red-600 font-medium">
              Sai. Đáp án đúng là: {options.find(o => o.id === correctAnswer)?.text || correctAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default McqQuestion;
