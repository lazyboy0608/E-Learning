import { useState, useEffect } from "react";
import { McqQuestion } from "./McqQuestion";
import { FillBlankQuestion } from "./FillBlankQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { TableFillQuestion } from "./TableFillQuestion";

const questionComponents = {
  mcq: McqQuestion,
  fill_blank: FillBlankQuestion,
  matching: MatchingQuestion,
  table_fill: TableFillQuestion,
};

export function QuestionRenderer({
  question,
  onAnswer,
  answer: initialAnswer = null,
  showResult = false,
  result = null,
  userAnswer = null,
}) {
  const [answer, setAnswer] = useState(initialAnswer ?? userAnswer ?? null);
  const QuestionComponent = questionComponents[question.type];

  useEffect(() => {
    setAnswer(initialAnswer ?? userAnswer ?? null);
  }, [initialAnswer, userAnswer]);

  const handleAnswer = (newAnswer) => {
    setAnswer(newAnswer);
    onAnswer(newAnswer);
  };

  if (!QuestionComponent) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626',
        fontSize: '14px',
      }}>
        Loại câu hỏi không được hỗ trợ: <strong>{question.type}</strong>
      </div>
    );
  }

  return (
    <QuestionComponent
      question={question}
      onAnswer={handleAnswer}
      answer={answer}
      showResult={showResult}
      result={result}
    />
  );
}

export default QuestionRenderer;
