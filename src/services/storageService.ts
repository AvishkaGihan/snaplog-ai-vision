import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "@/services/firebaseConfig";

export interface UploadItemImageResult {
  downloadUrl: string;
  storagePath: string;
}

export async function uploadItemImage(
  localUri: string,
  userId: string,
): Promise<UploadItemImageResult> {
  try {
    const imageId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const storagePath = `users/${userId}/items/${imageId}`;
    const storageRef = ref(storage, storagePath);

    const response = await fetch(localUri);
    const blob = await response.blob();
    const metadata = { contentType: blob.type || "image/jpeg" };

    await uploadBytes(storageRef, blob, metadata);
    const downloadUrl = await getDownloadURL(storageRef);

    return { downloadUrl, storagePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to upload image to Cloud Storage: ${message}`);
  }
}
