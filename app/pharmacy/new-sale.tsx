import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AWaReBadge } from '@/components/AWaReBadge';
import {
  Button,
  Card,
  PageHeader,
  Row,
  Screen,
  SectionTitle,
  SegmentedControl,
  TextField,
} from '@/components/app-ui';
import { colors, spacing, typography } from '@/constants/theme';
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
        eyebrow="PHARMACIE"
        subtitle="La vente est liee a un veterinaire enregistre et sera envoyee au backend."
        title="Nouvelle vente"
      />

      <SectionTitle>Medicament</SectionTitle>
      <Card tone={awareClass === 'Reserve' ? 'danger' : awareClass === 'Watch' ? 'warning' : 'default'}>
        <TextField
          autoCapitalize="characters"
          label="Code ATC"
          onChangeText={setAtcCode}
          value={atcCode}
        />
        <AWaReBadge awareClass={awareClass} />
        <TextField label="Numero de lot" onChangeText={setBatchNumber} value={batchNumber} />
      </Card>

      <SectionTitle>Veterinaire</SectionTitle>
      <Card>
        <SegmentedControl
          onChange={setVetId}
          options={vets.map((vet) => ({ label: vet.name, value: vet.id }))}
          value={vetId}
        />
      </Card>

      <SectionTitle>Quantite</SectionTitle>
      <Card>
        <View style={styles.quantityRow}>
          <Button variant="secondary" compact onPress={() => setQuantity((v) => Math.max(1, v - 1))}>-</Button>
          <Text style={styles.quantityValue}>{quantity} doses</Text>
          <Button variant="secondary" compact onPress={() => setQuantity((v) => v + 1)}>+</Button>
        </View>
      </Card>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button onPress={submit}>Confirmer par biometrie</Button>
      <Button variant="secondary" onPress={() => Alert.alert('Brouillon', 'La vente reste en saisie locale.')}>
        Enregistrer brouillon
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...typography.caption,
    color: colors.status.danger,
    fontWeight: '600',
  },
  quantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  quantityValue: {
    ...typography.title,
    color: colors.text.primary,
    minWidth: 100,
    textAlign: 'center',
  },
});
