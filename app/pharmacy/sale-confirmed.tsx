import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { Button, Card, PageHeader, Screen, StatusChip } from '@/components/app-ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { type AwareClass } from '@/types/domain';

export default function SaleConfirmedScreen() {
  const params = useLocalSearchParams<{ awareClass?: AwareClass; saleId?: string; txHash?: string }>();

  return (
    <Screen>
      <PageHeader
        eyebrow="TRANSACTION CREEE"
        subtitle="La vente est prete pour synchronisation on-chain via le relayer."
        title="Vente confirmee"
      />

      <Card tone="success">
        <View style={styles.successIcon}>
          <Text style={styles.successText}>OK</Text>
        </View>
        <StatusChip label="On-chain pret" tone="success" />
        <Text style={styles.saleId}>
          Vente {params.saleId ?? 'sale-demo'}
        </Text>
        <AWaReBadge awareClass={params.awareClass ?? 'Access'} />
        <BlockchainHash hash={params.txHash ?? '0x50760f31fe5af9a7fcb7a470cfeb0f9a141a4d759dd070602da19f7219517c3f'} />
        <Button onPress={() => router.replace('/pharmacy/home')}>Retour accueil</Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  saleId: {
    ...typography.section,
    color: colors.text.primary,
  },
  successIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.status.successBg,
    borderColor: `${colors.status.success}30`,
    borderRadius: 56,
    borderWidth: 2,
    height: 112,
    justifyContent: 'center',
    width: 112,
  },
  successText: {
    color: colors.status.success,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
