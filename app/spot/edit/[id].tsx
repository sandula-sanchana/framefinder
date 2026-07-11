import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImagePickerButton from '../../../components/ImagePickerButton';
import LoadingSpinner from '../../../components/LoadingSpinner';
import PrimaryButton from '../../../components/PrimaryButton';
import { CATEGORIES } from '../../../constants/Categories';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import Typography from '../../../constants/Typography';
import { useSpots } from '../../../context/SpotsContext';
import { Spot, SpotFormData } from '../../../types';
import Toast from 'react-native-toast-message';

export default function EditSpotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSpotById, updateSpot } = useSpots();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [location, setLocation] = useState<SpotFormData['location']>(null);

  useEffect(() => {
    if (!id) return;
    getSpotById(id)
      .then((s) => {
        if (!s) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Spot not found.', position: 'bottom' });
          router.back();
          return;
        }
        setSpot(s);
        setTitle(s.title);
        setDescription(s.description);
        setCategory(s.category);
        setBestTime(s.bestTime);
        setLocation(s.location);

        // Pre-fill photo slots with existing URLs
        const slots: (string | null)[] = [null, null, null];
        s.photos.slice(0, 3).forEach((url, i) => {
          slots[i] = url;
        });
        setPhotos(slots);
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load spot.', position: 'bottom' });
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id]);

  const filledPhotos = photos.filter(Boolean) as string[];
  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    category.length > 0 &&
    filledPhotos.length > 0 &&
    !isSubmitting;

  const handlePhotoPicked = (index: number, uri: string) => {
    const newPhotos = [...photos];
    newPhotos[index] = uri;
    setPhotos(newPhotos);
  };

  const handleRemoveImage = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const handleGetLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission Required', text2: 'Location access needed.', position: 'bottom' });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not get location.', position: 'bottom' });
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !spot) return;
    setIsSubmitting(true);
    try {
      await updateSpot(spot.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        bestTime: bestTime.trim(),
        photos: filledPhotos,
        location,
      });
      router.back();
      Toast.show({ type: 'success', text1: 'Success', text2: 'Spot updated successfully.', position: 'bottom' });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not update spot. Please try again.', position: 'bottom' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading spot..." />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.heading}>Edit Spot</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Photo Picker */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>
              PHOTOS ({filledPhotos.length}/3)
            </Text>
            <View style={styles.photoRow}>
              {photos.map((uri, i) => (
                <ImagePickerButton
                  key={i}
                  index={i}
                  image={uri}
                  onPick={(pickedUri) => handlePhotoPicked(i, pickedUri)}
                  onRemove={() => handleRemoveImage(i)}
                />
              ))}
            </View>
          </View>

          {/* Spot Name */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>SPOT NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="Spot name"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>DESCRIPTION *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Describe this spot..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>CATEGORY *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    category === cat && styles.categoryPillActive,
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Best Time */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>BEST PHOTOGRAPHY TIME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Golden Hour — 6:30 AM"
              placeholderTextColor={Colors.textMuted}
              value={bestTime}
              onChangeText={setBestTime}
            />
          </View>

          {/* Location */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>LOCATION</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetLocation}
              disabled={isFetchingLocation}
              activeOpacity={0.8}
            >
              {isFetchingLocation ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <>
                  <Feather name="map-pin" size={16} color={Colors.accent} style={{ marginRight: Spacing.sm }} />
                  <Text style={styles.locationButtonText}>Update Location</Text>
                </>
              )}
            </TouchableOpacity>
            {location ? (
              <Text style={styles.locationText}>
                :: Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
              </Text>
            ) : null}
          </View>

          {/* Submit */}
          <PrimaryButton
            title="Save Changes"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
            icon="check"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  sectionContainer: { marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.textMuted,
    letterSpacing: Typography.wider,
    marginBottom: Spacing.sm,
  },
  photoRow: { flexDirection: 'row' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  multilineInput: { height: 100, paddingTop: Spacing.md },
  categoryList: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  categoryText: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary },
  categoryTextActive: { color: Colors.accent, fontWeight: Typography.semiBold },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Spacing.radiusMd,
    height: 46,
  },
  locationButtonText: { color: Colors.accent, fontSize: Typography.base, fontWeight: Typography.medium },
  locationText: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: Spacing.sm },
  submitButton: { marginTop: Spacing.md },
});