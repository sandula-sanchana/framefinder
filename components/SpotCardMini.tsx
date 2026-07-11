import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import CategoryBadge from './CategoryBadge';
import { Spot, FavoriteEntry } from '../types';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

interface SpotCardMiniProps {
  spot: Spot | FavoriteEntry;
  onPress?: () => void;
}

function isFavoriteEntry(s: Spot | FavoriteEntry): s is FavoriteEntry {
  return 'spotId' in s;
}

export default function SpotCardMini({ spot, onPress }: SpotCardMiniProps) {
  const router = useRouter();

  const id = isFavoriteEntry(spot) ? spot.spotId : spot.id;
  const title = isFavoriteEntry(spot) ? spot.spotTitle : spot.title;
  const coverImage = isFavoriteEntry(spot) ? spot.spotCoverImage : spot.coverImage;
  const category = isFavoriteEntry(spot) ? spot.spotCategory : spot.category;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/spot/${id}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      <Image
        source={{ uri: coverImage }}
        style={styles.image}
        contentFit="cover"
        placeholder={{ color: Colors.shimmer }}
        transition={300}
      />
      <LinearGradient
        colors={Colors.gradientCard}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={styles.overlay}>
        <CategoryBadge category={category} size="sm" />
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: Spacing.xs,
    height: 170,
    borderRadius: Spacing.radiusMd,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
  },
  title: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
  },
});
