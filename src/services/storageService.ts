import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';

import { storage } from '@/services/firebaseConfig';

export interface UploadItemImageResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Uploads a local image file to Firebase Cloud Storage at
 * `users/{userId}/items/{imageId}` and returns the public download URL
 * along with the storage path (needed for later deletion).
 *
 * The MIME type is inferred from the network response header of the local
 * URI fetch; it falls back to `"image/jpeg"` if unavailable.
 *
 * @param localUri - Local file URI of the compressed image to upload.
 * @param userId - The authenticated user's UID used to scope the storage path.
 * @returns `{ downloadUrl, storagePath }` — the HTTPS download URL and the
 *   Cloud Storage path string (used by `deleteItemImage`).
 * @throws {Error} Wraps any fetch or Storage SDK error with a descriptive message.
 */
export async function uploadItemImage(
  localUri: string,
  userId: string
): Promise<UploadItemImageResult> {
  try {
    const imageId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const storagePath = `users/${userId}/items/${imageId}`;
    const storageRef = ref(storage, storagePath);

    const response = await fetch(localUri);
    const blob = await response.blob();
    const metadata = { contentType: blob.type || 'image/jpeg' };

    await uploadBytes(storageRef, blob, metadata);
    const downloadUrl = await getDownloadURL(storageRef);

    return { downloadUrl, storagePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload image to Cloud Storage: ${message}`);
  }
}

/**
 * Deletes an image from Firebase Cloud Storage by its storage path.
 * Failures are logged as warnings but never re-thrown — image cleanup
 * is best-effort and should not block app flow.
 *
 * @param storagePath - The Cloud Storage path returned by `uploadItemImage`
 *   (e.g., `"users/uid123/items/1706000000000-abcd1234"`).
 */
export async function deleteItemImage(storagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn(`Failed to delete item image at ${storagePath}:`, error);
  }
}
