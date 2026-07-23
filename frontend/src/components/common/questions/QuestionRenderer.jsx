import { McqQuestion } from './McqQuestion';
import { FillBlankQuestion } from './FillBlankQuestion';
import { MatchingQuestion } from './MatchingQuestion';
import { TableFillQuestion } from './TableFillQuestion';

const questionComponents = {
  mcq: McqQuestion,
  fill_blank: FillBlankQuestion,
  matching: MatchingQuestion,
  table_fill: TableFillQuestion,
};

export function QuestionRenderer({ question, onAnswer, showResult = false, userAnswer = null }) {
  const QuestionComponent = questionComponents[question.type];

  if (!QuestionComponent) {
    return <div className="text-red-500">Loại câu hỏi không xác định: {question.type}</div>;
  }

  return (
    <QuestionComponent
      question={question}
      onAnswer={onAnswer}
      showResult={showResult}
      userAnswer={userAnswer}
    />
  );
}

export default QuestionRenderer;
