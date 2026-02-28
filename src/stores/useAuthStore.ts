import { create } from "zustand";

import {
  signInAnonymouslyService,
  signInWithGoogleService,
  signOutService,
  subscribeToAuthState,
} from "@/services/authService";
import type { AuthUser } from "@/types/auth.types";

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  isInitialized: boolean;
  initialize: () => () => void;
  signInAnonymously: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  isInitialized: false,

  initialize: () => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (user) {
        set({
          user,
          isAuthenticated: true,
          loading: false,
          isInitialized: true,
        });
        return;
      }

      try {
        await signInAnonymouslyService();
      } catch {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          isInitialized: true, // Allow app to load even if offline
        });
      }
    });

    return unsubscribe;
  },

  signInAnonymously: async () => {
    set({ loading: true });
    try {
      await signInAnonymouslyService();
    } catch {
      set({ loading: false });
    }
  },

  signInWithGoogle: async (idToken: string) => {
    set({ loading: true });
    try {
      const user = await signInWithGoogleService(idToken);
      set({
        user,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await signOutService();
    } catch {
      set({ loading: false });
    }
  },
}));
