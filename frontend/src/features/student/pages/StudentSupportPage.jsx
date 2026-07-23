import React from 'react';
import StudentLayout from '../../../components/student/StudentLayout';

const StudentSupportPage = () => {
  return (
    <StudentLayout pageTitle="Trợ giúp">
      <div className="dashboard-section">
        {/* <h3 className="dashboard-section-title">Trợ giúp</h3> */}
        <div
          style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <p style={{ color: '#666', fontSize: '16px' }}>
            Tính năng trợ giúp sẽ được phát triển sớm.
          </p>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentSupportPage;
