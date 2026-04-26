import * as Clipboard from 'expo-clipboard';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function BlockchainHash({ hash }: { hash: string }) {
  const shortHash = hash.length > 22 ? `${hash.slice(0, 12)}...${hash.slice(-8)}` : hash;

  return (
    <View style={styles.container}>
      <Text selectable style={styles.hash}>
        {shortHash}
      </Text>
      <Pressable onPress={() => Clipboard.setStringAsync(hash)} style={styles.copyButton}>
        <Text style={styles.copyText}>Copier</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 10,
  },
  copyButton: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  copyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  hash: {
    color: '#0f172a',
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 13,
  },
});
