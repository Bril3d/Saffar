import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { Button, Card, Divider, PageHeader, Row, Screen, SectionTitle, Stat } from '@/components/app-ui';
import { colors, typography } from '@/constants/theme';
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
        eyebrow="PHARMACIE"
        subtitle="Ventes suivies avec classification AWaRe et hash on-chain."
        title="Tableau de bord"
      />

      <Row>
        <Stat label="Ventes ce mois" tone="success" value="42" />
        <Stat label="Veterinaires" tone="info" value="12" />
        <Stat label="Doses dispensees" tone="warning" value="1.8k" />
      </Row>

      <Button onPress={() => router.push('/pharmacy/new-sale')}>
        Nouvelle vente
      </Button>

      <SectionTitle>Historique recent</SectionTitle>
      {drugSales.map((sale) => (
        <Card key={sale.id} tone={sale.awareClass === 'Reserve' ? 'danger' : 'default'}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{sale.atcCode}</Text>
            <AWaReBadge awareClass={sale.awareClass} />
          </View>
          <Text style={styles.cardBody}>
            {sale.vetName} — Lot {sale.batchNumber} — {sale.quantity} doses
          </Text>
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
});
