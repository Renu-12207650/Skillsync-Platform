import apiClient from '../api/client.js';

/**
 * Wraps the /auth/* endpoints exposed by skillsync-auth-service.
 * All methods return the AuthResponse-like shape the backend ships.
 */
export const authService = {
  register: (payload) => apiClient.post('/auth/register', payload, { _skipAuthRedirect: true }).then(r => r.data),
  login:    (payload) => apiClient.post('/auth/login', payload, { _skipAuthRedirect: true }).then(r => r.data),
  forgotPassword: (email) =>
    apiClient.post('/auth/forgot-password', { email }, { _skipAuthRedirect: true }).then(r => r.data),
  resetPassword: ({ token, newPassword }) =>
    apiClient.post('/auth/reset-password', { token, newPassword }, { _skipAuthRedirect: true }).then(r => r.data),

  /** Admin only — create a user with any role (incl. ROLE_ADMIN). */
  adminCreateUser: (payload) => apiClient.post('/auth/admin/users', payload).then(r => r.data),

  /** Admin only — list all auth users including inactive accounts. */
  adminListUsers: () => apiClient.get('/auth/admin/users').then(r => r.data),

  /** Admin only — delete a user account. */
  adminDeleteUser: (userId) => apiClient.delete(`/auth/admin/users/${userId}`).then(r => r.data),

  /** Submit the email OTP to complete a developer login. */
  verifyOtp: (email, code) =>
    apiClient.post('/auth/verify-otp', { email, code }, { _skipAuthRedirect: true }).then(r => r.data),

  /** Returns { developer: boolean } — is the calling user the configured developer? */
  isDeveloper: () => apiClient.get('/auth/me/is-developer').then(r => r.data?.developer === true)
};

export default authService;
