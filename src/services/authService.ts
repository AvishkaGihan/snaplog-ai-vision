import {
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signOut,
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
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    isAnonymous: user.isAnonymous,
    photoURL: user.photoURL,
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
): Promise<void> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const currentUser = auth.currentUser;

    if (currentUser?.isAnonymous) {
      try {
        await linkWithCredential(currentUser, credential);
        return;
      } catch (error: unknown) {
        const firebaseError = error as FirebaseLikeError;
        if (firebaseError.code !== "auth/credential-already-in-use") {
          throw error;
        }
      }
    }

    await signInWithCredential(auth, credential);
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
