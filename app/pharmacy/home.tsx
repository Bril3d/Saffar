import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { Button, Card, Divider, PageHeader, Row, Screen, SectionTitle, Stat } from '@/components/app-ui';
import { colors, typography } from '@/constants/theme';
import { drugSales } from '@/services/mockData';
import { useAuthStore } from '@/store/authStore';

export default function PharmacyHomeScreen() {
  const logout = useAuthStore((state) => state.logout);

  const signOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen>
      <PageHeader
        role={{ label: 'Pharmacie', accent: colors.role.pharmacy }}
        breadcrumb="Tableau de bord"
        subtitle="Ventes suivies avec classification AWaRe et hash on-chain."
        title="Bonjour, Pharmacie El Manar"
      />

      <Row>
        <Stat
          label="Ventes ce mois"
          tone="success"
          value="42"
          delta={{ direction: 'up', value: '+8%', label: 'vs. mois dernier' }}
        />
        <Stat label="Vétérinaires" tone="info" value="12" />
        <Stat
          label="Doses dispensées"
          tone="warning"
          value="1 842"
          delta={{ direction: 'up', value: '+124', label: '7j' }}
        />
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
