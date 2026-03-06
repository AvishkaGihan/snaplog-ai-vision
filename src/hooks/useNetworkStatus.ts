import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

import { useNetworkStore } from "@/stores/useNetworkStore";

export function useNetworkStatus(): void {
  useEffect(() => {
    void NetInfo.fetch().then((state) => {
      useNetworkStore.getState().setOnline(state.isConnected ?? false);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      useNetworkStore.getState().setOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
