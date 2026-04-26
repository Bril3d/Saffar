import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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

  return (
    <View style={[styles.bar, online ? styles.online : styles.offline]}>
      <Text style={styles.text}>
        {online ? 'Synchronisation prete' : 'Hors connexion'} - {queueLength} actions en attente
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  offline: {
    backgroundColor: '#fef3c7',
  },
  online: {
    backgroundColor: '#dcfce7',
  },
  text: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
});
