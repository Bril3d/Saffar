import { StyleSheet, Text, View } from 'react-native';

import { type AwareClass } from '@/types/domain';

const BADGE_STYLE: Record<AwareClass, { background: string; color: string; label: string }> = {
  Access: {
    background: '#dcfce7',
    color: '#166534',
    label: 'Access',
  },
  Watch: {
    background: '#fef3c7',
    color: '#92400e',
    label: 'Watch',
  },
  Reserve: {
    background: '#fee2e2',
    color: '#991b1b',
    label: 'Reserve',
  },
};

export function AWaReBadge({ awareClass }: { awareClass: AwareClass }) {
  const badge = BADGE_STYLE[awareClass];

  return (
    <View style={[styles.badge, { backgroundColor: badge.background }]}>
      <Text style={[styles.text, { color: badge.color }]}>{badge.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
});
