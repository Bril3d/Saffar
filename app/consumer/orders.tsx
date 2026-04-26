import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { Card, PageHeader, PrimaryButton, Screen, SectionTitle, StatusChip } from '@/components/app-ui';
import { getFarmerOrders } from '@/services/api';
import { type Order } from '@/services/mockData';

export default function ConsumerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = () => {
    getFarmerOrders().then(setOrders);
  };

  useEffect(refresh, []);

  return (
    <Screen>
      <PageHeader
        eyebrow="Mes commandes"
        subtitle="Statuts synchronises avec le backend marketplace."
        title="Commandes"
      />

      <PrimaryButton onPress={refresh}>Rafraichir</PrimaryButton>
      <SectionTitle>Historique</SectionTitle>
      {orders.map((order) => (
        <Card key={order.id} tone={order.status === 'DELIVERED' ? 'green' : 'blue'}>
          <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '900' }}>{order.productTitle}</Text>
          <Text style={{ color: '#475569' }}>
            Quantite {order.quantity} - total {order.total} TND
          </Text>
          <StatusChip label={order.status} tone={order.status === 'PENDING' ? 'amber' : 'green'} />
        </Card>
      ))}
    </Screen>
  );
}
