import {
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import { auth } from '@/services/firebaseConfig';
import type { AuthUser } from '@/types/auth.types';

type AuthStateCallback = (user: AuthUser | null) => void;

type FirebaseLikeError = {
  code?: string;
  message?: string;
};

const mapFirebaseUserToAuthUser = (user: User): AuthUser => {
  // The top-level displayName/photoURL may be null after linkWithCredential,
  // so fall back to the Google provider data which always has the profile info.
  const googleProvider = user.providerData.find((p) => p.providerId === 'google.com');

  return {
    uid: user.uid,
    email: user.email ?? googleProvider?.email ?? null,
    displayName: user.displayName ?? googleProvider?.displayName ?? null,
    isAnonymous: user.isAnonymous,
    photoURL: user.photoURL ?? googleProvider?.photoURL ?? null,
  };
};

/**
 * Subscribes to Firebase Auth state changes and invokes `callback` with a
 * mapped `AuthUser` whenever the signed-in user changes (or `null` on sign-out).
 *
 * @param callback - Function called with the current user or `null`.
 * @returns Unsubscribe function — call it to stop listening (e.g., on component unmount).
 */
export const subscribeToAuthState = (callback: AuthStateCallback): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUserToAuthUser(user) : null);
  });
};

/**
 * Signs the current user in anonymously via Firebase Auth.
 * Used as the default entry point so users can interact with the app
 * without creating an account.
 *
 * @throws {FirebaseError} If the anonymous sign-in request fails.
 */
export const signInAnonymouslyService = async (): Promise<void> => {
  try {
    await signInAnonymously(auth);
  } catch (error: unknown) {
    throw error;
  }
};

/**
 * Signs in with a Google ID token obtained from the Google Sign-In SDK.
 *
 * If the current user is already signed in anonymously, their account is upgraded
 * by linking the Google credential (preserving any data they created as a guest).
 * If linking fails because the Google account is already linked to a different
 * Firebase user (`auth/credential-already-in-use`), the error is silently ignored
 * and a fresh `signInWithCredential` is performed instead.
 *
 * After linking, `updateProfile` is called explicitly because `linkWithCredential`
 * does not automatically copy Google provider profile data (displayName, photoURL)
 * to the Firebase user object.
 *
 * @param idToken - The ID token string from `@react-native-google-signin/google-signin`.
 * @returns The mapped `AuthUser` for the authenticated Firebase user.
 * @throws {FirebaseError} If sign-in or linking fails for any reason other than
 *   `auth/credential-already-in-use`.
 */
export const signInWithGoogleService = async (idToken: string): Promise<AuthUser> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const currentUser = auth.currentUser;

    if (currentUser?.isAnonymous) {
      try {
        const result = await linkWithCredential(currentUser, credential);

        // linkWithCredential doesn't copy Google profile data to the user,
        // so we need to update it manually from the provider data.
        const googleProvider = result.user.providerData.find((p) => p.providerId === 'google.com');
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
        if (firebaseError.code !== 'auth/credential-already-in-use') {
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

/**
 * Signs out the currently authenticated Firebase user.
 *
 * @throws {FirebaseError} If the sign-out request fails.
 */
export const signOutService = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    throw error;
  }
};
