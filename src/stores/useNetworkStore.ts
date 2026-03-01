import { create } from "zustand";

interface NetworkStore {
  isOnline: boolean;
  setOnline: (status: boolean) => void;
}

export const useNetworkStore = create<NetworkStore>((set) => ({
  isOnline: true,
  setOnline: (status) => {
    set({ isOnline: status });
  },
}));
