import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    type StyleProp,
    type TextInputProps,
    type TextStyle,
    type ViewStyle
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { colors, elevation, radii, spacing, tokens, typography, withAlpha } from '@/constants/theme';

// ── Types ──────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cta-large';
type CardVariant = 'default' | 'elevated' | 'tinted';
type ToneKey = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

type ButtonProps = {
  children: string;
  disabled?: boolean;
  onPress?: () => void;
  variant?: ButtonVariant;
  compact?: boolean;
  trailingArrow?: boolean;
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

type CardProps = {
  children: ReactNode;
  /**
   * @deprecated use `variant="tinted"` + `tone`
   * (kept for back-compat with existing screens)
   */
  tone?: ToneKey;
  variant?: CardVariant;
  accent?: ToneKey;
  style?: StyleProp<ViewStyle>;
};

type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
};

// ── Tone mapping ───────────────────────────────────────────────────────────

const TONE_COLORS: Record<ToneKey, string> = {
  default: colors.border.subtle,
  success: colors.status.success,
  warning: colors.status.warning,
  danger: colors.status.danger,
  info: colors.status.info,
  brand: colors.accent.primary,
};

const TONE_BG: Record<ToneKey, string> = {
  default: colors.bg.secondary,
  success: colors.status.successBg,
  warning: colors.status.warningBg,
  danger: colors.status.dangerBg,
  info: colors.status.infoBg,
  brand: colors.accent.primaryMuted,
};

// ── Screen ─────────────────────────────────────────────────────────────────

export function Screen({
  children,
  variant = 'default',
  contentContainerStyle,
}: {
  children: ReactNode;
  variant?: 'default' | 'warm';
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const bg = variant === 'warm' ? colors.bg.canvasWarm : colors.bg.primary;
  return (
    <ScrollView
      contentContainerStyle={[
        styles.screen,
        { backgroundColor: bg },
        contentContainerStyle,
      ]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: bg }}>
      {children}
    </ScrollView>
  );
}

// ── Typography ─────────────────────────────────────────────────────────────

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  role,
  breadcrumb,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  role?: { label: string; accent: string };
  breadcrumb?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerEyebrow}>
          {role ? (
            <View style={[styles.roleChip, { borderColor: withAlpha(role.accent, 0.35), backgroundColor: withAlpha(role.accent, 0.1) }]}>
              <View style={[styles.roleChipDot, { backgroundColor: role.accent }]} />
              <Text style={[styles.roleChipLabel, { color: role.accent }]}>{role.label}</Text>
            </View>
          ) : null}
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {breadcrumb ? <Text style={styles.breadcrumb}>{`  •  ${breadcrumb}`}</Text> : null}
        </View>
        {right}
      </View>
      <Text style={styles.headerTitle} selectable>
        {title}
      </Text>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text style={styles.sectionAction}>{action.label} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────

export function Card({ children, tone = 'default', variant, accent, style }: CardProps) {
  // Resolve variant. Back-compat: if `tone` is provided and not 'default',
  // we render as tinted. Otherwise honor the explicit variant (default).
  const resolvedVariant: CardVariant =
    variant ?? (tone !== 'default' ? 'tinted' : 'default');
  const effectiveTone = accent ?? tone;
  const toneKey: ToneKey = effectiveTone === 'default' ? 'brand' : effectiveTone;
  const toneColor = TONE_COLORS[toneKey];
  const isTinted = resolvedVariant === 'tinted' && effectiveTone !== 'default';
  const isElevated = resolvedVariant === 'elevated';

  const cardStyle: ViewStyle = {
    backgroundColor: isTinted ? TONE_BG[toneKey] : colors.bg.secondary,
    borderColor: isTinted ? withAlpha(toneColor, 0.35) : colors.border.subtle,
  };

  const cardShadow = Platform.OS === 'web'
    ? { boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 30,
        elevation: 2,
      };

  return (
    <View
      style={[
        styles.card,
        cardStyle,
        cardShadow as ViewStyle,
        isElevated && styles.cardElevated,
        style,
      ]}>
      {isTinted ? (
        <View style={[styles.cardAccentBar, { backgroundColor: toneColor }]} />
      ) : null}
      {children}
    </View>
  );
}

// ── Row / Grid ─────────────────────────────────────────────────────────────

export function Row({
  children,
  gap,
  align,
  justify,
  wrap = true,
}: {
  children: ReactNode;
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'baseline' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  wrap?: boolean;
}) {
  return (
    <View
      style={[
        styles.row,
        { flexWrap: wrap ? 'wrap' : 'nowrap' },
        gap != null ? { gap } : undefined,
        align ? { alignItems: align } : undefined,
        justify ? { justifyContent: justify } : undefined,
      ]}>
      {children}
    </View>
  );
}

// ── Stat (with optional delta indicator) ───────────────────────────────────

export function Stat({
  label,
  value,
  tone = 'default',
  delta,
}: {
  label: string;
  tone?: ToneKey;
  value: string;
  delta?: { value: string; direction: 'up' | 'down' | 'flat'; label?: string };
}) {
  const effectiveTone = tone === 'default' ? 'brand' : tone;
  const accentColor = TONE_COLORS[effectiveTone];

  let deltaColor: string = colors.text.tertiary;
  let deltaArrow = '→';
  if (delta) {
    if (delta.direction === 'up') {
      deltaColor = colors.status.success;
      deltaArrow = '↑';
    } else if (delta.direction === 'down') {
      deltaColor = colors.status.danger;
      deltaArrow = '↓';
    }
  }

  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: accentColor as any }]} selectable>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      {delta ? (
        <Text style={[styles.statDelta, { color: deltaColor }]}>
          {deltaArrow} {delta.value}
          {delta.label ? ` ${delta.label}` : ''}
        </Text>
      ) : null}
    </View>
  );
}

// ── Button ─────────────────────────────────────────────────────────────────

const BUTTON_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string; innerTop?: string }> = {
  primary: {
    bg: colors.accent.primary,
    text: colors.text.primary,
    innerTop: 'rgba(255,255,255,0.12)',
  },
  'cta-large': {
    bg: colors.accent.primary,
    text: colors.text.primary,
    innerTop: 'rgba(255,255,255,0.14)',
  },
  secondary: {
    bg: colors.bg.tertiary,
    text: colors.text.primary,
    border: colors.border.subtle,
  },
  ghost: {
    bg: 'transparent',
    text: colors.text.secondary,
  },
  danger: {
    bg: colors.status.dangerBg,
    text: colors.status.danger,
    border: withAlpha(tokens.danger, 0.35),
  },
};

export function Button({
  children,
  disabled,
  onPress,
  variant = 'primary',
  compact,
  trailingArrow,
  leading,
  style,
}: ButtonProps) {
  const scheme = BUTTON_STYLES[variant];
  const isCta = variant === 'cta-large';
  const minHeight = isCta ? 56 : compact ? 40 : 48;

  const handlePress = async () => {
    if (disabled) return;
    // Haptic on native. Dynamic import so web bundle stays clean.
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        const Haptics = await import('expo-haptics');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
    }
    onPress?.();
  };

  const isPrimary = variant === 'primary' || variant === 'cta-large';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border || 'transparent',
          borderWidth: scheme.border ? 1 : 0,
          minHeight,
          paddingHorizontal: isCta ? spacing.xl : spacing.lg,
          borderRadius: 16,
          alignSelf: isCta ? 'stretch' : 'auto',
          overflow: 'hidden',
        },
        isPrimary && Platform.OS === 'web' 
          ? { boxShadow: '0 4px 14px 0 rgba(31,122,77,0.39)' } as ViewStyle 
          : null,
        disabled && styles.disabled,
        pressed && !disabled ? {
          backgroundColor: isPrimary ? tokens.brandPrimaryPressed : scheme.bg,
          ...(Platform.OS === 'web' ? ({ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' } as ViewStyle) : {}),
        } : null,
        style,
      ]}>
      {scheme.innerTop ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: 16, borderTopWidth: 1, borderColor: scheme.innerTop },
          ]}
        />
      ) : null}
      {leading ? <View style={{ marginRight: spacing.sm }}>{leading}</View> : null}
      <Text
        style={[
          styles.buttonText,
          { color: scheme.text, fontSize: isCta ? 16 : 15, zIndex: 1 },
        ]}>
        {children}
      </Text>
      {trailingArrow || isCta ? (
        <Text style={[styles.buttonText, styles.buttonArrow, { color: scheme.text, zIndex: 1 }]}>
          {'  →'}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** @deprecated Use Button with variant="primary" instead */
export function PrimaryButton({ children, disabled, onPress }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button variant="primary" disabled={disabled} onPress={onPress}>
      {children}
    </Button>
  );
}

/** @deprecated Use Button with variant="secondary" instead */
export function SecondaryButton({ children, disabled, onPress }: Omit<ButtonProps, 'variant'>) {
  return (
    <Button variant="secondary" disabled={disabled} onPress={onPress}>
      {children}
    </Button>
  );
}

// ── TextField ──────────────────────────────────────────────────────────────

export function TextField({
  label,
  hint,
  error,
  style,
  trailing,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.status.danger
    : focused
      ? colors.accent.primary
      : colors.border.subtle;
  const webFocusShadow =
    Platform.OS === 'web' && focused && !error
      ? ({ boxShadow: elevation.focusRing } as ViewStyle)
      : Platform.OS === 'web' && error
        ? ({ boxShadow: elevation.focusRingDanger } as ViewStyle)
        : null;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWell, { borderColor }, webFocusShadow]}>
        <TextInput
          placeholderTextColor={colors.text.tertiary}
          style={[styles.input, style]}
          selectionColor={colors.accent.primary}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {trailing ? <View style={styles.inputTrailing}>{trailing}</View> : null}
      </View>
      {error ? (
        <Text style={[styles.fieldHint, { color: colors.status.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={styles.fieldHint}>{hint}</Text>
      ) : null}
    </View>
  );
}

// ── SegmentedControl ───────────────────────────────────────────────────────

export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
}: {
  onChange: (value: TValue) => void;
  options: { label: string; value: TValue }[];
  value: TValue;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}>
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── StatusChip ─────────────────────────────────────────────────────────────

export function StatusChip({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: ToneKey;
}) {
  const accent = TONE_COLORS[tone];
  const bgMap: Record<ToneKey, string> = {
    default: colors.bg.elevated,
    success: colors.status.successBg,
    warning: colors.status.warningBg,
    danger: colors.status.dangerBg,
    info: colors.status.infoBg,
    brand: colors.accent.primaryMuted,
  };
  return (
    <View style={[styles.chip, { backgroundColor: bgMap[tone] }]}>
      <View style={[styles.chipDot, { backgroundColor: accent }]} />
      <Text style={[styles.chipText, { color: accent }]}>{label}</Text>
    </View>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────

export function Divider() {
  return <View style={styles.divider} />;
}

// ── Badge ──────────────────────────────────────────────────────────────────

export function Badge({
  label,
  color: badgeColor,
  bg,
  mono = false,
}: {
  label: string;
  color: string;
  bg: string;
  mono?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: withAlpha(badgeColor, 0.35) },
      ]}>
      <Text
        style={[
          styles.badgeText,
          { color: badgeColor },
          mono ? { fontFamily: Platform.OS === 'web' ? '"JetBrains Mono", monospace' : 'Menlo' } : null,
        ]}>
        {label}
      </Text>
    </View>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.empty}>
      {icon ? <View style={styles.emptyIcon}>{icon}</View> : null}
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDescription}>{description}</Text> : null}
      {action ? (
        <View style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}>
          <Button variant="secondary" onPress={action.onPress}>
            {action.label}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

// ── RoleChip (small) ───────────────────────────────────────────────────────

export function RoleChip({ label, accent }: { label: string; accent: string }) {
  return (
    <View
      style={[
        styles.roleChip,
        {
          borderColor: withAlpha(accent, 0.35),
          backgroundColor: withAlpha(accent, 0.1),
        },
      ]}>
      <View style={[styles.roleChipDot, { backgroundColor: accent }]} />
      <Text style={[styles.roleChipLabel, { color: accent }]}>{label}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bg.primary,
    gap: spacing.xl,
    padding: spacing.xl,
    paddingBottom: 56 + 24,
    minHeight: '100%',
  },

  header: {
    gap: spacing.sm,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerEyebrow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.accent.primary,
  },
  breadcrumb: {
    ...typography.overline,
    color: colors.text.tertiary,
  },
  headerTitle: {
    ...typography.display,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },

  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
  },
  sectionAction: {
    ...typography.caption,
    color: colors.accent.primary,
    fontWeight: '600',
  },

  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' ? ({ boxShadow: elevation.cardInset } as ViewStyle) : {}),
  },
  cardElevated: {
    backgroundColor: colors.bg.secondary,
    borderColor: withAlpha(tokens.brandPrimary, 0.35),
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  stat: {
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    gap: spacing.xs,
    minWidth: 100,
    padding: spacing.lg,
    ...(Platform.OS === 'web' ? ({ boxShadow: elevation.cardInset } as ViewStyle) : {}),
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.56,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    ...typography.overline,
  },
  statDelta: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },

  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  buttonArrow: {
    marginLeft: spacing.xs,
  },
  disabled: {
    opacity: 0.42,
  },

  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.overline,
    color: colors.text.secondary,
  },
  fieldHint: {
    ...typography.caption,
  },
  inputWell: {
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  input: {
    color: colors.text.primary,
    fontSize: 15,
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  } as TextStyle,
  inputTrailing: {
    paddingHorizontal: spacing.md,
  },

  segmented: {
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.subtle,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 0,
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radii.full,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  segmentSelected: {
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  segmentText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  segmentTextSelected: {
    color: colors.text.primary,
  },

  chip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  chipDot: {
    borderRadius: radii.full,
    height: 8,
    width: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  divider: {
    backgroundColor: colors.border.subtle,
    height: 1,
    width: '100%',
  },

  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  empty: {
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['4xl'],
  },
  emptyIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  emptyTitle: {
    ...typography.section,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  roleChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  roleChipDot: {
    borderRadius: radii.full,
    height: 6,
    width: 6,
  },
  roleChipLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
