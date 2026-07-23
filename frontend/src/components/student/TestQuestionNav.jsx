import { FiFlag } from 'react-icons/fi';

export function TestQuestionNav({ 
  questions, 
  currentIndex, 
  answers,
  flaggedQuestions = [],
  onNavigate 
}) {
  const getQuestionStatus = (index) => {
    const questionId = questions[index]?.id;
    const isAnswered = answers[questionId] != null;
    const isFlagged = flaggedQuestions.includes(questionId);

    return { isAnswered, isFlagged };
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>
        Danh sách câu hỏi
      </h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-10 text-xs" style={{marginBottom: '16px'}}>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></span>
          <span className="text-gray-600">Chưa trả lời</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-blue-500 border border-blue-600"></span>
          <span className="text-gray-600">Đã trả lời</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-yellow-400 border border-yellow-500 flex items-center justify-center">
            <FiFlag className="text-xs text-yellow-800" />
          </span>
          <span className="text-gray-600">Đánh dấu</span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-6 gap-2">
        {questions.map((question, index) => {
          const { isAnswered, isFlagged } = getQuestionStatus(index);
          const isCurrent = index === currentIndex;

          let buttonClasses = 'w-full aspect-square rounded-lg font-semibold text-sm transition-all duration-200 ';
          
          if (isCurrent) {
            buttonClasses += 'ring-2 ring-offset-2 ring-blue-500 ';
          }
          
          if (isFlagged) {
            buttonClasses += 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border border-yellow-500 ';
          } else if (isAnswered) {
            buttonClasses += 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 ';
          } else {
            buttonClasses += 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 ';
          }

          return (
            <button
              key={question.id}
              onClick={() => onNavigate(index)}
              className={buttonClasses}
              title={`Cau ${index + 1}${isAnswered ? ' - Da tra loi' : ''}${isFlagged ? ' - Da danh dau' : ''}`}
            >
              <span className="flex items-center justify-center gap-1">
                {index + 1}
                {isFlagged && <FiFlag className="text-xs" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e5e7eb', fontSize: '13px', color: '#6b7280' }}>
        <div className="flex justify-between">
          <span>Đã trả lời: {Object.keys(answers).filter(id => answers[id] != null).length}/{questions.length}</span>
          <span>Đã đánh dấu: {flaggedQuestions.length}</span>
        </div>
      </div>
    </div>
  );
}

export default TestQuestionNav;
