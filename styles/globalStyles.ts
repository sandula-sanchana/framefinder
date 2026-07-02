import { StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';
import Typography from '../constants/Typography';

const globalStyles = StyleSheet.create({
  // Screens
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
  },

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.radiusLg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },

  // Text styles
  heading1: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: Typography.tight,
  },
  heading2: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  heading3: {
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: Typography.base,
    fontWeight: Typography.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  caption: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
    letterSpacing: Typography.wide,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },

  // Inputs
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputFocused: {
    borderColor: Colors.accent,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Shadows (iOS)
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shadowSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default globalStyles;
