import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { storage } from './config';

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

/**
 * Generates a simple UUID-like unique string for filenames.
 */
function generateUUID(): string {
  return (
    Math.random().toString(36).substring(2, 10) +
    '-' +
    Date.now().toString(36)
  );
}

/**
 * Compresses a local image URI, resizing the longest side to MAX_DIMENSION.
 * Returns the URI of the compressed image.
 */
async function compressImage(localUri: string): Promise<string> {
  const actions = [
    {
      resize: { width: MAX_DIMENSION },
    },
  ];

  const result = await manipulateAsync(
    localUri,
    actions,
    {
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
    }
  );

  return result.uri;
}

/**
 * Uploads a local image URI to Firebase Storage at the given path.
 * Compresses the image before uploading.
 * Returns the public download URL.
 */
export async function uploadImage(localUri: string, path: string): Promise<string> {
  // 1. Compress & resize
  const compressedUri = await compressImage(localUri);

  // 2. Convert to Blob for upload
  const response = await fetch(compressedUri);
  const blob = await response.blob();

  // 3. Generate unique filename and build full storage path
  const uuid = generateUUID();
  const fullPath = `${path}/${uuid}.jpg`;

  // 4. Upload to Firebase Storage
  const storageRef = ref(storage, fullPath);
  await uploadBytes(storageRef, blob);

  // 5. Return the public download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

/**
 * Deletes an image from Firebase Storage using its public download URL.
 */
export async function deleteImage(downloadUrl: string): Promise<void> {
  try {
    // Convert download URL to a storage reference
    const storageRef = ref(storage, downloadUrl);
    await deleteObject(storageRef);
  } catch (error) {
    // If file doesn't exist, silently continue
    console.warn('[StorageService] deleteImage failed:', error);
  }
}

/**
 * Downloads a remote image to the local cache directory.
 * Returns the local URI.
 */
export async function downloadImageToCache(
  remoteUrl: string,
  filename: string
): Promise<string> {
  const localUri = `${FileSystem.cacheDirectory}${filename}`;
  const result = await FileSystem.downloadAsync(remoteUrl, localUri);
  return result.uri;
}
