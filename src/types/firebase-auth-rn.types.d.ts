declare module "@firebase/auth/dist/rn/index" {
  import type { Persistence } from "firebase/auth";

  interface ReactNativeAsyncStorage {
    setItem(key: string, value: string): Promise<unknown>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }

  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence;
}
