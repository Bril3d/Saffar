import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';

export function BlockchainHash({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);
  const shortHash = hash.length > 22 ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : hash;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.indicator} />
      <Text selectable style={styles.hash}>{shortHash}</Text>
      <Pressable onPress={handleCopy} style={styles.copyBtn}>
        <Text style={styles.copyText}>{copied ? 'Copie' : 'Copier'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.bg.tertiary,
    borderColor: colors.border.default,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm + 2,
  },
  copyBtn: {
    backgroundColor: colors.accent.blockchainMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 1,
  },
  copyText: {
    color: colors.accent.blockchain,
    fontSize: 12,
    fontWeight: '600',
  },
  hash: {
    ...typography.mono,
    color: colors.accent.blockchain,
    flex: 1,
  },
  indicator: {
    backgroundColor: colors.accent.blockchain,
    borderRadius: radii.full,
    height: 6,
    width: 6,
  },
});
