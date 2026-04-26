/**
 * SAFAR Chain — Design System Tokens (2026 refresh)
 *
 * Deep olive-grove dark with terracotta, Mediterranean blue, and saffron accents.
 * Agricultural warmth on a clinical chassis. Dark-first.
 *
 * Nested shape preserved for backward compat (colors.bg.primary, etc.)
 * while the brief's flat names are exposed via `tokens`.
 */

// ── Raw tokens (flat, brief-aligned) ────────────────────────────────────────

export const darkTokens = {
  // Canvas / surfaces (SaaS Dark)
  canvas: '#0B1120',      // Background principal
  canvasWarm: '#111827',  // Secondary background
  surface1: '#1F2937',    // Card background
  surface2: '#374151',
  surface3: '#4B5563',
  borderSubtle: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.12)',

  // Text
  textPrimary: '#F9FAFB',   // Main text
  textSecondary: '#9CA3AF', // Soft text
  textTertiary: '#6B7280',
  textDisabled: '#4B5563',
  textInverse: '#0B1120',

  // Brand (Premium Green)
  brandPrimary: '#10B981',  // Primary accent
  brandPrimaryHover: '#34D399', // Secondary accent
  brandPrimaryPressed: '#059669',
  brandGlow: 'rgba(16,185,129,0.15)',
  brandGlowSoft: 'rgba(16,185,129,0.08)',
  brandSecondary: '#3B82F6', // Keep blue for blockchain hash/links
  brandSecondaryGlow: 'rgba(59,130,246,0.15)',

  // Tunisian accent layer (Refined for SaaS)
  accentTerracotta: '#F97316',
  accentOchre: '#F59E0B',
  accentSand: '#ECFDF5',    // Highlight text used here for extreme contrast
  accentSaffron: '#EAB308',

  // Functional / status
  success: '#10B981',
  successBg: 'rgba(16,185,129,0.1)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.1)',
  danger: '#EF4444',
  dangerBg: 'rgba(239,68,68,0.1)',
  info: '#3B82F6',
  infoBg: 'rgba(59,130,246,0.1)',

  // Role accents (Adjusted to blend with SaaS theme)
  rolePharmacy: '#10B981',
  roleVet: '#3B82F6',
  roleFarmer: '#F59E0B',
  roleAbattoir: '#EF4444',
  roleConsumer: '#8B5CF6',
  roleRegulator: '#6B7280',

  // AWaRe
  awareAccess: '#10B981',
  awareWatch: '#F59E0B',
  awareReserve: '#EF4444',
} as const;

export const lightTokens = {
  // Canvas / surfaces
  canvas: '#F7FAF7',      // Soft Background
  canvasWarm: '#F2F4F3',  // Soft Gray (Inputs/Secondary)
  surface1: '#FFFFFF',    // White Pure (Cards)
  surface2: '#DDF4E7',    // Light Mint Green
  surface3: '#F2F4F3',
  borderSubtle: '#E3E8E5',
  borderStrong: '#CBD5E1',

  // Text
  textPrimary: '#1C2B22',   // Text Dark
  textSecondary: '#6B7A72', // Text Secondary
  textTertiary: '#A0AEA5',  // Inactive icons
  textDisabled: '#CBD5E1',
  textInverse: '#FFFFFF',

  // Brand (Pro Green & Gold)
  brandPrimary: '#1F7A4D',  // Primary Green
  brandPrimaryHover: '#3FAF6C', // Secondary Green
  brandPrimaryPressed: '#175C3A',
  brandGlow: 'rgba(31,122,77,0.15)',
  brandGlowSoft: 'rgba(31,122,77,0.08)',
  brandSecondary: '#D9B96E', // Gold Accent
  brandSecondaryGlow: 'rgba(217,185,110,0.15)',

  // Accents
  accentTerracotta: '#EA580C',
  accentOchre: '#D9B96E',   // Gold Accent
  accentSand: '#F2F4F3',
  accentSaffron: '#B45309',

  // Functional / status
  success: '#3FAF6C',
  successBg: 'rgba(63,175,108,0.08)',
  warning: '#FFD76A',       // Warning Weather Yellow
  warningBg: 'rgba(255,215,106,0.15)',
  danger: '#FF6B6B',        // Error Soft
  dangerBg: 'rgba(255,107,107,0.08)',
  info: '#DCEFFF',          // Sky Blue
  infoBg: 'rgba(220,239,255,0.15)',

  // Role accents
  rolePharmacy: '#DDF4E7', // Mint
  roleVet: '#DCEFFF',      // Sky Blue
  roleFarmer: '#1F7A4D',   // Primary Green
  roleAbattoir: '#D9B96E', // Gold
  roleConsumer: '#F2F4F3', // Soft Gray
  roleRegulator: '#1C2B22', // Text Dark

  // AWaRe
  awareAccess: '#3FAF6C',
  awareWatch: '#D9B96E',
  awareReserve: '#FF6B6B',
} as const;


export const tokens = darkTokens; // Default to dark for compatibility


function withAlpha(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Legacy nested shape (backward-compatible) ──────────────────────────────

import { Appearance } from 'react-native';

export function generateColors(t: typeof darkTokens | typeof lightTokens) {
  return {
    bg: {
      primary: t.canvas,
      canvas: t.canvas,
      canvasWarm: t.canvasWarm,
      secondary: t.surface1,
      tertiary: t.surface2,
      elevated: t.surface3,
      input: t.surface2,
    },

    border: {
      default: t.borderSubtle,
      subtle: t.borderSubtle,
      strong: t.borderStrong,
      focus: t.brandPrimary,
    },

    text: {
      primary: t.textPrimary,
      secondary: t.textSecondary,
      tertiary: t.textTertiary,
      disabled: t.textDisabled,
      inverse: t.textInverse,
      link: t.brandSecondary,
    },

    accent: {
      primary: t.brandPrimary,
      primaryHover: t.brandPrimaryHover,
      primaryMuted: withAlpha(t.brandPrimary, 0.12),
      primarySubtle: withAlpha(t.brandPrimary, 0.06),
      primaryGlow: t.brandGlow,
      blockchain: t.brandSecondary,
      blockchainMuted: withAlpha(t.brandSecondary, 0.14),
      blockchainSubtle: withAlpha(t.brandSecondary, 0.06),
      terracotta: t.accentTerracotta,
      ochre: t.accentOchre,
      sand: t.accentSand,
      saffron: t.accentSaffron,
    },

    aware: {
      access: t.awareAccess,
      accessBg: withAlpha(t.awareAccess, 0.14),
      watch: t.awareWatch,
      watchBg: withAlpha(t.awareWatch, 0.14),
      reserve: t.awareReserve,
      reserveBg: withAlpha(t.awareReserve, 0.14),
    },

    status: {
      success: t.success,
      successBg: t.successBg,
      warning: t.warning,
      warningBg: t.warningBg,
      danger: t.danger,
      dangerBg: t.dangerBg,
      info: t.info,
      infoBg: t.infoBg,
    },

    role: {
      pharmacy: t.rolePharmacy,
      pharmacyBg: withAlpha(t.rolePharmacy, 0.10),
      vet: t.roleVet,
      vetBg: withAlpha(t.roleVet, 0.10),
      farmer: t.roleFarmer,
      farmerBg: withAlpha(t.roleFarmer, 0.10),
      slaughterhouse: t.roleAbattoir,
      slaughterhouseBg: withAlpha(t.roleAbattoir, 0.10),
      consumer: t.roleConsumer,
      consumerBg: withAlpha(t.roleConsumer, 0.10),
      regulator: t.roleRegulator,
      regulatorBg: withAlpha(t.roleRegulator, 0.10),
    },
  } as const;
}


// Force SaaS Light Theme globally as per user request
export const colors = generateColors(lightTokens);
export const darkColors = generateColors(darkTokens);
export const lightColors = generateColors(lightTokens);



// ── Spacing (4px base) ─────────────────────────────────────────────────────

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 24,
  xxl: 24,
  '3xl': 32,
  xxxl: 32,
  '4xl': 40,
  '5xl': 56,
  '6xl': 72,
} as const;

// ── Radii ──────────────────────────────────────────────────────────────────

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  full: 9999,
} as const;

// ── Fonts ──────────────────────────────────────────────────────────────────

export const fonts = {
  display: 'CabinetGrotesk, "Cabinet Grotesk", "General Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", "IBM Plex Mono", Menlo, Consolas, monospace',
  arabic: '"IBM Plex Sans Arabic", "Noto Sans Arabic", Tahoma, sans-serif',
} as const;

// ── Typography (11/13/15/17/20/24/32/44) ──────────────────────────────────

export const typography = {
  displayLarge: {
    fontSize: 44,
    fontWeight: '600' as const,
    letterSpacing: -0.88,
    lineHeight: 50,
    color: tokens.textPrimary,
  },
  display: {
    fontSize: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.64,
    lineHeight: 38,
    color: tokens.textPrimary,
  },
  title: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 30,
    color: tokens.textPrimary,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 30,
    color: tokens.textPrimary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 26,
    color: tokens.textPrimary,
  },
  section: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 24,
    color: tokens.textPrimary,
  },
  bodyLg: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 26,
    color: tokens.textSecondary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0.05,
    lineHeight: 22,
    color: tokens.textSecondary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
    color: tokens.textTertiary,
  },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.32,
    lineHeight: 14,
    color: tokens.textTertiary,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 18,
    fontVariant: ['tabular-nums'] as ('tabular-nums')[],
    color: tokens.textSecondary,
  },
  monoLg: {
    fontSize: 15,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 22,
    fontVariant: ['tabular-nums'] as ('tabular-nums')[],
    color: tokens.textPrimary,
  },
} as const;

// ── Elevation (CSS boxShadow, per Expo UI guidelines) ──────────────────────

export const elevation = {
  cardInset: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  brandGlow: `0 0 0 1px ${tokens.brandPrimary}, 0 8px 32px ${tokens.brandGlow}`,
  brandGlowSoft: `0 0 0 1px ${withAlpha(tokens.brandPrimary, 0.4)}, 0 4px 20px ${tokens.brandGlowSoft}`,
  buttonPressed: 'inset 0 1px 3px rgba(0,0,0,0.25)',
  focusRing: `0 0 0 3px ${withAlpha(tokens.brandPrimary, 0.16)}`,
  focusRingDanger: `0 0 0 3px ${withAlpha(tokens.danger, 0.16)}`,
} as const;

// ── Motion tokens ──────────────────────────────────────────────────────────

export const motion = {
  fast: 200,
  medium: 280,
  slow: 400,
  stagger: 40,
  scannerLoop: 2000,
  aiBorderLoop: 8000,
  spring: { mass: 1, stiffness: 180, damping: 22 },
} as const;

export const zIndex = {
  base: 0,
  card: 1,
  banner: 10,
  header: 50,
  modal: 100,
  toast: 1000,
} as const;

export { withAlpha };

// ── Backward-compat aliases (capitalized exports some old code expects) ─────
export const Colors = colors;
export const Fonts = {
  display: 'CabinetGrotesk, "Cabinet Grotesk", "General Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", "IBM Plex Mono", Menlo, Consolas, monospace',
  rounded: 'CabinetGrotesk, "Cabinet Grotesk", "General Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};
export const Spacing = spacing;
export const Radii = radii;
export const Typography = typography;

// ── Legacy color scheme (light/dark) for old hooks/components ──────────────
export const colorScheme = {
  light: colors.bg.primary,
  dark: colors.bg.primary,
} as const;

