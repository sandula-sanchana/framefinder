import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { uploadImage, deleteImage } from './storageService';
import { Spot, SpotFormData } from '../types';

const SPOTS_COLLECTION = 'spots';
const USERS_COLLECTION = 'users';

/**
 * Determines whether a URI is a local file URI (device) vs a remote URL.
 */
function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('/');
}

/**
 * Fetch all spots ordered by creation date (newest first).
 */
export async function getAllSpots(limitCount: number = 20): Promise<Spot[]> {
  const q = query(
    collection(db, SPOTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Spot));
}

/**
 * Fetch a single spot by its Firestore document ID.
 * Returns null if not found.
 */
export async function getSpotById(spotId: string): Promise<Spot | null> {
  const snap = await getDoc(doc(db, SPOTS_COLLECTION, spotId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Spot;
}

/**
 * Fetch spots by category.
 */
export async function getSpotsByCategory(category: string): Promise<Spot[]> {
  const q = query(
    collection(db, SPOTS_COLLECTION),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Spot));
}

/**
 * Fetch all spots owned by a specific user.
 */
export async function getUserSpots(uid: string): Promise<Spot[]> {
  const q = query(
    collection(db, SPOTS_COLLECTION),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Spot));
}

/**
 * Create a new spot:
 * 1. Generate a Firestore document reference (to get the ID first)
 * 2. Upload all images in parallel
 * 3. Write the Firestore document
 * 4. Increment owner's spotsCount
 */
export async function createSpot(
  data: SpotFormData,
  ownerId: string,
  ownerUsername: string,
  ownerAvatar: string | null
): Promise<string> {
  // 1. Generate a new doc reference to get the ID ahead of time
  const newDocRef = doc(collection(db, SPOTS_COLLECTION));
  const spotId = newDocRef.id;

  // 2. Upload all photos in parallel
  const uploadPromises = data.photos.map((uri) =>
    uploadImage(uri, `spots/${spotId}`)
  );
  const uploadedURLs = await Promise.all(uploadPromises);

  const coverImage = uploadedURLs[0];

  // 3. Write Firestore document
  const now = serverTimestamp();
  const spotData = {
    id: spotId,
    title: data.title,
    description: data.description,
    category: data.category,
    photos: uploadedURLs,
    coverImage,
    bestTime: data.bestTime,
    location: data.location ?? { lat: 0, lng: 0 },
    ownerId,
    ownerUsername,
    ownerAvatar,
    favoritesCount: 0,
    views: 0,
    isPublic: true,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, spotData);

  // 4. Increment owner's spotsCount
  await updateDoc(doc(db, USERS_COLLECTION, ownerId), {
    spotsCount: increment(1),
  });

  return spotId;
}

/**
 * Update an existing spot.
 * Any photo that is a local URI will be uploaded; existing URLs are kept as-is.
 */
export async function updateSpot(
  spotId: string,
  data: Partial<SpotFormData>
): Promise<void> {
  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.category !== undefined) updates.category = data.category;
  if (data.bestTime !== undefined) updates.bestTime = data.bestTime;
  if (data.location !== undefined) updates.location = data.location;

  if (data.photos && data.photos.length > 0) {
    const processedPhotos: string[] = [];
    for (const uri of data.photos) {
      if (isLocalUri(uri)) {
        const url = await uploadImage(uri, `spots/${spotId}`);
        processedPhotos.push(url);
      } else {
        processedPhotos.push(uri);
      }
    }
    updates.photos = processedPhotos;
    updates.coverImage = processedPhotos[0];
  }

  await updateDoc(doc(db, SPOTS_COLLECTION, spotId), updates);
}

/**
 * Delete a spot and all its associated Storage files.
 * Also decrements the owner's spotsCount.
 */
export async function deleteSpot(spotId: string, ownerId: string): Promise<void> {
  // 1. Get the spot to find photo URLs
  const snap = await getDoc(doc(db, SPOTS_COLLECTION, spotId));
  if (!snap.exists()) return;

  const spotData = snap.data() as Spot;

  // 2. Delete all Storage files in parallel
  const deletePromises = (spotData.photos ?? []).map((url) => deleteImage(url));
  await Promise.allSettled(deletePromises);

  // 3. Delete Firestore document
  await deleteDoc(doc(db, SPOTS_COLLECTION, spotId));

  // 4. Decrement owner's spotsCount
  await updateDoc(doc(db, USERS_COLLECTION, ownerId), {
    spotsCount: increment(-1),
  });
}
