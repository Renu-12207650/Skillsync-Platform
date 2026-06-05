import apiClient from '../api/client.js';

/**
 * Wraps the /users/* endpoints from skillsync-user-service.
 * Profile fields: fullName, bio, profileImageUrl, linkedinUrl, githubUrl.
 */
export const userService = {
  /** Create a new user profile (called once after register). */
  createProfile: (payload) => apiClient.post('/users', payload).then(r => r.data),

  getMyProfile:  () => apiClient.get('/users/me').then(r => r.data),
  getProfile:    (authUserId) => apiClient.get(`/users/${authUserId}`).then(r => r.data),
  updateProfile: (payload) => apiClient.put('/users/me', payload).then(r => r.data),
  listProfiles:  () => apiClient.get('/users').then(r => r.data)
};

export default userService;
