import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';
import { getQueueLength } from '@/services/offlineQueue';

export function OfflineStatus() {
  const [online, setOnline] = useState(true);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      const length = await getQueueLength();
      if (mounted) {
        setQueueLength(length);
      }
    };

    refresh();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
      refresh();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (online && queueLength === 0) {
    return null;
  }

  const accent = online ? colors.status.success : colors.status.warning;

  return (
    <View style={[styles.bar, { borderColor: `${accent}25` }]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={[styles.text, { color: accent }]}>
        {online ? 'Synchronisation prete' : 'Hors connexion'} — {queueLength} en attente
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: colors.bg.secondary,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  dot: {
    borderRadius: radii.full,
    height: 7,
    width: 7,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});
