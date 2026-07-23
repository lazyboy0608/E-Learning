import React from 'react';
import { FiFileText, FiClock, FiCheckCircle } from 'react-icons/fi';
import './AssignmentCard.css';

const AssignmentCard = ({ assignment }) => {
  return (
    <div className="assignment-card">
      <div className="assignment-card-body">
        <div className="assignment-icon-wrapper">
          <div className="assignment-icon">
            <FiFileText />
          </div>
        </div>
        
        <div className="assignment-content">
          <h4 className="assignment-title">{assignment.title}</h4>
          <div className="assignment-meta">
            <span className="assignment-meta-item">
              <FiClock className="assignment-meta-icon" />
              {assignment.duration ? `${assignment.duration} phút` : 'Không giới hạn'}
            </span>
          </div>
        </div>

        <div className="assignment-status">
          <span className={`assignment-badge ${assignment.is_active ? 'active' : 'inactive'}`}>
            {assignment.is_active ? (
              <>
                <FiCheckCircle /> Đang mở
              </>
            ) : (
              'Đã đóng'
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
