import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';

interface PhotoGridProps {
  photos: string[];
}

const PLACEHOLDER = { uri: '', thumbhash: undefined };

export default function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <View style={styles.single}>
        <Image
          source={{ uri: photos[0] }}
          style={styles.singleImage}
          contentFit="cover"
          placeholder={{ color: Colors.shimmer }}
          transition={300}
        />
      </View>
    );
  }

  if (photos.length === 2) {
    return (
      <View style={styles.twoRow}>
        {photos.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={styles.twoImage}
            contentFit="cover"
            placeholder={{ color: Colors.shimmer }}
            transition={300}
          />
        ))}
      </View>
    );
  }

  // 3 photos: tall left, stacked right
  return (
    <View style={styles.threeContainer}>
      <Image
        source={{ uri: photos[0] }}
        style={styles.threeLeft}
        contentFit="cover"
        placeholder={{ color: Colors.shimmer }}
        transition={300}
      />
      <View style={styles.threeRight}>
        <Image
          source={{ uri: photos[1] }}
          style={styles.threeRightTop}
          contentFit="cover"
          placeholder={{ color: Colors.shimmer }}
          transition={300}
        />
        <Image
          source={{ uri: photos[2] }}
          style={styles.threeRightBottom}
          contentFit="cover"
          placeholder={{ color: Colors.shimmer }}
          transition={300}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  single: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
    borderRadius: Spacing.radiusMd,
    overflow: 'hidden',
  },
  singleImage: {
    width: '100%',
    height: 240,
  },
  twoRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  twoImage: {
    flex: 1,
    height: 180,
    borderRadius: Spacing.radiusMd,
  },
  threeContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
    height: 220,
    gap: Spacing.xs,
  },
  threeLeft: {
    flex: 1,
    borderRadius: Spacing.radiusMd,
  },
  threeRight: {
    flex: 1,
    gap: Spacing.xs,
  },
  threeRightTop: {
    flex: 1,
    borderRadius: Spacing.radiusMd,
  },
  threeRightBottom: {
    flex: 1,
    borderRadius: Spacing.radiusMd,
  },
});
