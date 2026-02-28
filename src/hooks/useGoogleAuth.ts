import { useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import type { AuthSessionResult } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { useAuthStore } from "@/stores/useAuthStore";

WebBrowser.maybeCompleteAuthSession();

type GoogleAuthResponseParams = {
  id_token?: string;
};

export const useGoogleAuth = (): {
  promptAsync: () => Promise<AuthSessionResult>;
  isReady: boolean;
  loading: boolean;
} => {
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    const exchangeToken = async () => {
      if (response?.type !== "success") {
        return;
      }

      const params = response.params as GoogleAuthResponseParams;
      const idToken = params.id_token;

      if (!idToken) {
        return;
      }

      setLoading(true);
      try {
        await signInWithGoogle(idToken);
      } finally {
        setLoading(false);
      }
    };

    void exchangeToken();
  }, [response, signInWithGoogle]);

  return {
    promptAsync,
    isReady: Boolean(request),
    loading,
  };
};
