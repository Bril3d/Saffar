import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import { Card, PageHeader, PrimaryButton, Screen, TextField } from '@/components/app-ui';
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
    if (!prescription) {
      return;
    }

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
        <PageHeader title="Chargement prescription" />
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="Offline-first"
        subtitle="Si le reseau tombe, la confirmation est mise en file SQLite."
        title="Confirmer administration"
      />

      <Card tone="amber">
        <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>
          Prescription {prescription.id}
        </Text>
        <AWaReBadge awareClass={prescription.awareClass} />
        <Text style={{ color: '#475569' }}>Lot {prescription.animalLotId}</Text>
        <Text style={{ color: '#475569' }}>Diagnostic: {prescription.diagnosis}</Text>
        <Text style={{ color: '#475569' }}>Prescription: {prescription.prescriptionDate}</Text>
        <TextField label="Date administration" onChangeText={setAdministeredAt} value={administeredAt} />
        <TextField
          label="Notes optionnelles"
          multiline
          onChangeText={setNotes}
          style={{ minHeight: 82, textAlignVertical: 'top' }}
          value={notes}
        />
        {message ? <Text style={{ color: '#166534', fontWeight: '800' }}>{message}</Text> : null}
        <PrimaryButton onPress={submit}>Confirmer administration</PrimaryButton>
      </Card>
    </Screen>
  );
}
