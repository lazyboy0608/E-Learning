import React, { useState } from 'react';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import './student.css';

const StudentLayout = ({ children, pageTitle, pageSubtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="student-layout">
      <StudentSidebar isOpen={sidebarOpen} />
      <div className="student-main">
        <StudentHeader 
          title={pageTitle} 
          subtitle={pageSubtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        <div className="student-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
