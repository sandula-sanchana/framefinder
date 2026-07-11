import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import CategoryBadge from './CategoryBadge';
import FavoriteButton from './FavoriteButton';
import { Spot } from '../types';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

interface SpotCardProps {
  spot: Spot;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function SpotCard({ spot, onPress, style }: SpotCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/spot/${spot.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.92}
    >
      <View style={styles.card}>
        <Image
          source={{ uri: spot.coverImage }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ color: Colors.shimmer }}
          transition={400}
        />
        <LinearGradient
          colors={Colors.gradientCard}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={styles.overlay}>
          <CategoryBadge category={spot.category} size="sm" />
          <Text style={styles.title} numberOfLines={2}>
            {spot.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.timeRow}>
              <Feather name="clock" size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.metaText} numberOfLines={1}>
                {spot.bestTime}
              </Text>
            </View>
            <FavoriteButton spotId={spot.id} spot={spot} size="sm" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    borderRadius: Spacing.radiusLg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    borderRadius: Spacing.radiusLg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 240,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.cardPadding,
  },
  title: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginVertical: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
});
