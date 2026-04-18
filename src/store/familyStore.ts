import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Family, Child } from '@/types';

interface FamilyState {
  family: Family | null;
  children: Child[];

  setFamily: (family: Family) => void;
  setChildren: (children: Child[]) => void;
  updateSettings: (settings: Partial<Family['settings']>) => void;
  clearFamily: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      family: null,
      children: [],

      setFamily: (family) => set({ family }),

      setChildren: (children) => set({ children }),

      updateSettings: (settings) =>
        set((state) =>
          state.family
            ? { family: { ...state.family, settings: { ...state.family.settings, ...settings } } }
            : state,
        ),

      clearFamily: () => set({ family: null, children: [] }),
    }),
    {
      name: 'family-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
