import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; first_name: string; last_name: string; subdomain: string }) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.signIn(email, password);
          if (response.success && response.data) {
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          } else {
            set({ error: response.error || 'Sign in failed', isLoading: false });
          }
        } catch (err) {
          set({ error: 'Sign in failed', isLoading: false });
        }
      },

      signUp: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.signUp(data);
          if (response.success && response.data) {
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          } else {
            set({ error: response.error || 'Sign up failed', isLoading: false });
          }
        } catch (err) {
          set({ error: 'Sign up failed', isLoading: false });
        }
      },

      signOut: async () => {
        try {
          await api.signOut();
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await api.getCurrentUser();
          if (response.success && response.data) {
            set({ user: response.data, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
