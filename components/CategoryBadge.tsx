import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/Categories';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] ?? '#A0A0A0';
  const icon = (CATEGORY_ICONS[category] ?? 'camera') as keyof typeof Feather.glyphMap;

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${color}33` }, // 20% opacity
        isSmall && styles.badgeSm,
      ]}
    >
      <Feather
        name={icon}
        size={isSmall ? 10 : 12}
        color={color}
        style={{ marginRight: Spacing.xxs }}
      />
      <Text style={[styles.text, { color }, isSmall && styles.textSm]}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs + 1,
    borderRadius: Spacing.radiusFull,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
  },
  text: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    letterSpacing: Typography.wide,
  },
  textSm: {
    fontSize: 10,
  },
});
