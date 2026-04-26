import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { BlockchainHash } from '@/components/BlockchainHash';
import { Card, Divider, PageHeader, Screen, SectionTitle, StatusChip } from '@/components/app-ui';
import { Timeline } from '@/components/Timeline';
import { colors, spacing, typography } from '@/constants/theme';
import { prescriptions } from '@/services/mockData';

export default function PrescriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const prescription = prescriptions.find((item) => item.id === id) ?? prescriptions[0];

  return (
    <Screen>
      <PageHeader
        eyebrow="LECTURE SEULE"
        subtitle="Tous les champs critiques sont verrouilles apres emission."
        title={`Prescription ${prescription.id}`}
      />

      <Card tone={prescription.status === 'WITHDRAWAL' ? 'warning' : 'success'}>
        <View style={styles.row}>
          <Text style={styles.lotTitle}>Lot {prescription.animalLotId}</Text>
          <AWaReBadge awareClass={prescription.awareClass} />
        </View>
        <StatusChip
          label={prescription.status}
          tone={prescription.status === 'WITHDRAWAL' ? 'warning' : 'success'}
        />
        <Divider />
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Diagnostic</Text>
          <Text style={styles.detailValue}>{prescription.diagnosis}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Posologie</Text>
          <Text style={styles.detailValue}>{prescription.dosage}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Retrait</Text>
          <Text style={styles.detailValue}>
            {prescription.withdrawalDays} jours — fin {prescription.withdrawalEnd}
          </Text>
        </View>
        <Divider />
        <BlockchainHash hash={prescription.txHash} />
      </Card>

      <SectionTitle>Parcours</SectionTitle>
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

const styles = StyleSheet.create({
  detail: {
    gap: spacing.xs,
  },
  detailLabel: {
    ...typography.overline,
    color: colors.text.tertiary,
  },
  detailValue: {
    ...typography.body,
    color: colors.text.primary,
  },
  lotTitle: {
    ...typography.section,
    color: colors.text.primary,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
