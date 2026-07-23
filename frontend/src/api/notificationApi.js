import apiClient from './client';

const notificationApi = {
  getNotifications() {
    return apiClient.get('/notifications');
  },

  getUnreadCount() {
    return apiClient.get('/notifications/unread-count');
  },

  markAsRead(id) {
    return apiClient.patch(`/notifications/${id}/read`);
  }
};

export default notificationApi;