import React from 'react';
import { FiFileText } from 'react-icons/fi';

const AssignmentCard = ({ assignment }) => {
  return (
    <div className="assignment-card">
      <div className="assignment-icon">
        <FiFileText />
      </div>
      <div className="assignment-content">
        <h4 className="assignment-title">{assignment.title}</h4>
      </div>
    </div>
  );
};

export default AssignmentCard;
