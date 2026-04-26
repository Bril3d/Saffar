import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, Divider, PageHeader, Screen, SectionTitle, StatusChip } from '@/components/app-ui';
import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { Timeline } from '@/components/Timeline';
import { TrustScore } from '@/components/TrustScore';
import { colors, typography } from '@/constants/theme';
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
      <Screen variant="warm">
        <PageHeader title="Chargement…" />
      </Screen>
    );
  }

  return (
    <Screen variant="warm">
      <PageHeader
        role={{ label: 'Consommateur', accent: colors.role.consumer }}
        breadcrumb="Vérification publique"
        subtitle="Vue filtrée : aucun nom vétérinaire, dosage exact ou adresse wallet."
        title="Traçabilité"
      />

      <Card tone="success">
        <StatusChip label="Blockchain verifiee" tone="success" />
        <BlockchainHash hash={trace.txHash} />
        <TrustScore value={trace.trustScore} />
        <Divider />
        <Text style={styles.productTitle}>{trace.productTitle}</Text>
        <Text style={styles.region}>Origine: {trace.farmRegion}</Text>
        <AWaReBadge awareClass={trace.antibioticClass} />
      </Card>

      <SectionTitle>Parcours du lot</SectionTitle>
      <Card>
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

      <Card tone="info">
        <Text style={styles.explainTitle}>Explication IA</Text>
        <Text style={styles.explainBody}>
          Ce produit est sur car son lot a respecte la periode de retrait avant certification. La
          tracabilite publique garde seulement les informations utiles a votre decision.
        </Text>
      </Card>

      <Button onPress={() => router.push({ pathname: '/consumer/checkout', params: { lotId: trace.lotId } })}>
        Commander ce produit
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  explainBody: {
    ...typography.body,
  },
  explainTitle: {
    ...typography.section,
    color: colors.text.primary,
  },
  productTitle: {
    ...typography.section,
    color: colors.text.primary,
  },
  region: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
});
