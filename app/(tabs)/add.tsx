import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ImagePickerButton from '../../components/ImagePickerButton';
import PrimaryButton from '../../components/PrimaryButton';
import { CATEGORIES } from '../../constants/Categories';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import { useSpots } from '../../context/SpotsContext';
import { SpotFormData } from '../../types';

export default function AddSpotScreen() {
  const router = useRouter();
  const { createSpot } = useSpots();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [photos, setPhotos] = useState<string[]>([
    null as unknown as string,
    null as unknown as string,
    null as unknown as string,
  ]);
  const [location, setLocation] = useState<SpotFormData['location']>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const filledPhotos = photos.filter(Boolean);
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
    newPhotos[index] = null as unknown as string;
    setPhotos(newPhotos);
  };

  const handleGetLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission Required', text2: 'Location access is needed to tag your spot.', position: 'bottom' });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not get your location. Please try again.', position: 'bottom' });
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const formData: SpotFormData = {
        title: title.trim(),
        description: description.trim(),
        category,
        bestTime: bestTime.trim(),
        photos: filledPhotos,
        location,
      };
      await createSpot(formData);
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setBestTime('');
      setPhotos([null as unknown as string, null as unknown as string, null as unknown as string]);
      setLocation(null);
      router.replace('/(tabs)');
      Toast.show({ type: 'success', text1: 'Spot Created', text2: 'Your spot was created successfully!', position: 'bottom' });
    } catch (error) {
      console.error('CREATE SPOT ERROR:', error);

      const message =
        error instanceof Error
          ? error.message
          : JSON.stringify(error);

      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: message,
        position: 'bottom',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Text style={styles.heading}>Add New Spot</Text>
          <Text style={styles.subheading}>Share your favourite photography location</Text>

          {/* Photo Picker Row */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>
              ADD PHOTOS ({filledPhotos.length}/3)
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
            <Text style={styles.hint}>First photo will be the cover image</Text>
          </View>

          {/* Spot Name */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>SPOT NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sigiriya at Sunrise"
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
              placeholder="Describe what makes this spot special..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category Picker */}
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
                  <Text style={styles.locationButtonText}>Get Current Location</Text>
                </>
              )}
            </TouchableOpacity>
            {location ? (
              <Text style={styles.locationText}>
                📍 Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
              </Text>
            ) : null}
          </View>

          {/* Submit */}
          <PrimaryButton
            title="Share Spot"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
            icon="upload"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  heading: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
    marginBottom: Spacing.xs,
  },
  subheading: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  sectionContainer: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.textMuted,
    letterSpacing: Typography.wider,
    marginBottom: Spacing.sm,
  },
  photoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  hint: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  multilineInput: {
    height: 100,
    paddingTop: Spacing.md,
  },
  categoryList: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
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
  categoryText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.accent,
    fontWeight: Typography.semiBold,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Spacing.radiusMd,
    height: 46,
  },
  locationButtonText: {
    color: Colors.accent,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  locationText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});