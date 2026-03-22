// stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserLoginResponse } from "@/services/authService"; // interface login response

export interface User {
  id?: string;
  username?: string;
  email?: string;
  fullName?: string;
  role?: string;
}

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  login: (user: User, tokens: UserLoginResponse) => void;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  isKickedOut: boolean;
  setKickedOut: (kicked: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isKickedOut: false,

      // Actions
      setTokens: ({ accessToken, refreshToken }) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: !!accessToken,
        });
      },

      login: (user, tokens) => {
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setKickedOut: (kicked: boolean) => set({ isKickedOut: kicked }),
    }),
    {
      name: "auth-storage", // key lưu trong localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
