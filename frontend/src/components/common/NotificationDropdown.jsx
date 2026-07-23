import NotificationItem from './NotificationItem';

const NotificationDropdown = ({
  notifications,
  onRead
}) => {
  return (
    <div className="notification-dropdown">

      <div className="notification-header">
        Thông báo
      </div>

      {notifications.length === 0 ? (
        <div className="notification-empty">
          Chưa có thông báo
        </div>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={onRead}
          />
        ))
      )}
    </div>
  );
};

export default NotificationDropdown;