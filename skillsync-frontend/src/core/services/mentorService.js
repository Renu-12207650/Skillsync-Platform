import apiClient from '../api/client.js';

/**
 * Wraps /mentors/* endpoints from skillsync-mentor-service.
 * The backend returns a Spring Page<MentorProfileResponse> for search and
 * /pending. For convenience we expose a `.list` that returns the content array.
 */
export const mentorService = {
  apply:        (payload) => apiClient.post('/mentors/apply', payload).then(r => r.data),

  search:       (params = {}) =>
    apiClient.get('/mentors', { params }).then(r => r.data),

  list:         (params = {}) =>
    apiClient.get('/mentors', { params }).then(r => r.data?.content ?? []),

  getById:      (id) => apiClient.get(`/mentors/${id}`).then(r => r.data),
  getMyProfile: () => apiClient.get('/mentors/my-profile').then(r => r.data),
  pending:      (params = {}) =>
    apiClient.get('/mentors/pending', { params }).then(r => r.data),

  approve:      (id) => apiClient.put(`/mentors/${id}/approve`).then(r => r.data),
  reject:       (id) => apiClient.put(`/mentors/${id}/reject`).then(r => r.data)
};

export default mentorService;
