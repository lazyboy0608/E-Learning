import { useState, useEffect } from 'react';

export function TableFillBuilder({ data, onChange, onSave, onCancel }) {
  const [rows, setRows] = useState(data.rows || 2);
  const [cols, setCols] = useState(data.cols || 2);
  const [correctAnswers, setCorrectAnswers] = useState(data.correct_answers || {});

  useEffect(() => {
    const newAnswers = { ...correctAnswers };
    for (let r = 0; r < rows; r++) {
      if (!newAnswers[r]) newAnswers[r] = {};
      for (let c = 0; c < cols; c++) {
        if (!newAnswers[r][c]) newAnswers[r][c] = '';
      }
    }
    Object.keys(newAnswers).forEach(r => {
      if (parseInt(r) >= rows) delete newAnswers[r];
      else {
        Object.keys(newAnswers[r]).forEach(c => {
          if (parseInt(c) >= cols) delete newAnswers[r][c];
        });
      }
    });
    setCorrectAnswers(newAnswers);
  }, [rows, cols]);

  const handleSave = () => {
    const hasEmpty = Object.values(correctAnswers).some(row =>
      Object.values(row).some(cell => !cell.trim())
    );
    if (hasEmpty) {
      alert('Vui lòng nhập đầy đủ các đáp án');
      return;
    }
    onSave({
      rows,
      cols,
      correct_answers: correctAnswers,
    });
  };

  const updateCell = (row, col, value) => {
    const newAnswers = JSON.parse(JSON.stringify(correctAnswers));
    if (!newAnswers[row]) newAnswers[row] = {};
    newAnswers[row][col] = value;
    setCorrectAnswers(newAnswers);
  };

  const getCellValue = (row, col) => {
    return correctAnswers[row]?.[col] || '';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-blue-700">Câu hỏi Điền bảng (Table Fill)</h3>
      <p className="text-sm text-gray-600">Nhập đáp án đúng vào các ô trong bảng</p>

      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Số hàng:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={rows}
            onChange={(e) => setRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 2)))}
            className="w-20 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Số cột:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={cols}
            onChange={(e) => setCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 2)))}
            className="w-20 px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-300">
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex} className="border border-gray-300 p-2 bg-white">
                    <div className="text-xs text-gray-500 mb-1 text-center">
                      H{rowIndex + 1},C{colIndex + 1}
                    </div>
                    <input
                      type="text"
                      value={getCellValue(rowIndex, colIndex)}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      placeholder="..."
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Tổng cộng: {rows * cols} ô cần nhập đáp án
      </p>

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

export default TableFillBuilder;
