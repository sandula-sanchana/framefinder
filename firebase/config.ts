/**
 * FrameFinder Firebase Configuration
 *
 * Replace ALL placeholder values below with your actual Firebase credentials.
 * Go to: Firebase Console → Project Settings → Your apps → Web app → SDK setup and configuration
 *
 * See SETUP.md for full instructions.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDvNvubv833MbdR3VfbNCgkSwQr4NYmd4Y",

  authDomain: "framefinder-cc9f2.firebaseapp.com",

  projectId: "framefinder-cc9f2",

  storageBucket: "framefinder-cc9f2.firebasestorage.app",

  messagingSenderId: "91613149065",

  appId: "1:91613149065:web:ce1f0ac07a8fc352781358"

};

// Prevent duplicate initialisation during hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Prevent duplicate auth initialisation during hot reload
// initializeAuth throws if called twice on the same app — use getAuth() as fallback.
function getOrInitAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = getOrInitAuth();
export const db = getFirestore(app);
export default app;

