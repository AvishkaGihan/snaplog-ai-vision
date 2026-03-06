import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { MAX_IMAGE_DIMENSION, MAX_IMAGE_SIZE_BYTES } from '@/constants/config';

export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
}

const COMPRESSION_QUALITIES = [0.8, 0.6, 0.4, 0.2] as const;

function resolveResizeAction(width: number, height: number) {
  if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION) {
    return {};
  }

  if (width >= height) {
    return { width: MAX_IMAGE_DIMENSION };
  }

  return { height: MAX_IMAGE_DIMENSION };
}

function readFileSize(uri: string): number {
  const file = new File(uri);

  if (!file.exists || typeof file.size !== 'number' || file.size <= 0) {
    throw new Error('Compressed image file info is unavailable');
  }

  return file.size;
}

async function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  const context = ImageManipulator.manipulate(uri);
  const imageRef = await context.renderAsync();

  return {
    width: imageRef.width,
    height: imageRef.height,
  };
}

async function compressWithQuality(
  uri: string,
  resize: { width?: number; height?: number },
  quality: number
) {
  const context = ImageManipulator.manipulate(uri);

  if (resize.width || resize.height) {
    context.resize(resize);
  }

  const imageRef = await context.renderAsync();
  return imageRef.saveAsync({
    compress: quality,
    format: SaveFormat.JPEG,
  });
}

/**
 * Compresses a local image URI to fit within the app's upload constraints
 * (max dimension: `MAX_IMAGE_DIMENSION` px; max file size: `MAX_IMAGE_SIZE_BYTES`).
 *
 * **Algorithm** (multi-pass progressive compression):
 * 1. Read original image dimensions via `ImageManipulator`.
 * 2. Determine a resize action: scale down to `MAX_IMAGE_DIMENSION` on the
 *    longest axis if either dimension exceeds it; skip resize otherwise.
 * 3. Iterate through quality levels `[0.8, 0.6, 0.4, 0.2]`, compressing and
 *    saving as JPEG at each level.
 * 4. Return the first result that is ≤ `MAX_IMAGE_SIZE_BYTES`, or the result
 *    at the lowest quality level if none meet the size target.
 *
 * @param uri - Local file URI of the image to compress (e.g., from the camera or picker).
 * @returns Compressed image metadata including the new local URI, dimensions, and file size.
 * @throws {Error} If the image cannot be read, manipulated, or its size cannot be determined.
 */
export async function compressImage(uri: string): Promise<CompressedImageResult> {
  try {
    const original = await getImageDimensions(uri);
    const resizeAction = resolveResizeAction(original.width, original.height);

    for (const quality of COMPRESSION_QUALITIES) {
      const result = await compressWithQuality(uri, resizeAction, quality);
      const fileSize = readFileSize(result.uri);

      if (
        fileSize <= MAX_IMAGE_SIZE_BYTES ||
        quality === COMPRESSION_QUALITIES[COMPRESSION_QUALITIES.length - 1]
      ) {
        return {
          uri: result.uri,
          width: result.width,
          height: result.height,
          fileSize,
        };
      }
    }

    throw new Error('Unreachable');
  } catch (error) {
    console.warn('Image compression failed', error);
    throw new Error('Failed to compress image for upload');
  }
}

/**
 * Deletes a temporary image file from the device's file system.
 * Silently no-ops if `uri` is `null`, `undefined`, or the file no longer exists.
 * Failures are logged as warnings but never thrown — temp file cleanup is
 * best-effort and should not interrupt app flow.
 *
 * @param uri - Local file URI of the temp image to delete, or `null`/`undefined`.
 */
export async function cleanupTempImage(uri?: string | null): Promise<void> {
  if (!uri) {
    return;
  }

  try {
    const file = new File(uri);
    if (file.exists) {
      await file.delete();
    }
  } catch (error) {
    console.warn('Failed to clean up temp image:', uri, error);
  }
}
