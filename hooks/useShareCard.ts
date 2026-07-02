import { useCallback, useRef, useState } from 'react';
import { Alert, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Spot } from '../types';

interface UseShareCardReturn {
  shareCardRef: React.RefObject<View>;
  captureCard: () => Promise<string>;
  shareStory: (spot: Spot) => Promise<void>;
  nativeShare: (spot: Spot) => Promise<void>;
  saveToGallery: (spot: Spot) => Promise<void>;
  exportOriginal: (spot: Spot) => Promise<void>;
  isProcessing: boolean;
}

export function useShareCard(): UseShareCardReturn {
  const shareCardRef = useRef<View>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const captureCard = useCallback(async (): Promise<string> => {
    if (!shareCardRef.current) throw new Error('Share card ref not attached');
    const uri = await captureRef(shareCardRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    return uri;
  }, []);

  const shareStory = useCallback(
    async (_spot: Spot) => {
      setIsProcessing(true);
      try {
        const uri = await captureCard();
        await Sharing.shareAsync(uri, { mimeType: 'image/png' });
      } catch (error) {
        Alert.alert('Error', 'Could not share. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    [captureCard]
  );

  const nativeShare = useCallback(
    async (spot: Spot) => {
      setIsProcessing(true);
      try {
        const uri = await captureCard();
        await Share.share({ title: spot.title, url: uri });
      } catch (error) {
        Alert.alert('Error', 'Could not share. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    [captureCard]
  );

  const saveToGallery = useCallback(
    async (_spot: Spot) => {
      setIsProcessing(true);
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Gallery access is needed to save images.');
          return;
        }
        const uri = await captureCard();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Saved!', 'Share card saved to your gallery.');
      } catch (error) {
        Alert.alert('Error', 'Could not save to gallery. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    [captureCard]
  );

  const exportOriginal = useCallback(
    async (spot: Spot) => {
      setIsProcessing(true);
      try {
        const filename = `ff_export_${spot.id}.jpg`;
        const localPath = `${FileSystem.cacheDirectory}${filename}`;
        const result = await FileSystem.downloadAsync(spot.coverImage, localPath);
        await Sharing.shareAsync(result.uri, {
          mimeType: 'image/jpeg',
          UTI: 'public.jpeg',
        });
      } catch (error) {
        Alert.alert('Error', 'Could not export image. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    shareCardRef,
    captureCard,
    shareStory,
    nativeShare,
    saveToGallery,
    exportOriginal,
    isProcessing,
  };
}
