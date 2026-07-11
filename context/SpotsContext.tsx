import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import Toast from 'react-native-toast-message';
import {
  getAllSpots,
  getSpotById as fetchSpotById,
  createSpot as serviceCreateSpot,
  updateSpot as serviceUpdateSpot,
  deleteSpot as serviceDeleteSpot,
} from '../firebase/spotsService';
import { Spot, SpotFormData } from '../types';
import { useAuth } from './AuthContext';

interface SpotsContextType {
  spots: Spot[];
  isLoading: boolean;
  isRefreshing: boolean;
  fetchSpots: () => Promise<void>;
  refreshSpots: () => Promise<void>;
  createSpot: (data: SpotFormData) => Promise<string>;
  updateSpot: (spotId: string, data: Partial<SpotFormData>) => Promise<void>;
  deleteSpot: (spotId: string) => Promise<void>;
  getSpotById: (spotId: string) => Promise<Spot | null>;
}

const SpotsContext = createContext<SpotsContextType | null>(null);

export function SpotsProvider({ children }: { children: React.ReactNode }) {
  const { user, userDoc } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSpots = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getAllSpots(50);
      setSpots(data);
    } catch (error: any) {
      console.log('fetchSpots error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'Could not load spots. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSpots();
    } else {
      setSpots([]);
    }
  }, [user, fetchSpots]);

  const refreshSpots = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await getAllSpots(50);
      setSpots(data);
    } catch (error: any) {
      console.log('refreshSpots error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: error?.message || 'Could not refresh spots.' });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const createSpot = useCallback(
    async (data: SpotFormData): Promise<string> => {
      if (!user || !userDoc) throw new Error('Not authenticated');
      const spotId = await serviceCreateSpot(
        data,
        user.uid,
        userDoc.username,
        userDoc.profilePicture
      );
      // Re-fetch to get the new spot in the list
      const freshSpots = await getAllSpots(50);
      setSpots(freshSpots);
      return spotId;
    },
    [user, userDoc]
  );

  const updateSpot = useCallback(
    async (spotId: string, data: Partial<SpotFormData>) => {
      await serviceUpdateSpot(spotId, data);
      setSpots((prev) =>
        prev.map((s) =>
          s.id === spotId
            ? { ...s, ...data, location: (data.location ?? s.location) as NonNullable<typeof data.location>, photos: data.photos ?? s.photos }
            : s
        )
      );
    },
    []
  );

  const deleteSpot = useCallback(
    async (spotId: string) => {
      if (!user) throw new Error('Not authenticated');
      await serviceDeleteSpot(spotId, user.uid);
      setSpots((prev) => prev.filter((s) => s.id !== spotId));
    },
    [user]
  );

  const getSpotById = useCallback(
    async (spotId: string): Promise<Spot | null> => {
      // Check cache first
      const cached = spots.find((s) => s.id === spotId);
      if (cached) return cached;
      return fetchSpotById(spotId);
    },
    [spots]
  );

  return (
    <SpotsContext.Provider
      value={{
        spots,
        isLoading,
        isRefreshing,
        fetchSpots,
        refreshSpots,
        createSpot,
        updateSpot,
        deleteSpot,
        getSpotById,
      }}
    >
      {children}
    </SpotsContext.Provider>
  );
}

export function useSpots(): SpotsContextType {
  const ctx = useContext(SpotsContext);
  if (!ctx) throw new Error('useSpots must be used within a SpotsProvider');
  return ctx;
}
