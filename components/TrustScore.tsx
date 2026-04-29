import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';

function scoreColor(value: number) {
  if (value >= 85) return colors.status.success;
  if (value >= 65) return colors.status.warning;
  return colors.status.danger;
}

export function TrustScore({ value }: { value: number }) {
  const accent = scoreColor(value);
  const percent = Math.min(100, Math.max(0, value));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Indice de confiance</Text>
        <Text style={[styles.value, { color: accent }]}>{value}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: accent }]} />
      </View>
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
  },
  label: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  labelRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    backgroundColor: colors.bg.tertiary,
    borderRadius: radii.full,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
