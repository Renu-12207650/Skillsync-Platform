import apiClient from '../api/client.js';

/**
 * Wraps the /skills/* endpoints from skillsync-skill-service.
 */
export const skillService = {
  list:        () => apiClient.get('/skills').then(r => r.data),
  get:         (id) => apiClient.get(`/skills/${id}`).then(r => r.data),
  byCategory:  (cat) => apiClient.get(`/skills/category/${encodeURIComponent(cat)}`).then(r => r.data),
  create:      (payload) => apiClient.post('/skills', payload).then(r => r.data),
  update:      (id, payload) => apiClient.put(`/skills/${id}`, payload).then(r => r.data),
  remove:      (id) => apiClient.delete(`/skills/${id}`).then(r => r.data)
};

export default skillService;
