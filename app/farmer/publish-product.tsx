import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Divider, PageHeader, Screen, SectionTitle, SegmentedControl, TextField } from '@/components/app-ui';
import { colors, spacing, typography } from '@/constants/theme';
import { getCertifiedLots, publishProduct } from '@/services/api';
import { type Lot } from '@/services/mockData';

export default function PublishProductScreen() {
  const [certifiedLots, setCertifiedLots] = useState<Lot[]>([]);
  const [lotId, setLotId] = useState('');
  const [title, setTitle] = useState('Poulet fermier certifie');
  const [category, setCategory] = useState('Poulet');
  const [price, setPrice] = useState('9');
  const [stock, setStock] = useState('28');
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getCertifiedLots().then((items) => {
      setCertifiedLots(items);
      setLotId(items[0]?.id ?? '');
    });
  }, []);

  const netRevenue = useMemo(() => (Number(price) || 0) * 0.9, [price]);

  const submit = async () => {
    if (!lotId) {
      setMessage('Selectionnez un lot certifie avant publication.');
      return;
    }

    const product = await publishProduct({
      category,
      lotId,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      title,
    });
    setMessage(`Produit ${product.productId} cree.`);
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="ELEVEUR"
        subtitle="Seuls les lots certifies peuvent etre publies."
        title="Publier produit"
      />

      <SectionTitle>Lot certifie</SectionTitle>
      <Card tone={lotId ? 'success' : 'danger'}>
        <SegmentedControl
          onChange={setLotId}
          options={certifiedLots.map((lot) => ({ label: lot.id, value: lot.id }))}
          value={lotId}
        />
      </Card>

      <SectionTitle>Details du produit</SectionTitle>
      <Card>
        <TextField label="Nom produit" onChangeText={setTitle} value={title} />
        <SegmentedControl
          onChange={setCategory}
          options={[
            { label: 'Poulet', value: 'Poulet' },
            { label: 'Oeufs', value: 'Oeufs' },
            { label: 'Dinde', value: 'Dinde' },
          ]}
          value={category}
        />
        <TextField keyboardType="numeric" label="Prix (TND)" onChangeText={setPrice} value={price} />
        <TextField keyboardType="numeric" label="Stock disponible" onChangeText={setStock} value={stock} />
        <SegmentedControl
          onChange={setDeliveryMode}
          options={[
            { label: 'Retrait sur place', value: 'pickup' },
            { label: 'Livraison', value: 'delivery' },
          ]}
          value={deliveryMode}
        />
      </Card>

      <Card tone="info">
        <Text style={styles.revenueTitle}>Apercu revenu</Text>
        <Divider />
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Prix unitaire</Text>
          <Text style={styles.revenueValue}>{price || 0} TND</Text>
        </View>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Commission (10%)</Text>
          <Text style={[styles.revenueValue, { color: colors.status.warning }]}>
            -{((Number(price) || 0) * 0.1).toFixed(2)} TND
          </Text>
        </View>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Revenu net</Text>
          <Text style={[styles.revenueValue, { color: colors.status.success }]}>
            {netRevenue.toFixed(2)} TND
          </Text>
        </View>
        <Text style={styles.comparison}>+12% vs vente gros locale</Text>
      </Card>

      {message ? <Text style={styles.messageText}>{message}</Text> : null}
      <Button disabled={!lotId} onPress={submit}>Publier</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  comparison: {
    ...typography.caption,
    color: colors.status.success,
    fontWeight: '600',
  },
  messageText: {
    ...typography.caption,
    color: colors.status.success,
    fontWeight: '600',
  },
  revenueLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revenueTitle: {
    ...typography.section,
    color: colors.text.primary,
  },
  revenueValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
