import { useAuth } from "../../contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiMessageSquare,
  FiSearch,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiMenu,
} from "react-icons/fi";
import NotificationBell from "../common/NotificationBell";
import { getEcho } from "../../realtime/echo";

const TeacherHeader = ({ title, onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setAccountDropdownOpen(false);
  };

  const handleSettings = () => {
    navigate("/teacher/settings");
    setAccountDropdownOpen(false);
  };

  return (
    <header className="teacher-header">
      {/* Left: Menu & Title */}
      <div className="teacher-header-left">
        <h2 className="teacher-header-title">{title}</h2>
      </div>

      {/* Center: Search */}
      <div className="teacher-header-search">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          className="search-input"
        />
      </div>

      {/* Right: Actions */}
      <div className="teacher-header-right">
        <NotificationBell />
        <button className="teacher-header-btn">
          <FiMessageSquare />
        </button>

        {/* Account Dropdown */}
        <div className="teacher-account-menu">
          <button
            className="teacher-account-btn"
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
          >
            <div className="teacher-avatar">
              {(user?.full_name || user?.name || "T").charAt(0).toUpperCase()}
            </div>

            <span className="teacher-account-name">
              {user?.full_name || user?.name || "Teacher"}
            </span>

            <FiChevronDown
              className={`account-chevron ${accountDropdownOpen ? "open" : ""}`}
            />
          </button>

          {accountDropdownOpen && (
            <div className="teacher-account-dropdown">
              <button
                className="teacher-dropdown-item"
                onClick={handleSettings}
              >
                <FiSettings className="dropdown-icon" />
                Cài đặt
              </button>

              <button
                className="teacher-dropdown-item logout"
                onClick={handleLogout}
              >
                <FiLogOut className="dropdown-icon" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {accountDropdownOpen && (
        <div
          className="teacher-overlay"
          onClick={() => setAccountDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default TeacherHeader;
