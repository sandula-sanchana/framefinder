import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import SpotCard from '../../components/SpotCard';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { getUserSpots } from '../../firebase/spotsService';
import { uploadImage } from '../../firebase/storageService';
import { updateUserProfile } from '../../firebase/authService';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';
import { Spot } from '../../types';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const { user, userDoc, logout, refreshUserDoc } = useAuth();
  const { favorites } = useFavorites();

  const [mySpots, setMySpots] = useState<Spot[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState(userDoc?.username ?? '');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserSpots(user.uid)
      .then(setMySpots)
      .catch(() => {})
      .finally(() => setLoadingSpots(false));
  }, [user]);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Required', text2: 'Gallery access needed.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) setEditAvatar(result.assets[0].uri);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: { username?: string; profilePicture?: string } = {};
      if (editUsername.trim() && editUsername !== userDoc?.username) {
        updates.username = editUsername.trim();
      }
      if (editAvatar) {
        const url = await uploadImage(editAvatar, `avatars/${user.uid}`);
        updates.profilePicture = url;
      }
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(user.uid, updates);
        await refreshUserDoc();
      }
      setShowEditModal(false);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Profile updated successfully.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setShowSignOutModal(false);
    await logout();
  };

  const initials = userDoc?.username
    ? userDoc.username.substring(0, 2).toUpperCase()
    : '??';

  const avatarUri = editAvatar ?? userDoc?.profilePicture;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>{userDoc?.username ?? 'User'}</Text>
          <Text style={styles.email}>{userDoc?.email ?? user?.email}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userDoc?.spotsCount ?? 0}</Text>
              <Text style={styles.statLabel}>Spots</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favourites</Text>
            </View>
          </View>
        </View>

        {/* Edit Profile Button */}
        <View style={styles.section}>
          <PrimaryButton
            title="Edit Profile"
            onPress={() => {
              setEditUsername(userDoc?.username ?? '');
              setEditAvatar(null);
              setShowEditModal(true);
            }}
            variant="outlined"
          />
        </View>

        {/* My Spots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Spots</Text>
          {loadingSpots ? (
            <ActivityIndicator color={Colors.accent} style={{ marginVertical: Spacing.lg }} />
          ) : mySpots.length === 0 ? (
            <EmptyState icon="camera" message="You haven't added any spots yet." />
          ) : (
            <FlatList
              data={mySpots}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <SpotCard spot={item} style={{ marginHorizontal: 0 }} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: Spacing.sm }}
              style={{ marginHorizontal: -Spacing.screenPadding }}
              contentInset={{ left: Spacing.screenPadding, right: Spacing.screenPadding }}
              contentOffset={{ x: -Spacing.screenPadding, y: 0 }}
            />
          )}
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => setShowSignOutModal(true)}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={16} color={Colors.error} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sign Out Confirm */}
      <ConfirmModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        confirmVariant="danger"
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowEditModal(false)}
        />
        <View style={styles.editSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.editTitle}>Edit Profile</Text>

          <TouchableOpacity style={styles.avatarEdit} onPress={handlePickAvatar}>
            {editAvatar || userDoc?.profilePicture ? (
              <Image
                source={{ uri: editAvatar ?? userDoc?.profilePicture ?? '' }}
                style={styles.avatarLg}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatarPlaceholder, styles.avatarLg]}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Feather name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <TextInput
            style={styles.editInput}
            value={editUsername}
            onChangeText={setEditUsername}
            placeholder="Username"
            placeholderTextColor={Colors.textMuted}
          />

          <PrimaryButton
            title="Save Changes"
            onPress={handleSaveProfile}
            loading={saving}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 80 },
  profileHeader: { alignItems: 'center', padding: Spacing.xl },
  avatarContainer: { marginBottom: Spacing.md },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  username: {
    fontSize: Typography.xl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  email: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Spacing.radiusMd,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  section: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.errorMuted,
    backgroundColor: Colors.errorMuted,
  },
  signOutText: { color: Colors.error, fontSize: Typography.base, fontWeight: Typography.semiBold },
  modalBackdrop: { flex: 1, backgroundColor: Colors.overlay },
  editSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Spacing.radiusXl,
    borderTopRightRadius: Spacing.radiusXl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.sm,
  },
  editTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  avatarEdit: { alignSelf: 'center', position: 'relative' },
  avatarLg: { width: 88, height: 88, borderRadius: 44 },
  editBadge: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  editInput: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
});
