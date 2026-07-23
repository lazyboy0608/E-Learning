export function PracticeProgress({ current, total, correct, incorrect }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-600">Tien do</span>
        <span className="font-bold">{current}/{total}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between mt-3 text-sm">
        <span className="text-green-600">&#10003; Dung: {correct}</span>
        <span className="text-red-600">&#10007; Sai: {incorrect}</span>
      </div>
    </div>
  );
}

export default PracticeProgress;
