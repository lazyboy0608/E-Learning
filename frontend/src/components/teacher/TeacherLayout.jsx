import React, { useState } from 'react';
import TeacherSidebar from './TeacherSidebar';
import TeacherHeader from './TeacherHeader';
import './teacher.css';

const TeacherLayout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="teacher-layout">
      <TeacherSidebar isOpen={sidebarOpen} />
      <div className="teacher-main">
        <TeacherHeader 
          title={pageTitle} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        <div className="teacher-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TeacherLayout;
