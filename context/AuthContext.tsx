import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUserDoc,
} from '../firebase/authService';
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

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const doc = await getCurrentUserDoc(firebaseUser.uid);
          setUserDoc(doc);
        } catch {
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await loginUser(email, password);
    // onAuthStateChanged will update user state automatically
  }, []);

  const register = useCallback(
    async (email: string, password: string, username: string) => {
      const newUserDoc = await registerUser(email, password, username);
      setUserDoc(newUserDoc);
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setUserDoc(null);
  }, []);

  const refreshUserDoc = useCallback(async () => {
    if (!user) return;
    try {
      const doc = await getCurrentUserDoc(user.uid);
      setUserDoc(doc);
    } catch (error) {
      Alert.alert('Error', 'Could not refresh profile.');
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, userDoc, isLoading, login, register, logout, refreshUserDoc }}
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
