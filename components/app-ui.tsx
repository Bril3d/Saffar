import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';

// ── Types ──

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ToneKey = 'default' | 'success' | 'warning' | 'danger' | 'info';

type ButtonProps = {
  children: string;
  disabled?: boolean;
  onPress?: () => void;
  variant?: ButtonVariant;
  compact?: boolean;
};

type CardProps = {
  children: ReactNode;
  tone?: ToneKey;
  style?: ViewStyle;
};

type TextFieldProps = TextInputProps & {
  label: string;
  hint?: string;
};

// ── Tone Mapping ──

const TONE_ACCENTS: Record<ToneKey, string> = {
  default: colors.border.default,
  success: colors.status.success,
  warning: colors.status.warning,
  danger: colors.status.danger,
  info: colors.status.info,
};

// ── Layout ──

export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

// ── Typography ──

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

// ── Card ──

export function Card({ children, tone = 'default', style }: CardProps) {
  const borderColor = tone === 'default' ? colors.border.default : TONE_ACCENTS[tone];
  return (
    <View style={[styles.card, { borderColor }, style]}>
      {children}
    </View>
  );
}

// ── Row / Grid ──

export function Row({ children, gap }: { children: ReactNode; gap?: number }) {
  return (
    <View style={[styles.row, gap != null ? { gap } : undefined]}>
      {children}
    </View>
  );
}

// ── Stat ──

export function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  tone?: ToneKey;
  value: string;
}) {
  const accentColor = tone === 'default' ? colors.text.primary : TONE_ACCENTS[tone];

  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: accentColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Buttons ──

const BUTTON_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.accent.primary, text: colors.text.inverse },
  secondary: { bg: 'transparent', text: colors.text.primary, border: colors.border.strong },
  ghost: { bg: 'transparent', text: colors.text.secondary },
  danger: { bg: colors.status.dangerBg, text: colors.status.danger, border: 'rgba(232,84,84,0.25)' },
};

export function Button({ children, disabled, onPress, variant = 'primary', compact }: ButtonProps) {
  const scheme = BUTTON_STYLES[variant];
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border || 'transparent',
          borderWidth: scheme.border ? 1 : 0,
          minHeight: compact ? 40 : 48,
        },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.buttonText, { color: scheme.text }]}>{children}</Text>
    </Pressable>
  );
}

/** @deprecated Use Button with variant="primary" instead */
export function PrimaryButton({ children, disabled, onPress }: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" disabled={disabled} onPress={onPress}>{children}</Button>;
}

/** @deprecated Use Button with variant="secondary" instead */
export function SecondaryButton({ children, disabled, onPress }: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" disabled={disabled} onPress={onPress}>{children}</Button>;
}

// ── Text Field ──

export function TextField({ label, hint, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.text.tertiary}
        style={[styles.input, style]}
        selectionColor={colors.accent.primary}
        {...props}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

// ── Segmented Control ──

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

// ── Status Chip ──

export function StatusChip({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: ToneKey;
}) {
  const accent = TONE_ACCENTS[tone];
  const bgMap: Record<ToneKey, string> = {
    default: colors.bg.tertiary,
    success: colors.status.successBg,
    warning: colors.status.warningBg,
    danger: colors.status.dangerBg,
    info: colors.status.infoBg,
  };
  return (
    <View style={[styles.chip, { backgroundColor: bgMap[tone] }]}>
      <View style={[styles.chipDot, { backgroundColor: accent }]} />
      <Text style={[styles.chipText, { color: accent }]}>{label}</Text>
    </View>
  );
}

// ── Divider ──

export function Divider() {
  return <View style={styles.divider} />;
}

// ── Badge (generic) ──

export function Badge({
  label,
  color: badgeColor,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: `${badgeColor}20` }]}>
      <Text style={[styles.badgeText, { color: badgeColor }]}>{label}</Text>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  // Layout
  screen: {
    backgroundColor: colors.bg.primary,
    gap: spacing.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 20,
    minHeight: '100%',
  },

  // Header
  header: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.accent.primary,
  },
  headerTitle: {
    ...typography.display,
  },
  headerSubtitle: {
    ...typography.body,
  },

  // Section
  sectionTitle: {
    ...typography.section,
    paddingTop: spacing.xs,
  },

  // Card
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },

  // Row
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Stat
  stat: {
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    gap: spacing.xs,
    minWidth: 96,
    padding: spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    ...typography.caption,
  },

  // Button
  button: {
    alignItems: 'center',
    borderRadius: radii.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.78,
  },

  // Field
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  fieldHint: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  input: {
    backgroundColor: colors.bg.input,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },

  // Segmented
  segmented: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  segmentSelected: {
    backgroundColor: colors.accent.primaryMuted,
    borderColor: colors.accent.primary,
  },
  segmentText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  segmentTextSelected: {
    color: colors.accent.primary,
  },

  // Chip
  chip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  chipDot: {
    borderRadius: radii.full,
    height: 6,
    width: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Divider
  divider: {
    backgroundColor: colors.border.default,
    height: 1,
    width: '100%',
  },

  // Badge
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
    textTransform: 'uppercase',
  },
});
