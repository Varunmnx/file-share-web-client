import { create } from "zustand";
import type { User } from "../types";
import { authApi, isAuthenticated } from "../api";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),

  fetchMe: async () => {
    if (!isAuthenticated()) {
      set({ initialized: true });
      return;
    }
    set({ loading: true });
    try {
      const user = await authApi.getMe();
      set({ user, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authApi.logout();
    } finally {
      set({ user: null, loading: false });
    }
  },
}));
