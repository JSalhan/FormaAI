import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DBUser } from '../types';

interface AuthState {
  user: DBUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: DBUser, token: string) => void;
  logout: () => void;
  setUser: (user: DBUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'formaai-auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
