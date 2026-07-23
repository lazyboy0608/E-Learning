import React from 'react';
import './admin.css';

const StatCard = ({ title, value, icon, bgColor, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-info">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
      <div className="stat-card-icon" style={{ backgroundColor: bgColor, color: color }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
