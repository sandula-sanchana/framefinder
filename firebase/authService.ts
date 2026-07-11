import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { User } from '../types';
import { auth, db } from './config';

/**
 * Register a new user with email, password and username.
 * Creates a Firestore /users/{uid} document.
 */
export async function registerUser(
  email: string,
  password: string,
  username: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = credential;

  // Update Firebase Auth display name
  await updateProfile(user, { displayName: username });

  const now = serverTimestamp();
  const userData: Omit<User, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid: user.uid,
    username,
    email,
    profilePicture: null,
    spotsCount: 0,
    createdAt: now,
  };


  // Return the full user doc (createdAt will be server-resolved)
  return {
    uid: user.uid,
    username,
    email,
    profilePicture: null,
    spotsCount: 0,
    createdAt: now as unknown as import('firebase/firestore').Timestamp,
  };
}

/**
 * Sign in with email and password.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user.
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Update the Firestore user profile document.
 */
export async function updateUserProfile(
  uid: string,
  data: { username?: string; profilePicture?: string }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...data });

  // Also update Firebase Auth display name if username changed
  if (data.username && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: data.username });
  }
}

/**
 * Fetch the Firestore user document for a given uid.
 * Returns null if the document does not exist.
 */
export async function getCurrentUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as User;
}
