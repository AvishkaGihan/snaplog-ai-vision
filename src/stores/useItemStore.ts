import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ItemDocument, LocalDraft } from "@/types/item.types";
import { mmkvStorage } from "@/utils/mmkvStorage";

interface ItemStore {
  items: ItemDocument[];
  drafts: LocalDraft[];
  isLoading: boolean;
  searchQuery: string;
  categoryFilter: string | null;
  addItem: (item: ItemDocument) => void;
  updateItem: (id: string, updates: Partial<ItemDocument>) => void;
  deleteItem: (id: string) => void;
  addDraft: (draft: LocalDraft) => void;
  removeDraft: (localId: string) => void;
  updateDraftStatus: (
    localId: string,
    status: LocalDraft["syncStatus"],
    retryCount?: number,
  ) => void;
  setItems: (items: ItemDocument[]) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useItemStore = create<ItemStore>()(
  persist(
    (set) => ({
      items: [],
      drafts: [],
      isLoading: false,
      searchQuery: "",
      categoryFilter: null,

      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      addDraft: (draft) =>
        set((state) => ({
          drafts: state.drafts.some((d) => d.localId === draft.localId)
            ? state.drafts
            : [...state.drafts, draft],
        })),

      removeDraft: (localId) =>
        set((state) => ({
          drafts: state.drafts.filter((draft) => draft.localId !== localId),
        })),

      updateDraftStatus: (localId, status, retryCount) =>
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.localId === localId
              ? {
                  ...draft,
                  syncStatus: status,
                  retryCount: retryCount ?? draft.retryCount,
                }
              : draft,
          ),
        })),

      setItems: (items) => {
        set({ items });
      },

      setSearchQuery: (searchQuery) => {
        set({ searchQuery });
      },

      setCategoryFilter: (categoryFilter) => {
        set({ categoryFilter });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: "item-store",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ drafts: state.drafts }),
    },
  ),
);
