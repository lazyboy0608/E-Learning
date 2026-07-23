const NotificationItem = ({ notification, onRead }) => {
  return (
    <div
      className={`notification-item ${
        !notification.read_at ? 'unread' : ''
      }`}
      onClick={() => {
        if (!notification.read_at) {
          onRead(notification.id);
        }
      }}
    >
      <div className="notification-title">
        {notification.data.title}
      </div>

      <div className="notification-message">
        {notification.data.message}
      </div>
    </div>
  );
};

export default NotificationItem;