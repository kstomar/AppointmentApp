import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Business } from '../types';
import api from '../services/api';

interface BusinessState {
  currentBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;
  error: string | null;
  fetchBusinesses: () => Promise<void>;
  setCurrentBusiness: (business: Business | null) => void;
  clearError: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      currentBusiness: null,
      businesses: [],
      isLoading: false,
      error: null,

      fetchBusinesses: async () => {
        set({ isLoading: true, error: null });
        try {
          const businesses = await api.getBusinesses();
          if (businesses && businesses.length > 0) {
            const current = get().currentBusiness;
            // If no current business is set, use the first one
            const currentBusiness = current && businesses.find(b => b.id === current.id) 
              ? current 
              : businesses[0];
            set({ businesses, currentBusiness, isLoading: false });
          } else {
            set({ businesses: [], isLoading: false });
          }
        } catch {
          set({ error: 'Failed to fetch businesses', isLoading: false });
        }
      },

      setCurrentBusiness: (business) => {
        set({ currentBusiness: business });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'business-storage',
      partialize: (state) => ({ currentBusiness: state.currentBusiness }),
    }
  )
);
