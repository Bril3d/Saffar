import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, withAlpha } from '@/constants/theme';
import { type AwareClass } from '@/types/domain';

type BadgeSize = 'sm' | 'md';

const BADGE_CONFIG: Record<AwareClass, { accent: string; bg: string; label: string; position: 0 | 1 | 2 }> = {
  Access: {
    accent: colors.aware.access,
    bg: colors.aware.accessBg,
    label: 'Access',
    position: 0,
  },
  Watch: {
    accent: colors.aware.watch,
    bg: colors.aware.watchBg,
    label: 'Watch',
    position: 1,
  },
  Reserve: {
    accent: colors.aware.reserve,
    bg: colors.aware.reserveBg,
    label: 'Reserve',
    position: 2,
  },
};

/**
 * AWaRe classification pill with a three-segment "traffic light" glyph
 * (only the corresponding position is lit). Optional ATC code in mono.
 */
export function AWaReBadge({
  awareClass,
  atcCode,
  size = 'md',
}: {
  awareClass: AwareClass;
  atcCode?: string;
  size?: BadgeSize;
}) {
  const config = BADGE_CONFIG[awareClass];
  const segColors = [colors.aware.access, colors.aware.watch, colors.aware.reserve];

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        { backgroundColor: config.bg, borderColor: withAlpha(config.accent, 0.35) },
      ]}>
      <View style={styles.segments}>
        {segColors.map((c, i) => {
          const lit = i === config.position;
          return (
            <View
              key={i}
              style={[
                styles.seg,
                {
                  backgroundColor: lit ? c : withAlpha(c, 0.18),
                  // subtle glow on the lit segment (web only)
                  ...(lit && Platform.OS === 'web'
                    ? { boxShadow: `0 0 6px ${withAlpha(c, 0.8)}` }
                    : null),
                },
              ]}
            />
          );
        })}
      </View>
      <Text style={[styles.label, { color: config.accent }]}>{config.label}</Text>
      {atcCode ? <Text style={[styles.atc, { color: config.accent }]}>{atcCode}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  atc: {
    fontFamily: Platform.OS === 'web' ? '"JetBrains Mono", monospace' : 'Menlo',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: spacing.xs,
    opacity: 0.85,
    fontVariant: ['tabular-nums'],
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  badgeSm: {
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  seg: {
    borderRadius: 1,
    height: 10,
    width: 3,
  },
  segments: {
    flexDirection: 'row',
    gap: 2,
  },
});
