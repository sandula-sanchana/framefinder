import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

// These are set in .env and exposed via Expo's EXPO_PUBLIC_ convention.
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

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
  const result = await manipulateAsync(
    localUri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: JPEG_QUALITY, format: SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * Uploads a local image URI to Cloudinary using FileSystem.uploadAsync
 * (multipart/form-data with an unsigned upload preset).
 *
 * Firebase Storage was replaced because it requires a paid plan and the
 * Firebase JS SDK internally uses ArrayBuffer/Blob which crash on Hermes.
 *
 * The `path` parameter is used as a Cloudinary folder prefix, e.g. "spots".
 * Returns the secure download URL.
 */
export async function uploadImage(localUri: string, path: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env'
    );
  }

  // 1. Compress & resize
  const compressedUri = await compressImage(localUri);

  // 2. Build a unique public_id for the uploaded asset
  const publicId = `${path}/${generateUUID()}`;

  // 3. Upload via Expo FileSystem (multipart) — no ArrayBuffer involved;
  //    works reliably on Hermes/React Native.
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const result = await FileSystem.uploadAsync(uploadUrl, compressedUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'file',
    parameters: {
      upload_preset: UPLOAD_PRESET,
      public_id: publicId,
      folder: path,
    },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Cloudinary upload failed [${result.status}]: ${result.body}`);
  }

  const json = JSON.parse(result.body);
  return json.secure_url as string;
}

/**
 * Deletes an image from Cloudinary.
 * NOTE: Cloudinary does not allow client-side deletions without an API secret,
 * which must never be bundled in a client app.
 * Images uploaded with an unsigned preset remain in your Cloudinary account.
 * If you need deletion, implement a lightweight backend endpoint that holds
 * the API secret and calls the Cloudinary Admin API.
 */
export async function deleteImage(_downloadUrl: string): Promise<void> {
  // No-op on the client side — see the JSDoc above.
  console.warn('[Cloudinary] deleteImage: client-side deletion not supported without API secret.');
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
