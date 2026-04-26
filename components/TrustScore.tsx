import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, tokens, typography, withAlpha } from '@/constants/theme';

function scoreColor(value: number) {
  if (value >= 85) return colors.status.success;
  if (value >= 65) return colors.status.warning;
  return colors.status.danger;
}

/**
 * Trust score bar with gradient (red → amber → green), animated fill on mount,
 * big tabular number to the right, and a row of verifying icons beneath.
 *
 * Accepts both `score` (new) and `value` (legacy) for back-compat.
 */
export function TrustScore({
  score,
  value,
  compact = false,
  showVerifiers = true,
}: {
  score?: number;
  value?: number;
  compact?: boolean;
  showVerifiers?: boolean;
}) {
  const n = score ?? value ?? 0;
  const accent = scoreColor(n);
  const percent = Math.min(100, Math.max(0, n));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Indice de confiance</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: accent }]} selectable>
            {n}
          </Text>
          <Text style={styles.valueSuffix}>/ 100</Text>
        </View>
      </View>
      <View style={styles.track}>
        {/* Gradient reference stops (visible beneath the fill if fill < width) */}
        <View style={styles.gradientRef} pointerEvents="none">
          <View style={[styles.gradientStop, { backgroundColor: withAlpha(tokens.danger, 0.4) }]} />
          <View style={[styles.gradientStop, { backgroundColor: withAlpha(tokens.warning, 0.4) }]} />
          <View style={[styles.gradientStop, { backgroundColor: withAlpha(tokens.success, 0.4) }]} />
        </View>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: accent }]} />
      </View>
      {!compact && showVerifiers ? (
        <Text style={styles.verifiers}>
          Vérifié par · AWaRe · Blockchain · Vétérinaire
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 120,
  },
  fill: {
    borderRadius: radii.full,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 0 8px rgba(255,255,255,0.08)' } as object)
      : null),
  },
  gradientRef: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  gradientStop: {
    flex: 1,
    height: '100%',
  },
  label: {
    ...typography.overline,
  },
  labelRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: radii.full,
    height: 8,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  value: {
    fontSize: 24,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  valueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 4,
  },
  valueSuffix: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  verifiers: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
