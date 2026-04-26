import { useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';

import { Card, PageHeader, PrimaryButton, Screen, SegmentedControl, TextField } from '@/components/app-ui';
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
        eyebrow="Marketplace"
        subtitle="Seuls les lots certifies peuvent etre publies."
        title="Publier produit"
      />

      <Card tone={lotId ? 'green' : 'red'}>
        <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>Lot certifie</Text>
        <SegmentedControl
          onChange={setLotId}
          options={certifiedLots.map((lot) => ({ label: lot.id, value: lot.id }))}
          value={lotId}
        />
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
        <TextField keyboardType="numeric" label="Prix" onChangeText={setPrice} value={price} />
        <TextField keyboardType="numeric" label="Stock" onChangeText={setStock} value={stock} />
        <SegmentedControl
          onChange={setDeliveryMode}
          options={[
            { label: 'Retrait', value: 'pickup' },
            { label: 'Livraison', value: 'delivery' },
          ]}
          value={deliveryMode}
        />
        <Card tone="blue">
          <Text style={{ color: '#0f172a', fontWeight: '900' }}>Apercu revenu</Text>
          <Text style={{ color: '#475569' }}>
            {price || 0} TND x 90% = {netRevenue.toFixed(2)} TND net par unite
          </Text>
          <Text style={{ color: '#475569' }}>Comparaison marche: +12% vs vente gros locale</Text>
        </Card>
        {message ? <Text style={{ color: '#166534', fontWeight: '800' }}>{message}</Text> : null}
        <PrimaryButton disabled={!lotId} onPress={submit}>Publier</PrimaryButton>
      </Card>
    </Screen>
  );
}
