import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import SpotCardMini from '../../components/SpotCardMini';
import EmptyState from '../../components/EmptyState';
import { useSpots } from '../../context/SpotsContext';
import Colors from '../../constants/Colors';
import Typography from '../../constants/Typography';
import Spacing from '../../constants/Spacing';
import { Spot } from '../../types';

export default function SearchScreen() {
  const { spots } = useSpots();
  const [query, setQuery] = useState('');

  const filteredSpots: Spot[] = query.trim()
    ? spots.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.category.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase()) ||
          s.ownerUsername.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const renderItem = ({ item }: { item: Spot }) => (
    <SpotCardMini spot={item} />
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Search Input */}
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Feather name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search locations..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
              <Feather name="x" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={filteredSpots}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          query.trim() ? (
            <EmptyState icon="search" message="No spots found." />
          ) : (
            <View style={styles.hintContainer}>
              <Text style={styles.hintTitle}>Search by:</Text>
              {['• Spot Name', '• Category', '• Description', '• Owner Username'].map((h) => (
                <Text key={h} style={styles.hintItem}>{h}</Text>
              ))}
              <Text style={styles.hintNote}>
                Results update instantly from cached spots.
              </Text>
            </View>
          )
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
  searchRow: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusMd,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.xs,
    paddingBottom: 80,
  },
  hintContainer: {
    padding: Spacing.xl,
    alignItems: 'flex-start',
  },
  hintTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  hintItem: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  hintNote: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
});
