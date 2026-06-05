import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import authService from '../services/authService.js';
import userService from '../services/userService.js';
import {
  clearAccessToken, getAccessToken, getStoredUser,
  setAccessToken, setRefreshToken, setStoredUser
} from './tokenStorage.js';

const AuthContext = createContext(null);

/**
 * Top-level auth provider.
 * Exposes the current `user`, role helpers, and login/register/logout actions.
 *
 * The `user` object on the frontend has this shape:
 *   { authUserId, email, fullName, role, profile: UserProfileResponse | null,
 *     skillInterests: number[] (learner only, stored locally) }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [bootstrapped, setBootstrapped] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('skillsync-theme') || 'dark'; } catch { return 'dark'; }
  });
  const navigate = useNavigate();

  // Listen for global "unauthorized" so token expiry forces a re-login.
  // Skip the redirect when the user is already on a public auth page —
  // optional prefetches there (e.g. skillService.list on the register page)
  // can return 401 without meaning the user should be kicked out.
  useEffect(() => {
    const onUnauthorized = () => {
      const path = window.location.pathname || '';
      if (path.startsWith('/auth/')) return;
      setUser(null);
      navigate('/auth/login', { replace: true });
    };
    window.addEventListener('skillsync:unauthorized', onUnauthorized);
    return () => window.removeEventListener('skillsync:unauthorized', onUnauthorized);
  }, [navigate]);

  useEffect(() => {
    try { localStorage.setItem('skillsync-theme', theme); } catch { /* ignore */ }
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // On mount, if we have a token but no profile yet, hydrate from /users/me.
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const token = getAccessToken();
      const stored = getStoredUser();
      if (token && stored && !stored.profile) {
        try {
          const profile = await userService.getMyProfile();
          if (cancelled) return;
          const merged = { ...stored, profile };
          setStoredUser(merged);
          setUser(merged);
        } catch {
          // Profile may not exist yet (right after registration). Leave as is.
        }
      }
      setBootstrapped(true);
    }
    bootstrap();
    return () => { cancelled = true; };
  }, []);

  const persist = useCallback((authResponse, profile, extras = {}) => {
    setAccessToken(authResponse.accessToken);
    if (authResponse.refreshToken) setRefreshToken(authResponse.refreshToken);
    const fullUser = {
      authUserId: authResponse.userId,
      email: authResponse.email,
      fullName: authResponse.fullName,
      role: authResponse.role,
      profile: profile ?? null,
      skillInterests: extras.skillInterests ?? [],
      ...extras
    };
    setStoredUser(fullUser);
    setUser(fullUser);
    return fullUser;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const auth = await authService.login({ email, password });
    // High-privilege accounts (configured developer email) return
    // {otpRequired:true} and no tokens — caller must collect the OTP.
    if (auth?.otpRequired) {
      return auth;
    }
    let profile = null;
    try { profile = await userService.getMyProfile(); } catch { /* may not exist */ }
    return persist(auth, profile);
  }, [persist]);

  /** Called by LoginPage after a successful /auth/verify-otp response. */
  const completeOtpLogin = useCallback(async (auth) => {
    let profile = null;
    try { profile = await userService.getMyProfile(); } catch { /* may not exist */ }
    return persist(auth, profile);
  }, [persist]);

  const register = useCallback(async ({ fullName, email, password, role }) => {
    // Step 1 only — we now persist the user and let /onboarding collect the
    // role-specific profile (bio, skills, hourly rate, etc.) on step 2.
    const auth = await authService.register({ fullName, email, password, role });
    return persist(auth, null);
  }, [persist]);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    navigate('/auth/login', { replace: true });
  }, [navigate]);

  const updateProfileLocal = useCallback((profile) => {
    setUser((u) => {
      if (!u) return u;
      const merged = { ...u, profile };
      setStoredUser(merged);
      return merged;
    });
  }, []);

  const setSkillInterests = useCallback((skillInterests) => {
    setUser((u) => {
      if (!u) return u;
      const merged = { ...u, skillInterests };
      setStoredUser(merged);
      return merged;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    bootstrapped,
    theme,
    setTheme,
    isAuthenticated: !!user && !!getAccessToken(),
    isLearner: user?.role === 'ROLE_LEARNER',
    isMentor:  user?.role === 'ROLE_MENTOR',
    isAdmin:   user?.role === 'ROLE_ADMIN',
    login,
    completeOtpLogin,
    register,
    logout,
    updateProfileLocal,
    setSkillInterests
  }), [user, bootstrapped, theme, login, completeOtpLogin, register, logout, updateProfileLocal, setSkillInterests]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
