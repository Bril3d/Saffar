import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { Card, PageHeader, PrimaryButton, Screen, StatusChip } from '@/components/app-ui';
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
        eyebrow="Controle valide"
        subtitle="block.timestamp >= dateFinRetrait confirme par le contrat."
        title="Lot eligible"
      />

      <Card tone="green">
        <View
          style={{
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: '#dcfce7',
            borderRadius: 110,
            height: 150,
            justifyContent: 'center',
            width: 150,
          }}>
          <Text style={{ color: '#166534', fontSize: 48, fontWeight: '900' }}>OK</Text>
        </View>
        <Text style={{ color: '#166534', fontSize: 26, fontWeight: '900', textAlign: 'center' }}>
          LOT ELIGIBLE
        </Text>
        <StatusChip label="Smart contract valide" tone="green" />
        <Text style={{ color: '#475569' }}>Region ferme: {lot.farmRegion}</Text>
        <Text style={{ color: '#475569' }}>Antibiotique: {lot.antibiotic}</Text>
        <AWaReBadge awareClass={lot.awareClass} />
        <Text style={{ color: '#475569' }}>Dernier retrait: {lot.withdrawalEnd}</Text>
        <Text style={{ color: '#475569' }}>Prescription: {prescription?.id ?? 'rx-demo'}</Text>
        <BlockchainHash hash={txHash ?? '0x6ec7c26412f9fd20a3a12f5f55d9826a493487c341d3882fab6726e7e431bd83'} />
        <PrimaryButton onPress={certify}>Imprimer etiquette QR</PrimaryButton>
        {certificateHash ? <BlockchainHash hash={certificateHash} /> : null}
        <PrimaryButton onPress={() => router.replace('/abattoir/scanner')}>Scanner autre lot</PrimaryButton>
      </Card>
    </Screen>
  );
}
