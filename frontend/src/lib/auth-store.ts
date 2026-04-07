import type { AuthUser } from '@/types/auth';

const ACCESS_KEY = 'cp_access_token';
const REFRESH_KEY = 'cp_refresh_token';
const USER_KEY = 'cp_user';

function isBrowser() {
  return typeof window !== 'undefined';
}

export const auth = {
  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  getUser(): AuthUser | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  setTokens(accessToken: string, refreshToken: string) {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  setUser(user: AuthUser) {
    if (!isBrowser()) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};
