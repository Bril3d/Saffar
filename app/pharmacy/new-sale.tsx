import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import {
  Card,
  PageHeader,
  PrimaryButton,
  Row,
  Screen,
  SecondaryButton,
  SegmentedControl,
  TextField,
} from '@/components/app-ui';
import { createDrugSale, getVets } from '@/services/api';
import { awareClassForAtc } from '@/types/domain';
import { type VetProfile } from '@/services/mockData';

export default function NewSaleScreen() {
  const [atcCode, setAtcCode] = useState('J01CA04');
  const [batchNumber, setBatchNumber] = useState('AMX-04-26');
  const [quantity, setQuantity] = useState(10);
  const [vetId, setVetId] = useState('');
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [error, setError] = useState('');
  const awareClass = awareClassForAtc(atcCode);

  useEffect(() => {
    getVets().then((items) => {
      setVets(items);
      setVetId(items[0]?.id ?? '');
    });
  }, []);

  const submit = async () => {
    if (!atcCode.trim()) {
      setError('Code ATC requis.');
      return;
    }

    if (!vetId) {
      setError('Veterinaire requis.');
      return;
    }

    setError('');

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (hasHardware) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirmer la vente antibiotique',
      });

      if (!result.success) {
        return;
      }
    }

    const sale = await createDrugSale({ atcCode, batchNumber, quantity, vetId });
    router.replace({
      pathname: '/pharmacy/sale-confirmed',
      params: { awareClass: sale.awareClass, saleId: sale.saleId, txHash: sale.txHash },
    });
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="Pharmacie"
        subtitle="La vente est liee a un veterinaire enregistre et sera envoyee au backend Dev 3."
        title="Nouvelle vente"
      />

      <Card tone={awareClass === 'Reserve' ? 'red' : awareClass === 'Watch' ? 'amber' : 'green'}>
        <TextField
          autoCapitalize="characters"
          label="Code ATC"
          onChangeText={setAtcCode}
          value={atcCode}
        />
        <AWaReBadge awareClass={awareClass} />
        <TextField label="Numero de lot" onChangeText={setBatchNumber} value={batchNumber} />

        <Text style={{ color: '#334155', fontWeight: '800' }}>Veterinaire</Text>
        <SegmentedControl
          onChange={setVetId}
          options={vets.map((vet) => ({ label: vet.name, value: vet.id }))}
          value={vetId}
        />

        <Text style={{ color: '#334155', fontWeight: '800' }}>Quantite</Text>
        <Row>
          <SecondaryButton onPress={() => setQuantity((value) => Math.max(1, value - 1))}>-</SecondaryButton>
          <Card>
            <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '900' }}>{quantity} doses</Text>
          </Card>
          <SecondaryButton onPress={() => setQuantity((value) => value + 1)}>+</SecondaryButton>
        </Row>

        {error ? <Text style={{ color: '#dc2626', fontWeight: '800' }}>{error}</Text> : null}
        <PrimaryButton onPress={submit}>Confirmer par biometrie</PrimaryButton>
        <SecondaryButton onPress={() => Alert.alert('Brouillon', 'La vente reste en saisie locale.')}>
          Enregistrer brouillon
        </SecondaryButton>
      </Card>
    </Screen>
  );
}
