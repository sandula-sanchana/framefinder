import {
  doc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { FavoriteEntry, Spot } from '../types';

const FAVORITES_COLLECTION = 'favorites';
const SPOTS_COLLECTION = 'spots';

/**
 * Fetch all favorites for a user, ordered by addedAt descending.
 */
export async function getUserFavorites(uid: string): Promise<FavoriteEntry[]> {
  const q = query(
    collection(db, FAVORITES_COLLECTION, uid, 'spots'),
    orderBy('addedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as FavoriteEntry);
}

/**
 * Add a spot to a user's favorites.
 * Also increments the spot's favoritesCount.
 */
export async function addFavorite(uid: string, spot: Spot): Promise<void> {
  const entry: Omit<FavoriteEntry, 'addedAt'> & { addedAt: ReturnType<typeof serverTimestamp> } = {
    spotId: spot.id,
    spotTitle: spot.title,
    spotCoverImage: spot.coverImage,
    spotCategory: spot.category,
    addedAt: serverTimestamp(),
  };

  await setDoc(
    doc(db, FAVORITES_COLLECTION, uid, 'spots', spot.id),
    entry
  );

  await updateDoc(doc(db, SPOTS_COLLECTION, spot.id), {
    favoritesCount: increment(1),
  });
}

/**
 * Remove a spot from a user's favorites.
 * Also decrements the spot's favoritesCount.
 */
export async function removeFavorite(uid: string, spotId: string): Promise<void> {
  await deleteDoc(doc(db, FAVORITES_COLLECTION, uid, 'spots', spotId));

  await updateDoc(doc(db, SPOTS_COLLECTION, spotId), {
    favoritesCount: increment(-1),
  });
}

/**
 * Check whether a specific spot is favorited by a user.
 */
export async function isFavorited(uid: string, spotId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, FAVORITES_COLLECTION, uid, 'spots', spotId));
  return snap.exists();
}
