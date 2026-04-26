import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Divider, PageHeader, Screen, SectionTitle, SegmentedControl, TextField } from '@/components/app-ui';
import { colors, spacing, typography } from '@/constants/theme';
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
        eyebrow="CONSOMMATEUR"
        title={product.title}
      />

      <SectionTitle>Details de la commande</SectionTitle>
      <Card>
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
      </Card>

      <SectionTitle>Paiement</SectionTitle>
      <Card>
        <SegmentedControl
          onChange={setPaymentMethod}
          options={[
            { label: 'D17', value: 'D17' },
            { label: 'Carte', value: 'Carte' },
            { label: 'Especes', value: 'Cash' },
          ]}
          value={paymentMethod}
        />
      </Card>

      <Card tone="info">
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryValue}>{subtotal.toFixed(2)} TND</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Livraison</Text>
          <Text style={styles.summaryValue}>{deliveryFee.toFixed(2)} TND</Text>
        </View>
        <Divider />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)} TND</Text>
        </View>
      </Card>

      {message ? <Text style={styles.errorText}>{message}</Text> : null}
      <Button onPress={submit}>Confirmer la commande</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...typography.caption,
    color: colors.status.danger,
    fontWeight: '600',
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  totalLabel: {
    ...typography.section,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.title,
    color: colors.accent.primary,
  },
});
