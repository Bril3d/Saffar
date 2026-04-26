import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/constants/theme';
import { type AwareClass } from '@/types/domain';

const BADGE_CONFIG: Record<AwareClass, { accent: string; bg: string; label: string }> = {
  Access: {
    accent: colors.aware.access,
    bg: colors.aware.accessBg,
    label: 'ACCESS',
  },
  Watch: {
    accent: colors.aware.watch,
    bg: colors.aware.watchBg,
    label: 'WATCH',
  },
  Reserve: {
    accent: colors.aware.reserve,
    bg: colors.aware.reserveBg,
    label: 'RESERVE',
  },
};

export function AWaReBadge({ awareClass }: { awareClass: AwareClass }) {
  const config = BADGE_CONFIG[awareClass];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: `${config.accent}30` }]}>
      <View style={[styles.dot, { backgroundColor: config.accent }]} />
      <Text style={[styles.label, { color: config.accent }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  dot: {
    borderRadius: radii.full,
    height: 7,
    width: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
