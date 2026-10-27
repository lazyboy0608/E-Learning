import { useEffect, useState, useCallback, useRef } from "react";
import notificationApi from "../api/notificationApi";
import { useAuth } from "../contexts/AuthContext";
import { getEcho } from "../realtime/echo";

export default function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isFetchingRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    // Tránh gửi nhiều request trùng lặp đồng thời
    if (isFetchingRef.current || !userId) return;
    isFetchingRef.current = true;

    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.getNotifications().catch(() => ({ data: { data: [] } })),
        notificationApi.getUnreadCount().catch(() => ({ data: { count: 0 } })),
      ]);

      setNotifications(listRes.data?.data || []);
      setUnreadCount(countRes.data?.count || 0);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [userId]);

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
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Realtime listener: Chỉ lắng nghe một lần dựa trên userId (primitive value)
  useEffect(() => {
    if (!userId) {
      return;
    }

    const echo = getEcho();
    if (!echo) {
      return;
    }

    const channelName = `notifications.${userId}`;
    const privateChannelName = `private-${channelName}`;

    echo
      .private(channelName)
      .listen('.notification.created', (event) => {
        console.log('Realtime notification received:', event);
        fetchNotifications();
      });

    return () => {
      echo.leave(privateChannelName);
    };
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    refresh: fetchNotifications,
  };
}
