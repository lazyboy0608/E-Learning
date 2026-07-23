import { useState } from 'react';

export function MatchingBuilder({ data, onChange, onSave, onCancel }) {
  const [leftItems, setLeftItems] = useState(data.left || ['', '']);
  const [rightItems, setRightItems] = useState(data.right || ['', '']);
  const [correctMatches, setCorrectMatches] = useState(data.correct_matches || {});
  const [matchStep, setMatchStep] = useState({ left: null, right: null });

  const updateLeft = (index, value) => {
    const newLeft = [...leftItems];
    newLeft[index] = value;
    setLeftItems(newLeft);
  };

  const updateRight = (index, value) => {
    const newRight = [...rightItems];
    newRight[index] = value;
    setRightItems(newRight);
  };

  const addPair = () => {
    if (leftItems.length < 8) {
      setLeftItems([...leftItems, '']);
      setRightItems([...rightItems, '']);
    }
  };

  const removePair = (index) => {
    if (leftItems.length > 2) {
      const newLeft = leftItems.filter((_, i) => i !== index);
      const newRight = rightItems.filter((_, i) => i !== index);
      setLeftItems(newLeft);
      setRightItems(newRight);
      const newMatches = {};
      Object.entries(correctMatches).forEach(([k, v]) => {
        const oldLeft = parseInt(k);
        const oldRight = parseInt(v);
        if (oldLeft < index && oldRight < index) {
          newMatches[oldLeft] = oldRight;
        } else if (oldLeft < index && oldRight > index) {
          newMatches[oldLeft] = oldRight - 1;
        } else if (oldLeft > index && oldRight < index) {
          newMatches[oldLeft - 1] = oldRight;
        } else if (oldLeft > index && oldRight > index) {
          newMatches[oldLeft - 1] = oldRight - 1;
        }
      });
      setCorrectMatches(newMatches);
    }
  };

  const handleMatchClick = (side, index) => {
    if (matchStep.left === null && side === 'left') {
      setMatchStep({ left: index, right: null });
    } else if (matchStep.left !== null && side === 'right') {
      const newMatches = { ...correctMatches, [matchStep.left]: index };
      setCorrectMatches(newMatches);
      setMatchStep({ left: null, right: null });
    } else if (side === 'left') {
      setMatchStep({ left: index, right: null });
    }
  };

  const clearMatch = (leftIndex) => {
    const newMatches = { ...correctMatches };
    delete newMatches[leftIndex];
    setCorrectMatches(newMatches);
  };

  const handleSave = () => {
    if (leftItems.some(l => !l.trim()) || rightItems.some(r => !r.trim())) {
      alert('Vui lòng nhập đầy đủ nội dung các cặp');
      return;
    }
    if (Object.keys(correctMatches).length !== leftItems.length) {
      alert('Vui lòng nối đủ các cặp');
      return;
    }
    onSave({
      left: leftItems,
      right: rightItems,
      correct_matches: correctMatches,
    });
  };

  const isLeftSelected = (index) => matchStep.left === index;
  const isRightMatchable = (index) => matchStep.left !== null && !Object.values(correctMatches).includes(index);
  const isLeftMatched = (index) => index.toString() in correctMatches;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-blue-700">Câu hỏi Nối cột (Matching)</h3>
      <p className="text-sm text-gray-600">Nhập nội dung, click chọn cột trái trước, sau đó click cột phải để nối</p>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium mb-3 text-gray-700">Cột trái (click để chọn)</h4>
          {leftItems.map((item, index) => (
            <div key={`left-${index}`} className="flex items-center gap-2 mb-2">
              <span className="w-8 text-center bg-gray-200 px-2 py-1 rounded font-medium">{index + 1}</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateLeft(index, e.target.value)}
                placeholder={`Mục ${index + 1}`}
                className="flex-1 px-3 py-2 border rounded focus:border-blue-500 focus:outline-none"
              />
              {leftItems.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePair(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Xoá
                </button>
              )}
              <button
                type="button"
                onClick={() => handleMatchClick('left', index)}
                className={`px-2 py-1 rounded text-sm ${
                  isLeftSelected(index)
                    ? 'bg-blue-500 text-white'
                    : isLeftMatched(index)
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 hover:bg-blue-100'
                }`}
              >
                {isLeftMatched(index) ? 'Đã nối' : isLeftSelected(index) ? 'Đang chọn' : 'Nối'}
              </button>
              {isLeftMatched(index) && (
                <button
                  type="button"
                  onClick={() => clearMatch(index)}
                  className="text-red-500 text-sm"
                >
                  Huỷ
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-medium mb-3 text-gray-700">Cột phải (click để nối)</h4>
          {rightItems.map((item, index) => (
            <div key={`right-${index}`} className="flex items-center gap-2 mb-2">
              <span className="w-8 text-center bg-gray-200 px-2 py-1 rounded font-medium">{index + 1}</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateRight(index, e.target.value)}
                placeholder={`Đáp án ${index + 1}`}
                className="flex-1 px-3 py-2 border rounded focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleMatchClick('right', index)}
                disabled={!isRightMatchable(index) && !Object.values(correctMatches).includes(index)}
                className={`px-2 py-1 rounded text-sm ${
                  Object.values(correctMatches).includes(index)
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : isRightMatchable(index)
                    ? 'bg-blue-100 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {Object.values(correctMatches).includes(index) ? 'Đã nối' : 'Nối'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={addPair}
        disabled={leftItems.length >= 8}
        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        + Thêm cặp
      </button>

      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Đã nối:</strong> {Object.keys(correctMatches).length}/{leftItems.length} cặp
        </p>
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

export default MatchingBuilder;
