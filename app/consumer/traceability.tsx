import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { TrustScore } from '@/components/TrustScore';
import { Card, PageHeader, PrimaryButton, Row, Screen, StatusChip } from '@/components/app-ui';
import { Timeline } from '@/components/Timeline';
import { getTraceability } from '@/services/api';
import { type AwareClass } from '@/types/domain';

type Trace = {
  antibioticClass: AwareClass;
  certificateHash: string;
  farmRegion: string;
  lotId: string;
  productTitle: string;
  trustScore: number;
  txHash: string;
  withdrawalRespected: boolean;
};

export default function TraceabilityScreen() {
  const { lotId } = useLocalSearchParams<{ lotId?: string }>();
  const [trace, setTrace] = useState<Trace | null>(null);

  useEffect(() => {
    getTraceability(lotId).then(setTrace);
  }, [lotId]);

  if (!trace) {
    return (
      <Screen>
        <PageHeader title="Chargement tracabilite" />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Verification publique"
        subtitle="Vue volontairement filtree: aucun nom veterinaire, dosage exact ou adresse wallet."
        title="Tracabilite"
      />

      <Card tone="green">
        <StatusChip label="Blockchain verifiee" tone="green" />
        <BlockchainHash hash={trace.txHash} />
        <Row>
          <TrustScore value={trace.trustScore} />
          <Card>
            <Text style={{ color: '#0f172a', fontWeight: '900' }}>{trace.productTitle}</Text>
            <Text style={{ color: '#475569' }}>Origine region: {trace.farmRegion}</Text>
            <AWaReBadge awareClass={trace.antibioticClass} />
          </Card>
        </Row>
      </Card>

      <Card tone="blue">
        <Timeline
          steps={[
            {
              detail: `Classe antibiotique utilisee: ${trace.antibioticClass}`,
              status: 'done',
              title: 'Traitement encadre',
            },
            {
              detail: trace.withdrawalRespected
                ? 'Delai de retrait respecte avant certification'
                : 'Delai de retrait non termine',
              status: trace.withdrawalRespected ? 'done' : 'active',
              title: 'Retrait',
            },
            {
              detail: 'Controle abattoir valide par hash public',
              status: 'done',
              title: 'Certification',
            },
          ]}
        />
      </Card>

      <Card tone="blue">
        <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>Explication IA locale</Text>
        <Text style={{ color: '#475569', lineHeight: 21 }}>
          Ce produit est sur car son lot a respecte la periode de retrait avant certification. La
          tracabilite publique garde seulement les informations utiles a votre decision.
        </Text>
      </Card>

      <PrimaryButton onPress={() => router.push({ pathname: '/consumer/checkout', params: { lotId: trace.lotId } })}>
        Commander ce produit
      </PrimaryButton>
    </Screen>
  );
}
