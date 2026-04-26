import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { Card, PageHeader, PrimaryButton, Screen, StatusChip } from '@/components/app-ui';
import { type AwareClass } from '@/types/domain';

export default function SaleConfirmedScreen() {
  const params = useLocalSearchParams<{ awareClass?: AwareClass; saleId?: string; txHash?: string }>();

  return (
    <Screen>
      <PageHeader
        eyebrow="Transaction creee"
        subtitle="La vente est prete pour synchronisation on-chain via le relayer Dev 1."
        title="Vente confirmee"
      />

      <Card tone="green">
        <View
          style={{
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: '#dcfce7',
            borderRadius: 80,
            height: 112,
            justifyContent: 'center',
            width: 112,
          }}>
          <Text style={{ color: '#166534', fontSize: 54, fontWeight: '900' }}>OK</Text>
        </View>
        <StatusChip label="On-chain pret" tone="green" />
        <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>
          Vente {params.saleId ?? 'sale-demo'}
        </Text>
        <AWaReBadge awareClass={params.awareClass ?? 'Access'} />
        <BlockchainHash hash={params.txHash ?? '0x50760f31fe5af9a7fcb7a470cfeb0f9a141a4d759dd070602da19f7219517c3f'} />
        <PrimaryButton onPress={() => router.replace('/pharmacy/home')}>Retour accueil</PrimaryButton>
      </Card>
    </Screen>
  );
}
