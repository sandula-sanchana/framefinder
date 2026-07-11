import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import Toast from 'react-native-toast-message';

import {
  loginUser,
  logoutUser,
  registerUser
} from '../firebase/authService';

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userDoc: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -------------------------
  // AUTH STATE LISTENER
  // -------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AUTH STATE:", firebaseUser?.uid);

      if (!firebaseUser) {
        // Signed out — update everything atomically
        setUser(null);
        setUserDoc(null);
        setIsLoading(false);
        return;
      }

      // User is signed in — load Firestore doc BEFORE updating state
      // so the navigation guard never sees user=set + isLoading=true at the same time.
      try {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        let userData: User;

        if (!snap.exists()) {
          console.log("Creating Firestore user doc...");

          userData = {
            uid: firebaseUser.uid,
            username: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "User",
            email: firebaseUser.email ?? "",
            profilePicture: null,
            spotsCount: 0,
            createdAt: serverTimestamp(),
          };

          await setDoc(ref, userData);
        } else {
          const data = snap.data();

          userData = {
            uid: firebaseUser.uid,
            username: data.username ?? "User",
            email: data.email ?? "",
            profilePicture: data.profilePicture ?? null,
            spotsCount: data.spotsCount ?? 0,
            createdAt: data.createdAt,
          };
        }

        console.log("User loaded:", userData);

        // Set user, doc, and loading done together so navigation guard
        // sees a consistent state in one render cycle.
        setUser(firebaseUser);
        setUserDoc(userData);

      } catch (error) {
        console.error("Firestore error:", error);
        setUser(firebaseUser); // still mark authenticated even if doc fails
        setUserDoc(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // -------------------------
  // LOGIN
  // -------------------------
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log("LOGIN: Starting...");
      const credential = await loginUser(email, password);
      console.log("LOGIN: Success", credential.user.uid);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      throw error;
    }
  }, []);

  // -------------------------
  // REGISTER
  // -------------------------
  const register = useCallback(async (email: string, password: string, username: string) => {
    await registerUser(email, password, username);

  }, []);

  // -------------------------
  // LOGOUT
  // -------------------------
  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setUserDoc(null);
  }, []);

  // -------------------------
  // REFRESH USER DOC
  // -------------------------
  const refreshUserDoc = useCallback(async () => {
    if (!user) return;

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const data = snap.data();

      setUserDoc({
        uid: user.uid,
        username: data.username ?? "User",
        email: data.email ?? "",
        profilePicture: data.profilePicture ?? null,
        spotsCount: data.spotsCount ?? 0,
        createdAt: data.createdAt,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not refresh profile.',
      });
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        isLoading,
        login,
        register,
        logout,
        refreshUserDoc,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}