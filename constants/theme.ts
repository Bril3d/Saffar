/**
 * SAFAR Chain — Design System Tokens
 * Single source of truth for all visual properties.
 * Inspired by medtech/fintech precision. Dark-first.
 */

export const colors = {
  // ── Backgrounds ──
  bg: {
    primary: '#0C0F14',
    secondary: '#141820',
    tertiary: '#1C2230',
    elevated: '#232A38',
    input: '#171D28',
  },

  // ── Borders ──
  border: {
    default: '#242C3B',
    strong: '#3A4558',
    focus: '#2ECC87',
  },

  // ── Text ──
  text: {
    primary: '#F0F2F5',
    secondary: '#8B95A8',
    tertiary: '#5C667A',
    inverse: '#0C0F14',
    link: '#5B8DEF',
  },

  // ── Brand ──
  accent: {
    primary: '#2ECC87',
    primaryMuted: 'rgba(46,204,135,0.10)',
    primarySubtle: 'rgba(46,204,135,0.06)',
    blockchain: '#5B8DEF',
    blockchainMuted: 'rgba(91,141,239,0.10)',
  },

  // ── AWaRe Classification ──
  aware: {
    access: '#2ECC87',
    accessBg: 'rgba(46,204,135,0.10)',
    watch: '#E8A838',
    watchBg: 'rgba(232,168,56,0.10)',
    reserve: '#E85454',
    reserveBg: 'rgba(232,84,84,0.10)',
  },

  // ── Semantic ──
  status: {
    success: '#2ECC87',
    successBg: 'rgba(46,204,135,0.10)',
    warning: '#E8A838',
    warningBg: 'rgba(232,168,56,0.10)',
    danger: '#E85454',
    dangerBg: 'rgba(232,84,84,0.10)',
    info: '#5B8DEF',
    infoBg: 'rgba(91,141,239,0.10)',
  },

  // ── Role Accents ──
  role: {
    pharmacy: '#2ECC87',
    pharmacyBg: 'rgba(46,204,135,0.07)',
    vet: '#5B8DEF',
    vetBg: 'rgba(91,141,239,0.07)',
    farmer: '#E8A838',
    farmerBg: 'rgba(232,168,56,0.07)',
    slaughterhouse: '#E85454',
    slaughterhouseBg: 'rgba(232,84,84,0.07)',
    consumer: '#9B8AEF',
    consumerBg: 'rgba(155,138,239,0.07)',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 34,
    color: colors.text.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
    color: colors.text.primary,
  },
  section: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 22,
    color: colors.text.primary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 18,
    color: colors.text.tertiary,
  },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    lineHeight: 16,
    color: colors.text.tertiary,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 18,
    fontFamily: 'monospace',
    color: colors.text.secondary,
  },
} as const;
