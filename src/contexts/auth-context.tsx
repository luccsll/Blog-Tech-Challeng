import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { loginRequest, setAuthToken, setUnauthorizedHandler, type User } from '@/services/api';
import { deleteItem, getItem, setItem } from '@/services/storage';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  /** Only professors can write posts and manage professores/alunos. */
  isProfessor: boolean;
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
        const parsedUser: Partial<User> | null = storedUser ? JSON.parse(storedUser) : null;
        // Sessions saved before roles existed have no role: make the user log in again.
        if (storedToken && parsedUser?.role) {
          setUser(parsedUser as User);
          setToken(storedToken);
          setAuthToken(storedToken);
        }
      } catch {
        // An unreadable session is the same as being logged out.
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  });

  async function login(username: string, password: string) {
    const session = await loginRequest(username, password);
    await Promise.all([
      setItem(TOKEN_KEY, session.token),
      setItem(USER_KEY, JSON.stringify(session.user)),
    ]);
    setAuthToken(session.token);
    setToken(session.token);
    setUser(session.user);
  }

  async function logout() {
    setAuthToken(null);
    try {
      await Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY)]);
    } finally {
      setToken(null);
      setUser(null);
    }
  }

  const isProfessor = user?.role === 'professor';

  return (
    <AuthContext.Provider value={{ token, user, isLoading, isProfessor, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
