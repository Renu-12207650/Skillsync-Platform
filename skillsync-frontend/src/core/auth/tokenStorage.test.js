import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAccessToken, setAccessToken, clearAccessToken,
  getRefreshToken, setRefreshToken,
  getStoredUser, setStoredUser
} from './tokenStorage.js';

describe('tokenStorage', () => {
  beforeEach(() => sessionStorage.clear());

  it('round-trips the access token', () => {
    setAccessToken('abc.def.ghi');
    expect(getAccessToken()).toBe('abc.def.ghi');
  });

  it('round-trips the refresh token', () => {
    setRefreshToken('refresh-xyz');
    expect(getRefreshToken()).toBe('refresh-xyz');
  });

  it('round-trips the stored user object', () => {
    const user = { authUserId: 42, email: 'me@x.com', role: 'ROLE_LEARNER' };
    setStoredUser(user);
    expect(getStoredUser()).toEqual(user);
  });

  it('clearAccessToken wipes everything', () => {
    setAccessToken('a');
    setRefreshToken('b');
    setStoredUser({ authUserId: 1 });
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('returns null for missing keys', () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
