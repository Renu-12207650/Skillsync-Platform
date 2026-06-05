import axios from 'axios';
import { getAccessToken, clearAccessToken } from '../auth/tokenStorage.js';

/**
 * Axios instance pointed at the API gateway.
 * - In dev, requests use Vite's proxy (empty base URL).
 * - In Docker/prod, the same-origin Nginx config forwards /auth, /users, etc.
 *   to the gateway, so an empty base URL still works.
 * - You can override at build time with VITE_API_BASE_URL.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT on every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralised error handling. Auto-logout on 401, expose readable messages.
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 401 && !error.config?._skipAuthRedirect) {
      clearAccessToken();
      // Defer navigation to consumers (AuthContext listens for this).
      window.dispatchEvent(new CustomEvent('skillsync:unauthorized'));
    }

    const message = (typeof data === 'string' && data)
      || data?.message
      || data?.error
      || error.message
      || 'Something went wrong';
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;
