import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import SpotCard from '../../components/SpotCard';
import { CATEGORIES } from '../../constants/Categories';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography from '../../constants/Typography';
import { useSpots } from '../../context/SpotsContext';
import { Spot } from '../../types';

const ALL_CATEGORIES = ['All', ...CATEGORIES];

export default function HomeScreen() {
  const { spots, isLoading, isRefreshing, fetchSpots, refreshSpots } = useSpots();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredSpots: Spot[] =
    selectedCategory === 'All'
      ? spots
      : spots.filter((s) => s.category === selectedCategory);

  const renderSpotCard = ({ item }: { item: Spot }) => (
    <SpotCard spot={item} />
  );

  if (isLoading && spots.length === 0) {
    return (
      <View style={styles.screen}>
        <LoadingSpinner fullScreen message="Loading spots..." />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>FrameFinder</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="bell" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        style={styles.categoryScroll}
      >
        {ALL_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryPill,
              selectedCategory === cat && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Spots Feed */}
      <FlatList
        data={filteredSpots}
        keyExtractor={(item) => item.id}
        renderItem={renderSpotCard}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="camera"
            message={
              selectedCategory === 'All'
                ? 'No spots yet. Be the first to add one!'
                : `No ${selectedCategory} spots yet.`
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshSpots}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
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
    paddingVertical: Spacing.sm,
  },
  wordmark: {
    fontSize: Typography.xl,
    fontWeight: Typography.extraBold,
    color: Colors.primary,
    letterSpacing: Typography.tight,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  categoryList: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.surfaceElevated,
  },
  categoryPillActive: {
    backgroundColor: Colors.accent,
  },
  categoryText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: Typography.semiBold,
  },
  feedContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 80,
  },
});
