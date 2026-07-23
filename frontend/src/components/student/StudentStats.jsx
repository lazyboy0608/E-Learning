import React from 'react';

const StudentStats = ({ stats }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
      {[
        { label: '📚 Class', value: stats.classes, color: '#0B6DF6' },
        { label: '📝 Exams', value: stats.tests, color: '#0D9488' },
        { label: '✅ Completed', value: stats.completed, color: '#059669' },
        { label: '⭐ Average Score', value: stats.averageGrade !== null ? `${stats.averageGrade.toFixed(1)}%` : 'N/A', color: '#F59E0B' },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            flex: '1 1 200px',
            background: '#fff',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 15px 35px rgba(15, 23, 42, 0.08)',
            minWidth: '180px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#4B5563' }}>{item.label}</div>
          <div style={{ marginTop: '10px', fontSize: '28px', fontWeight: 700, color: item.color }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StudentStats;
