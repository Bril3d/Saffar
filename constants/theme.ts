/**
 * SAFAR Chain — "Emerald Trace" Design System
 * Light theme · White/Green · Inter · Tonal Layering · No-Line Rule
 */

import { Platform } from 'react-native';

/* ── Color Tokens ─────────────────────────────────── */

export const Colors = {
  // Primary greens
  primary: '#0d631b',
  primaryContainer: '#2e7d32',
  primaryFixed: '#a3f69c',
  primaryFixedDim: '#88d982',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#cbffc2',

  // Secondary greens
  secondary: '#476644',
  secondaryContainer: '#c6e9be',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#4c6a48',

  // Tertiary (accent)
  tertiary: '#923357',
  tertiaryContainer: '#b14b6f',

  // Surfaces (tonal layering)
  surface: '#f8faf8',
  surfaceBright: '#f8faf8',
  surfaceContainer: '#eceeec',
  surfaceContainerHigh: '#e6e9e7',
  surfaceContainerHighest: '#e1e3e1',
  surfaceContainerLow: '#f2f4f2',
  surfaceContainerLowest: '#ffffff',
  surfaceDim: '#d8dad9',
  surfaceTint: '#1b6d24',

  // On-surface text
  onSurface: '#191c1b',
  onSurfaceVariant: '#40493d',
  background: '#f8faf8',
  onBackground: '#191c1b',

  // Outlines (ghost borders only)
  outline: '#707a6c',
  outlineVariant: '#bfcaba',

  // Error / status
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // AWaRe classification
  aware: {
    access: '#2e7d32',
    watch: '#f9a825',
    reserve: '#d32f2f',
  },

  // Status colors
  status: {
    certified: '#2e7d32',
    withdrawal: '#f9a825',
    pending: '#9e9e9e',
    rejected: '#d32f2f',
  },

  // Inverse
  inverseSurface: '#2e3130',
  inverseOnSurface: '#eff1ef',
  inversePrimary: '#88d982',
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
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/* ── Border Radii (large, pill-like) ─────────────── */

export const Radii = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

/* ── Shadows (ambient, tinted) ───────────────────── */

export const Shadows = {
  sm: {
    shadowColor: '#191c1b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#191c1b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#191c1b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  }),
};
