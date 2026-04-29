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
};

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
