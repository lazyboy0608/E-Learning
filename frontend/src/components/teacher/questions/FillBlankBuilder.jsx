import { useState } from 'react';

export function FillBlankBuilder({ data, onChange, onSave, onCancel }) {
  const [correctAnswers, setCorrectAnswers] = useState(data.correct_answers || ['']);
  const [caseSensitive, setCaseSensitive] = useState(data.case_sensitive || false);

  const addBlank = () => {
    if (correctAnswers.length < 10) {
      setCorrectAnswers([...correctAnswers, '']);
    }
  };

  const removeBlank = (index) => {
    if (correctAnswers.length > 1) {
      setCorrectAnswers(correctAnswers.filter((_, i) => i !== index));
    }
  };

  const updateAnswer = (index, value) => {
    setCorrectAnswers(correctAnswers.map((a, i) => i === index ? value : a));
  };

  const handleSave = () => {
    if (correctAnswers.some(a => !a.trim())) {
      alert('Vui lòng nhập đầy đủ các đáp án');
      return;
    }
    onSave({
      correct_answers: correctAnswers,
      case_sensitive: caseSensitive,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-blue-700">Câu hỏi Điền chỗ trống (Fill Blank)</h3>
      <p className="text-sm text-gray-600">
        Nhập các đáp án đúng theo thứ tự từ trái sang phải trong nội dung câu hỏi
      </p>

      <div className="space-y-2">
        {correctAnswers.map((answer, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="font-medium text-gray-600">Chỗ {index + 1}:</span>
            <input
              type="text"
              value={answer}
              onChange={(e) => updateAnswer(index, e.target.value)}
              placeholder={`Đáp án cho chỗ trống ${index + 1}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
            {correctAnswers.length > 1 && (
              <button
                type="button"
                onClick={() => removeBlank(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Xoá
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addBlank}
        disabled={correctAnswers.length >= 10}
        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        + Thêm chỗ trống
      </button>

      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded">
        <input
          type="checkbox"
          id="case_sensitive"
          checked={caseSensitive}
          onChange={(e) => setCaseSensitive(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="case_sensitive" className="text-sm">
          Phân biệt hoa thường
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Lưu cấu hình
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Huỷ
        </button>
      </div>
    </div>
  );
}

export default FillBlankBuilder;
