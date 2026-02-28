import {
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { auth } from "@/services/firebaseConfig";
import type { AuthUser } from "@/types/auth.types";

type AuthStateCallback = (user: AuthUser | null) => void;

type FirebaseLikeError = {
  code?: string;
  message?: string;
};

const mapFirebaseUserToAuthUser = (user: User): AuthUser => {
  // The top-level displayName/photoURL may be null after linkWithCredential,
  // so fall back to the Google provider data which always has the profile info.
  const googleProvider = user.providerData.find(
    (p) => p.providerId === "google.com",
  );

  return {
    uid: user.uid,
    email: user.email ?? googleProvider?.email ?? null,
    displayName: user.displayName ?? googleProvider?.displayName ?? null,
    isAnonymous: user.isAnonymous,
    photoURL: user.photoURL ?? googleProvider?.photoURL ?? null,
  };
};

export const subscribeToAuthState = (
  callback: AuthStateCallback,
): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUserToAuthUser(user) : null);
  });
};

export const signInAnonymouslyService = async (): Promise<void> => {
  try {
    await signInAnonymously(auth);
  } catch (error: unknown) {
    throw error;
  }
};

export const signInWithGoogleService = async (
  idToken: string,
): Promise<AuthUser> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const currentUser = auth.currentUser;

    if (currentUser?.isAnonymous) {
      try {
        const result = await linkWithCredential(currentUser, credential);

        // linkWithCredential doesn't copy Google profile data to the user,
        // so we need to update it manually from the provider data.
        const googleProvider = result.user.providerData.find(
          (p) => p.providerId === "google.com",
        );
        if (googleProvider) {
          await updateProfile(result.user, {
            displayName: googleProvider.displayName,
            photoURL: googleProvider.photoURL,
          });
        }

        // Return profile with Google provider data since the local user
        // object may not reflect updateProfile changes immediately.
        return {
          uid: result.user.uid,
          email: result.user.email ?? googleProvider?.email ?? null,
          displayName: googleProvider?.displayName ?? result.user.displayName,
          isAnonymous: false,
          photoURL: googleProvider?.photoURL ?? result.user.photoURL,
        };
      } catch (error: unknown) {
        const firebaseError = error as FirebaseLikeError;
        if (firebaseError.code !== "auth/credential-already-in-use") {
          throw error;
        }
      }
    }

    const result = await signInWithCredential(auth, credential);
    return mapFirebaseUserToAuthUser(result.user);
  } catch (error: unknown) {
    throw error;
  }
};

export const signOutService = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    throw error;
  }
};
