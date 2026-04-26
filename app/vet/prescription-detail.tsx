import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { Card, PageHeader, Screen, StatusChip } from '@/components/app-ui';
import { Timeline } from '@/components/Timeline';
import { prescriptions } from '@/services/mockData';

export default function PrescriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const prescription = prescriptions.find((item) => item.id === id) ?? prescriptions[0];

  return (
    <Screen>
      <PageHeader
        eyebrow="Lecture seule"
        subtitle="Tous les champs critiques sont verrouilles apres emission."
        title={`Prescription ${prescription.id}`}
      />

      <Card tone={prescription.status === 'WITHDRAWAL' ? 'amber' : 'green'}>
        <Text style={{ color: '#0f172a', fontSize: 17, fontWeight: '900' }}>
          Lot {prescription.animalLotId}
        </Text>
        <AWaReBadge awareClass={prescription.awareClass} />
        <StatusChip label={prescription.status} tone={prescription.status === 'WITHDRAWAL' ? 'amber' : 'green'} />
        <Text style={{ color: '#475569' }}>Diagnostic: {prescription.diagnosis}</Text>
        <Text style={{ color: '#475569' }}>Posologie: {prescription.dosage}</Text>
        <Text style={{ color: '#475569' }}>
          Retrait: {prescription.withdrawalDays} jours, fin {prescription.withdrawalEnd}
        </Text>
        <BlockchainHash hash={prescription.txHash} />
      </Card>

      <Card>
        <Timeline
          steps={[
            { detail: 'Prescription emise par le veterinaire', status: 'done', title: 'CREATED' },
            { detail: 'Administration confirmee par eleveur', status: 'done', title: 'ADMINISTERED' },
            { detail: 'Delai de retrait surveille par contrat', status: 'active', title: 'WITHDRAWAL' },
            { detail: 'Certification abattoir apres eligibilite', status: 'locked', title: 'CERTIFIED' },
          ]}
        />
      </Card>
    </Screen>
  );
}
