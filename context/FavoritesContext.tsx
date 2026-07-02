import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert } from 'react-native';
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
} from '../firebase/favoritesService';
import { FavoriteEntry, Spot } from '../types';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: FavoriteEntry[];
  favoritedIds: Set<string>;
  isLoading: boolean;
  toggleFavorite: (spot: Spot) => Promise<void>;
  isFavorited: (spotId: string) => boolean;
  fetchFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getUserFavorites(user.uid);
      setFavorites(data);
      setFavoritedIds(new Set(data.map((f) => f.spotId)));
    } catch {
      Alert.alert('Error', 'Could not load favorites.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load favorites when user logs in
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoritedIds(new Set());
    }
  }, [user, fetchFavorites]);

  const toggleFavorite = useCallback(
    async (spot: Spot) => {
      if (!user) return;
      const isCurrentlyFaved = favoritedIds.has(spot.id);

      // Optimistic update
      if (isCurrentlyFaved) {
        setFavoritedIds((prev) => {
          const next = new Set(prev);
          next.delete(spot.id);
          return next;
        });
        setFavorites((prev) => prev.filter((f) => f.spotId !== spot.id));
      } else {
        setFavoritedIds((prev) => new Set(prev).add(spot.id));
        setFavorites((prev) => [
          {
            spotId: spot.id,
            spotTitle: spot.title,
            spotCoverImage: spot.coverImage,
            spotCategory: spot.category,
            addedAt: null as unknown as import('firebase/firestore').Timestamp,
          },
          ...prev,
        ]);
      }

      try {
        if (isCurrentlyFaved) {
          await removeFavorite(user.uid, spot.id);
        } else {
          await addFavorite(user.uid, spot);
        }
      } catch {
        // Revert on failure
        if (isCurrentlyFaved) {
          setFavoritedIds((prev) => new Set(prev).add(spot.id));
        } else {
          setFavoritedIds((prev) => {
            const next = new Set(prev);
            next.delete(spot.id);
            return next;
          });
          setFavorites((prev) => prev.filter((f) => f.spotId !== spot.id));
        }
        Alert.alert('Error', 'Could not update favorites. Please try again.');
      }
    },
    [user, favoritedIds]
  );

  const isFavorited = useCallback(
    (spotId: string): boolean => favoritedIds.has(spotId),
    [favoritedIds]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, favoritedIds, isLoading, toggleFavorite, isFavorited, fetchFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
