import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthUser, googleSignIn as apiGoogleSignIn } from '../api/authApi';

const TOKEN_KEY = 'rift-auth-token';
const USER_KEY  = 'rift-auth-user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

interface AuthContextValue {
  user: AuthUser | null;
  signIn: (credential: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  });

  const signIn = useCallback(async (credential: string) => {
    const resp = await apiGoogleSignIn(credential);
    localStorage.setItem(TOKEN_KEY, resp.token);
    localStorage.setItem(USER_KEY, JSON.stringify(resp.user));
    setUser(resp.user);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
