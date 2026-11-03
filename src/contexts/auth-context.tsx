import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { loginRequest, type User } from '@/services/api';
import { deleteItem, getItem, setItem } from '@/services/storage';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside an <AuthProvider />');
  }
  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([getItem(TOKEN_KEY), getItem(USER_KEY)]);
        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch {
        // An unreadable session is the same as being logged out.
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(username: string, password: string) {
    const session = await loginRequest(username, password);
    await Promise.all([
      setItem(TOKEN_KEY, session.token),
      setItem(USER_KEY, JSON.stringify(session.user)),
    ]);
    setToken(session.token);
    setUser(session.user);
  }

  async function logout() {
    try {
      await Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY)]);
    } finally {
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
