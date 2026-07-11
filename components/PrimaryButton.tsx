import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Typography from '../constants/Typography';
import Spacing from '../constants/Spacing';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}

export default function PrimaryButton({
  title,
  onPress,
  variant = 'filled',
  loading = false,
  disabled = false,
  icon,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'filled' && styles.filled,
        variant === 'outlined' && styles.outlined,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'filled' ? '#fff' : Colors.accent}
          size="small"
        />
      ) : (
        <>
          {icon ? (
            <Feather
              name={icon}
              size={18}
              color={variant === 'filled' ? '#fff' : Colors.accent}
              style={{ marginRight: Spacing.xs }}
            />
          ) : null}
          <Text
            style={[
              styles.text,
              variant === 'filled' && styles.textFilled,
              variant === 'outlined' && styles.textOutlined,
              variant === 'ghost' && styles.textGhost,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
  },
  filled: {
    backgroundColor: Colors.accent,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
  textFilled: {
    color: '#fff',
  },
  textOutlined: {
    color: Colors.accent,
  },
  textGhost: {
    color: Colors.accent,
  },
});
