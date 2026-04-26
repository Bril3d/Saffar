import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';

import { AIAssistantCard } from '@/components/AIAssistantCard';
import { AWaReBadge } from '@/components/AWaReBadge';
import { Card, PageHeader, PrimaryButton, Screen, SegmentedControl, TextField } from '@/components/app-ui';
import { createPrescription, getVetDrugSales } from '@/services/api';
import { type DrugSale } from '@/services/mockData';

export default function NewPrescriptionScreen() {
  const [sales, setSales] = useState<DrugSale[]>([]);
  const [saleId, setSaleId] = useState('');
  const [farmerId, setFarmerId] = useState('farmer-001');
  const [animalLotId, setAnimalLotId] = useState('L-901');
  const [diagnosis, setDiagnosis] = useState('Suspicion infection respiratoire');
  const [dosage, setDosage] = useState('Suivre protocole valide');
  const [withdrawalDays, setWithdrawalDays] = useState('7');
  const [error, setError] = useState('');

  useEffect(() => {
    getVetDrugSales().then((items) => {
      setSales(items);
      setSaleId(items[0]?.id ?? '');
    });
  }, []);

  const selectedSale = useMemo(
    () => sales.find((sale) => sale.id === saleId) ?? sales[0],
    [saleId, sales]
  );
  const minWithdrawal = selectedSale?.awareClass === 'Reserve' ? 7 : 3;
  const safeWithdrawalDays = Math.max(Number(withdrawalDays) || 0, minWithdrawal);

  const submit = async () => {
    if (!selectedSale) {
      setError('Aucun medicament disponible pour ce veterinaire.');
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (hasHardware) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Signer la prescription',
      });

      if (!result.success) {
        return;
      }
    }

    const created = await createPrescription({
      animalLotId,
      diagnosis,
      farmerId,
      saleId,
      withdrawalDays: safeWithdrawalDays,
    });
    router.replace({ pathname: '/vet/prescription-detail', params: { id: created.rxId } });
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="Veterinaire"
        subtitle="La liste medicament est limitee aux achats du veterinaire connecte."
        title="Nouvelle prescription"
      />

      <AIAssistantCard />

      <Card tone="green">
        <Text style={{ color: '#334155', fontWeight: '800' }}>Medicament achete</Text>
        <SegmentedControl
          onChange={setSaleId}
          options={sales.map((sale) => ({ label: `${sale.atcCode} - ${sale.batchNumber}`, value: sale.id }))}
          value={saleId}
        />
        {selectedSale ? <AWaReBadge awareClass={selectedSale.awareClass} /> : null}
        <TextField label="Eleveur" onChangeText={setFarmerId} value={farmerId} />
        <TextField label="ID lot animal" onChangeText={setAnimalLotId} value={animalLotId} />
        <TextField
          label="Diagnostic"
          multiline
          onChangeText={setDiagnosis}
          style={{ minHeight: 76, textAlignVertical: 'top' }}
          value={diagnosis}
        />
        <TextField label="Posologie" onChangeText={setDosage} value={dosage} />
        <TextField
          keyboardType="numeric"
          label={`Delai de retrait minimum: ${minWithdrawal} jours`}
          onChangeText={setWithdrawalDays}
          value={withdrawalDays}
        />
        {safeWithdrawalDays !== Number(withdrawalDays) ? (
          <Text style={{ color: '#ca8a04', fontWeight: '800' }}>
            Le contrat forcera {safeWithdrawalDays} jours pour ce code ATC.
          </Text>
        ) : null}
        {error ? <Text style={{ color: '#dc2626', fontWeight: '800' }}>{error}</Text> : null}
        <PrimaryButton onPress={submit}>Creer prescription</PrimaryButton>
      </Card>
    </Screen>
  );
}
