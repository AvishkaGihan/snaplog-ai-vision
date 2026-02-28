import { useEffect, useState, useCallback } from "react";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { useAuthStore } from "@/stores/useAuthStore";

export const useGoogleAuth = (): {
  signIn: () => Promise<void>;
  isReady: boolean;
  loading: boolean;
} => {
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
    });
    setIsReady(true);
  }, []);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === "success") {
        const idToken = response.data.idToken;
        if (idToken) {
          await signInWithGoogle(idToken);
        }
      }
    } catch (error: unknown) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          // User cancelled — do nothing
          return;
        }
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle]);

  return {
    signIn,
    isReady,
    loading,
  };
};
