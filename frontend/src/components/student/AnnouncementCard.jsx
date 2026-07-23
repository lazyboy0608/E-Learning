import React from 'react';

const AnnouncementCard = ({ announcement }) => {
  return (
    <div className="class-detail-card announcement-card">
      <div className="announcement-header">
        <h3>{announcement.title}</h3>
        <span className="class-detail-meta">{announcement.createdAt}</span>
      </div>
      <p className="announcement-content">{announcement.content}</p>
    </div>
  );
};

export default AnnouncementCard;
