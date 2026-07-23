import { useState, useEffect } from "react";

export function McqBuilder({ data, onChange, onSave, onCancel }) {
  const [options, setOptions] = useState(
    data.options || [
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" },
    ],
  );
  const [correctAnswers, setCorrectAnswers] = useState(
    data.correct_answers || [],
  );

  useEffect(() => {
    setOptions(
      data.options || [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
    );

    setCorrectAnswers(
      data.correct_answers ||
        (data.correct_answer ? [data.correct_answer] : []),
    );
  }, [data]);

  const addOption = () => {
    const newId = String.fromCharCode(65 + options.length);
    if (options.length < 6) {
      setOptions([...options, { id: newId, text: "" }]);
    }
  };

  const removeOption = (id) => {
    if (options.length > 2) {
      setOptions(options.filter((o) => o.id !== id));
    }
  };

  const updateOption = (id, text) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleSave = () => {
    if (options.some((o) => !o.text.trim())) {
      alert("Vui lòng nhập đầy đủ nội dung các đáp án");
      return;
    }
    if (correctAnswers.length === 0) {
      alert("Vui lòng chọn đáp án đúng");
      return;
    }
    onSave({
      options,
      correct_answers: correctAnswers,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-blue-700">
        Câu hỏi Trắc nghiệm (MCQ)
      </h3>
      <p className="text-sm text-gray-600">
        Chọn đáp án đúng bằng cách click vào radio button
      </p>

      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              name="correct_answers"
              checked={correctAnswers.includes(option.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setCorrectAnswers([...correctAnswers, option.id]);
                } else {
                  setCorrectAnswers(
                    correctAnswers.filter((id) => id !== option.id),
                  );
                }
              }}
              className="w-5 h-5 text-green-600"
            />
            <span className="font-medium w-8 bg-gray-200 px-2 py-1 rounded text-center">
              {option.id}
            </span>
            <input
              type="text"
              value={option.text}
              onChange={(e) => updateOption(option.id, e.target.value)}
              placeholder={`Nhập đáp án ${option.id}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(option.id)}
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
        onClick={addOption}
        disabled={options.length >= 6}
        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        + Thêm đáp án
      </button>

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

export default McqBuilder;
