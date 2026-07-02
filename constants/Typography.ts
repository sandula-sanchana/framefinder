const Typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 36,

  // Weights (as string literals for React Native)
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,

  // Letter spacing
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
};

export default Typography;
