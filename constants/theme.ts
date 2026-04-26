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

export const tokens = {
  // Canvas / surfaces (warm-neutral dark)
  canvas: '#0A0E12',
  canvasWarm: '#0E1117', // consumer marketplace variant
  surface1: '#131820',
  surface2: '#1B2230',
  surface3: '#242C3D',
  borderSubtle: '#232A38',
  borderStrong: '#2F3849',

  // Text
  textPrimary: '#F2F4F7',
  textSecondary: '#9AA4B7',
  textTertiary: '#5E687C',
  textDisabled: '#3A4253',
  textInverse: '#0A0E12',

  // Brand
  brandPrimary: '#1F8A6F',
  brandPrimaryHover: '#268F75',
  brandPrimaryPressed: '#1A7560',
  brandGlow: 'rgba(45,159,130,0.18)',
  brandGlowSoft: 'rgba(45,159,130,0.08)',
  brandSecondary: '#2D6FA6',
  brandSecondaryGlow: 'rgba(45,111,166,0.18)',

  // Tunisian accent layer
  accentTerracotta: '#C97042',
  accentOchre: '#D89530',
  accentSand: '#E8C893',
  accentSaffron: '#E5A53B',

  // Functional / status
  success: '#3FB97D',
  successBg: 'rgba(63,185,125,0.14)',
  warning: '#E5A53B',
  warningBg: 'rgba(229,165,59,0.14)',
  danger: '#E55353',
  dangerBg: 'rgba(229,83,83,0.14)',
  info: '#5B8DEF',
  infoBg: 'rgba(91,141,239,0.14)',

  // Role accents
  rolePharmacy: '#2BAA7E',
  roleVet: '#3B7AC7',
  roleFarmer: '#D89530',
  roleAbattoir: '#C04848',
  roleConsumer: '#8E6BC9',
  roleRegulator: '#6B8CB8',

  // AWaRe
  awareAccess: '#3FB97D',
  awareWatch: '#E5A53B',
  awareReserve: '#E55353',
} as const;

function withAlpha(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Legacy nested shape (backward-compatible) ──────────────────────────────

export const colors = {
  bg: {
    primary: tokens.canvas,
    canvas: tokens.canvas,
    canvasWarm: tokens.canvasWarm,
    secondary: tokens.surface1,
    tertiary: tokens.surface2,
    elevated: tokens.surface3,
    input: tokens.surface2,
  },

  border: {
    default: tokens.borderSubtle,
    subtle: tokens.borderSubtle,
    strong: tokens.borderStrong,
    focus: tokens.brandPrimary,
  },

  text: {
    primary: tokens.textPrimary,
    secondary: tokens.textSecondary,
    tertiary: tokens.textTertiary,
    disabled: tokens.textDisabled,
    inverse: tokens.textInverse,
    link: tokens.brandSecondary,
  },

  accent: {
    primary: tokens.brandPrimary,
    primaryHover: tokens.brandPrimaryHover,
    primaryMuted: withAlpha(tokens.brandPrimary, 0.12),
    primarySubtle: withAlpha(tokens.brandPrimary, 0.06),
    primaryGlow: tokens.brandGlow,
    blockchain: tokens.brandSecondary,
    blockchainMuted: withAlpha(tokens.brandSecondary, 0.14),
    blockchainSubtle: withAlpha(tokens.brandSecondary, 0.06),
    terracotta: tokens.accentTerracotta,
    ochre: tokens.accentOchre,
    sand: tokens.accentSand,
    saffron: tokens.accentSaffron,
  },

  aware: {
    access: tokens.awareAccess,
    accessBg: withAlpha(tokens.awareAccess, 0.14),
    watch: tokens.awareWatch,
    watchBg: withAlpha(tokens.awareWatch, 0.14),
    reserve: tokens.awareReserve,
    reserveBg: withAlpha(tokens.awareReserve, 0.14),
  },

  status: {
    success: tokens.success,
    successBg: tokens.successBg,
    warning: tokens.warning,
    warningBg: tokens.warningBg,
    danger: tokens.danger,
    dangerBg: tokens.dangerBg,
    info: tokens.info,
    infoBg: tokens.infoBg,
  },

  role: {
    pharmacy: tokens.rolePharmacy,
    pharmacyBg: withAlpha(tokens.rolePharmacy, 0.10),
    vet: tokens.roleVet,
    vetBg: withAlpha(tokens.roleVet, 0.10),
    farmer: tokens.roleFarmer,
    farmerBg: withAlpha(tokens.roleFarmer, 0.10),
    slaughterhouse: tokens.roleAbattoir,
    slaughterhouseBg: withAlpha(tokens.roleAbattoir, 0.10),
    consumer: tokens.roleConsumer,
    consumerBg: withAlpha(tokens.roleConsumer, 0.10),
    regulator: tokens.roleRegulator,
    regulatorBg: withAlpha(tokens.roleRegulator, 0.10),
  },
} as const;

// ── Spacing (4px base) ─────────────────────────────────────────────────────

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
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

