import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AIAssistantCard } from '@/components/AIAssistantCard';
import { AWaReBadge } from '@/components/AWaReBadge';
import { Timeline } from '@/components/Timeline';
import { Button, Card, Divider, PageHeader, Row, Screen, SectionTitle, Stat, StatusChip } from '@/components/app-ui';
import { colors, typography } from '@/constants/theme';
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
        role={{ label: 'Vétérinaire', accent: colors.role.vet }}
        breadcrumb="Tableau de bord"
        subtitle="Prescriptions actives, délais de retrait et aide IA locale."
        title="Bonjour, Dr. Ben Ali"
      />

      <Row>
        <Stat
          label="Prescriptions"
          tone="warning"
          value="8"
          delta={{ direction: 'up', value: '+3', label: '7j' }}
        />
        <Stat label="Fermes suivies" tone="success" value="17" />
        <Stat
          label="Suggestions IA"
          tone="info"
          value="42"
          delta={{ direction: 'up', value: '+15%', label: 'adoption' }}
        />
      </Row>

      <Button onPress={() => router.push('/vet/new-prescription')}>
        Nouvelle prescription
      </Button>

      <AIAssistantCard />

      <SectionTitle>Prescriptions actives</SectionTitle>
      {prescriptions.map((prescription) => (
        <Card
          key={prescription.id}
          tone={prescription.status === 'WITHDRAWAL' ? 'warning' : 'success'}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Lot {prescription.animalLotId}</Text>
            <AWaReBadge awareClass={prescription.awareClass} />
          </View>
          <StatusChip
            label={prescription.status}
            tone={prescription.status === 'WITHDRAWAL' ? 'warning' : 'success'}
          />
          <Timeline
            steps={[
              { detail: 'Prescription creee', status: 'done', title: 'CREATED' },
              { detail: 'Administration en attente eleveur', status: 'active', title: 'ADMINISTERED' },
            ]}
          />
          <Button
            variant="secondary"
            onPress={() =>
              router.push({ pathname: '/vet/prescription-detail', params: { id: prescription.id } })
            }>
            Ouvrir le detail
          </Button>
        </Card>
      ))}

      <Divider />
      <Button variant="ghost" onPress={signOut}>Se deconnecter</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.section,
    color: colors.text.primary,
  },
});
