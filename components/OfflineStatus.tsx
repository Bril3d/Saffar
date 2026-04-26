import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography, withAlpha } from '@/constants/theme';
import { getQueueLength } from '@/services/offlineQueue';

/**
 * Slim banner that appears when offline or when offline queue has pending items.
 * Contains the exact text "actions en attente" (contract with component tests).
 */
export function OfflineStatus() {
  const [online, setOnline] = useState(true);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      try {
        const length = await getQueueLength();
        if (mounted) setQueueLength(length);
      } catch {
        // Queue lookup failed; keep banner calm.
      }
    };

    refresh();

    // NetInfo.addEventListener may return undefined in certain jest setups —
    // guard the cleanup so unmount never throws.
    const maybeUnsub = NetInfo.addEventListener?.((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
      refresh();
    });

    return () => {
      mounted = false;
      if (typeof maybeUnsub === 'function') {
        maybeUnsub();
      }
    };
  }, []);

  if (online && queueLength === 0) {
    return null;
  }

  const accent = online ? colors.status.success : colors.status.warning;
  const headline = online
    ? 'Synchronisation en cours'
    : 'Hors ligne';
  const tail = `${queueLength} actions en attente`;

  return (
    <View style={[styles.bar, { borderColor: withAlpha(accent, 0.35), backgroundColor: withAlpha(accent, 0.12) }]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={[styles.text, { color: accent }]}>
        {headline} — {tail}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  dot: {
    borderRadius: radii.full,
    height: 8,
    width: 8,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});
