import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import CategoryBadge from './CategoryBadge';
import { Spot } from '../types';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

interface ShareCardViewProps {
  spot: Spot;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = CARD_WIDTH * (16 / 9);

const ShareCardView = forwardRef<View, ShareCardViewProps>(({ spot }, ref) => {
  return (
    <View ref={ref} style={styles.card} collapsable={false}>
      {/* Background photo */}
      <Image
        source={{ uri: spot.coverImage }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.95)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Content */}
      <View style={styles.content}>
        <CategoryBadge category={spot.category} size="sm" />
        <Text style={styles.title}>{spot.title}</Text>

        {spot.bestTime ? (
          <View style={styles.infoRow}>
            <Feather name="clock" size={14} color={Colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.infoText}>{spot.bestTime}</Text>
          </View>
        ) : null}

        {spot.location && (spot.location.lat !== 0 || spot.location.address) ? (
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={14} color={Colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.infoText}>
              {spot.location.address ||
                `${spot.location.lat.toFixed(4)}, ${spot.location.lng.toFixed(4)}`}
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        {/* Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandWordmark}>FrameFinder</Text>
          <Text style={styles.brandTagline}>Discover. Capture. Share.</Text>
        </View>
      </View>
    </View>
  );
});

ShareCardView.displayName = 'ShareCardView';
export default ShareCardView;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
  },
  title: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    marginVertical: Spacing.sm,
    lineHeight: 36,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.md,
  },
  branding: {
    alignItems: 'flex-start',
  },
  brandWordmark: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
    letterSpacing: Typography.wide,
  },
  brandTagline: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
