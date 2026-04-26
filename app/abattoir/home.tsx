import { router } from 'expo-router';
import { Text } from 'react-native';

import { Card, PageHeader, PrimaryButton, Row, Screen, SectionTitle, Stat, StatusChip } from '@/components/app-ui';
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
        eyebrow="Role SLAUGHTERHOUSE"
        subtitle="Verification eligibilite et certification impossible a contourner."
        title="Abattoir"
      />

      <Row>
        <Stat label="Lots verifies" tone="blue" value="18" />
        <Stat label="Eligibles" tone="green" value="14" />
        <Stat label="Rejetes" tone="red" value="4" />
      </Row>

      <Card tone="green">
        <Text style={{ color: '#0f172a', fontSize: 22, fontWeight: '900' }}>Scanner un lot</Text>
        <Text style={{ color: '#475569' }}>
          Le QR code declenche le controle smart contract avant toute certification.
        </Text>
        <PrimaryButton onPress={() => router.push('/abattoir/scanner')}>Ouvrir camera</PrimaryButton>
      </Card>

      <SectionTitle>Scans recents</SectionTitle>
      {lots.map((lot) => (
        <Card key={lot.id} tone={lot.status === 'CERTIFIED' ? 'green' : 'red'}>
          <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>{lot.id}</Text>
          <StatusChip
            label={lot.status === 'CERTIFIED' ? 'ELIGIBLE' : 'NON ELIGIBLE'}
            tone={lot.status === 'CERTIFIED' ? 'green' : 'red'}
          />
          <Text style={{ color: '#475569' }}>{lot.name}</Text>
        </Card>
      ))}

      <PrimaryButton onPress={signOut}>Se deconnecter</PrimaryButton>
    </Screen>
  );
}
