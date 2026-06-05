/**
 * Single source of truth for storing the JWT in the browser.
 * We use sessionStorage so the token doesn't survive a browser restart
 * (slightly safer than localStorage), and so the same browser can have
 * multiple tabs with different sessions if needed.
 */
const TOKEN_KEY = 'skillsync.accessToken';
const REFRESH_KEY = 'skillsync.refreshToken';
const USER_KEY = 'skillsync.user';

export function getAccessToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setAccessToken(token) {
  try { sessionStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
}
export function clearAccessToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch { /* ignore */ }
}
export function getRefreshToken() {
  try { return sessionStorage.getItem(REFRESH_KEY); } catch { return null; }
}
export function setRefreshToken(token) {
  try { sessionStorage.setItem(REFRESH_KEY, token); } catch { /* ignore */ }
}
export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function setStoredUser(user) {
  try { sessionStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* ignore */ }
}
