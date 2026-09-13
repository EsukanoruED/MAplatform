import React from 'react';
import { ApiError, api } from './api';
import type { CurrentUser } from './api';

/**
 * Session state for the app.
 *
 * The source of truth is the server: on mount this asks GET /api/auth/me, which
 * succeeds only if the browser holds a valid httpOnly session cookie. Nothing is
 * persisted client-side — no token in localStorage, and a page reload re-asks the
 * server rather than trusting anything it finds locally.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  status: AuthStatus;
  user: CurrentUser | null;
  /** Resolves on success; throws ApiError with the server's message on failure. */
  signIn: (email: string, password: string) => Promise<CurrentUser>;
  signInAdmin: (email: string, password: string) => Promise<CurrentUser>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>('loading');
  const [user, setUser] = React.useState<CurrentUser | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const { user: current } = await api.getCurrentUser();
      setUser(current);
      setStatus('authenticated');
    } catch (error) {
      // A 401 is the expected answer for a signed-out visitor, not a fault.
      if (!(error instanceof ApiError) || error.isUnauthenticated || error.status === 0) {
        setUser(null);
        setStatus('unauthenticated');
        return;
      }
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = React.useCallback(async (email: string, password: string) => {
    const { user: signedIn } = await api.loginCompany(email, password);
    setUser(signedIn);
    setStatus('authenticated');
    return signedIn;
  }, []);

  const signInAdmin = React.useCallback(async (email: string, password: string) => {
    const { user: signedIn } = await api.loginAdmin(email, password);
    setUser(signedIn);
    setStatus('authenticated');
    return signedIn;
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      await api.logout();
    } finally {
      // Clear locally even if the call failed — the cookie is gone or invalid
      // either way, and the guard must not keep showing protected content.
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signInAdmin, signOut, refresh }),
    [status, user, signIn, signInAdmin, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>.');
  return ctx;
}
