const Colors = {
  // Backgrounds
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  surfaceHighlight: '#252525',

  // Brand
  primary: '#E8D5B7',      // Warm cream — film photography feel
  primaryDark: '#C4A882',
  accent: '#FF6B35',       // Warm orange — golden hour
  accentMuted: 'rgba(255, 107, 53, 0.15)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#606060',
  textInverse: '#0A0A0A',

  // Borders
  border: '#2A2A2A',
  borderSubtle: '#1E1E1E',

  // Status
  error: '#FF4444',
  errorMuted: 'rgba(255, 68, 68, 0.15)',
  success: '#00C896',
  successMuted: 'rgba(0, 200, 150, 0.15)',
  warning: '#FFB830',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayHeavy: 'rgba(0, 0, 0, 0.85)',
  shimmer: '#1A1A1A',

  // Gradient stops (use with expo-linear-gradient)
  gradientCard: ['transparent', 'rgba(0,0,0,0.85)'] as const,
  gradientHero: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)'] as const,
};

export default Colors;
