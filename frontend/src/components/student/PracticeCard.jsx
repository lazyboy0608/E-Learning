import React from 'react';

const PracticeCard = ({ practiceItem }) => {
  return (
    <div className="class-detail-card exercise-card">
      <h3>{practiceItem.title}</h3>
      <p className="exercise-description">{practiceItem.description}</p>
      <p className="class-detail-meta">Hạn nộp: {practiceItem.dueDate}</p>
      <div className="class-detail-action">
        <button type="button" className="class-detail-button">
          Làm bài
        </button>
      </div>
    </div>
  );
};

export default PracticeCard;
