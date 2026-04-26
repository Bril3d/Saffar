import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, tokens, typography, withAlpha } from '@/constants/theme';

/**
 * Mono, brand-secondary tinted pill with chain glyph, truncated hash
 * (0xa3f4…b7e2), and a copy button that flips to a checkmark on success.
 */
export function BlockchainHash({
  hash,
  label,
  compact = false,
}: {
  hash: string;
  label?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const shortHash = hash.length > 22 ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : hash;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(hash);
    } catch {
      // Clipboard may not exist on some web runtimes.
    }
    setCopied(true);
    // Haptic confirmation on native
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        const Haptics = await import('expo-haptics');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.chainIcon}>
        <View style={[styles.chainLink, { borderColor: colors.accent.blockchain }]} />
        <View
          style={[
            styles.chainLink,
            { borderColor: colors.accent.blockchain, marginLeft: -4 },
          ]}
        />
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text selectable style={styles.hash}>
        {shortHash}
      </Text>
      <Pressable onPress={handleCopy} style={styles.copyBtn} hitSlop={6}>
        <Text style={styles.copyText}>{copied ? '✓ Copié' : 'Copier'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chainIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 12,
  },
  chainLink: {
    borderRadius: 3,
    borderWidth: 1.5,
    height: 8,
    width: 10,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.accent.blockchainMuted,
    borderColor: withAlpha(tokens.brandSecondary, 0.3),
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  containerCompact: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  copyBtn: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  copyText: {
    color: colors.accent.blockchain,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  hash: {
    color: colors.accent.blockchain,
    flex: 1,
    fontFamily: Platform.OS === 'web' ? '"JetBrains Mono", monospace' : 'Menlo',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  label: {
    ...typography.caption,
    color: colors.accent.blockchain,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
