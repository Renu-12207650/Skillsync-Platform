import apiClient from '../api/client.js';

/**
 * Wraps /sessions/* endpoints from skillsync-session-service.
 */
export const sessionService = {
  book: (payload) => apiClient.post('/sessions', payload).then(r => r.data),

  getById: (id) => apiClient.get(`/sessions/${id}`).then(r => r.data),

  myAsLearner: (params = {}) =>
    apiClient.get('/sessions/my/as-learner', { params }).then(r => r.data),

  myAsMentor: (params = {}) =>
    apiClient.get('/sessions/my/as-mentor', { params }).then(r => r.data),

  accept:   (id) => apiClient.put(`/sessions/${id}/accept`).then(r => r.data),
  reject:   (id, reason) => apiClient.put(`/sessions/${id}/reject`, { rejectionReason: reason }).then(r => r.data),
  cancel:   (id) => apiClient.put(`/sessions/${id}/cancel`).then(r => r.data),
  complete: (id) => apiClient.put(`/sessions/${id}/complete`).then(r => r.data)
};

export default sessionService;
