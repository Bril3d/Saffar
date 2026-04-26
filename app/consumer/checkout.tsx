import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { Card, PageHeader, PrimaryButton, Row, Screen, SegmentedControl, TextField } from '@/components/app-ui';
import { createOrder, productById } from '@/services/api';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const product = productById(id);
  const [quantity, setQuantity] = useState('1');
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('D17');
  const [message, setMessage] = useState('');
  const qty = Number(quantity) || 1;
  const deliveryFee = deliveryMode === 'delivery' ? 5 : 0;
  const subtotal = product.price * qty;
  const total = useMemo(() => subtotal + deliveryFee, [deliveryFee, subtotal]);

  const submit = async () => {
    if (deliveryMode === 'delivery' && !address.trim()) {
      setMessage('Adresse de livraison requise.');
      return;
    }

    const order = await createOrder({
      deliveryAddress: address,
      deliveryMode,
      productId: product.id,
      quantity: qty,
      total,
    });
    setMessage(`Commande ${order.orderId} creee.`);
    router.replace('/consumer/orders');
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="Commande"
        subtitle="Paiement mock pour demo hackathon."
        title={product.title}
      />

      <Card tone="green">
        <TextField keyboardType="numeric" label="Quantite" onChangeText={setQuantity} value={quantity} />
        <SegmentedControl
          onChange={setDeliveryMode}
          options={[
            { label: 'Retrait', value: 'pickup' },
            { label: 'Livraison', value: 'delivery' },
          ]}
          value={deliveryMode}
        />
        {deliveryMode === 'delivery' ? (
          <TextField label="Adresse livraison" onChangeText={setAddress} value={address} />
        ) : null}
        <SegmentedControl
          onChange={setPaymentMethod}
          options={[
            { label: 'D17', value: 'D17' },
            { label: 'Carte', value: 'Carte' },
            { label: 'Livraison', value: 'Cash' },
          ]}
          value={paymentMethod}
        />
        <Card tone="blue">
          <Row>
            <Text style={{ color: '#475569' }}>Sous-total</Text>
            <Text style={{ color: '#0f172a', fontWeight: '900' }}>{subtotal.toFixed(2)} TND</Text>
          </Row>
          <Row>
            <Text style={{ color: '#475569' }}>Livraison</Text>
            <Text style={{ color: '#0f172a', fontWeight: '900' }}>{deliveryFee.toFixed(2)} TND</Text>
          </Row>
          <Text style={{ color: '#0f172a', fontSize: 24, fontWeight: '900' }}>
            Total {total.toFixed(2)} TND
          </Text>
        </Card>
        {message ? <Text style={{ color: '#dc2626', fontWeight: '800' }}>{message}</Text> : null}
        <PrimaryButton onPress={submit}>Confirmer la commande</PrimaryButton>
      </Card>
    </Screen>
  );
}
