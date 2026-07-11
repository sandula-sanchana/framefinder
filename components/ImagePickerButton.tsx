import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';
import Typography from '../constants/Typography';

interface ImagePickerButtonProps {
  image: string | null;
  onPick: (uri: string) => void;
  onRemove: () => void;
  index?: number;
}

export default function ImagePickerButton({
  image,
  onPick,
  onRemove,
}: ImagePickerButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleTakePhoto = async () => {
    setModalVisible(false);
    // Small delay so modal fully closes before camera opens (Android)
    await new Promise((r) => setTimeout(r, Platform.OS === 'android' ? 200 : 50));

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Permission Needed', 'Please enable camera access in your device settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
      exif: true,
      cameraType: ImagePicker.CameraType.back,
    });
    if (!result.canceled && result.assets?.[0]) {
      onPick(result.assets[0].uri);
    }
  };

  const handlePickFromGallery = async () => {
    setModalVisible(false);
    await new Promise((r) => setTimeout(r, Platform.OS === 'android' ? 200 : 50));

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Gallery Permission Needed', 'Please enable photo library access in your device settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
      exif: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      onPick(result.assets[0].uri);
    }
  };

  return (
    <>
      <View style={styles.wrapper}>
        {image ? (
          <View style={styles.filled}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={onRemove}
              hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
            >
              <Feather name="x" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.empty}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Feather name="camera" size={22} color={Colors.textMuted} />
            <Text style={styles.emptyLabel}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Photo Source Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.handle} />

            <Text style={styles.sheetTitle}>Add Photo</Text>
            <Text style={styles.sheetSubtitle}>Choose how you'd like to add a photo</Text>

            <TouchableOpacity
              style={styles.option}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: Colors.accentMuted }]}>
                <Ionicons name="camera-outline" size={22} color={Colors.accent} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSub}>Use your camera to snap a new photo</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.option}
              onPress={handlePickFromGallery}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#1a3a2a' }]}>
                <Ionicons name="images-outline" size={22} color="#4caf94" />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionSub}>Pick an existing photo from your library</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 105,
    height: 105,
    marginRight: Spacing.sm,
  },
  empty: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    gap: 4,
  },
  emptyLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  filled: {
    flex: 1,
    borderRadius: Spacing.radiusMd,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.overlayHeavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal / Bottom Sheet
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl ?? 48,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sheetSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  optionSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  cancelButton: {
    marginTop: Spacing.lg,
    height: 50,
    borderRadius: Spacing.radiusMd,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
});