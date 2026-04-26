import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { Button, Card, Divider, PageHeader, Screen, StatusChip } from '@/components/app-ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { certifyLot, prescriptionByLot } from '@/services/api';
import { lots } from '@/services/mockData';

export default function EligibleResultScreen() {
  const { lotId, txHash } = useLocalSearchParams<{ lotId?: string; txHash?: string }>();
  const [certificateHash, setCertificateHash] = useState('');
  const lot = lots.find((item) => item.id === lotId) ?? lots[0];
  const prescription = prescriptionByLot(lot.id);

  const certify = async () => {
    const result = await certifyLot(lot.id);
    setCertificateHash(result.certificateHash);
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="CONTROLE VALIDE"
        subtitle="block.timestamp >= dateFinRetrait confirme par le contrat."
        title="Lot eligible"
      />

      <Card tone="success">
        <View style={styles.successIcon}>
          <Text style={styles.successText}>OK</Text>
        </View>
        <Text style={styles.resultTitle}>LOT ELIGIBLE</Text>
        <StatusChip label="Smart contract valide" tone="success" />
        <Divider />
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Region</Text>
          <Text style={styles.detailValue}>{lot.farmRegion}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Antibiotique</Text>
          <Text style={styles.detailValue}>{lot.antibiotic}</Text>
        </View>
        <AWaReBadge awareClass={lot.awareClass} />
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Fin retrait</Text>
          <Text style={styles.detailValue}>{lot.withdrawalEnd}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Prescription</Text>
          <Text style={styles.detailValue}>{prescription?.id ?? 'rx-demo'}</Text>
        </View>
        <Divider />
        <BlockchainHash hash={txHash ?? '0x6ec7c26412f9fd20a3a12f5f55d9826a493487c341d3882fab6726e7e431bd83'} />
        <Button onPress={certify}>Imprimer etiquette QR</Button>
        {certificateHash ? <BlockchainHash hash={certificateHash} /> : null}
        <Button variant="secondary" onPress={() => router.replace('/abattoir/scanner')}>
          Scanner autre lot
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    color: colors.status.success,
    letterSpacing: 2,
    textAlign: 'center',
  },
  successIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.status.successBg,
    borderColor: `${colors.status.success}30`,
    borderRadius: 75,
    borderWidth: 2,
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  successText: {
    color: colors.status.success,
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
