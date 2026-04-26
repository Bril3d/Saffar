import { router } from 'expo-router';
import { Text } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { Card, PageHeader, PrimaryButton, Row, Screen, SectionTitle, Stat, StatusChip } from '@/components/app-ui';
import { OfflineStatus } from '@/components/OfflineStatus';
import { lotTone } from '@/services/api';
import { lots } from '@/services/mockData';
import { useAuthStore } from '@/store/authStore';

export default function FarmerHomeScreen() {
  const logout = useAuthStore((state) => state.logout);
  const withdrawalLot = lots.find((lot) => lot.status === 'WITHDRAWAL');

  const signOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="Role FARMER"
        subtitle="Administration offline-first, lots et marketplace direct."
        title="Eleveur"
      />

      <OfflineStatus />

      {withdrawalLot ? (
        <Card tone="amber">
          <Text style={{ color: '#92400e', fontSize: 16, fontWeight: '900' }}>
            Lot en delai de retrait
          </Text>
          <Text style={{ color: '#475569' }}>
            {withdrawalLot.id} reste bloque jusqu au {withdrawalLot.withdrawalEnd}.
          </Text>
        </Card>
      ) : null}

      <Row>
        <Stat label="Lots actifs" tone="green" value="3" />
        <Stat label="Commandes" tone="blue" value="7" />
        <Stat label="Revenu net" tone="amber" value="486 TND" />
      </Row>

      <Row>
        <PrimaryButton onPress={() => router.push('/farmer/confirm-admin')}>
          Confirmer traitement
        </PrimaryButton>
        <PrimaryButton onPress={() => router.push('/farmer/publish-product')}>
          Publier produit
        </PrimaryButton>
        <PrimaryButton onPress={() => router.push('/farmer/my-sales')}>Mes ventes</PrimaryButton>
      </Row>

      <SectionTitle>Mes lots</SectionTitle>
      {lots.map((lot) => (
        <Card key={lot.id} tone={lotTone(lot)}>
          <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>{lot.name}</Text>
          <AWaReBadge awareClass={lot.awareClass} />
          <StatusChip
            label={lot.status === 'WITHDRAWAL' ? lot.countdown : lot.status}
            tone={lot.status === 'WITHDRAWAL' ? 'amber' : lot.status === 'CERTIFIED' ? 'green' : 'default'}
          />
          <Text style={{ color: '#475569' }}>
            {lot.antibiotic} - retrait fin {lot.withdrawalEnd}
          </Text>
          {lot.status === 'CERTIFIED' ? (
            <PrimaryButton onPress={() => router.push('/farmer/publish-product')}>Publier produit</PrimaryButton>
          ) : null}
        </Card>
      ))}

      <PrimaryButton onPress={signOut}>Se deconnecter</PrimaryButton>
    </Screen>
  );
}
