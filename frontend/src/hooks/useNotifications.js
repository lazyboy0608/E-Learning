import { useEffect, useState } from "react";
import notificationApi from "../api/notificationApi";
import { useAuth } from "../contexts/AuthContext";
import { getEcho } from "../realtime/echo";

export default function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);

      setNotifications(listRes.data.data || []);
      setUnreadCount(countRes.data.count || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

    // realtime listener
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const echo = getEcho();

    if (!echo) {
      return;
    }

    console.log(
      'Subscribe:',
      `notifications.${user.id}`
    );

    echo
      .private(`notifications.${user.id}`)
      .listen(
        '.notification.created',
        (event) => {
          console.log(
            'Realtime notification:',
            event
          );

          fetchNotifications();
        }
      );

    return () => {
      echo.leave(
        `private-notifications.${user.id}`
      );
    };
  }, [user]);
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    refresh: fetchNotifications,
  };
}
