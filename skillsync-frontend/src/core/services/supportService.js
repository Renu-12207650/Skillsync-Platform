import apiClient from '../api/client.js';

/**
 * Wraps the /support endpoints exposed by skillsync-notification-service.
 * Used by the "Nikki" in-app helper bot ("Contact admins") and by the
 * Admin console's Support inbox tab.
 */
export const supportService = {
  submit:    (payload) => apiClient.post('/support/messages', payload).then((r) => r.data),
  mine:      ()        => apiClient.get('/support/messages/mine').then((r) => r.data),
  listAll:   (status)  => apiClient.get('/support/messages', { params: status ? { status } : {} }).then((r) => r.data),
  resolve:   (id, adminNote) =>
    apiClient.put(`/support/messages/${id}/resolve`, { adminNote: adminNote || '' }).then((r) => r.data)
};

export default supportService;
