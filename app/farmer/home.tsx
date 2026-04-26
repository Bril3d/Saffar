import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Divider, PageHeader, Row, Screen, SectionTitle, Stat, StatusChip } from '@/components/app-ui';
import { AWaReBadge } from '@/components/AWaReBadge';
import { OfflineStatus } from '@/components/OfflineStatus';
import { colors, typography } from '@/constants/theme';
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
        role={{ label: 'Éleveur', accent: colors.role.farmer }}
        breadcrumb="Tableau de bord"
        subtitle="Administration offline-first, lots et marketplace direct."
        title="Bonjour — Élevage El Amri"
      />

      <OfflineStatus />

      {withdrawalLot ? (
        <Card tone="warning">
          <Text style={styles.warningTitle}>Lot en delai de retrait</Text>
          <Text style={styles.warningBody}>
            {withdrawalLot.id} reste bloque jusqu'au {withdrawalLot.withdrawalEnd}.
          </Text>
        </Card>
      ) : null}

      <Row>
        <Stat
          label="Lots actifs"
          tone="success"
          value="3"
          delta={{ direction: 'up', value: '+1', label: 'ce mois' }}
        />
        <Stat
          label="Commandes"
          tone="info"
          value="7"
          delta={{ direction: 'up', value: '+2', label: '7j' }}
        />
        <Stat
          label="Revenu net"
          tone="warning"
          value="486 DT"
          delta={{ direction: 'up', value: '+12%', label: 'vs. mois dernier' }}
        />
      </Row>

      <Row>
        <Button onPress={() => router.push('/farmer/confirm-admin')}>
          Confirmer traitement
        </Button>
      </Row>
      <Row>
        <Button variant="secondary" onPress={() => router.push('/farmer/publish-product')}>
          Publier produit
        </Button>
        <Button variant="secondary" onPress={() => router.push('/farmer/my-sales')}>
          Mes ventes
        </Button>
      </Row>

      <SectionTitle>Mes lots</SectionTitle>
      {lots.map((lot) => (
        <Card key={lot.id} tone={lot.status === 'WITHDRAWAL' ? 'warning' : lot.status === 'CERTIFIED' ? 'success' : 'default'}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{lot.name}</Text>
            <AWaReBadge awareClass={lot.awareClass} />
          </View>
          <StatusChip
            label={lot.status === 'WITHDRAWAL' ? lot.countdown : lot.status}
            tone={lot.status === 'WITHDRAWAL' ? 'warning' : lot.status === 'CERTIFIED' ? 'success' : 'default'}
          />
          <Text style={styles.cardBody}>
            {lot.antibiotic} — retrait fin {lot.withdrawalEnd}
          </Text>
          {lot.status === 'CERTIFIED' ? (
            <Button variant="secondary" compact onPress={() => router.push('/farmer/publish-product')}>
              Publier produit
            </Button>
          ) : null}
        </Card>
      ))}

      <Divider />
      <Button variant="ghost" onPress={signOut}>Se deconnecter</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    ...typography.body,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.section,
    color: colors.text.primary,
  },
  warningBody: {
    ...typography.body,
    color: colors.status.warning,
  },
  warningTitle: {
    ...typography.section,
    color: colors.status.warning,
  },
});
