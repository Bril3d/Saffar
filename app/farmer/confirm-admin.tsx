import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { Button, Card, Divider, PageHeader, Screen, SectionTitle, TextField } from '@/components/app-ui';
import { colors, spacing, typography } from '@/constants/theme';
import { confirmPrescription, getPrescription } from '@/services/api';
import { type Prescription } from '@/services/mockData';
import { enqueue, processQueue } from '@/services/offlineQueue';
import { isOnline, onReconnect } from '@/services/network';

export default function ConfirmAdminScreen() {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [administeredAt, setAdministeredAt] = useState('2026-04-26');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getPrescription('rx-901').then(setPrescription);
    const unsubscribe = onReconnect(async () => {
      const synced = await processQueue();
      if (synced > 0) {
        setMessage(`${synced} action(s) synchronisee(s).`);
      }
    });

    return unsubscribe;
  }, []);

  const submit = async () => {
    if (!prescription) return;

    if (administeredAt < prescription.prescriptionDate) {
      setMessage('La date doit etre apres la prescription.');
      return;
    }

    const online = await isOnline();
    const payload = { administeredAt, id: prescription.id, notes };

    if (online) {
      await processQueue();
      await confirmPrescription(prescription.id, { administeredAt, notes });
      setMessage('Administration confirmee en ligne.');
    } else {
      await enqueue({ payload, type: 'CONFIRM_ADMINISTRATION' });
      setMessage('Sauvegarde hors-ligne. Synchronisation au retour reseau.');
    }
  };

  if (!prescription) {
    return (
      <Screen>
        <PageHeader title="Chargement..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="ELEVEUR"
        subtitle="Si le reseau tombe, la confirmation est mise en file locale."
        title="Confirmer administration"
      />

      <Card tone="warning">
        <View style={styles.headerRow}>
          <Text style={styles.rxId}>Prescription {prescription.id}</Text>
          <AWaReBadge awareClass={prescription.awareClass} />
        </View>
        <Divider />
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Lot</Text>
          <Text style={styles.detailValue}>{prescription.animalLotId}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Diagnostic</Text>
          <Text style={styles.detailValue}>{prescription.diagnosis}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Date prescription</Text>
          <Text style={styles.detailValue}>{prescription.prescriptionDate}</Text>
        </View>
        <Divider />
        <TextField label="Date administration" onChangeText={setAdministeredAt} value={administeredAt} />
        <TextField
          label="Notes optionnelles"
          multiline
          onChangeText={setNotes}
          style={styles.textarea}
          value={notes}
        />
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
        <Button onPress={submit}>Confirmer administration</Button>
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
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageText: {
    ...typography.caption,
    color: colors.status.success,
    fontWeight: '600',
  },
  rxId: {
    ...typography.section,
    color: colors.text.primary,
  },
  textarea: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
});
