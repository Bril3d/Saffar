import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Divider, PageHeader, Row, Screen, SectionTitle, Stat, StatusChip } from '@/components/app-ui';
import { colors, typography } from '@/constants/theme';
import { lots } from '@/services/mockData';
import { useAuthStore } from '@/store/authStore';

export default function AbattoirHomeScreen() {
  const logout = useAuthStore((state) => state.logout);

  const signOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="ABATTOIR"
        subtitle="Verification eligibilite et certification on-chain."
        title="Tableau de bord"
      />

      <Row>
        <Stat label="Lots verifies" tone="info" value="18" />
        <Stat label="Eligibles" tone="success" value="14" />
        <Stat label="Rejetes" tone="danger" value="4" />
      </Row>

      <Card tone="info">
        <Text style={styles.scanTitle}>Scanner un lot</Text>
        <Text style={styles.scanBody}>
          Le QR code declenche le controle smart contract avant toute certification.
        </Text>
        <Button onPress={() => router.push('/abattoir/scanner')}>Ouvrir le scanner</Button>
      </Card>

      <SectionTitle>Scans recents</SectionTitle>
      {lots.map((lot) => (
        <Card key={lot.id} tone={lot.status === 'CERTIFIED' ? 'success' : 'danger'}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{lot.id}</Text>
            <StatusChip
              label={lot.status === 'CERTIFIED' ? 'ELIGIBLE' : 'NON ELIGIBLE'}
              tone={lot.status === 'CERTIFIED' ? 'success' : 'danger'}
            />
          </View>
          <Text style={styles.cardBody}>{lot.name}</Text>
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
  scanBody: {
    ...typography.body,
  },
  scanTitle: {
    ...typography.title,
    color: colors.text.primary,
  },
});
