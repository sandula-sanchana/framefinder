import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryBadge from '../../components/CategoryBadge';
import FavoriteButton from '../../components/FavoriteButton';
import PhotoGrid from '../../components/PhotoGrid';
import ShareModal from '../../components/ShareModal';
import ConfirmModal from '../../components/ConfirmModal';
import PrimaryButton from '../../components/PrimaryButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useSpots } from '../../context/SpotsContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';
import { Spot } from '../../types';
import Toast from 'react-native-toast-message';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getSpotById, deleteSpot } = useSpots();
  const { user } = useAuth();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSpotById(id)
      .then((s) => setSpot(s))
      .catch(() => Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load spot.', position: 'bottom' }))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = user && spot && user.uid === spot.ownerId;

  const handleDelete = async () => {
    if (!spot || !user) return;
    setIsDeleting(true);
    setShowDeleteModal(false);
    try {
      await deleteSpot(spot.id);
      router.back();
      Toast.show({ type: 'success', text1: 'Spot Deleted', text2: 'The spot was successfully removed.', position: 'bottom' });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete spot.', position: 'bottom' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading spot..." />;
  if (!spot) {
    return (
      <View style={styles.screen}>
        <Text style={styles.errorText}>Spot not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Hero Image */}
      <View style={[styles.hero, { height: SCREEN_HEIGHT * 0.55 }]}>
        <Image
          source={{ uri: spot.coverImage }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={Colors.gradientHero}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top Actions */}
        <View style={[styles.heroTopRow, { top: insets.top + Spacing.sm }]}>
          <TouchableOpacity style={styles.circleButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => setShowShareModal(true)}
          >
            <Feather name="share-2" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Bottom hero info */}
        <View style={styles.heroBottom}>
          <CategoryBadge category={spot.category} size="sm" />
          <Text style={styles.heroTitle}>{spot.title}</Text>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Row */}
        <View style={styles.infoRow}>
          {spot.bestTime ? (
            <View style={styles.infoItem}>
              <Feather name="clock" size={14} color={Colors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.infoText}>{spot.bestTime}</Text>
            </View>
          ) : null}
          {spot.location ? (
            <View style={styles.infoItem}>
              <Feather name="map-pin" size={14} color={Colors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.infoText} numberOfLines={1}>
                {spot.location.address ||
                  `${spot.location.lat.toFixed(3)}, ${spot.location.lng.toFixed(3)}`}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.ownerText}>Added by @{spot.ownerUsername}</Text>

        {/* Photo Grid */}
        {spot.photos.length > 1 ? (
          <>
            <Text style={styles.sectionHeading}>Photos</Text>
            <PhotoGrid photos={spot.photos} />
          </>
        ) : null}

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>About This Spot</Text>
          <Text style={styles.description}>{spot.description}</Text>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <FavoriteButton spotId={spot.id} spot={spot} size="lg" />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <PrimaryButton
              title="Share This Spot"
              onPress={() => setShowShareModal(true)}
              icon="share-2"
            />
          </View>
        </View>

        {/* Owner Actions */}
        {isOwner ? (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={styles.ownerButton}
              onPress={() => router.push(`/spot/edit/${spot.id}`)}
            >
              <Feather name="edit-2" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.ownerButtonText}>Edit Spot</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ownerButton, styles.dangerButton]}
              onPress={() => setShowDeleteModal(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <>
                  <Feather name="trash-2" size={16} color={Colors.error} style={{ marginRight: 6 }} />
                  <Text style={[styles.ownerButtonText, { color: Colors.error }]}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modals */}
      {showShareModal ? (
        <ShareModal
          visible={showShareModal}
          spot={spot}
          onClose={() => setShowShareModal(false)}
        />
      ) : null}

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Spot"
        message="This will permanently remove the spot and all its photos. This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  hero: { position: 'relative' },
  heroTopRow: {
    position: 'absolute',
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  heroTitle: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    lineHeight: 36,
  },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.sm },
  infoItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoText: { fontSize: Typography.sm, color: Colors.textSecondary, flex: 1 },
  ownerText: { fontSize: Typography.sm, color: Colors.textMuted, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionHeading: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  description: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: 24 },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  ownerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ownerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  dangerButton: {
    borderColor: Colors.errorMuted,
    backgroundColor: Colors.errorMuted,
  },
  ownerButtonText: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  errorText: { color: Colors.textSecondary, fontSize: Typography.md, textAlign: 'center', marginTop: 80 },
  backLink: { color: Colors.accent, fontSize: Typography.base, textAlign: 'center', marginTop: 16 },
});
