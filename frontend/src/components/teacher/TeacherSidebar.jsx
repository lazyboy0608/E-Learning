import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBookOpen,
  FiFileText,
  FiHelpCircle,
  FiChevronDown,
  FiBook,
} from "react-icons/fi";
import classApi from "../../api/classApi";

const TeacherSidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [classesOpen, setClassesOpen] = useState(true);
  const [classes, setClasses] = useState([]);

  const isActive = (path) => location.pathname === path;
  const isClassActive = (classId) =>
    location.pathname === `/teacher/classes/${classId}`;

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
    <div className={`teacher-sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Logo */}
      <div className="teacher-sidebar-logo">
        <div className="teacher-logo-icon">
          <FiBook size={20} />
        </div>
        E-Learning
      </div>

      {/* Navigation Menu */}
      <nav className="teacher-sidebar-nav">
        {/* Dashboard */}
        <div
          className={`nav-item ${isActive("/teacher/dashboard") ? "active" : ""}`}
          onClick={() => navigate("/teacher/dashboard")}
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
                  onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                >
                  {cls.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`nav-item ${isActive("/teacher/practice") ? "active" : ""}`}
          onClick={() => navigate("/teacher/practice")}
        >
          <FiFileText className="nav-icon" />
          <span className="nav-text">Bài tập ôn tập</span>
        </div>

        <div
          className={`nav-item ${isActive("/teacher/tests") ? "active" : ""}`}
          onClick={() => navigate("/teacher/tests")}
        >
          <FiFileText className="nav-icon" />
          <span className="nav-text">Bài kiểm tra</span>
        </div>

        <div
          className={`nav-item ${isActive("/teacher/questions") ? "active" : ""}`}
          onClick={() => navigate("/teacher/questions")}
        >
          <FiHelpCircle className="nav-icon" />
          <span className="nav-text">Quản lý câu hỏi</span>
        </div>

        {/* Support */}
        <div
          className={`nav-item ${isActive("/teacher/support") ? "active" : ""}`}
          onClick={() => navigate("/teacher/support")}
        >
          <FiHelpCircle className="nav-icon" />
          <span className="nav-text">Trợ giúp</span>
        </div>
      </nav>
    </div>
  );
};

export default TeacherSidebar;
