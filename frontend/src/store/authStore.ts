import { create } from 'zustand';
import api from '../api/client';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (email, password) => {
    set({ isLoading: true });
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    set({
      user: res.data.user,
      accessToken: res.data.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  register: async (username, email, password) => {
    set({ isLoading: true });
    const res = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    set({
      user: res.data.user,
      accessToken: res.data.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  loadUser: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));