import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SpotCardMini from '../../components/SpotCardMini';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useFavorites } from '../../context/FavoritesContext';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';
import { FavoriteEntry } from '../../types';

export default function FavoritesScreen() {
  const { favorites, isLoading, fetchFavorites } = useFavorites();

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (isLoading && favorites.length === 0) {
    return <LoadingSpinner fullScreen message="Loading favorites..." />;
  }

  const renderItem = ({ item }: { item: FavoriteEntry }) => (
    <SpotCardMini spot={item} />
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Saved Spots</Text>
        {favorites.length > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favorites.length} spots saved</Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.spotId}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            message={`No saved spots yet.\nStart exploring and save your favourites.`}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
  },
  heading: {
    fontSize: Typography.xl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
  },
  countBadge: {
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs + 1,
    borderRadius: Spacing.radiusFull,
  },
  countText: {
    fontSize: Typography.xs,
    color: Colors.accent,
    fontWeight: Typography.semiBold,
  },
  listContent: {
    paddingHorizontal: Spacing.xs,
    paddingBottom: 80,
  },
});
