import { router } from 'expo-router';
import { Text } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { Card, PageHeader, PrimaryButton, Row, Screen, SectionTitle, Stat, StatusChip } from '@/components/app-ui';
import { Timeline } from '@/components/Timeline';
import { prescriptions } from '@/services/mockData';
import { useAuthStore } from '@/store/authStore';

export default function VetHomeScreen() {
  const logout = useAuthStore((state) => state.logout);

  const signOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="Role VET"
        subtitle="Prescriptions actives, delais de retrait et aide IA locale."
        title="Veterinaire"
      />

      <Row>
        <Stat label="Prescriptions actives" tone="amber" value="8" />
        <Stat label="Fermes suivies" tone="green" value="17" />
        <Stat label="Doses restantes" tone="blue" value="320" />
      </Row>

      <PrimaryButton onPress={() => router.push('/vet/new-prescription')}>
        Nouvelle prescription
      </PrimaryButton>

      <SectionTitle>Prescriptions</SectionTitle>
      {prescriptions.map((prescription) => (
        <Card
          key={prescription.id}
          tone={prescription.status === 'WITHDRAWAL' ? 'amber' : 'green'}>
          <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>
            Lot {prescription.animalLotId}
          </Text>
          <AWaReBadge awareClass={prescription.awareClass} />
          <StatusChip
            label={prescription.status}
            tone={prescription.status === 'WITHDRAWAL' ? 'amber' : 'green'}
          />
          <Timeline
            steps={[
              { detail: 'Prescription creee', status: 'done', title: 'CREATED' },
              { detail: 'Administration en attente eleveur', status: 'active', title: 'ADMINISTERED' },
            ]}
          />
          <PrimaryButton
            onPress={() =>
              router.push({ pathname: '/vet/prescription-detail', params: { id: prescription.id } })
            }>
            Ouvrir
          </PrimaryButton>
        </Card>
      ))}

      <PrimaryButton onPress={signOut}>Se deconnecter</PrimaryButton>
    </Screen>
  );
}
