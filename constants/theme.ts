/**
 * SAFAR Chain — "Emerald Trace" Design System
 * Migrated to Light agricultural theme: warm, earthy, Mediterranean
 */

import { Platform } from 'react-native';

/* ── Color Tokens ─────────────────────────────────── */

export const Colors = {
  // Canvas / Surfaces
  background: '#F7F5F0',         // warm cream
  surface: '#FFFFFF',            // cards
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F0EDE6',// inputs, wells
  surfaceContainer: '#E6E2DA',   // hover, pressed
  
  outline: '#DDD9D0',            // subtle border
  outlineVariant: '#C5BFB3',     // strong border

  // Text
  onBackground: '#1C2B1A',       // text-primary
  onSurface: '#1C2B1A',          // text-primary
  onSurfaceVariant: '#4E5D4B',   // text-secondary
  onSurfaceDisabled: '#B3BAB0',  // text-disabled

  // Brand
  primary: '#2E7D32',            // rich agricultural green
  primaryContainer: 'rgba(46, 125, 50, 0.08)',
  primaryFixed: '#E8F5E9',
  primaryFixedDim: '#C8E6C9',
  onPrimary: '#FFFFFF',
  
  secondary: '#1565A0',          // trustworthy blue
  secondaryContainer: 'rgba(21, 101, 160, 0.08)',
  onSecondary: '#FFFFFF',

  // Status
  error: '#C62828',
  errorContainer: 'rgba(198, 40, 40, 0.08)',
  onError: '#FFFFFF',
  onErrorContainer: '#C62828',

  success: '#2E7D32',
  warning: '#E09F24',
  info: '#1565A0',

  // AWaRe classification
  aware: {
    access: '#2e7d32',
    watch: '#E09F24',
    reserve: '#C62828',
  },

  // Status colors
  status: {
    certified: '#2e7d32',
    withdrawal: '#E09F24',
    pending: '#7D8A7A',
    rejected: '#C62828',
  },

  // Role Colors
  rolePharmacy: '#2E7D32',
  roleVet: '#1565A0',
  roleFarmer: '#D4960E',
  roleAbattoir: '#C62828',
  roleConsumer: '#7B3FA0',

  inverseSurface: '#1C2B1A',
  inverseOnSurface: '#F7F5F0',
  inversePrimary: '#357A38',

  // Standard Expo template theme keys
  text: '#1C2B1A',
  icon: '#4E5D4B',
  tint: '#2E7D32',
  tabIconDefault: '#B3BAB0',
  tabIconSelected: '#2E7D32',

  light: null as any,
  dark: null as any,
};

Colors.light = Colors;
Colors.dark = Colors;

/* ── Typography ───────────────────────────────────── */

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'Roboto',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "Inter, system-ui, sans-serif",
    mono: "'JetBrains Mono', SFMono-Regular, Menlo, monospace",
  },
});

/* ── Spacing ──────────────────────────────────────── */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

/* ── Border Radii (large, pill-like) ─────────────── */

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

/* ── Shadows (ambient, tinted) ───────────────────── */

export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  }),
};

/* ── Backward Compatibility Exports ─────────────── */

export const spacing = Spacing;
export const radii = Radii;

export const colors = {
  ...Colors,
  bg: {
    primary: Colors.background,
    secondary: Colors.surface,
    tertiary: Colors.surfaceContainerLow,
    elevated: Colors.surfaceContainer,
    input: Colors.surfaceContainerLow,
  },
  border: {
    default: Colors.outline,
    strong: Colors.outlineVariant,
    focus: Colors.primary,
  },
  text: {
    primary: Colors.onBackground,
    secondary: Colors.onSurfaceVariant,
    tertiary: Colors.onSurfaceDisabled,
    inverse: Colors.inverseOnSurface,
    link: Colors.secondary,
  },
  accent: {
    primary: Colors.primary,
    primaryMuted: Colors.primaryContainer,
    primarySubtle: 'rgba(46,125,50,0.06)',
    blockchain: Colors.secondary,
    blockchainMuted: Colors.secondaryContainer,
  },
  aware: {
    ...Colors.aware,
    accessBg: 'rgba(46,125,50,0.12)',
    watchBg: 'rgba(224,159,36,0.12)',
    reserveBg: 'rgba(198,40,40,0.12)',
  },
  status: {
    success: Colors.success,
    successBg: 'rgba(46,125,50,0.10)',
    warning: Colors.warning,
    warningBg: 'rgba(224,159,36,0.10)',
    danger: Colors.error,
    dangerBg: Colors.errorContainer,
    info: Colors.info,
    infoBg: 'rgba(21,101,160,0.10)',
    certified: Colors.status.certified,
    withdrawal: Colors.status.withdrawal,
    pending: Colors.status.pending,
    rejected: Colors.status.rejected,
  },
  role: {
    pharmacy: Colors.rolePharmacy,
    pharmacyBg: 'rgba(46,125,50,0.08)',
    vet: Colors.roleVet,
    vetBg: 'rgba(21,101,160,0.08)',
    farmer: Colors.roleFarmer,
    farmerBg: 'rgba(212,150,14,0.08)',
    slaughterhouse: Colors.roleAbattoir,
    slaughterhouseBg: 'rgba(198,40,40,0.08)',
    consumer: Colors.roleConsumer,
    consumerBg: 'rgba(123,63,160,0.08)',
  },
};

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 34,
    color: Colors.onBackground,
  },
  title: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
    color: Colors.onBackground,
  },
  section: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 22,
    color: Colors.onBackground,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 18,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', web: "'JetBrains Mono', monospace" }),
    color: Colors.onSurfaceVariant,
  },
};

