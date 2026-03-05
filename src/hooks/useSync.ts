import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { syncAllDrafts } from "@/services/syncService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useItemStore } from "@/stores/useItemStore";
import { useNetworkStore } from "@/stores/useNetworkStore";
import type { LocalDraft } from "@/types/item.types";

function shouldTriggerOnDraftChange(
  previousDrafts: LocalDraft[],
  currentDrafts: LocalDraft[],
): boolean {
  if (currentDrafts.length > previousDrafts.length) {
    return true;
  }

  return currentDrafts.some((draft) => {
    const previous = previousDrafts.find(
      (item) => item.localId === draft.localId,
    );

    if (!previous) {
      return draft.syncStatus === "pending";
    }

    const becamePending =
      previous.syncStatus !== "pending" && draft.syncStatus === "pending";
    const retryReset = previous.retryCount !== 0 && draft.retryCount === 0;

    return becamePending || retryReset;
  });
}

export function useSync(): void {
  const previousOnlineRef = useRef<boolean>(
    useNetworkStore.getState().isOnline,
  );
  const previousAppStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const unsubscribeNetwork = useNetworkStore.subscribe((state) => {
      const wasOffline = !previousOnlineRef.current;
      const isNowOnline = state.isOnline;
      previousOnlineRef.current = state.isOnline;

      if (wasOffline && isNowOnline) {
        const userId = useAuthStore.getState().user?.uid;
        if (userId) {
          void syncAllDrafts(userId);
        }
      }
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        const wasBackgrounded =
          previousAppStateRef.current === "background" ||
          previousAppStateRef.current === "inactive";

        if (wasBackgrounded && nextAppState === "active") {
          const isOnline = useNetworkStore.getState().isOnline;
          const userId = useAuthStore.getState().user?.uid;

          if (isOnline && userId) {
            void syncAllDrafts(userId);
          }
        }

        previousAppStateRef.current = nextAppState;
      },
    );

    const unsubscribeDrafts = useItemStore.subscribe((state, previousState) => {
      const isOnline = useNetworkStore.getState().isOnline;
      const userId = useAuthStore.getState().user?.uid;

      if (!isOnline || !userId) {
        return;
      }

      if (shouldTriggerOnDraftChange(previousState.drafts, state.drafts)) {
        void syncAllDrafts(userId);
      }
    });

    return () => {
      unsubscribeNetwork();
      appStateSubscription.remove();
      unsubscribeDrafts();
    };
  }, []);
}
