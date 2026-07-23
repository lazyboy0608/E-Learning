import { useState } from 'react';
import { FiBell } from 'react-icons/fi';

import useNotifications from '../../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead
  } = useNotifications();

  return (
    <div className="notification-bell">

      <button
        className="teacher-header-btn"
        onClick={() => setOpen(!open)}
      >
        <FiBell />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          onRead={markAsRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;