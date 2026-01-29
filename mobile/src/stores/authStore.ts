import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';
import { api } from '../services/api';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  signUpBusiness: (data: {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    phone?: string;
    business_name: string;
    subdomain: string;
    industry?: string;
  }) => Promise<void>;
  signUpClient: (data: {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { user, token } = await api.signIn(email, password);
      await AsyncStorage.setItem('auth_token', token);
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

    signUp: async (data) => {
      try {
        const { user, token } = await api.signUp(data);
        await AsyncStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        throw error;
      }
    },

    signUpBusiness: async (data) => {
      try {
        const { user, token } = await api.signUpBusiness(data);
        await AsyncStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        throw error;
      }
    },

    signUpClient: async (data) => {
      try {
        const { user, token } = await api.signUpClient(data);
        await AsyncStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        throw error;
      }
    },

    signOut: async () => {
    try {
      await api.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const user = await api.getMe();
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      await AsyncStorage.removeItem('auth_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const user = await api.updateProfile(data);
      set({ user });
    } catch (error) {
      throw error;
    }
  },
}));
