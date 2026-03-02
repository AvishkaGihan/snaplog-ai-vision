import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { MAX_IMAGE_DIMENSION, MAX_IMAGE_SIZE_BYTES } from "@/constants/config";

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

  if (!file.exists || typeof file.size !== "number" || file.size <= 0) {
    throw new Error("Compressed image file info is unavailable");
  }

  return file.size;
}

async function getImageDimensions(
  uri: string,
): Promise<{ width: number; height: number }> {
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
  quality: number,
) {
  const context = ImageManipulator.manipulate(uri);
  context.resize(resize);

  const imageRef = await context.renderAsync();
  return imageRef.saveAsync({
    compress: quality,
    format: SaveFormat.JPEG,
  });
}

export async function compressImage(
  uri: string,
): Promise<CompressedImageResult> {
  try {
    const original = await getImageDimensions(uri);
    const resizeAction = resolveResizeAction(original.width, original.height);

    for (const quality of COMPRESSION_QUALITIES) {
      const result = await compressWithQuality(uri, resizeAction, quality);
      const fileSize = readFileSize(result.uri);

      if (fileSize <= MAX_IMAGE_SIZE_BYTES || quality === COMPRESSION_QUALITIES[COMPRESSION_QUALITIES.length - 1]) {
        return {
          uri: result.uri,
          width: result.width,
          height: result.height,
          fileSize,
        };
      }
    }

    throw new Error("Unreachable");
  } catch (error) {
    console.warn("Image compression failed", error);
    throw new Error("Failed to compress image for upload");
  }
}
