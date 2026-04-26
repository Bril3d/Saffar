import { router } from 'expo-router';
import { Text } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { Card, PageHeader, PrimaryButton, Row, Screen, SectionTitle, Stat } from '@/components/app-ui';
import { useAuthStore } from '@/store/authStore';
import { drugSales } from '@/services/mockData';

export default function PharmacyHomeScreen() {
  const logout = useAuthStore((state) => state.logout);

  const signOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="Role PHARMACY"
        subtitle="Ventes suivies avec classification AWaRe et hash on-chain des transactions."
        title="Pharmacie"
      />

      <Row>
        <Stat label="Ventes ce mois" tone="green" value="42" />
        <Stat label="Veterinaires actifs" tone="blue" value="12" />
        <Stat label="Doses dispensees" tone="amber" value="1.8k" />
      </Row>

      <PrimaryButton onPress={() => router.push('/pharmacy/new-sale')}>Nouvelle vente</PrimaryButton>

      <SectionTitle>Historique recent</SectionTitle>
      {drugSales.map((sale) => (
        <Card key={sale.id} tone={sale.awareClass === 'Reserve' ? 'red' : 'green'}>
          <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>{sale.atcCode}</Text>
          <AWaReBadge awareClass={sale.awareClass} />
          <Text style={{ color: '#475569' }}>
            {sale.vetName} - lot {sale.batchNumber} - {sale.quantity} doses
          </Text>
        </Card>
      ))}

      <PrimaryButton onPress={signOut}>Se deconnecter</PrimaryButton>
    </Screen>
  );
}
