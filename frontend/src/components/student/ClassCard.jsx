import React, { useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ClassCard = ({ classData, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/student/classes/${classData.id}`);
  };

  return (
    <div className="class-card">
      {/* Card Header with Color */}
      <div
        className="class-card-header"
        style={{ backgroundColor: classData.color }}
      >
        <div className="class-card-info">
          <h3 className="class-card-title" onClick={handleCardClick}>
            {classData.name}
          </h3>
          <p className="class-card-teacher">{classData.teacher}</p>
        </div>
        <div className="class-card-avatar">{classData.avatar}</div>
      </div>

      {/* Card Footer with Menu */}
      <div className="class-card-footer">
        <button
          className="class-card-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FiMoreVertical />
        </button>
        {menuOpen && (
          <div className="class-card-menu-dropdown">
            <button onClick={handleCardClick}>Xem chi tiết</button>
            <button>Xóa</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;
