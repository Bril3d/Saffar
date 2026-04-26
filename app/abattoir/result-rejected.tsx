import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BlockchainHash } from '@/components/BlockchainHash';
import { Button, Card, Divider, PageHeader, Screen, StatusChip } from '@/components/app-ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { lots } from '@/services/mockData';

export default function RejectedResultScreen() {
  const { daysRemaining, lotId, txHash } = useLocalSearchParams<{
    daysRemaining?: string;
    lotId?: string;
    txHash?: string;
  }>();
  const lot = lots.find((item) => item.id === lotId) ?? lots[1];
  const days = Number(daysRemaining ?? 5);

  return (
    <Screen>
      <PageHeader
        eyebrow="CONTROLE BLOQUE"
        subtitle="Aucune exception possible pendant le delai de retrait."
        title="Lot non eligible"
      />

      <Card tone="danger">
        <View style={styles.dangerIcon}>
          <Text style={styles.dangerText}>NO</Text>
        </View>
        <Text style={styles.resultTitle}>LOT NON ELIGIBLE</Text>
        <Text style={styles.daysCount}>{days} JOURS</Text>
        <StatusChip label="Smart contract bloque" tone="danger" />
        <Divider />
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Abattage possible</Text>
          <Text style={styles.detailValue}>{lot.withdrawalEnd}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Lot</Text>
          <Text style={styles.detailValue}>{lot.id}</Text>
        </View>
        <Divider />
        <BlockchainHash hash={txHash ?? '0xabc91d2719961c41cc3b7db14a961c9cf040220eaa2716d5900718bb55a901'} />
        <Button variant="danger" onPress={() => undefined}>Notifier eleveur</Button>
        <Button variant="secondary" onPress={() => router.replace('/abattoir/scanner')}>
          Scanner autre lot
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dangerIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.status.dangerBg,
    borderColor: `${colors.status.danger}30`,
    borderRadius: 75,
    borderWidth: 2,
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  dangerText: {
    color: colors.status.danger,
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 2,
  },
  daysCount: {
    color: colors.status.danger,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  detail: {
    gap: spacing.xs,
  },
  detailLabel: {
    ...typography.overline,
    color: colors.text.tertiary,
  },
  detailValue: {
    ...typography.body,
    color: colors.text.primary,
  },
  resultTitle: {
    ...typography.title,
    color: colors.status.danger,
    letterSpacing: 2,
    textAlign: 'center',
  },
});
