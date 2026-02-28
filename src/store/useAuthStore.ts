import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  expiresAt: number | null;
  user: User | null;
  isAuth: boolean;

  setToken: (token: string, ttlMinutes: number) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isExpired: () => boolean;
}

const getStoredAuth = () => {
  const raw = localStorage.getItem('auth');
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  if (Date.now() > parsed.expiresAt) {
    localStorage.removeItem('auth');
    return null;
  }

  return parsed;
};

const storedAuth = getStoredAuth();

const useAuthStore = create<AuthState>((set, get) => ({
  token: storedAuth?.token ?? null,
  expiresAt: storedAuth?.expiresAt ?? null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuth: !!storedAuth?.token,

  setToken: (token, ttlMinutes) => {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

    localStorage.setItem('auth', JSON.stringify({ token, expiresAt }));

    set({
      token,
      expiresAt,
      isAuth: true,
    });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('user');

    set({
      token: null,
      expiresAt: null,
      user: null,
      isAuth: false,
    });
  },

  isExpired: () => {
    const { expiresAt } = get();
    if (!expiresAt) return true;
    return Date.now() > expiresAt;
  },
}));

export default useAuthStore;
