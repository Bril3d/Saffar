import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { BlockchainHash } from '@/components/BlockchainHash';
import { Card, PageHeader, PrimaryButton, Screen, StatusChip } from '@/components/app-ui';
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
        eyebrow="Controle bloque"
        subtitle="Aucune exception possible pendant le delai de retrait."
        title="Lot non eligible"
      />

      <Card tone="red">
        <View
          style={{
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: '#fee2e2',
            borderRadius: 110,
            height: 150,
            justifyContent: 'center',
            width: 150,
          }}>
          <Text style={{ color: '#991b1b', fontSize: 48, fontWeight: '900' }}>NO</Text>
        </View>
        <Text style={{ color: '#991b1b', fontSize: 26, fontWeight: '900', textAlign: 'center' }}>
          LOT NON ELIGIBLE
        </Text>
        <Text style={{ color: '#991b1b', fontSize: 42, fontWeight: '900', textAlign: 'center' }}>
          {days} JOURS
        </Text>
        <StatusChip label="Smart contract bloque" tone="red" />
        <Text style={{ color: '#475569' }}>
          Abattage possible a partir du: {lot.withdrawalEnd}
        </Text>
        <Text style={{ color: '#475569' }}>Lot: {lot.id}</Text>
        <BlockchainHash hash={txHash ?? '0xabc91d2719961c41cc3b7db14a961c9cf040220eaa2716d5900718bb55a901'} />
        <PrimaryButton onPress={() => undefined}>Notifier eleveur</PrimaryButton>
        <PrimaryButton onPress={() => router.replace('/abattoir/scanner')}>Scanner autre lot</PrimaryButton>
      </Card>
    </Screen>
  );
}
