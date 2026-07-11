import React, { useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import ShareCardView from './ShareCardView';
import { useShareCard } from '../hooks/useShareCard';
import { Spot } from '../types';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

interface ShareModalProps {
  visible: boolean;
  spot: Spot;
  onClose: () => void;
}

interface ShareOption {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}

export default function ShareModal({ visible, spot, onClose }: ShareModalProps) {
  const { shareCardRef, shareStory, nativeShare, saveToGallery, exportOriginal, isProcessing } =
    useShareCard();

  const options: ShareOption[] = [
    {
      label: 'Story Share',
      icon: 'smartphone',
      onPress: async () => {
        await shareStory(spot);
        onClose();
      },
    },
    {
      label: 'Native Share',
      icon: 'share-2',
      onPress: async () => {
        await nativeShare(spot);
        onClose();
      },
    },
    {
      label: 'Save to Gallery',
      icon: 'download',
      onPress: async () => {
        await saveToGallery(spot);
        onClose();
      },
    },
    {
      label: 'Export Original',
      icon: 'file',
      onPress: async () => {
        await exportOriginal(spot);
        onClose();
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Hidden share card rendered off-screen for capture */}
      <View style={styles.hiddenCard}>
        <ShareCardView ref={shareCardRef} spot={spot} />
      </View>

      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.sheetTitle}>Share This Spot</Text>

        {/* Spot preview */}
        <View style={styles.previewRow}>
          <Image
            source={{ uri: spot.coverImage }}
            style={styles.previewImage}
            contentFit="cover"
            placeholder={{ color: Colors.shimmer }}
          />
          <Text style={styles.previewTitle} numberOfLines={2}>
            {spot.title}
          </Text>
        </View>

        {/* Options grid */}
        <View style={styles.optionsGrid}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.optionButton}
              onPress={opt.onPress}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator color={Colors.accent} size="small" />
              ) : (
                <View style={styles.optionIcon}>
                  <Feather name={opt.icon} size={22} color={Colors.accent} />
                </View>
              )}
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  hiddenCard: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Spacing.radiusXl,
    borderTopRightRadius: Spacing.radiusXl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  previewImage: {
    width: 56,
    height: 56,
    borderRadius: Spacing.radiusSm,
  },
  previewTitle: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: Typography.base,
  },
});
