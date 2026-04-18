import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserRole } from '@/types';

interface AuthState {
  uid: string | null;
  familyId: string | null;
  role: UserRole;
  childId: string | null;
  childName: string | null;
  isOnboarded: boolean;

  setAuth: (params: {
    uid: string;
    familyId: string;
    role: UserRole;
    childId?: string;
    childName?: string;
  }) => void;
  setOnboarded: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      uid: null,
      familyId: null,
      role: null,
      childId: null,
      childName: null,
      isOnboarded: false,

      setAuth: ({ uid, familyId, role, childId, childName }) =>
        set({ uid, familyId, role, childId: childId ?? null, childName: childName ?? null }),

      setOnboarded: () => set({ isOnboarded: true }),

      clearAuth: () =>
        set({ uid: null, familyId: null, role: null, childId: null, childName: null, isOnboarded: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
