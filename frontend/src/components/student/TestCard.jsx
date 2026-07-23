import React from 'react';

const TestCard = ({ testItem }) => {
  return (
    <div className="class-detail-card test-card">
      <h3>{testItem.title}</h3>
      <p className="test-description">Thời lượng: {testItem.duration}</p>
      <p className="class-detail-meta">
        Số câu hỏi: {testItem.totalQuestions}
      </p>
      <div className="class-detail-action">
        <button type="button" className="class-detail-button">
          Bắt đầu
        </button>
      </div>
    </div>
  );
};

export default TestCard;
