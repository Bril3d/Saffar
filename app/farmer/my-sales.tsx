import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { Card, PageHeader, PrimaryButton, Row, Screen, SectionTitle, Stat, StatusChip } from '@/components/app-ui';
import { getFarmerOrders, updateOrderStatus } from '@/services/api';
import { type Order } from '@/services/mockData';

export default function MySalesScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getFarmerOrders().then(setOrders);
  }, []);

  const updateStatus = async (orderId: string, status: Order['status']) => {
    await updateOrderStatus(orderId, status);
    setOrders((items) => items.map((item) => (item.id === orderId ? { ...item, status } : item)));
  };

  const grossRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const revenue = grossRevenue * 0.9;
  const commission = grossRevenue * 0.1;

  return (
    <Screen>
      <PageHeader
        eyebrow="Commandes"
        subtitle="Commission plateforme: 10%, reversement eleveur: 90%."
        title="Mes ventes"
      />

      <Row>
        <Stat label="Revenu net" tone="green" value={`${revenue.toFixed(2)} TND`} />
        <Stat label="Commission" tone="amber" value={`${commission.toFixed(2)} TND`} />
      </Row>

      <SectionTitle>Commandes entrantes</SectionTitle>
      {orders.map((order) => (
        <Card key={order.id} tone={order.status === 'PENDING' ? 'amber' : 'green'}>
          <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>{order.productTitle}</Text>
          <Text style={{ color: '#475569' }}>
            {order.consumerName} - quantite {order.quantity} - {order.total} TND
          </Text>
          <StatusChip label={order.status} tone={order.status === 'PENDING' ? 'amber' : 'green'} />
          <Row>
            <PrimaryButton onPress={() => updateStatus(order.id, 'CONFIRMED')}>Confirmer</PrimaryButton>
            <PrimaryButton onPress={() => updateStatus(order.id, 'READY')}>Pret</PrimaryButton>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
