import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBookOpen,
  FiBarChart2,
  FiHelpCircle,
  FiChevronDown,
  FiBook,
  FiFileText,
  FiEdit,
} from "react-icons/fi";
import classApi from "../../api/classApi";

const StudentSidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [classesOpen, setClassesOpen] = useState(true);
  const [classes, setClasses] = useState([]);

  const isActive = (path) => location.pathname === path;
  const isClassActive = (classId) =>
    location.pathname === `/student/classes/${classId}`;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await classApi.getClasses();
        const classesData = response?.data || [];
        if (Array.isArray(classesData)) {
          setClasses(classesData);
        }
      } catch (error) {
        console.error('Failed to fetch classes for sidebar:', error);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className={`student-sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Logo */}
      <div className="student-sidebar-logo">
        <div className="student-logo-icon">
          <FiBook size={20} />
        </div>
        E-Learning
      </div>

      {/* Navigation Menu */}
      <nav className="student-sidebar-nav">
        {/* Dashboard */}
        <div
          className={`nav-item ${isActive("/student/dashboard") ? "active" : ""}`}
          onClick={() => navigate("/student/dashboard")}
        >
          <FiHome className="nav-icon" />
          <span className="nav-text">Màn hình chính</span>
        </div>

        {/* Classes */}
        <div className="nav-item-group">
          <div
            className="nav-item"
            onClick={() => setClassesOpen(!classesOpen)}
          >
            <FiBookOpen className="nav-icon" />
            <span className="nav-text">Lớp học của tôi</span>
            <FiChevronDown
              className={`nav-chevron ${classesOpen ? "open" : ""}`}
            />
          </div>

          {/* Classes Dropdown */}
          {classesOpen && (
            <div className="nav-dropdown">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className={`nav-dropdown-item ${
                    isClassActive(cls.id) ? "active" : ""
                  }`}
                  onClick={() => navigate(`/student/classes/${cls.id}`)}
                >
                  {cls.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exams */}
        <div
          className={`nav-item ${isActive("/student/tests") ? "active" : ""}`}
          onClick={() => navigate('/student/tests')}
        >
          <FiBookOpen className="nav-icon" />
          <span className="nav-text">Bài kiểm tra</span>
        </div>

        {/* System Tests */}
        <div
          className={`nav-item ${isActive("/student/system-tests") ? "active" : ""}`}
          onClick={() => navigate('/student/system-tests')}
        >
          <FiFileText className="nav-icon" />
          <span className="nav-text">Làm bài test hệ thống</span>
        </div>

        {/* Grades */}
        <div
          className={`nav-item ${isActive("/student/grades") ? "active" : ""}`}
          onClick={() => navigate("/student/grades")}
        >
          <FiBarChart2 className="nav-icon" />
          <span className="nav-text">Kết quả học tập</span>
        </div>

        {/* Practice */}
        <div
          className={`nav-item ${isActive("/student/practice") ? "active" : ""}`}
          onClick={() => navigate('/student/practice')}
        >
          <FiEdit className="nav-icon" />
          <span className="nav-text">Bài tập ôn tập</span>
        </div>

        {/* Support */}
        <div
          className={`nav-item ${isActive("/student/support") ? "active" : ""}`}
          onClick={() => navigate("/student/support")}
        >
          <FiHelpCircle className="nav-icon" />
          <span className="nav-text">Trợ giúp</span>
        </div>
      </nav>
    </div>
  );
};

export default StudentSidebar;
