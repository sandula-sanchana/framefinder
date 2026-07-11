import React, { useCallback, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFavorites } from '../context/FavoritesContext';
import { useSpots } from '../context/SpotsContext';
import { Spot } from '../types';
import Colors from '../constants/Colors';

interface FavoriteButtonProps {
  spotId: string;
  size?: 'sm' | 'lg';
  spot?: Spot; // Pass in spot if available to avoid a lookup
}

export default function FavoriteButton({ spotId, size = 'sm', spot }: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const { spots } = useSpots();

  const favorited = isFavorited(spotId);
  const iconSize = size === 'lg' ? 28 : 20;

  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(async () => {
    // Scale animation
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.35,
        useNativeDriver: true,
        speed: 50,
        bounciness: 12,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const targetSpot = spot ?? spots.find((s) => s.id === spotId);
    if (targetSpot) {
      await toggleFavorite(targetSpot);
    }
  }, [spot, spots, spotId, toggleFavorite, scale]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={favorited ? 'heart' : 'heart-outline'}
          size={iconSize}
          color={favorited ? Colors.error : Colors.textSecondary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
