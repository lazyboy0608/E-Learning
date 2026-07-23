import { useState } from 'react';
import { McqBuilder } from './McqBuilder';
import { FillBlankBuilder } from './FillBlankBuilder';
import { MatchingBuilder } from './MatchingBuilder';
import { TableFillBuilder } from './TableFillBuilder';

const builderComponents = {
  mcq: McqBuilder,
  fill_blank: FillBlankBuilder,
  matching: MatchingBuilder,
  table_fill: TableFillBuilder,
};

export function QuestionBuilder({ type, initialData = {}, onSave, onCancel }) {
  const [questionData, setQuestionData] = useState(initialData);
  const BuilderComponent = builderComponents[type];

  if (!BuilderComponent) {
    return <div className="text-red-500">Loại câu hỏi không xác định</div>;
  }

  const handleSave = (data) => {
    onSave({
      ...questionData,
      ...data,
      type,
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <BuilderComponent
        data={questionData}
        onChange={setQuestionData}
        onSave={handleSave}
        onCancel={onCancel}
      />
    </div>
  );
}

export default QuestionBuilder;
