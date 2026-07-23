import React from 'react';
import ClassCard from './ClassCard';

const ClassList = ({ classes }) => {
  if (!classes || classes.length === 0) {
    return (
      <div style={{ background: '#fff', padding: '28px', borderRadius: '18px', border: '1px dashed #D1D5DB', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '16px' }}>Bạn hiện chưa tham gia lớp nào.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
      {classes.map((item) => (
        <ClassCard
          key={item.id}
          classData={{
            ...item,
            color: item.color || '#4EC28A',
            avatar: item.name?.charAt(0)?.toUpperCase() || 'L',
            teacher: item.teacher?.name || 'Giáo viên'
          }}
        />
      ))}
    </div>
  );
};

export default ClassList;
