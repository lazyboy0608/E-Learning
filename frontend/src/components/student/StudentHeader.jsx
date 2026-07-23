import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
// import { getEcho } from "../../realtime/echo";

const StudentHeader = ({ title, subtitle, onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const subtitleText =
    subtitle || "Chào mừng trở lại! Tiếp tục hành trình học tập của bạn.";

  const handleLogout = async () => {
    await logout();
    setAccountDropdownOpen(false);
  };

  const handleSettings = () => {
    navigate("/student/settings");
    setAccountDropdownOpen(false);
  };

  // const { user } = useAuth();

  // useEffect(() => {
  //   if (!user?.id) return;

  //   console.log("Subscribe channel", user.id);

  //   echo
  //     .private(`notifications.${user.id}`)
  //     .listen(".notification.created", (event) => {
  //       console.log("Realtime notification:", event);
  //     });

  //   return () => {
  //     echo.leave(`private-notifications.${user.id}`);
  //   };
  // }, [user]);

  return (
    <header className="student-header">
      {/* Left: Menu & Title */}
      <div className="student-header-left">
        {/* <button className="student-menu-btn" onClick={onMenuClick}>
          <FiMenu />
        </button> */}
        <h2 className="student-header-title">{title}</h2>
        <p>{subtitleText}</p>
      </div>

      {/* Center: Search */}
      <div className="student-header-search">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          className="search-input"
        />
      </div>

      {/* Right: Actions */}
      <div className="student-header-right">
        <NotificationBell />
        <button className="student-header-btn">
          <FiMessageSquare />
        </button>

        {/* Account Dropdown */}
        <div className="student-account-menu">
          <button
            className="student-account-btn"
            onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
          >
            <div className="student-avatar">
              {(user?.full_name || user?.name || "S").charAt(0).toUpperCase()}
            </div>
            <span className="student-account-name">
              {user?.full_name || user?.name || "Student"}
            </span>
            <FiChevronDown
              className={`account-chevron ${accountDropdownOpen ? "open" : ""}`}
            />
          </button>

          {accountDropdownOpen && (
            <div className="student-account-dropdown">
              <button
                className="student-dropdown-item"
                onClick={handleSettings}
              >
                <FiSettings className="dropdown-icon" />
                Cài đặt
              </button>
              <button
                className="student-dropdown-item logout"
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
          className="student-overlay"
          onClick={() => setAccountDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default StudentHeader;
