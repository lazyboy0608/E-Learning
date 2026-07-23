export function AnswerFeedback({ result }) {
  if (!result) return null;

  return (
    <div className={`p-4 rounded-lg ${
      result.is_correct
        ? 'bg-green-100 border border-green-400'
        : 'bg-red-100 border border-red-400'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {result.is_correct ? (
          <span className="text-green-600 text-2xl">&#10003;</span>
        ) : (
          <span className="text-red-600 text-2xl">&#10007;</span>
        )}
        <span className={`font-bold ${
          result.is_correct ? 'text-green-700' : 'text-red-700'
        }`}>
          {result.is_correct ? 'Chính xác!' : 'Chưa đúng'}
        </span>
      </div>

      {result.explanation && (
        <div className="mt-3 text-gray-700">
          <strong>Giải thích:</strong>
          <p className="mt-1">{result.explanation}</p>
        </div>
      )}

      {result.correct_answer && !result.is_correct && (
        <div className="mt-2 text-gray-700">
          <strong>Đáp án đúng:</strong>
          <p className="mt-1">
            {typeof result.correct_answer === 'object'
              ? JSON.stringify(result.correct_answer)
              : result.correct_answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default AnswerFeedback;
