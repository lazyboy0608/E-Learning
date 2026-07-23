import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiMessageSquare, FiChevronDown, FiBook, FiFileText, FiHelpCircle } from 'react-icons/fi';
import './admin.css';

const AdminSidebar = () => {
  const [isUsersOpen, setIsUsersOpen] = useState(true);
  const [isTestsOpen, setIsTestsOpen] = useState(true);
  const location = useLocation();

  const toggleUsers = (e) => {
    e.preventDefault();
    setIsUsersOpen(!isUsersOpen);
  };

  const toggleTests = (e) => {
    e.preventDefault();
    setIsTestsOpen(!isTestsOpen);
  };

  const isUsersActive = location.pathname.includes('/admin/teachers') || location.pathname.includes('/admin/students');
  const isTestsActive = location.pathname.includes('/admin/tests');
  const isQuestionsActive = location.pathname.includes('/admin/questions');

  return (
    <div className="admin-sidebar">
      <div className="admin-logo">
        <div className="admin-logo-icon">
          <FiBook size={20} />
        </div>
        E-Learning
      </div>

      <div className="admin-menu">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
        >
          <div className="admin-menu-item-content">
            <FiHome size={18} />
            Dashboard
          </div>
        </NavLink>

        <div 
          className={`admin-menu-item ${isUsersActive ? 'active' : ''}`} 
          onClick={toggleUsers}
        >
          <div className="admin-menu-item-content">
            <FiUsers size={18} />
            Quản lý người dùng
          </div>
          <FiChevronDown 
            size={16} 
            style={{ 
              transform: isUsersOpen ? 'rotate(180deg)' : 'rotate(0)', 
              transition: 'transform 0.3s ease' 
            }} 
          />
        </div>

        <div 
          className="admin-submenu" 
          style={{ maxHeight: isUsersOpen ? '120px' : '0' }}
        >
          <NavLink 
            to="/admin/teachers" 
            className={({ isActive }) => `admin-submenu-item ${isActive ? 'active' : ''}`}
          >
            Danh sách giáo viên
          </NavLink>
          <NavLink 
            to="/admin/students" 
            className={({ isActive }) => `admin-submenu-item ${isActive ? 'active' : ''}`}
          >
            Danh sách học sinh
          </NavLink>
        </div>

        <div 
          className={`admin-menu-item ${isTestsActive ? 'active' : ''}`} 
          onClick={toggleTests}
        >
          <div className="admin-menu-item-content">
            <FiFileText size={18} />
            Quản lý bài kiểm tra
          </div>
          <FiChevronDown 
            size={16} 
            style={{ 
              transform: isTestsOpen ? 'rotate(180deg)' : 'rotate(0)', 
              transition: 'transform 0.3s ease' 
            }} 
          />
        </div>

        <div 
          className="admin-submenu" 
          style={{ maxHeight: isTestsOpen ? '120px' : '0' }}
        >
          <NavLink 
            to="/admin/tests" 
            className={({ isActive }) => `admin-submenu-item ${isActive ? 'active' : ''}`}
          >
            Danh sách bài kiểm tra
          </NavLink>
          <NavLink 
            to="/admin/tests/create" 
            className={({ isActive }) => `admin-submenu-item ${isActive ? 'active' : ''}`}
          >
            Tạo bài kiểm tra mới
          </NavLink>
        </div>

        <NavLink
          to="/admin/questions"
          className={({ isActive }) => `admin-menu-item ${isActive || isQuestionsActive ? 'active' : ''}`}
        >
          <div className="admin-menu-item-content">
            <FiHelpCircle size={18} />
            Quản lý câu hỏi
          </div>
        </NavLink>

        <NavLink
          to="/admin/feedback" 
          className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
        >
          <div className="admin-menu-item-content">
            <FiMessageSquare size={18} />
            Feedback
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
