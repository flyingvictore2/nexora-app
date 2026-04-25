import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  profiles?: Profile[];
  subscription?: any;
}

interface Profile {
  id: string;
  name: string;
  avatar?: string;
  isKids: boolean;
  language: string;
  isDefault: boolean;
}

interface AuthState {
  user: User | null;
  activeProfile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveProfile: (profile: Profile) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      activeProfile: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = res.data.data;
          Cookies.set('accessToken', accessToken, { expires: 1 });
          Cookies.set('refreshToken', refreshToken, { expires: 7 });

          const defaultProfile = user.profiles?.find((p: Profile) => p.isDefault) || user.profiles?.[0];
          if (defaultProfile) {
            Cookies.set('profileId', defaultProfile.id, { expires: 7 });
          }

          set({ user, isAuthenticated: true, activeProfile: defaultProfile || null });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', { email, password, name });
          const { user, accessToken, refreshToken } = res.data.data;
          Cookies.set('accessToken', accessToken, { expires: 1 });
          Cookies.set('refreshToken', refreshToken, { expires: 7 });

          const defaultProfile = user.profiles?.find((p: Profile) => p.isDefault);
          if (defaultProfile) {
            Cookies.set('profileId', defaultProfile.id, { expires: 7 });
          }

          set({ user, isAuthenticated: true, activeProfile: defaultProfile || null });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('profileId');
        set({ user: null, activeProfile: null, isAuthenticated: false });
      },

      setActiveProfile: (profile) => {
        Cookies.set('profileId', profile.id, { expires: 7 });
        set({ activeProfile: profile });
      },

      refreshUser: async () => {
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'nexora-auth',
      partialize: (state) => ({
        user: state.user,
        activeProfile: state.activeProfile,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
