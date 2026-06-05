import apiClient from '../api/client.js';

/**
 * Wraps /notifications/* endpoints from skillsync-notification-service.
 */
export const notificationService = {
  myAll: () => apiClient.get('/notifications/my').then(r => r.data),
  myUnread: () => apiClient.get('/notifications/my/unread').then(r => r.data),
  unreadCount: () => apiClient.get('/notifications/my/unread-count').then(r => r.data?.unreadCount ?? r.data?.count ?? 0),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`).then(r => r.data)
};

export default notificationService;
